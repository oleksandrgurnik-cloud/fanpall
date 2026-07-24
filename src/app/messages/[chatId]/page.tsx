"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface Conversation {
  id: string;
  participants: {
    user: { id: string; name: string; isOnline: boolean };
  }[];
  messages: Message[];
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = useCallback(async () => {
    const res = await fetch(`/api/conversations/${params.chatId}`);
    if (res.ok) {
      const data = await res.json();
      setConversation(data);
    }
  }, [params.chatId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetchConversation();

    // Polling mock for real-time — replace with WebSocket/Pusher later
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [status, router, fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const res = await fetch(`/api/conversations/${params.chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      setNewMessage("");
      await fetchConversation();
    }
    setSending(false);
  };

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  const other = conversation.participants.find(
    (p) => p.user.id !== session?.user?.id
  )?.user;

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-4 flex items-center gap-3 border-b pb-4">
        <Link href="/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-semibold">{other?.name}</h1>
          <p className="text-xs text-muted-foreground">
            {other?.isOnline ? "Online" : "Offline"} · Polls every 5s (demo)
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {conversation.messages.map((msg) => {
          const isOwn = msg.senderId === session?.user?.id;
          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-4 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p>{msg.content}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t pt-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
