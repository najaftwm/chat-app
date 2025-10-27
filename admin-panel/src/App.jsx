import { useState, useEffect } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./components/Login";
import { ApiClient } from "./api/ApiClient";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = ApiClient.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    console.log("Login successful:", user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    ApiClient.logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;

