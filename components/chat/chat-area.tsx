"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, Message } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Sparkles } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  model?: string;
  onModelChange?: (model: string) => void;
}

export function ChatArea({
  messages,
  onSendMessage,
  isLoading = false,
  model,
  onModelChange,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="min-h-full flex flex-col">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        model={model}
        onModelChange={onModelChange}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          How can I help you today?
        </h2>
        <p className="text-muted-foreground mb-8">
          Start a conversation with AI. Ask questions, get help with tasks, or
          just chat.
        </p>
        <div className="grid gap-3 text-left">
          {[
            "Explain quantum computing in simple terms",
            "Write a Python function to sort a list",
            "Help me brainstorm ideas for a startup",
          ].map((suggestion, i) => (
            <button
              key={i}
              className="p-4 bg-secondary/50 hover:bg-secondary rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors text-left border border-border"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex gap-4 p-4 bg-secondary/30">
      <div className="h-8 w-8 rounded-full bg-chart-2 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex items-center gap-1 pt-2">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  );
}
