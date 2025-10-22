import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import nexaLogo from "@/assets/nexa-logo.png";
import { LogIn, UserPlus } from "lucide-react";

interface AuthProps {
  onLogin: (role: "admin" | "user") => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    // TODO: Replace with real API call to /api/auth/login from login.yaml
    if (loginData.email && loginData.password) {
      // Demo: admin@nexabank.com logs in as admin
      const role = loginData.email === "admin@nexabank.com" ? "admin" : "user";
      
      // Store auth token and userId (mock values for now)
      // In production, these should come from the login API response
      localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
      localStorage.setItem('userId', role === "admin" ? "admin-123" : "user-" + loginData.email.split('@')[0]);
      
      toast({
        title: "Login Successful",
        description: `Welcome back${role === "admin" ? ", Admin" : ""}!`,
      });
      
      onLogin(role);
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    // TODO: Replace with real API call to /api/auth/register from login.yaml
    if (signupData.email && signupData.password && signupData.fullName) {
      // Store auth token and userId (mock values for now)
      localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
      localStorage.setItem('userId', 'user-' + signupData.email.split('@')[0]);
      
      toast({
        title: "Account Created",
        description: "Welcome to NexaBank!",
      });
      
      onLogin("user");
      navigate("/dashboard");
    } else {
      toast({
        title: "Signup Failed",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={nexaLogo} alt="NexaBank" className="mx-auto h-16 mb-4" />
          <h1 className="text-2xl font-bold">Welcome to NexaBank</h1>
          <p className="text-muted-foreground">Secure banking at your fingertips</p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Access Your Account</CardTitle>
            <CardDescription>Login or create a new account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" size="lg">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Demo: Use admin@nexabank.com for admin access
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData({ ...signupData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" size="lg">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
