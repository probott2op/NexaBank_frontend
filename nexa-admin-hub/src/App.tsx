import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";
import { tokenManager, startTokenRefresh, stopTokenRefresh } from "./services/api";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [userName, setUserName] = useState<string>("");

  // Check authentication status on mount
  useEffect(() => {
    const token = tokenManager.getAccessToken();
    const userInfo = tokenManager.getUserInfo();
    
    if (token && userInfo) {
      setIsAuthenticated(true);
      setUserRole(userInfo.userType === "ADMIN" ? "admin" : "user");
      setUserName(userInfo.firstName || userInfo.email?.split('@')[0] || "User");
      // Start token refresh if user is authenticated
      startTokenRefresh();
    }
    
    // Cleanup on unmount
    return () => {
      stopTokenRefresh();
    };
  }, []);

  const handleLogin = (role: "admin" | "user") => {
    setIsAuthenticated(true);
    setUserRole(role);
    const userInfo = tokenManager.getUserInfo();
    setUserName(userInfo?.firstName || userInfo?.email?.split('@')[0] || "User");
  };

  const handleLogout = () => {
    tokenManager.clearTokens();
    stopTokenRefresh();
    setIsAuthenticated(false);
    setUserRole("user");
    setUserName("");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar 
              isAuthenticated={isAuthenticated} 
              userRole={userRole}
              userName={userName}
              onLogout={handleLogout}
            />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/auth" 
                  element={
                    isAuthenticated ? (
                      <Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} replace />
                    ) : (
                      <Auth onLogin={handleLogin} />
                    )
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    isAuthenticated && userRole === "admin" ? (
                      <AdminDashboard />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  } 
                />
                <Route 
                  path="/admin/products/:productCode" 
                  element={
                    isAuthenticated && userRole === "admin" ? (
                      <ProductDetails />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    isAuthenticated && userRole === "user" ? (
                      <UserDashboard />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    isAuthenticated && userRole === "user" ? (
                      <CustomerProfile />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
