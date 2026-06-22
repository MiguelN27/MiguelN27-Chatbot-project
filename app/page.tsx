"use client";

import { useState, useCallback, useEffect } from "react";
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

const LOCAL_STORAGE_KEY = "chat_messages_";
const CHATS_STORAGE_KEY = "chat_list";
const ACTIVE_CHAT_STORAGE_KEY = "active_chat";
const getStorageKey = (chatId: string) => `${LOCAL_STORAGE_KEY}${chatId}`;

function sanitizeMarkdownText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, (match) =>
      match.replace(/```/g, "\n").trim()
    )
    .replace(/(^|\n)#+\s*/g, "$1")
    .replace(/(^|\n)>\s*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/(^|\n)[-\*+]\s+/g, "$1")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [model, setModel] = useState("openai/gpt-oss-20b");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Session token stats (accumulated during this browser session)
  const [tokenStats, setTokenStats] = useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    tokensUsedToday: 0,
    dailyLimit: 100000,
    averageResponseTime: 847,
    totalConversations: 24,
    estimatedCost: 0.0,
  });

  // Load chats from localStorage on mount
  useEffect(() => {
    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    if (storedChats) {
      try {
        setChats(JSON.parse(storedChats));
      } catch (error) {
        console.error("Failed to parse stored chats:", error);
        setChats(initialChats);
      }
    }
  }, []);

  // Load active chat from localStorage on mount
  useEffect(() => {
    const storedActiveChat = localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
    if (storedActiveChat) {
      setActiveChat(storedActiveChat);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  // Save active chat to localStorage whenever it changes
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeChat);
    }
  }, [activeChat]);
  useEffect(() => {
    if (!activeChat) return;

    const storedMessages = localStorage.getItem(getStorageKey(activeChat));
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages) as Array<{
          id: string;
          role: "user" | "assistant";
          content: string;
          timestamp: string;
          tokens: number;
        }>;

        setMessages(
          parsed.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          }))
        );
      } catch (error) {
        console.error("Failed to parse stored chat history:", error);
        setMessages(activeChat === "1" ? sampleMessages : []);
      }
    } else {
      setMessages(activeChat === "1" ? sampleMessages : []);
    }
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    localStorage.setItem(getStorageKey(activeChat), JSON.stringify(messages));
  }, [messages, activeChat]);

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
  }, []);

  const handleClearConversation = useCallback(() => {
    setMessages([]);
    if (activeChat) {
      localStorage.removeItem(getStorageKey(activeChat));
    }
  }, [activeChat]);

  const handleDeleteChat = useCallback(
    (id: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      localStorage.removeItem(getStorageKey(id));
      if (activeChat === id) {
        setActiveChat(null);
        setMessages([]);
      }
    },
    [activeChat]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      setErrorMessage("");

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        tokens: Math.floor(content.split(" ").length * 1.3),
      };

      const conversationForApi = [...messages, userMessage].map((message) => ({
        role: message.role,
        content: message.content,
      }));

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/groq", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            messages: conversationForApi,
            model,
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const serverMessage =
            errorPayload?.error || errorPayload?.message ||
            `Server responded with status ${response.status}.`;
          throw new Error(serverMessage);
        }

        const result = await response.json();

        // If the API returned a usage object, extract prompt/completion tokens
        // and accumulate them for the session. Support common field names.
        try {
          const usage = result?.usage ?? null;
          if (usage) {
            const prompt = Number(
              usage.prompt_tokens ?? usage.promptTokens ?? usage.prompt ?? 0
            );
            const completion = Number(
              usage.completion_tokens ??
                usage.completionTokens ??
                usage.completion ??
                0
            );

            setTokenStats((prev) => ({
              ...prev,
              promptTokens: prev.promptTokens + (isNaN(prompt) ? 0 : prompt),
              completionTokens:
                prev.completionTokens + (isNaN(completion) ? 0 : completion),
              totalTokens:
                prev.totalTokens + (isNaN(prompt) ? 0 : prompt) + (isNaN(completion) ? 0 : completion),
              // Update daily/session usage so the progress bar reflects the new totals
              tokensUsedToday:
                prev.tokensUsedToday + (isNaN(prompt) ? 0 : prompt) + (isNaN(completion) ? 0 : completion),
              // Optionally update estimated cost slightly (placeholder rate)
              estimatedCost:
                prev.estimatedCost + ((isNaN(prompt) ? 0 : prompt) + (isNaN(completion) ? 0 : completion)) * 0.000001,
            }));
          }
        } catch (e) {
          // ignore usage parsing errors
        }

        const rawAssistantText =
          result?.data?.text || result?.data || result?.message;

        if (!rawAssistantText || typeof rawAssistantText !== "string") {
          throw new Error(
            "The GROQ API returned an unexpected response. Please try again."
          );
        }

        const assistantText = sanitizeMarkdownText(rawAssistantText);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantText,
          timestamp: new Date(),
          tokens: Math.max(1, Math.floor(String(assistantText).split(" ").length * 1.1)),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const humanMessage =
          error instanceof Error && error.message
            ? error.message
            : "There was an error connecting to the GROQ API. Please check your connection and try again.";

        setErrorMessage(
          `Sorry, something went wrong. ${humanMessage}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, model]
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
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          errorMessage={errorMessage}
          model={model}
          onModelChange={setModel}
          onClearConversation={handleClearConversation}
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
