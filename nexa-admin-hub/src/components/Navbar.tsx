import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import nexaLogo from "@/assets/nexa-logo.png";

interface NavbarProps {
  isAuthenticated: boolean;
  userRole?: "admin" | "user";
  onLogout: () => void;
}

export const Navbar = ({ isAuthenticated, userRole, onLogout }: NavbarProps) => {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={nexaLogo} alt="NexaBank" className="h-10" />
        </Link>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={userRole === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  {userRole === "admin" ? "Admin Panel" : "Dashboard"}
                </Button>
              </Link>
              <Button variant="ghost" onClick={onLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
