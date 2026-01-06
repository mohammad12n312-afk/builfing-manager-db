import { useAuth } from "@/hooks/use-auth";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUnits } from "@/hooks/use-building";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simple unified chat page for both roles
export default function ChatPage() {
  const { user } = useAuth();
  // Admin selects a unit to chat with, Resident chats with Admin (fixed unitId)
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(user?.unitId || null);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">پیام‌ها</h1>
        <p className="text-muted-foreground">گفتگو با {user?.role === 'resident' ? 'مدیریت' : 'ساکنین'}</p>
      </div>

      {user?.role === 'building_admin' && (
        <div className="w-full md:w-64">
           <UnitSelector onSelect={setSelectedUnitId} selected={selectedUnitId} />
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-lg">
        {selectedUnitId ? (
          <ChatWindow unitId={selectedUnitId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            یک واحد را برای گفتگو انتخاب کنید
          </div>
        )}
      </Card>
    </div>
  );
}

function UnitSelector({ onSelect, selected }: { onSelect: (id: number) => void, selected: number | null }) {
  const { data: units } = useUnits();
  
  return (
    <Select onValueChange={(val) => onSelect(parseInt(val))} value={selected?.toString()}>
      <SelectTrigger>
        <SelectValue placeholder="انتخاب واحد..." />
      </SelectTrigger>
      <SelectContent>
        {units?.map(unit => (
          <SelectItem key={unit.id} value={unit.id.toString()}>
            واحد {unit.unitNumber}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ChatWindow({ unitId }: { unitId: number }) {
  const { data: messages, isLoading } = useChatMessages(unitId);
  const sendMessage = useSendMessage(unitId);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate({
      unitId,
      message: text,
      senderType: user?.role === 'resident' ? 'resident' : 'admin'
    });
    setText("");
  };

  if (isLoading) return <div className="p-4">در حال دریافت پیام‌ها...</div>;

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20" ref={scrollRef}>
        {messages?.map((msg) => {
          const isMe = (user?.role === 'resident' && msg.senderType === 'resident') ||
                       (user?.role !== 'resident' && msg.senderType === 'admin');
          
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-start" : "justify-end")}>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                isMe 
                  ? "bg-primary text-primary-foreground rounded-br-none" 
                  : "bg-white dark:bg-zinc-800 text-foreground rounded-bl-none border"
              )}>
                {msg.message}
                <div className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                  {new Date(msg.createdAt!).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {messages?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-10">هنوز پیامی رد و بدل نشده است.</p>
        )}
      </div>

      <div className="p-4 bg-card border-t flex gap-2">
        <Input 
          placeholder="پیام خود را بنویسید..." 
          value={text} 
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="rounded-xl"
        />
        <Button size="icon" onClick={handleSend} disabled={sendMessage.isPending} className="rounded-xl shrink-0">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </>
  );
}
