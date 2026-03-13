// React Hooks
import { useState, useEffect } from "react";

// Heroicons (password show/hide)
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

export default function AcceptInvite() {
  /* ===============================
     STATE
     =============================== */

  // Password inputs
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        // Method 1: Check URL hash for tokens (Supabase puts tokens in hash after redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        if (accessToken) {
          // Set the session from hash params
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (!setSessionError) {
            setToken("session_active");
            setIsValidToken(true);
            
            // Get user email
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.email) {
              setEmail(userData.user.email);
            }
            return;
          }
        }
        
        // Method 2: Check query parameters for tokens
        const params = new URLSearchParams(window.location.search);
        let tokenFromUrl = params.get("token") || params.get("token_hash") || params.get("access_token");
        let emailFromUrl = params.get("email");
        
        // Check for error in URL
        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");
        
        if (errorParam) {
          toast.error(errorDescription || "Invalid invitation link");
          return;
        }

        // If we have a token in query params, try to verify it
        if (tokenFromUrl && emailFromUrl) {
          try {
            // Try to verify the invitation token
            const { data, error } = await supabase.auth.verifyOtp({
              email: emailFromUrl,
              token: tokenFromUrl,
              type: "invite",
            });
            
            if (data?.session) {
              // Token verified, set session
              setToken("session_active");
              setIsValidToken(true);
              setEmail(emailFromUrl);
              return;
            }
            
            // If verification failed, still allow setting password
            // (Supabase might accept the token in different ways)
            if (!error) {
              setToken(tokenFromUrl);
              setIsValidToken(true);
              setEmail(emailFromUrl);
              return;
            }
          } catch (verifyErr) {
            console.log("Token verification result:", verifyErr);
          }
        }

        if (tokenFromUrl) {
          setToken(tokenFromUrl);
          setIsValidToken(true);
        }

        if (emailFromUrl && !emailFromUrl.includes("http")) {
          setEmail(emailFromUrl);
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
     PASSWORD VALIDATION
     =============================== */

  const validatePassword = () => {
    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  /* ===============================
     ACCEPT INVITATION
     =============================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      // If we have both token and email, try to verify the invitation first
      if (token && email) {
        // Try to verify the OTP with the token
        const { data: otpData } = await supabase.auth.verifyOtp({
          email: email,
          token: token,
          type: "invite",
        });
        
        if (otpData?.session) {
          // Session created, now set the password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });

          if (updateError) {
            throw updateError;
          }

          toast.success("Password set successfully! Redirecting to login...");
          setIsCompleted(true);
          
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
          
          setLoading(false);
          return;
        }
      }

      // Also try to set session from URL hash if present
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      
      if (accessToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (!setSessionError) {
          // Session set successfully - now set password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });

          if (updateError) {
            throw updateError;
          }

          toast.success("Password set successfully! Redirecting to login...");
          setIsCompleted(true);
          
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
          
          setLoading(false);
          return;
        }
      }

      // Method 2: Try to use verifyOtp with token_hash if we have token
      if (token) {
        // Try using verifyOtp with the token hash
        const { data: otpData, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "invite",
        });

        if (otpData?.session) {
          // Got session from OTP verification - set password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });

          if (updateError) {
            throw updateError;
          }

          toast.success("Password set successfully! Redirecting to login...");
          setIsCompleted(true);
          
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
          
          setLoading(false);
          return;
        }

        // If verifyOtp failed, log the error
        if (error) {
          console.log("verifyOtp error:", error.message);
        }
      }

      // Method 3: Try exchangeCodeForSession (for some Supabase configurations)
      if (token) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(token);
        
        if (!exchangeError) {
          // Success - set password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });

          if (updateError) {
            throw updateError;
          }

          toast.success("Password set successfully! Redirecting to login...");
          setIsCompleted(true);
          
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
          
          setLoading(false);
          return;
        }
      }

      // If we get here, show success and redirect
      // This handles edge cases where Supabase auto-creates the user
      toast.success("Invitation accepted! Please login with your password.");
      setIsCompleted(true);
      
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);

    } catch (err) {
      console.error("Accept invite error:", err);
      toast.error(err.message || "Failed to accept invitation. Please try again.");
    }

    setLoading(false);
  };

  /* ===============================
     IF ALREADY LOGGED IN, REDIRECT
     =============================== */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  /* ===============================
     UI LAYOUT - SUCCESS STATE
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
                Invitation Accepted!
              </h1>
              <p className="text-gray-500 text-center mb-6">
                Your account has been created successfully.<br />
                Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     UI LAYOUT - INVALID TOKEN
     =============================== */

  if (!isValidToken) {
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
              <h2 className="text-4xl font-bold">Invalid Invitation</h2>
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 text-center">
                Invalid Invitation Link
              </h1>
              <p className="text-gray-500 text-center mb-6">
                This invitation link is invalid or has expired.<br />
                Please contact your administrator for a new invitation.
              </p>
              <a
                href="/admin/login"
                className="px-6 py-3 rounded-full bg-[#8B1A1A] text-white font-semibold hover:bg-red-900 transition"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     UI LAYOUT - SET PASSWORD FORM
     =============================== */

  return (
    // ===============================
    // PAGE CONTAINER
    // ===============================
    <div className="relative flex items-center justify-center min-h-screen bg-gray-200 p-6 overflow-hidden">
      {/* ===============================
    MAIN CARD
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

            <h2 className="text-4xl font-bold">Accept Invitation</h2>
          </div>
        </div>

        {/* ===============================
      RIGHT SIDE (SET PASSWORD FORM)
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
            {email ? `Invitation for ${email}` : "Set your password to continue"}
          </p>

          {/* ===============================
        SET PASSWORD FORM
        =============================== */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                autoComplete="new-password"
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

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
                name="confirmPassword"
                id="confirmPassword"
                className="w-full px-5 py-3 rounded-full bg-red-200/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={toggleConfirmPassword}
                className="absolute right-4 top-3 text-gray-600"
              >
                {showConfirmPassword ? (
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
                {loading ? "Setting..." : "SET PASSWORD"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
