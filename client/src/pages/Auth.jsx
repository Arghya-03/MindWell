
import { useState } from "react";
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import API from "../services/api";
import "../App.css";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const response = await API.post(endpoint, formData);

      localStorage.setItem("mindwell_token", response.data.token);
      localStorage.setItem(
        "mindwell_user",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one"></div>
      <div className="auth-decoration auth-decoration-two"></div>

      <div className="auth-card">
        <a href="#" className="brand auth-brand">
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          <span>mindwell</span>
        </a>

        <div className="auth-heading">
          <span className="welcome-label">
            <Leaf size={14} />
            YOUR PERSONAL WELLNESS SPACE
          </span>

          <h1>
            {isLogin ? "Welcome back" : "Begin your journey"}
          </h1>

          <p>
            {isLogin
              ? "Take a breath. Your wellness journey continues here."
              : "Create your private space for reflection and growth."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <div className="auth-input-wrapper">
                <User size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={60}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin
            ? "New to MindWell?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </div>

        <div className="auth-privacy">
          <Lock size={14} />
          Your journal deserves a private and safe space.
        </div>
      </div>
    </div>
  );
}

export default Auth;
