"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useMemo } from "react";

function SignupForm() {
    const params = useSearchParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState(params.get("email") || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Validation Regex Patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Password requirements: 8+ chars, 1 Upper, 1 Lower, 1 Number, 1 Special
    const passwordRequirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
    const isEmailValid = emailRegex.test(email);

    const canSubmit = name.trim() !== "" && isEmailValid && isPasswordValid && !loading;

    const handleSignup = async () => {
        if (!canSubmit) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push("/login?message=Account created successfully");
            } else {
                const data = await res.json();
                setError(data.message || "Signup failed.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: 450, borderRadius: "12px" }}>
                <h3 className="fw-bold mb-4 text-center">Create Account</h3>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input
                        className="form-control"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input
                        className={`form-control ${email && !isEmailValid ? "is-invalid" : ""}`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label small fw-bold">Password</label>
                    <input
                        className={`form-control ${password && !isPasswordValid ? "is-invalid" : ""}`}
                        type="password"
                        placeholder="Enter strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Password Checklist UI */}
                    <div className="mt-3 p-3 bg-light rounded border" style={{ fontSize: "0.8rem" }}>
                        <div className="fw-bold mb-1 text-secondary">Security Requirements:</div>
                        <ul className="list-unstyled mb-0">
                            <li className={passwordRequirements.length ? "text-success" : "text-muted"}>
                                {passwordRequirements.length ? "✓" : "○"} At least 8 characters
                            </li>
                            <li className={passwordRequirements.upper ? "text-success" : "text-muted"}>
                                {passwordRequirements.upper ? "✓" : "○"} One uppercase letter (A-Z)
                            </li>
                            <li className={passwordRequirements.lower ? "text-success" : "text-muted"}>
                                {passwordRequirements.lower ? "✓" : "○"} One lowercase letter (a-z)
                            </li>
                            <li className={passwordRequirements.number ? "text-success" : "text-muted"}>
                                {passwordRequirements.number ? "✓" : "○"} One number (0-9)
                            </li>
                            <li className={passwordRequirements.special ? "text-success" : "text-muted"}>
                                {passwordRequirements.special ? "✓" : "○"} One special character (!@#$%)
                            </li>
                        </ul>
                    </div>
                </div>

                <button
                    className="btn btn-success w-100 py-2 fw-bold"
                    onClick={handleSignup}
                    disabled={!canSubmit}
                >
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : "Create Account"}
                </button>

                <p className="text-center mt-4 small text-muted">
                    Already have an account? <a href="/login" className="text-primary text-decoration-none fw-bold">Login</a>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}