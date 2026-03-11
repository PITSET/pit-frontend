import { Navigate } from "react-router-dom";
import { isAuthenticated, restoreSession } from "../../utils/auth";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // First check if token exists
      let valid = isAuthenticated();
      
      // If no token, try to restore session using refresh token
      if (!valid) {
        const session = await restoreSession();
        if (session) {
          valid = true;
        }
      }
      
      setIsValid(valid);
    };

    checkAuth();
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
