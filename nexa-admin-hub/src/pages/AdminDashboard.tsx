import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Package, TrendingUp, DollarSign, Activity } from "lucide-react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { ProductManagementTable } from "@/components/admin/ProductManagementTable";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await authAPI.getDashboardStats();
        setStats(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard stats",
          variant: "destructive",
        });
        // Set default fallback stats on error
        setStats({
          totalUsers: 0,
          activeFDs: 0,
          totalDeposits: 0,
          revenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const metrics = [
    { 
      title: "Total Users", 
      value: loading ? "..." : (stats?.totalUsers?.toLocaleString() || "0"), 
      change: "+12.5%", 
      icon: Users, 
      color: "text-primary" 
    },
    { 
      title: "Active FDs", 
      value: loading ? "..." : (stats?.activeFDs?.toLocaleString() || "0"), 
      change: "+8.2%", 
      icon: Package, 
      color: "text-success" 
    },
    { 
      title: "Total Deposits", 
      value: loading ? "..." : (stats?.totalDeposits ? `₹${(stats.totalDeposits / 10000000).toFixed(1)}Cr` : "₹0"), 
      change: "+15.3%", 
      icon: DollarSign, 
      color: "text-info" 
    },
    { 
      title: "Revenue", 
      value: loading ? "..." : (stats?.revenue ? `₹${(stats.revenue / 10000000).toFixed(1)}Cr` : "₹0"), 
      change: "+22.1%", 
      icon: TrendingUp, 
      color: "text-warning" 
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, products, and monitor performance</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-success">
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Product Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagementTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Product & Pricing Management</CardTitle>
                <CardDescription>Configure FD products and interest rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductManagementTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="h-8 w-8 text-primary" />
                      <h3 className="text-lg font-semibold">Monthly Growth</h3>
                    </div>
                    <p className="text-3xl font-bold mb-2">+18.7%</p>
                    <p className="text-sm text-muted-foreground">Compared to last month</p>
                  </div>

                  <div className="rounded-lg border bg-gradient-to-br from-success/5 to-success/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-8 w-8 text-success" />
                      <h3 className="text-lg font-semibold">Customer Satisfaction</h3>
                    </div>
                    <p className="text-3xl font-bold mb-2">94.2%</p>
                    <p className="text-sm text-muted-foreground">Based on recent surveys</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
