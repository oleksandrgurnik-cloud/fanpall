"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  updatedAt: string;
  participants: {
    user: { id: string; name: string; avatar: string | null; isOnline: boolean };
  }[];
  messages: { content: string; createdAt: string }[];
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      });
  }, [status, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold">
        <MessageSquare className="h-8 w-8" />
        Messages
      </h1>

      <p className="mb-4 text-xs text-muted-foreground">
        Messages refresh on page load. WebSocket/Pusher integration can be added later for real-time updates.
      </p>

      {conversations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No conversations yet. Start chatting with a seller from an offer page.
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants.find(
              (p) => p.user.id !== session?.user?.id
            )?.user;
            const lastMessage = conv.messages[0];

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {other?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{other?.name}</span>
                        {other?.isOnline && (
                          <Badge variant="success" className="text-[10px]">Online</Badge>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="truncate text-sm text-muted-foreground">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
