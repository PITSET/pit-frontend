// React Hooks
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// Heroicons (password show/hide)
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

// Toast notifications
import { toast } from "react-hot-toast";

// API
import { acceptInvite } from "../../lib/services/adminManagementService";

// Logo image
import logo_image from "../../assets/logo/logo_image.svg";

// SVG images
import desktop_r from "../../assets/shapes/loginRight.svg";

export default function AcceptInvite() {
  /* ===============================
     STATE
     =============================== */

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Password inputs
  const passwordValue = watch("password");

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  /* ===============================
     EXTRACT TOKEN FROM URL
     =============================== */

  useEffect(() => {
    const processInvitation = async () => {
      try {
        // Check query parameters for custom token
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        const emailFromUrl = params.get("email");
        
        // Check for error in URL (from Supabase fallback)
        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");
        
        if (errorParam) {
          toast.error(errorDescription || "Invalid invitation link");
          return;
        }

        // Store token and email for later use
        if (tokenFromUrl && emailFromUrl) {
          setToken(tokenFromUrl);
          setEmail(emailFromUrl);
          setIsValidToken(true);
        }
      } catch (err) {
        console.error("Error processing invitation:", err);
      }
    };
    
    processInvitation();
  }, []);

  /* ===============================
     PASSWORD VISIBILITY TOGGLE
     =============================== */

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  /* ===============================
     ACCEPT INVITATION
     =============================== */

  const onSubmit = async (data) => {
    if (!data.password) {
      toast.error("Password is required");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token || !email) {
      toast.error("Invalid invitation link");
      return;
    }

    setLoading(true);

    try {
      // Use the custom API endpoint
      const response = await acceptInvite({
        token,
        email,
        password: data.password,
      });

      if (response.success) {
        toast.success("Password set successfully! You can now log in.");
        setIsCompleted(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to set password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
     =============================== */

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Set!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <EyeSlashIcon className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation Link</h2>
          <p className="text-gray-600">
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo_image} alt="PIT Logo" className="h-16" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Set Your Password
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Create a password for your admin account
          </p>

          {/* Email Display */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
              <p className="text-sm text-gray-500">Invited email:</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition-all"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition-all"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#8B1A1A] text-white font-semibold rounded-xl hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting password...
                </>
              ) : (
                "Set Password"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B1A1A] to-red-900">
          <img
            src={desktop_r}
            alt="Decorative"
            className="absolute bottom-0 right-0 w-64 h-64 object-contain opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl font-bold mb-4">Welcome to PIT</h2>
              <p className="text-xl opacity-90">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
