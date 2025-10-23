import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Wallet, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fdAccountAPI, tokenManager } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [fdAccounts, setFdAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user info from token
        const userInfo = tokenManager.getUserInfo();
        
        if (!userInfo || !userInfo.userId) {
          toast({
            title: "Error",
            description: "User information not found. Please login again.",
            variant: "destructive",
          });
          return;
        }

        // Try to get current user info from FD Account API
        try {
          const userData = await fdAccountAPI.getCurrentUser();
          setProfile(userData);
        } catch (error) {
          console.log('Using user info from token');
          // Use token info as fallback
          setProfile({
            userId: userInfo.userId,
            email: userInfo.email,
            firstName: userInfo.email.split('@')[0],
            lastName: '',
          });
        }

        // Fetch FD accounts using customerId
        try {
          const fdData = await fdAccountAPI.searchAccounts({ customerId: userInfo.userId });
          setFdAccounts(Array.isArray(fdData) ? fdData : []);
        } catch (fdError) {
          console.error('Failed to fetch FD accounts:', fdError);
          setFdAccounts([]);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  // Calculate stats from FD accounts
  const totalFDValue = fdAccounts.reduce((sum, fd) => sum + (fd.principalAmount || 0), 0);
  const interestEarned = fdAccounts.reduce((sum, fd) => sum + (fd.interestEarned || 0), 0);
  const avgRate = fdAccounts.length > 0 
    ? (fdAccounts.reduce((sum, fd) => sum + (fd.interestRate || 0), 0) / fdAccounts.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `Welcome back, ${profile?.firstName || 'User'}! Here's your account overview`}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FD Value</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `₹${totalFDValue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {fdAccounts.length} active deposit{fdAccounts.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loading ? "..." : `₹${interestEarned.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">This financial year</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Interest Rate</CardTitle>
              <Clock className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loading ? "..." : `${avgRate}%`}
              </div>
              <p className="text-xs text-muted-foreground">Across all deposits</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="fds" className="gap-2">
              <Wallet className="h-4 w-4" />
              My FDs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading profile...</p>
                ) : profile ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-lg font-semibold mt-1">
                          {profile.firstName} {profile.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg font-semibold mt-1">{profile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-lg font-semibold mt-1">{profile.phoneNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                        <p className="text-lg font-semibold mt-1">{profile.userId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <p className="text-lg font-semibold mt-1">{profile.city || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                        <p className="text-lg font-semibold mt-1">{profile.nationality || '-'}</p>
                      </div>
                    </div>
                    <Button>Edit Profile</Button>
                  </>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No profile data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fds">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">My Fixed Deposits</h2>
                  <p className="text-muted-foreground">View and manage your FD accounts</p>
                </div>
                <Button>Open New FD</Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading FD accounts...</p>
                ) : fdAccounts.length === 0 ? (
                  <Card className="shadow-card">
                    <CardContent className="pt-6">
                      <p className="text-center py-8 text-muted-foreground">
                        No FD accounts found. Open a new FD to get started!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  fdAccounts.map((fd) => (
                    <Card key={fd.accountNumber} className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{fd.accountNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              Maturity: {fd.maturityDate ? new Date(fd.maturityDate).toLocaleDateString('en-IN') : '-'}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                            {fd.status || 'Active'}
                          </span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Principal</p>
                            <p className="text-lg font-bold">₹{(fd.principalAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="text-lg font-bold text-primary">{fd.interestRate || 0}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Maturity Value</p>
                            <p className="text-lg font-bold text-success">
                              ₹{(fd.maturityAmount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-end">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
