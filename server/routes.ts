import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change";

// Password Hashing Helpers
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed Super Admin
  const seedSuperAdmin = async () => {
    const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";
    const password = process.env.SUPER_ADMIN_PASSWORD || "admin123";
    
    const existing = await storage.getUserByUsername(username);
    if (!existing) {
      console.log("Seeding Super Admin...");
      const hashedPassword = await hashPassword(password);
      await storage.createUser({
        username,
        password: hashedPassword,
        name: "Super Admin",
        role: "super_admin",
        unitId: null,
      });
      console.log("Super Admin seeded.");
    }
  };
  seedSuperAdmin(); // Fire and forget on startup

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
      }

      const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user });
    } catch (e) {
      res.status(400).json({ message: "Invalid Input" });
    }
  });

  // Create Building Admin (Only Super Admin)
  app.post(api.auth.createAdmin.path, authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const input = api.auth.createAdmin.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid Input" });
    }
  });

  // Create Resident (Only Building Admin)
  app.post(api.auth.createResident.path, authenticateToken, requireRole(['building_admin']), async (req, res) => {
    try {
      const input = api.auth.createResident.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid Input" });
    }
  });

  // Units
  app.get(api.units.list.path, authenticateToken, async (req, res) => {
    const units = await storage.getUnits();
    res.json(units);
  });

  app.post(api.units.create.path, authenticateToken, requireRole(['building_admin']), async (req, res) => {
    try {
      const input = api.units.create.input.parse(req.body);
      const unit = await storage.createUnit(input);
      res.status(201).json(unit);
    } catch (e) {
      res.status(400).json({ message: "Invalid Input" });
    }
  });
  
  app.patch(api.units.update.path, authenticateToken, requireRole(['building_admin']), async (req, res) => {
      try {
          const id = parseInt(req.params.id);
          const input = api.units.update.input.parse(req.body);
          const unit = await storage.updateUnit(id, input);
          res.json(unit);
      } catch (e) {
          res.status(400).json({ message: "Invalid Input" });
      }
  });


  // Payments
  app.get(api.payments.list.path, authenticateToken, async (req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  });

  app.post(api.payments.create.path, authenticateToken, requireRole(['building_admin']), async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (e) {
      res.status(400).json({ message: "Invalid Input" });
    }
  });

  // Chat
  app.get(api.chat.list.path, authenticateToken, async (req, res) => {
    const unitId = parseInt(req.params.unitId);
    // TODO: Add security check so residents can only see their own chat
    const msgs = await storage.getMessages(unitId);
    res.json(msgs);
  });

  app.post(api.chat.send.path, authenticateToken, async (req, res) => {
    try {
      const input = api.chat.send.input.parse(req.body);
      const msg = await storage.createMessage(input);
      res.status(201).json(msg);
    } catch (e) {
      res.status(400).json({ message: "Invalid Input" });
    }
  });

  return httpServer;
}
