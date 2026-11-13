import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import GoogleIcon from "../assets/icons8-google.svg";
import KalviumLogo from "../assets/kalvium-logo.svg";
import { supabase } from "../lib/supabase.js";
import { getUserRole } from "../hooks/useAuthStatus.js";
import { MENTOR_HOME, STUDENT_HOME } from "../components/AuthGate.jsx";

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();

    // Handle OAuth callback
    useEffect(() => {
        const handleAuthCallback = async () => {
            const hash = window.location.hash;

            if (hash && hash.includes("access_token")) {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    showError(error.message);
                    await supabase.auth.signOut();
                    return;
                }

                if (session) {
                    // Remove hash from URL
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );

                    // Land each role in its own dashboard home
                    const role = getUserRole(session.user);
                    navigate(
                        role === "mentor" ? MENTOR_HOME : role === "student" ? STUDENT_HOME : "/dashboard",
                        { replace: true }
                    );
                    return;
                }
            }

            // Handle OAuth errors
            const queryParams = new URLSearchParams(window.location.search);
            const errorCode = queryParams.get("error_code");
            const errorDescription = queryParams.get("error_description");

            if (errorCode || errorDescription) {
                showError(
                    "Access Denied: You must use an official @kalvium.com or @kalvium.community email address."
                );

                await supabase.auth.signOut();

                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                );
            }
        };

        handleAuthCallback();
    }, [navigate]);

    useEffect(() => {
        if (!errorMessage) return;

        setIsExiting(false);

        const displayTimer = setTimeout(() => {
            setIsExiting(true);
        }, 10000);

        return () => clearTimeout(displayTimer);
    }, [errorMessage]);

    useEffect(() => {
        if (!isExiting) return;

        const exitTimer = setTimeout(() => {
            setErrorMessage("");
            setIsExiting(false);
        }, 400);

        return () => clearTimeout(exitTimer);
    }, [isExiting]);

    const showError = (msg) => {
        setIsExiting(false);
        setErrorMessage(msg);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/login`,
            },
        });

        if (error) {
            showError(error.message);
        }
    };

    return (
        <div className="login">
            {errorMessage && (
                <div className={`error-toast ${isExiting ? "slide-out" : ""}`}>
                    <div className="error-icon-box">!</div>
                    <span className="error-message-text">
                        {errorMessage}
                    </span>
                </div>
            )}

            <title>Kalvium Portfolio | Profile Manager</title>

            <section className="login-left-side">
                <h1>
                    Kalvium <span style={{ color: "red" }}>Portfolio</span>
                </h1>

                <p>
                    Build Your Future.
                    <br />
                    Showcase Your Talent
                </p>
            </section>

            <section className="login-right-side">
                <div className="top-header">
                    <p>
                        <img
                            src={KalviumLogo}
                            alt="Kalvium Logo"
                        />
                        Kalvium | Profile Manager
                    </p>
                </div>

                <hr />

                <div className="google-login-container">
                    <div className="google-login-card">
                        <p>Welcome back!</p>
                        <p>Login to continue to Profile Manager</p>

                        <button
                            className="google-btn-login"
                            onClick={handleGoogleLogin}
                        >
                            <img
                                src={GoogleIcon}
                                alt="Google"
                            />
                            Continue With Google
                        </button>

                        <div style={{ margin: "16px 0 8px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                — or explore directly —
                            </div>
                            <Link
                                to="/student/dashboard"
                                style={{
                                    display: "block",
                                    padding: "10px 14px",
                                    backgroundColor: "#f0fdf4",
                                    color: "#166534",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    textDecoration: "none"
                                }}
                            >
                                🎓 Enter Student Dashboard (Skip Login)
                            </Link>
                            <Link
                                to="/mentor/dashboard"
                                style={{
                                    display: "block",
                                    padding: "10px 14px",
                                    backgroundColor: "#eff6ff",
                                    color: "#1e40af",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    textDecoration: "none"
                                }}
                            >
                                👨‍🏫 Enter Mentor Dashboard (Skip Login)
                            </Link>
                        </div>

                        <Link
                            to="/"
                            className="back-home-btn"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}