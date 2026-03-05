import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { login } from "../../utils/auth";
import logo_image from "../../assets/logo/logo_image.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await login(email, password);

      // save token
      localStorage.setItem("token", res.token);

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1200);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 400) {
        setError("Email and password are required");
      } else {
        setError("Login failed. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* LEFT */}
        <div className="hidden md:flex w-1/2 bg-[#8B1A1A] text-white flex-col items-center justify-center text-center p-12">
          <div className="bg-white p-5 rounded-full mb-6">
            <img src={logo_image} alt="logo" className="w-14 h-14" />
          </div>

          <p className="text-lg opacity-90 mb-3">
            Prometheus Institute of Technology
          </p>

          <h2 className="text-4xl font-bold">Welcome Back!</h2>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Welcome</h1>

          <p className="text-gray-500 mb-8">
            Login to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-3 text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* SUCCESS */}
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-40 py-3 rounded-full bg-[#8B1A1A] text-white font-semibold hover:bg-red-900 transition"
            >
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
