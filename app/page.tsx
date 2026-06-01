"use client";

import { useState, useCallback } from "react";
import { ChatSidebar, ChatHistory } from "@/components/chat/chat-sidebar";
import { TokenStats } from "@/components/chat/token-stats";
import { ChatArea } from "@/components/chat/chat-area";
import { Message } from "@/components/chat/chat-message";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data
const initialChats: ChatHistory[] = [
  {
    id: "1",
    title: "Understanding React Hooks",
    date: "Today",
    preview: "Can you explain useEffect?",
  },
  {
    id: "2",
    title: "Python Data Analysis",
    date: "Today",
    preview: "Help with pandas dataframe...",
  },
  {
    id: "3",
    title: "CSS Grid Layout",
    date: "Yesterday",
    preview: "How to create a responsive grid?",
  },
  {
    id: "4",
    title: "API Design Best Practices",
    date: "Yesterday",
    preview: "REST vs GraphQL...",
  },
  {
    id: "5",
    title: "Machine Learning Basics",
    date: "Previous",
    preview: "What is supervised learning?",
  },
  {
    id: "6",
    title: "Database Optimization",
    date: "Previous",
    preview: "Indexing strategies...",
  },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Can you explain how React hooks work, specifically useEffect?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    tokens: 24,
  },
  {
    id: "2",
    role: "assistant",
    content: `React hooks are functions that let you use state and other React features in functional components. The useEffect hook is particularly powerful for handling side effects.

useEffect Basics:

useEffect(() => {
  // This runs after every render
  console.log('Component rendered');
  
  return () => {
    // Cleanup function (optional)
    console.log('Cleanup');
  };
}, [dependencies]);

Key Points:

1. No dependencies array: Runs after every render
2. Empty array []: Runs only on mount
3. With dependencies: Runs when dependencies change

Common Use Cases:
- Fetching data from an API
- Setting up subscriptions
- Manipulating the DOM
- Timers and intervals

Would you like me to explain any specific aspect in more detail?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    tokens: 312,
  },
  {
    id: "3",
    role: "user",
    content:
      "What about the cleanup function? When should I use it?",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    tokens: 18,
  },
  {
    id: "4",
    role: "assistant",
    content: `The cleanup function is crucial for preventing memory leaks and ensuring your component behaves correctly. Here's when you should use it:

When to Use Cleanup:

1. Subscriptions - WebSocket connections, event listeners
2. Timers - setInterval, setTimeout
3. API requests - Cancel pending requests on unmount

Example with Event Listener:

useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

The cleanup runs:
- Before the effect runs again (if dependencies change)
- When the component unmounts

This ensures you don't have stale event listeners or memory leaks!`,
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    tokens: 245,
  },
];

export default function ChatPage() {
  const [chats, setChats] = useState<ChatHistory[]>(initialChats);
  const [activeChat, setActiveChat] = useState<string | null>("1");
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("openai/gpt-oss-20b");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Token stats
  const [tokenStats] = useState({
    promptTokens: 42,
    completionTokens: 557,
    totalTokens: 599,
    tokensUsedToday: 15420,
    dailyLimit: 100000,
    averageResponseTime: 847,
    totalConversations: 24,
    estimatedCost: 0.0089,
  });

  const handleNewChat = useCallback(() => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: "New Conversation",
      date: "Today",
      preview: "Start typing...",
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChat(id);
    // In a real app, you'd fetch messages for this chat
    if (id === "1") {
      setMessages(sampleMessages);
    } else {
      setMessages([]);
    }
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChat === id) {
      setActiveChat(null);
      setMessages([]);
    }
  }, [activeChat]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        tokens: Math.floor(content.split(" ").length * 1.3),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/groq", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: content, model }),
        });

        const result = await response.json();
        const assistantText =
          result?.data?.text || result?.data || result?.message ||
          "I couldn't get a response from the GROQ API. Please try again.";

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantText,
          timestamp: new Date(),
          tokens: Math.max(1, Math.floor(String(assistantText).split(" ").length * 1.1)),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "There was an error connecting to the GROQ API. Please verify the API configuration and try again.",
          timestamp: new Date(),
          tokens: 12,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [model]
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Chat History */}
      <aside
        className={cn(
          "border-r border-border bg-sidebar transition-all duration-300 flex flex-col",
          leftSidebarOpen ? "w-72" : "w-14"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          {leftSidebarOpen && (
            <h1 className="font-semibold text-foreground">Chats</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="text-muted-foreground hover:text-foreground ml-auto"
          >
            {leftSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isCollapsed={!leftSidebarOpen}
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          model={model}
          onModelChange={setModel}
        />
      </main>

      {/* Right Sidebar - Token Stats */}
      <aside
        className={cn(
          "border-l border-border bg-sidebar transition-all duration-300 flex flex-col",
          rightSidebarOpen ? "w-72" : "w-14"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            {rightSidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
          {rightSidebarOpen && (
            <h1 className="font-semibold text-foreground">Stats</h1>
          )}
        </div>
        <TokenStats stats={tokenStats} isCollapsed={!rightSidebarOpen} />
      </aside>
    </div>
  );
}
