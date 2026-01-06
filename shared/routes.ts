import { z } from 'zod';
import { 
  insertUserSchema, 
  insertUnitSchema, 
  insertPaymentSchema, 
  insertMessageSchema,
  loginSchema,
  createAdminSchema,
  createResidentSchema,
  users,
  units,
  payments,
  messages
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: loginSchema,
      responses: {
        200: z.object({
          token: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    // Super Admin creates Building Admin
    createAdmin: {
      method: 'POST' as const,
      path: '/api/admins/create',
      input: createAdminSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    // Building Admin creates Resident
    createResident: {
      method: 'POST' as const,
      path: '/api/residents/create',
      input: createResidentSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  units: {
    list: {
      method: 'GET' as const,
      path: '/api/units',
      responses: {
        200: z.array(z.custom<typeof units.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/units',
      input: insertUnitSchema,
      responses: {
        201: z.custom<typeof units.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/units/:id',
      input: insertUnitSchema.partial(),
      responses: {
        200: z.custom<typeof units.$inferSelect>(),
      },
    },
  },
  payments: {
    list: {
      method: 'GET' as const,
      path: '/api/payments',
      responses: {
        200: z.array(z.custom<typeof payments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/payments',
      input: insertPaymentSchema,
      responses: {
        201: z.custom<typeof payments.$inferSelect>(),
      },
    },
  },
  chat: {
    list: {
      method: 'GET' as const,
      path: '/api/chats/:unitId/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/chats/:unitId/messages',
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
