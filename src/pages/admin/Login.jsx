import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../utils/auth";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import logo_image from "../../assets/logo_image.svg";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo_image}
            alt="logo"
            className="h-20 w-20 object-contain mb-4"
          />

          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>

          <p className="text-sm text-gray-500">Sign in to manage the website</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Email
            </label>

            <input
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Password
            </label>

            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {isVisible ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
