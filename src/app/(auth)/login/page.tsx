"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const params = useSearchParams();
    const error = params.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleCredentialsLogin = async () => {
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error === "USER_NOT_FOUND") {
            router.push(`/signup?email=${email}`);
            return;
        }

        if (res?.ok) {
            router.push("/projects");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 420 }}>
            <h3 className="mb-3">Login</h3>

            <button
                className="btn btn-danger w-100 mb-3"
                onClick={() => signIn("google", { callbackUrl: "/projects" })}
            >
                Continue with Google
            </button>

            <hr />

            <input
                className="form-control mb-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                className="form-control mb-3"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className="btn btn-primary w-100"
                onClick={handleCredentialsLogin}
            >
                Login
            </button>

            {error && (
                <div className="alert alert-danger mt-3">
                    Invalid login attempt
                </div>
            )}
        </div>
    );
}
