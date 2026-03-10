import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    // Check if user has valid session
    const valid = isAuthenticated();
    setIsValid(valid);
    
    // If not authenticated, check if we should show session expired message
    if (!valid) {
      const expiry = localStorage.getItem("sessionExpiry");
      if (expiry && Date.now() > parseInt(expiry)) {
        // Session was valid before but now expired - will be handled by isAuthenticated
      }
    }
  }, []);

  // Show nothing while checking
  if (isValid === null) {
    return null;
  }

  if (!isValid) {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
