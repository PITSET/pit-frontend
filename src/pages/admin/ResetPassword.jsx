// React Hooks
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// Heroicons
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

// Toast notifications
import { toast } from "react-hot-toast";

// Supabase client
import { supabase } from "../../lib/supabaseClient";

// Logo image
import logo_image from "../../assets/logo/logo_image.svg";

// svg images
import desktop_l from "../../assets/shapes/loginLeft.svg";
import desktop_r from "../../assets/shapes/loginRight.svg";

export default function ResetPassword() {
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Watch password for validation display
  const passwordValue = watch("password");

  /* ===============================
     RESET PASSWORD
     =============================== */

  const onSubmit = async (data) => {
    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully! Redirecting to login...");
      setIsCompleted(true);

      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);

    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(err.message || "Failed to reset password");
    }

    setLoading(false);
  };

  /* ===============================
     REDIRECT IF ALREADY LOGGED IN
     =============================== */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  /* ===============================
     SUCCESS STATE
     =============================== */

  if (isCompleted) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-gray-200 p-6 overflow-hidden">
        <div className="relative flex w-full max-w-[840px] sm:min-h-[440px] md:min-h-[524px] rounded-3xl overflow-hidden shadow-2xl bg-white">
          <div className="hidden sm:flex w-1/2 relative text-white flex-col items-center justify-center text-center overflow-hidden">
            <img
              src={desktop_l}
              alt=""
              className="hidden sm:block absolute top-0 left-0 h-full w-auto pointer-events-none"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white p-5 rounded-full mb-6">
                <img src={logo_image} alt="logo" className="w-14 h-14" />
              </div>
              <p className="text-lg opacity-90 mb-3">
                Prometheus Institute of Technology
              </p>
              <h2 className="text-4xl font-bold">Success!</h2>
            </div>
          </div>

          <div className="relative w-full sm:w-1/2 p-6 sm:pl-12 flex flex-col justify-center items-center">
            <img
              src={desktop_r}
              alt=""
              className="absolute bottom-0 left-0 rotate-180 sm:top-0 sm:left-auto sm:right-0 sm:rotate-0 
               h-[35%] sm:h-[35%] w-auto pointer-events-none select-none"
            />
            
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 text-center">
                Password Updated!
              </h1>
              <p className="text-gray-500 text-center mb-6">
                Your password has been reset successfully.<br />
                Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     MAIN UI
     =============================== */

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-200 p-6 overflow-hidden">
      <div className="relative flex w-full max-w-[840px] sm:min-h-[440px] md:min-h-[524px] rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Desktop Shape */}
        <img
          src={desktop_l}
          alt=""
          className="hidden sm:block absolute top-0 left-0 h-full w-auto pointer-events-none"
        />
        
        {/* LEFT SIDE */}
        <div className="hidden sm:flex w-1/2 relative text-white flex-col items-center justify-center text-center overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-5 rounded-full mb-6">
              <img src={logo_image} alt="logo" className="w-14 h-14" />
            </div>
            <p className="text-lg opacity-90 mb-3">
              Prometheus Institute of Technology
            </p>
            <h2 className="text-4xl font-bold">Reset Password</h2>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative w-full sm:w-1/2 p-6 sm:pl-12 flex flex-col justify-center items-center">
          <img
            src={desktop_r}
            alt=""
            className="absolute bottom-0 left-0 rotate-180 sm:top-0 sm:left-auto sm:right-0 sm:rotate-0 
             h-[35%] sm:h-[35%] w-auto pointer-events-none select-none"
          />

          <h1 className="hidden sm:block text-3xl sm:text-4xl font-bold mb-2 text-gray-900 text-center sm:text-left">
            New Password
          </h1>
          
          <div className="bg-white mb-2 rounded-full sm:hidden">
            <img src={logo_image} alt="logo" className="w-20 h-20" />
          </div>

          <p className="text-gray-500 mb-8 text-center">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
                })}
                className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3 text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}

            {/* BUTTON */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-40 py-3 rounded-full bg-[#8B1A1A] text-white font-semibold hover:bg-red-900 transition"
              >
                {loading ? "Updating..." : "UPDATE PASSWORD"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
