export default function HomePage() {
    return (
        <div className="container mt-5 text-center">
            <h1 className="fw-bold">Chatbot Platform</h1>
            <p className="text-muted mt-3">
                Chat with your files securely using Gemini-powered agents.
            </p>

            <div className="mt-4">
                <a href="/signup" className="btn btn-primary me-2">
                    Get Started
                </a>
                <a href="/login" className="btn btn-outline-secondary">
                    Login
                </a>
            </div>
        </div>
    );
}
