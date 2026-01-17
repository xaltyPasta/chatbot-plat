"use client";

import { use, useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    fileName?: string; // Track which file belongs to which message
};

const markdownStyles = `
  .chat-markdown p { margin-bottom: 0.5rem; line-height: 1.5; }
  .chat-markdown h1, .chat-markdown h2, .chat-markdown h3 { 
    font-size: 1.15rem; margin-top: 1rem; font-weight: 700; color: inherit;
  }
  .chat-markdown ul, .chat-markdown ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
  .chat-markdown table { width: 100%; border-collapse: collapse; margin: 1rem 0; background: #fff; color: #212529; }
  .chat-markdown th, .chat-markdown td { padding: 0.6rem; border: 1px solid #dee2e6; font-size: 0.875rem; }
  .chat-markdown thead { background-color: #f8f9fa; font-weight: bold; }
  .chat-markdown code { background: rgba(0,0,0,0.08); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
  .chat-markdown blockquote { border-left: 4px solid #dee2e6; padding-left: 1rem; color: #6c757d; font-style: italic; }
`;

export default function ProjectChatPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = use(params);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        fetch(`/api/projects/${projectId}/chat`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data)) setMessages(data); })
            .catch(() => setMessages([]));
    }, [projectId]);

    const sendMessage = async () => {
        if (!input.trim() && !file) return; // Allow sending if there's just a file or just text
        if (loading) return;

        const userContent = input;
        const selectedFile = file;

        // 1. Create message object with file metadata for the UI
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: userContent,
            fileName: selectedFile?.name // Store name to show in the chat bubble
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setFile(null);
        setLoading(true);

        try {
            // 2. Upload file ONLY if one was actually attached to THIS message
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                // Tip: You might want to pass a reference ID here so the backend 
                // knows exactly which message this file belongs to
                await fetch(`/api/projects/${projectId}/files`, {
                    method: "POST",
                    body: formData
                });
            }

            // 3. Send chat message
            const res = await fetch(`/api/projects/${projectId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userContent,
                    hasFile: !!selectedFile // Signal to backend if context should include a new file
                }),
            });

            const data = await res.json();
            if (data.reply) {
                setMessages((prev) => [...prev, {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.reply
                }]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{markdownStyles}</style>
            <div className="d-flex flex-column h-100 bg-white">
                <div className="flex-grow-1 overflow-auto p-3">
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>
                        {messages.map((m) => (
                            <div key={m.id} className={`d-flex flex-column mb-4 ${m.role === "user" ? "align-items-end" : "align-items-start"}`}>

                                {/* NEW: File Attachment UI inside the message stream */}
                                {m.fileName && (
                                    <div className="mb-1 p-2 bg-light border rounded small d-flex align-items-center" style={{ borderRadius: "10px", maxWidth: "70%" }}>
                                        <span className="me-2">📄</span>
                                        <span className="text-truncate">{m.fileName}</span>
                                    </div>
                                )}

                                <div
                                    className={`p-3 shadow-sm ${m.role === "user" ? "bg-primary text-white rounded-start" : "bg-light text-dark border rounded-end"}`}
                                    style={{ maxWidth: "85%", borderRadius: "15px" }}
                                >
                                    <div className="chat-markdown">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="d-flex justify-content-start mb-4">
                                <div className="bg-light p-3 border rounded shadow-sm text-muted" style={{ borderRadius: "15px" }}>
                                    <div className="spinner-grow spinner-grow-sm text-primary me-2" role="status"></div>
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-top p-3 bg-white">
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>

                        {/* Staged File Preview (Before Sending) */}
                        {file && (
                            <div className="mb-2 d-inline-flex align-items-center bg-light border rounded-pill px-3 py-1 small">
                                <span className="text-primary me-2">📎</span>
                                <span className="text-muted text-truncate" style={{ maxWidth: '200px' }}>{file.name}</span>
                                <button className="btn btn-sm text-danger ms-2 p-0" onClick={() => setFile(null)}>✕</button>
                            </div>
                        )}

                        <div className="input-group shadow-sm" style={{ borderRadius: '25px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
                            <label className="btn btn-white border-0 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                📎
                                <input type="file" hidden onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                            </label>

                            <input
                                className="form-control border-0 shadow-none px-3"
                                placeholder="Ask anything..."
                                value={input}
                                disabled={loading}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            />

                            <button className="btn btn-primary border-0 px-4" onClick={sendMessage} disabled={loading || (!input.trim() && !file)}>
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}