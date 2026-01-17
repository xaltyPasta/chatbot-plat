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

            // reset local state
            setMessage("");
            setFile(null);

            router.push(`/projects/${projectId}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-100 d-flex flex-column justify-content-center align-items-center px-3">
            <h4 className="mb-4 text-muted text-center">
                Start typing to create your first project
            </h4>

            {/* ChatGPT-style input bar */}
            <div className="w-100" style={{ maxWidth: 720 }}>
                <div className="d-flex align-items-center border rounded px-3 py-2 bg-white shadow-sm">
                    {/* File attach */}
                    <label className="me-2 mb-0" style={{ cursor: "pointer" }}>
                        📎
                        <input
                            type="file"
                            hidden
                            onChange={(e) =>
                                setFile(e.target.files ? e.target.files[0] : null)
                            }
                        />
                    </label>

                    {/* Text input */}
                    <input
                        className="form-control border-0 shadow-none"
                        placeholder="Send a message…"
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

                    {/* Send button */}
                    <button
                        className="btn btn-primary ms-2"
                        disabled={loading || !message.trim()}
                        onClick={startProject}
                    >
                        {loading ? "…" : "➤"}
                    </button>
                </div>

                {/* Attached file indicator */}
                {file && (
                    <div className="mt-2 text-muted small">
                        Attached: <strong>{file.name}</strong>
                    </div>
                )}
            </div>
        </div>
    );
}
