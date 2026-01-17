"use client";

import { use, useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    fileName?: string;
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
        if (!input.trim() && !file) return;
        if (loading) return;

        const userContent = input;
        const selectedFile = file;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: userContent,
            fileName: selectedFile?.name
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setFile(null);
        setLoading(true);

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                await fetch(`/api/projects/${projectId}/files`, {
                    method: "POST",
                    body: formData
                });
            }

            const res = await fetch(`/api/projects/${projectId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userContent,
                    hasFile: !!selectedFile
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

                {/* Chat Display Area */}
                <div className="flex-grow-1 overflow-auto p-3 p-md-4">
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>
                        {messages.length === 0 && !loading && (
                            <div className="text-center mt-5 pt-5">
                                <h2 className="text-muted opacity-50">Start your conversation</h2>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} className={`d-flex mb-4 ${m.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                                <div className="d-flex flex-column" style={{ maxWidth: "85%" }}>
                                    {m.fileName && (
                                        <div className="align-self-end mb-1 p-2 bg-light border rounded-3 small d-flex align-items-center">
                                            <span className="me-2">📄</span>
                                            <span className="text-truncate" style={{ maxWidth: "150px" }}>{m.fileName}</span>
                                        </div>
                                    )}
                                    <div
                                        className={`p-3 ${m.role === "user" ? "bg-light border rounded-4 text-dark" : "text-dark"}`}
                                        style={{ borderRadius: "18px" }}
                                    >
                                        <div className="chat-markdown">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="d-flex justify-content-start mb-4">
                                <div className="text-muted small ps-2">
                                    <div className="spinner-grow spinner-grow-sm text-primary opacity-50" role="status"></div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* Gemini Style Input Area */}
                <div className="p-3 bg-white">
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>

                        {/* Staged File Indicator */}
                        {file && (
                            <div className="mt-3 ms-2 d-inline-flex align-items-center bg-light border rounded-3 px-3 py-2 shadow-sm mb-2">
                                <span className="me-2">📄</span>
                                <small className="text-truncate" style={{ maxWidth: "200px" }}>{file.name}</small>
                                <button
                                    className="btn btn-sm ms-2 p-0 text-muted"
                                    onClick={() => setFile(null)}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div
                            className="d-flex align-items-end border rounded-4 px-3 py-2 shadow-sm"
                            style={{ minHeight: "64px", border: "none", backgroundColor: "#f0f4f9" }}
                        >
                            {/* File attach */}
                            <label className="mb-2 me-2" style={{ cursor: "pointer" }}>
                                <div className="btn btn-link text-dark p-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </label>

                            {/* Auto-expanding Textarea */}
                            <textarea
                                className="form-control border-0 shadow-none bg-transparent flex-grow-1"
                                placeholder=""
                                rows={1}
                                style={{ fontSize: "1.1rem", resize: "none", paddingBottom: "8px" }}
                                value={input}
                                disabled={loading}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />

                            {/* Blue Circular Send Button */}
                            <div className="mb-1">
                                <button
                                    className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 transition-all ${(input.trim() || file) ? "btn-primary" : "btn-outline-secondary border-0"}`}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        backgroundColor: (input.trim() || file) ? "#0b57d0" : "transparent"
                                    }}
                                    disabled={loading || (!input.trim() && !file)}
                                    onClick={sendMessage}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm text-white" role="status"></span>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" fill={(input.trim() || file) ? "white" : "#444746"}>
                                            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}