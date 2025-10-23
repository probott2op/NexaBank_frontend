import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import nexaLogo from "@/assets/nexa-logo.png";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { authAPI, tokenManager, startTokenRefresh } from "@/services/api";

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
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    aadharNumber: "",
    panNumber: "",
  });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoginLoading(true);
    
    try {
      // Call real login API
      const response = await authAPI.login(loginData.email, loginData.password);
      
      // Store tokens
      tokenManager.setTokens(response.token, response.refreshToken || response.token);
      
      // Decode token to get user info
      const decodedToken = tokenManager.decodeToken(response.token);
      
      // Store user info
      const userInfo = {
        userId: response.userId || decodedToken?.userId,
        email: response.email || decodedToken?.sub,
        userType: response.userType || decodedToken?.userType,
        roles: response.roles || decodedToken?.roles,
      };
      tokenManager.setUserInfo(userInfo);
      
      // Start auto token refresh
      startTokenRefresh();
      
      // Determine role based on userType
      const role = userInfo.userType === "ADMIN" ? "admin" : "user";
      
      toast({
        title: "Login Successful",
        description: `Welcome back${role === "admin" ? ", Admin" : ""}!`,
      });
      
      onLogin(role);
      navigate(role === "admin" ? "/admin" : "/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!signupData.email || !signupData.password || !signupData.firstName || 
        !signupData.lastName || !signupData.phoneNumber || !signupData.dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSignupLoading(true);
    
    try {
      // Call real register API with all required fields
      const response = await authAPI.register({
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        phoneNumber: signupData.phoneNumber,
        dateOfBirth: signupData.dateOfBirth,
        // Optional fields
        ...(signupData.address && { address: signupData.address }),
        ...(signupData.city && { city: signupData.city }),
        ...(signupData.state && { state: signupData.state }),
        ...(signupData.country && { country: signupData.country }),
        ...(signupData.postalCode && { postalCode: signupData.postalCode }),
        ...(signupData.aadharNumber && { aadharNumber: signupData.aadharNumber }),
        ...(signupData.panNumber && { panNumber: signupData.panNumber }),
        userType: "CUSTOMER"
      });
      
      // Store tokens
      tokenManager.setTokens(response.token, response.refreshToken || response.token);
      
      // Decode token to get user info
      const decodedToken = tokenManager.decodeToken(response.token);
      
      // Store user info
      const userInfo = {
        userId: response.userId || decodedToken?.userId,
        email: response.email || decodedToken?.sub,
        userType: response.userType || decodedToken?.userType || "CUSTOMER",
        roles: response.roles || decodedToken?.roles,
      };
      tokenManager.setUserInfo(userInfo);
      
      // Start auto token refresh
      startTokenRefresh();
      
      toast({
        title: "Account Created",
        description: "Welcome to NexaBank!",
      });
      
      onLogin("user");
      navigate("/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSignupLoading(false);
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
                      disabled={isLoginLoading}
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
                      disabled={isLoginLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoginLoading}>
                    {isLoginLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    {isLoginLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Demo: Use admin@nexabank.com for admin access
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name *</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="John"
                        value={signupData.firstName}
                        onChange={(e) =>
                          setSignupData({ ...signupData, firstName: e.target.value })
                        }
                        required
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name *</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={signupData.lastName}
                        onChange={(e) =>
                          setSignupData({ ...signupData, lastName: e.target.value })
                        }
                        required
                        disabled={isSignupLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number *</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="9876543210"
                      pattern="^[6-9]\d{9}$"
                      title="Enter a valid 10-digit Indian mobile number"
                      value={signupData.phoneNumber}
                      onChange={(e) =>
                        setSignupData({ ...signupData, phoneNumber: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-dob">Date of Birth *</Label>
                    <Input
                      id="signup-dob"
                      type="date"
                      value={signupData.dateOfBirth}
                      onChange={(e) =>
                        setSignupData({ ...signupData, dateOfBirth: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-address">Address</Label>
                    <Input
                      id="signup-address"
                      type="text"
                      placeholder="123 Main Street"
                      value={signupData.address}
                      onChange={(e) =>
                        setSignupData({ ...signupData, address: e.target.value })
                      }
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">City</Label>
                      <Input
                        id="signup-city"
                        type="text"
                        placeholder="Mumbai"
                        value={signupData.city}
                        onChange={(e) =>
                          setSignupData({ ...signupData, city: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-state">State</Label>
                      <Input
                        id="signup-state"
                        type="text"
                        placeholder="Maharashtra"
                        value={signupData.state}
                        onChange={(e) =>
                          setSignupData({ ...signupData, state: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-country">Country</Label>
                      <Input
                        id="signup-country"
                        type="text"
                        placeholder="India"
                        value={signupData.country}
                        onChange={(e) =>
                          setSignupData({ ...signupData, country: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-postal">Postal Code</Label>
                      <Input
                        id="signup-postal"
                        type="text"
                        placeholder="400001"
                        pattern="^[1-9]\d{5}$"
                        title="Enter a valid 6-digit Indian postal code"
                        value={signupData.postalCode}
                        onChange={(e) =>
                          setSignupData({ ...signupData, postalCode: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-aadhar">Aadhar Number</Label>
                      <Input
                        id="signup-aadhar"
                        type="text"
                        placeholder="234567890123"
                        pattern="^[2-9]\d{11}$"
                        title="Enter a valid 12-digit Aadhar number"
                        value={signupData.aadharNumber}
                        onChange={(e) =>
                          setSignupData({ ...signupData, aadharNumber: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-pan">PAN Number</Label>
                      <Input
                        id="signup-pan"
                        type="text"
                        placeholder="ABCDE1234F"
                        pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                        title="Enter a valid PAN number (e.g., ABCDE1234F)"
                        value={signupData.panNumber}
                        onChange={(e) =>
                          setSignupData({ ...signupData, panNumber: e.target.value.toUpperCase() })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      minLength={8}
                      title="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password *</Label>
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
                      disabled={isSignupLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" size="lg" disabled={isSignupLoading}>
                    {isSignupLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {isSignupLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    * Required fields
                  </p>
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
