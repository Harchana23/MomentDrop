"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! 👋 I'm the MomentDrop assistant. Ask me how it works, what it costs, or anything about collecting your guests' photos.",
};

/** Render assistant text with simple Markdown links + line breaks (no HTML injection). */
function renderContent(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let key = 0;
  const pushText = (s: string) => {
    const lines = s.split("\n");
    lines.forEach((line, i) => {
      if (line) nodes.push(line);
      if (i < lines.length - 1) nodes.push(<br key={`br-${key++}`} />);
    });
  };
  const re = /\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) pushText(text.slice(last, m.index));
    const [, label, href] = m;
    const external = href.startsWith("http");
    nodes.push(
      <a
        key={`a-${key++}`}
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={{ color: "#B5654A", fontWeight: 600, textDecoration: "underline" }}
      >
        {label}
      </a>,
    );
    last = re.lastIndex;
  }
  if (last < text.length) pushText(text.slice(last));
  return nodes;
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Don't show on guest upload pages — the assistant is for owners & prospects.
  if (pathname?.startsWith("/e/")) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Request failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error && /configured/i.test(err.message)
          ? "The assistant isn't switched on yet. Please try again later, or email momentdropsharing@gmail.com."
          : "Sorry — I couldn't reach the assistant. Please email momentdropsharing@gmail.com.";
      setMessages((prev) => {
        const copy = prev.slice();
        copy[copy.length - 1] = { role: "assistant", content: msg };
        return copy;
      });
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Chat with us"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 120,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.7)",
          background: "linear-gradient(135deg,#C97F52,#B5654A)",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "0 18px 44px -12px rgba(201,127,82,.6)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span aria-hidden="true">{open ? "✕" : "💬"}</span>
      </button>

      {/* panel */}
      <div
        role="dialog"
        aria-label="MomentDrop assistant"
        aria-hidden={!open}
        style={{
          position: "fixed",
          right: 20,
          bottom: 90,
          zIndex: 119,
          width: "min(384px, calc(100vw - 40px))",
          height: "min(560px, calc(100vh - 130px))",
          display: "flex",
          flexDirection: "column",
          borderRadius: 22,
          overflow: "hidden",
          background: "rgba(255,251,246,.94)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "1px solid rgba(255,255,255,.75)",
          boxShadow: "0 30px 80px -24px rgba(90,50,40,.5)",
          transformOrigin: "bottom right",
          transition: "opacity .22s ease, transform .22s ease, visibility .22s",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open ? "translateY(0) scale(1)" : "translateY(10px) scale(.98)",
          fontFamily: "var(--font-sans-jakarta), sans-serif",
          color: "#2A1B24",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "14px 16px",
            background: "linear-gradient(135deg,#C97F52,#B5654A)",
            color: "#fff",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-tile.png"
            alt=""
            aria-hidden="true"
            style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>MomentDrop assistant</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Usually replies instantly</div>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,.2)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* messages */}
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}
        >
          {messages.map((m, i) => {
            const mine = m.role === "user";
            return (
              <div
                key={i}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  padding: "10px 13px",
                  borderRadius: 16,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: mine ? "#fff" : "#2A1B24",
                  background: mine ? "linear-gradient(135deg,#C97F52,#B5654A)" : "#fff",
                  border: mine ? "none" : "1px solid #EADFD4",
                  borderBottomRightRadius: mine ? 5 : 16,
                  borderBottomLeftRadius: mine ? 16 : 5,
                }}
              >
                {m.role === "assistant" && m.content === "" ? (
                  <span style={{ color: "#9B8676" }}>…</span>
                ) : (
                  renderContent(m.content)
                )}
              </div>
            );
          })}
        </div>

        {/* input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #EADFD4", background: "rgba(255,255,255,.6)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask about MomentDrop…"
            aria-label="Type your message"
            style={{
              flex: 1,
              resize: "none",
              maxHeight: 110,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #E4D9CF",
              background: "#fff",
              fontSize: 14.5,
              lineHeight: 1.4,
              outline: "none",
              color: "#2A1B24",
            }}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={busy || !input.trim()}
            style={{
              flex: "none",
              width: 42,
              height: 42,
              alignSelf: "flex-end",
              borderRadius: 12,
              border: "none",
              cursor: busy || !input.trim() ? "default" : "pointer",
              opacity: busy || !input.trim() ? 0.5 : 1,
              background: "linear-gradient(135deg,#C97F52,#B5654A)",
              color: "#fff",
              fontSize: 17,
            }}
          >
            <span aria-hidden="true">↑</span>
          </button>
        </form>
      </div>
    </>
  );
}
