"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://kelana-travel-production.up.railway.app/api/v1';
const res = await fetch(`${baseUrl}/auth/register`, {

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          selectConversation(data[0].id, data[0].title);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectConversation = async (id: number, title: string) => {
    setActiveConvId(id);
    setActiveTitle(title);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewConversation = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: "New Conversation" })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([]);
        setActiveConvId(data.conversation_id);
        setActiveTitle("New Conversation");
        fetchConversations();
      }
    } catch (e) {
      console.error(e);
    }
  };

const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    let currentConvId = activeConvId;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // Auto-create conversation thread if none exists
    if (!currentConvId) {
      try {
        const convRes = await fetch(`${API_URL}/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: inputMsg.slice(0, 30) })
        });

        if (convRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (convRes.ok) {
          const convData = await convRes.json();
          currentConvId = convData.conversation_id;
          setActiveConvId(currentConvId);
          setActiveTitle(inputMsg.slice(0, 30));
        } else {
          return;
        }
      } catch (err) {
        console.error("Error creating conversation:", err);
        return;
      }
    }

    const currentText = inputMsg;
    setInputMsg("");

    // Optimistically render user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: currentText,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentText })
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.ok) {
        const aiMsg = await res.json();
        setMessages((prev) => [...prev, aiMsg]);
        fetchConversations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {/* Sidebar - Conversation List */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4 border-r border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">Conversations</h2>
          <button
            onClick={startNewConversation}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 text-sm rounded font-medium"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id, c.title)}
              className={`w-full text-left p-3 rounded-lg text-sm transition ${
                activeConvId === c.id ? "bg-blue-600 text-white font-medium" : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <p className="truncate">{c.title}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        <Link href="/trips" className="text-xs text-slate-400 hover:text-white mt-4 text-center">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header - Conversation Title (UX Win 1) */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h1 className="font-bold text-gray-800 text-lg">{activeTitle || "KelanaAI Chat"}</h1>
          <span className="text-xs text-gray-500">Multi-Turn Context Active</span>
        </div>

        {/* Message History Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
              </div>
              {/* Message Timestamp (UX Win 4) */}
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}

          {/* Typing Indicator (UX Win 3) */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 text-sm italic">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              KelanaAI is thinking...
            </div>
          )}

          {/* Ref element for Auto-scroll (UX Win 2) */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-3 bg-white">
          <input
            type="text"
            placeholder="Type a message (e.g., 'Plan a family trip to Japan')..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}