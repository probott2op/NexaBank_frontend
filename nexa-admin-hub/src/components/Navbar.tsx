import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import nexaLogo from "@/assets/nexa-logo.png";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  isAuthenticated: boolean;
  userRole?: "admin" | "user";
  userName?: string;
  onLogout: () => void;
}

export const Navbar = ({ isAuthenticated, userRole, userName, onLogout }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with logout even if API fails
    } finally {
      // Clear local state and redirect
      onLogout();
      navigate('/');
    }
  };

  // Get first letter of user's name for avatar
  const getUserInitial = () => {
    if (!userName) return 'U';
    return userName.charAt(0).toUpperCase();
  };
  
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userRole === "admin" ? "Administrator" : "Customer"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole !== "admin" && (
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
