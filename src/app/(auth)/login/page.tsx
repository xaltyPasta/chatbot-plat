"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleCredentialsLogin = async () => {
        if (!email || !password) {
            setLocalError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setLocalError(null);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false, // Prevents automatic redirect to the error page
            });

            if (res?.error) {
                setLoading(false);

                // Route handling based on authOptions error strings
                if (res.error === "USER_NOT_FOUND") {
                    router.push(`/signup?email=${encodeURIComponent(email)}`);
                } else if (res.error === "INVALID_PASSWORD") {
                    setLocalError("Incorrect password. Please try again.");
                } else {
                    setLocalError("An error occurred during login.");
                }
                return;
            }

            if (res?.ok) {
                router.push("/projects");
                router.refresh();
            }
        } catch (err) {
            setLoading(false);
            setLocalError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: 420, borderRadius: "12px" }}>
                <h3 className="fw-bold mb-4 text-center">Login</h3>

                <button
                    className="btn btn-outline-dark w-100 mb-3 d-flex align-items-center justify-content-center py-2"
                    disabled={loading}
                    onClick={() => signIn("google", { callbackUrl: "/projects" })}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="me-2"
                        style={{ width: '18px' }}
                    />
                    Continue with Google
                </button>

                <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted small text-uppercase">or</span>
                    <hr className="flex-grow-1" />
                </div>

                <div className="mb-3">
                    <label className="form-label small fw-bold">Email</label>
                    <input
                        className="form-control py-2"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label small fw-bold">Password</label>
                    <input
                        className="form-control py-2"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        disabled={loading}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCredentialsLogin()}
                    />
                </div>

                {localError && (
                    <div className="alert alert-danger py-2 small mb-3">
                        {localError}
                    </div>
                )}

                <button
                    className="btn btn-primary w-100 py-2 fw-bold"
                    onClick={handleCredentialsLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                        "Sign In"
                    )}
                </button>

                <p className="text-center mt-4 small text-muted">
                    Don't have an account? <a href="/signup" className="text-primary text-decoration-none fw-bold">Sign up</a>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}