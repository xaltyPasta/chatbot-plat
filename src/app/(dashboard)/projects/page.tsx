"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const startProject = async () => {
        if (!message.trim() || loading) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("message", message);
            if (file) formData.append("file", file);

            const res = await fetch("/api/projects/start", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to start project");
            }

            const { projectId } = await res.json();

            setMessage("");
            setFile(null);

            router.push(`/projects/${projectId}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center px-3 bg-white">
            <div className="w-100 mb-5" style={{ maxWidth: 760 }}>
                {/* Large Title like Gemini */}
                <h1 className="display-5 fw-semibold text-center mb-5" style={{ color: "#444746" }}>
                    Have an  Idea ?
                </h1>

                {/* Gemini-style Input Bar */}
                <div
                    className="d-flex align-items-end border rounded-4 px-3 py-2 bg-light shadow-sm"
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
                            onChange={(e) =>
                                setFile(e.target.files ? e.target.files[0] : null)
                            }
                        />
                    </label>

                    {/* Text input (Auto-expanding style) */}
                    <textarea
                        className="form-control border-0 shadow-none bg-transparent flex-grow-1"
                        placeholder="Transform your ideas into projects"
                        rows={1}
                        style={{ fontSize: "1.1rem", resize: "none", paddingBottom: "8px" }}
                        value={message}
                        disabled={loading}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                startProject();
                            }
                        }}
                    />

                    {/* Gemini-style Circular Send Button */}
                    <div className="mb-1">
                        <button
                            className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 transition-all ${message.trim() ? "btn-primary" : "btn-outline-secondary border-0"
                                }`}
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: message.trim() ? "#0b57d0" : "transparent"
                            }}
                            disabled={loading || !message.trim()}
                            onClick={startProject}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm text-white" role="status"></span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" fill={message.trim() ? "white" : "#444746"}>
                                    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Attached file indicator */}
                {file && (
                    <div className="mt-3 ms-2 d-inline-flex align-items-center bg-light border rounded-3 px-3 py-2 shadow-sm">
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
            </div>
        </div>
    );
}