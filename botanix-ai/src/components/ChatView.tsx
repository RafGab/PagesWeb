"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Plus } from "lucide-react";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";
import { NotConfigured } from "./NotConfigured";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatView({ conversations, aiConfigured, aiHelp }: { conversations: { id: string; title: string }[]; aiConfigured: boolean; aiHelp?: string[] }) {
  const { t } = useI18n();
  const a = t.assistant;
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function open(id: string) {
    const r = await api<{ conversation: { messages: Msg[] } }>(`/api/conversations/${id}`);
    setConvId(id);
    setMessages(r.conversation.messages);
  }

  if (!aiConfigured) return <NotConfigured message={t.errors.AI_NOT_CONFIGURED} help={aiHelp} />;

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <aside className="card hidden p-3 lg:block">
        <button type="button" className="btn btn-ghost mb-2 w-full !justify-start" onClick={() => { setConvId(null); setMessages([]); }}><Plus className="h-4 w-4" aria-hidden /> {a.newChat}</button>
        <ul className="space-y-1 text-sm">{conversations.map((c) => <li key={c.id}><button type="button" onClick={() => open(c.id)} className={`w-full truncate rounded-lg px-2 py-1.5 text-left hover:bg-[var(--surface-2)] ${c.id === convId ? "bg-[var(--surface-2)] font-semibold" : ""}`}>{c.title}</button></li>)}</ul>
      </aside>
      <section className="card flex min-h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {messages.length === 0 && <p className="muted">{a.intro}</p>}
          {testData && <Notice tone="test">{t.common.testData}</Notice>}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 ${m.role === "user" ? "ml-auto bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-[var(--surface-2)]"}`}>{m.content}</div>
          ))}
          {busy && <div className="w-24 animate-pulse rounded-2xl bg-[var(--surface-2)] px-4 py-2.5">…</div>}
          <div ref={endRef} />
        </div>
        {error && <div className="px-4"><Notice tone="danger">{error}</Notice></div>}
        <form className="flex gap-2 border-t border-[var(--line)] p-3" onSubmit={async (e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text) return;
          setInput("");
          setError(null);
          setMessages((m) => [...m, { role: "user", content: text }]);
          setBusy(true);
          try {
            const r = await api<{ conversationId: string; reply: string; isTestFixture: boolean }>("/api/chat", { method: "POST", json: { conversationId: convId ?? undefined, message: text } });
            setConvId(r.conversationId);
            setTestData(r.isTestFixture);
            setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
          } catch (err) {
            setError(err instanceof ApiError ? (err.code === "NETWORK" ? t.errors.network : err.message) : t.common.error);
          } finally {
            setBusy(false);
          }
        }}>
          <label htmlFor="msg" className="sr-only">{a.placeholder}</label>
          <textarea id="msg" className="textarea min-h-11 flex-1 resize-none" rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={a.placeholder} maxLength={4000}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
          <button className="btn btn-primary" disabled={busy || !input.trim()} aria-label={a.send}><Send className="h-4 w-4" aria-hidden /></button>
        </form>
      </section>
    </div>
  );
}
