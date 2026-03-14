// React Hooks
import { useState, useEffect } from "react";

// Heroicons (password show/hide)
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Toast notifications (like Google, Facebook login)
import { toast } from "react-hot-toast";

// Auth utility (handles API request)
import { login } from "../../utils/auth";

// Supabase client
import { supabase } from "../../lib/supabaseClient";

// Logo image
import logo_image from "../../assets/logo/logo_image.svg";

// svg images
import desktop_l from "../../assets/shapes/loginLeft.svg";
import desktop_r from "../../assets/shapes/loginRight.svg";

export default function Login() {
  /* ===============================
     FORM STATE
     =============================== */

  // User email input
  const [email, setEmail] = useState("");

  // User password input
  const [password, setPassword] = useState("");

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Show forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  /* ===============================
     UI STATE
     =============================== */

  // Loading indicator during login request
  const [loading, setLoading] = useState(false);

  /* ===============================
     AUTO REDIRECT IF ALREADY LOGGED IN
     =============================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If token exists → redirect to dashboard
    if (token) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  /* ===============================
     PASSWORD VISIBILITY TOGGLE
     =============================== */

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  /* ===============================
     FORGOT PASSWORD
     =============================== */

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    setForgotPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset link sent! Check your email.");
      setShowForgotPassword(false);
    } catch (err) {
      toast.error(err.message || "Failed to send reset email");
    }
    
    setForgotPasswordLoading(false);
  };

  /* ===============================
     LOGIN FORM SUBMISSION
     =============================== */

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh

    // Start loading state
    setLoading(true);

    try {
      // Call login API using Supabase auth
      await login(email, password);

      // Show success message (toast notification)
      toast.success("Login successful! Redirecting...");

      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1200);
    } catch (err) {
      /* ===============================
         ERROR HANDLING - Show toast notification
         =============================== */

      // Supabase auth error message
      if (err.message) {
        // Handle common Supabase auth errors
        if (err.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else if (err.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email address");
        } else if (err.message.includes("Too many requests")) {
          toast.error("Too many login attempts. Please try again later.");
        } else {
          toast.error(err.message);
        }
      }

      // Backend error message
      else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }

      // Backend error field
      else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      }

      // Unauthorized
      else if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      }

      // Missing fields
      else if (err.response?.status === 400) {
        toast.error("Email and password are required");
      }

      // Generic fallback
      else {
        toast.error("Login failed. Please try again.");
      }
    }

    // Stop loading
    setLoading(false);
  };

  /* ===============================
     UI LAYOUT
     =============================== */

  return (
    // ===============================
    // PAGE CONTAINER
    // ===============================
    <div className="relative flex items-center justify-center min-h-screen bg-gray-200 p-6 overflow-hidden">
      {/* ===============================
    MAIN LOGIN CARD
    =============================== */}
      <div className="relative flex w-full max-w-[840px] sm:min-h-[440px] md:min-h-[524px] rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Desktop Shape */}
        <img
          src={desktop_l}
          alt=""
          className="hidden sm:block absolute top-0 left-0 h-full w-auto pointer-events-none"
        />
        {/* ===============================
      LEFT SIDE (DESKTOP ONLY)
      =============================== */}
        <div className="hidden sm:flex w-1/2 relative text-white flex-col items-center justify-center text-center overflow-hidden">
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-5 rounded-full mb-6">
              <img src={logo_image} alt="logo" className="w-14 h-14" />
            </div>

            <p className="text-lg opacity-90 mb-3">
              Prometheus Institute of Technology
            </p>

            <h2 className="text-4xl font-bold">Welcome Back!</h2>
          </div>
        </div>

        {/* ===============================
      RIGHT SIDE (LOGIN FORM)
      =============================== */}
        <div className="relative w-full sm:w-1/2 p-6 sm:pl-12 flex flex-col justify-center items-center">
          {/* Desktop Shape */}
          <img
            src={desktop_r}
            alt=""
            className="absolute bottom-0 left-0 rotate-180 sm:top-0 sm:left-auto sm:right-0 sm:rotate-0 
             h-[35%] sm:h-[35%] w-auto pointer-events-none select-none"
          />

          {/* Title */}
          <h1 className="hidden sm:block text-3xl sm:text-4xl font-bold mb-2 text-gray-900 text-center sm:text-left">
            Welcome
          </h1>
          {/* logo */}
          <div className="bg-white mb-2 rounded-full sm:hidden">
            <img src={logo_image} alt="logo" className="w-20 h-20" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-500 mb-8 text-center">
            Login to your account to continue
          </p>

          {/* ===============================
        LOGIN FORM
        =============================== */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              required
              autoComplete="username"
              name="email"
              id="email"
              className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                autoComplete="current-password"
                name="password"
                id="password"
                className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
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

            {/* BUTTON */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-40 py-3 rounded-full bg-[#8B1A1A] text-white font-semibold hover:bg-red-900 transition"
              >
                {loading ? "Logging in..." : "LOG IN"}
              </button>
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-gray-600 hover:text-[#8B1A1A] underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
          
          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6">
              <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleForgotPassword} className="w-full space-y-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="px-6 py-2 rounded-full bg-[#8B1A1A] text-white font-semibold hover:bg-red-900"
                  >
                    {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
