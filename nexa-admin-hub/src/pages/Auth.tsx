import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  // Helper function to format lockout time
  const formatLockoutTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds > 0 ? `and ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}` : ''}`;
    }
    return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: t('auth.missingInformation'),
        description: t('auth.fillAllFields'),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoginLoading(true);
    
    try {
      // Call real login API
      const response = await authAPI.login(loginData.email, loginData.password);
      
      // Extract data from response (response has a 'data' wrapper)
      const { accessToken, refreshToken, user } = response.data || response;
      
      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken || accessToken);
      
      // Decode token to get user info
      const decodedToken = tokenManager.decodeToken(accessToken);
      
      // Store user info (use user object from response if available)
      const userInfo = {
        userId: user?.userId || decodedToken?.userId,
        email: user?.email || decodedToken?.sub,
        userType: user?.userType || decodedToken?.userType,
        roles: user?.roles || decodedToken?.roles,
      };
      tokenManager.setUserInfo(userInfo);
      
      // Start auto token refresh
      startTokenRefresh();
      
      // Determine role based on userType
      const role = userInfo.userType === "ADMIN" ? "admin" : "user";
      
      toast({
        title: t('auth.loginSuccessful'),
        description: role === "admin" ? t('auth.welcomeBackAdmin') : t('auth.welcomeBack'),
      });
      
      onLogin(role);
      navigate(role === "admin" ? "/admin" : "/dashboard");
      
    } catch (error: any) {
      // Handle account lockout (423 status)
      if (error.status === 423) {
        // Extract seconds from error message if available
        const message = error.message || "";
        const secondsMatch = message.match(/(\d+)\s+seconds?/);
        
        let description = message;
        if (secondsMatch) {
          const seconds = parseInt(secondsMatch[1]);
          const formattedTime = formatLockoutTime(seconds);
          description = `Your account is temporarily locked. Please try again in ${formattedTime}.`;
        }
        
        toast({
          title: t('auth.accountLocked'),
          description,
          variant: "destructive",
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast({
          title: t('auth.loginFailed'),
          description: error.message || t('auth.invalidCredentialsMsg'),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t('auth.passwordsDontMatch'),
        description: t('auth.passwordsMatchError'),
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!signupData.email || !signupData.password || !signupData.firstName || 
        !signupData.lastName || !signupData.phoneNumber || !signupData.dateOfBirth) {
      toast({
        title: t('auth.missingInformation'),
        description: t('auth.fillRequiredFields'),
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
      
      // Extract data from response (response has a 'data' wrapper)
      const { accessToken, refreshToken, user } = response.data || response;
      
      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken || accessToken);
      
      // Decode token to get user info
      const decodedToken = tokenManager.decodeToken(accessToken);
      
      // Store user info (use user object from response if available)
      const userInfo = {
        userId: user?.userId || decodedToken?.userId,
        email: user?.email || decodedToken?.sub,
        userType: user?.userType || decodedToken?.userType || "CUSTOMER",
        roles: user?.roles || decodedToken?.roles,
      };
      tokenManager.setUserInfo(userInfo);
      
      // Start auto token refresh
      startTokenRefresh();
      
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.welcomeToBank'),
      });
      
      onLogin("user");
      navigate("/dashboard");
      
    } catch (error: any) {
      toast({
        title: t('auth.registrationFailed'),
        description: error.message || t('auth.registrationFailedMsg'),
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
          <h1 className="text-2xl font-bold">{t('auth.welcomeToNexaBank')}</h1>
          <p className="text-muted-foreground">{t('auth.secureBanking')}</p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>{t('auth.accessYourAccount')}</CardTitle>
            <CardDescription>{t('auth.loginOrCreate')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('auth.emailExample')}
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                      disabled={isLoginLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('common.password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
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
                    {isLoginLoading ? t('common.loading') : t('common.login')}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t('auth.demoText')}
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">{t('user.firstName')} *</Label>
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
                      <Label htmlFor="signup-lastname">{t('user.lastName')} *</Label>
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
                    <Label htmlFor="signup-email">{t('common.email')} *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">{t('auth.phoneNumber')} *</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder={t('auth.phonePlaceholder')}
                      pattern="^[6-9]\d{9}$"
                      title={t('auth.phoneValidation')}
                      value={signupData.phoneNumber}
                      onChange={(e) =>
                        setSignupData({ ...signupData, phoneNumber: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-dob">{t('auth.dateOfBirth')} *</Label>
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
                    <Label htmlFor="signup-address">{t('auth.address')}</Label>
                    <Input
                      id="signup-address"
                      type="text"
                      placeholder={t('auth.addressPlaceholder')}
                      value={signupData.address}
                      onChange={(e) =>
                        setSignupData({ ...signupData, address: e.target.value })
                      }
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">{t('auth.city')}</Label>
                      <Input
                        id="signup-city"
                        type="text"
                        placeholder={t('auth.cityPlaceholder')}
                        value={signupData.city}
                        onChange={(e) =>
                          setSignupData({ ...signupData, city: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-state">{t('auth.state')}</Label>
                      <Input
                        id="signup-state"
                        type="text"
                        placeholder={t('auth.statePlaceholder')}
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
                      <Label htmlFor="signup-country">{t('auth.country')}</Label>
                      <Input
                        id="signup-country"
                        type="text"
                        placeholder={t('auth.countryPlaceholder')}
                        value={signupData.country}
                        onChange={(e) =>
                          setSignupData({ ...signupData, country: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-postal">{t('auth.postalCode')}</Label>
                      <Input
                        id="signup-postal"
                        type="text"
                        placeholder={t('auth.postalCodePlaceholder')}
                        pattern="^[1-9]\d{5}$"
                        title={t('auth.postalCodeValidation')}
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
                      <Label htmlFor="signup-aadhar">{t('auth.aadharNumber')}</Label>
                      <Input
                        id="signup-aadhar"
                        type="text"
                        placeholder={t('auth.aadharPlaceholder')}
                        pattern="^[2-9]\d{11}$"
                        title={t('auth.aadharValidation')}
                        value={signupData.aadharNumber}
                        onChange={(e) =>
                          setSignupData({ ...signupData, aadharNumber: e.target.value })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-pan">{t('auth.panNumber')}</Label>
                      <Input
                        id="signup-pan"
                        type="text"
                        placeholder={t('auth.panPlaceholder')}
                        pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                        title={t('auth.panValidation')}
                        value={signupData.panNumber}
                        onChange={(e) =>
                          setSignupData({ ...signupData, panNumber: e.target.value.toUpperCase() })
                        }
                        disabled={isSignupLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')} *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      minLength={8}
                      title={t('auth.passwordValidation')}
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      required
                      disabled={isSignupLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t('auth.confirmPassword')} *</Label>
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
                    {isSignupLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t('auth.requiredFields')}
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
