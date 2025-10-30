import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Wallet, Clock, TrendingUp, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fdAccountAPI, tokenManager, customerAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [fdAccounts, setFdAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Account details dialog state
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    account: null as any,
    balances: [] as any[],
    transactions: [] as any[],
    withdrawalInfo: null as any,
    loadingDetails: false,
  });

  // Statement generation state
  const [statementDialog, setStatementDialog] = useState({
    open: false,
    accountNumber: "",
    startDate: "",
    endDate: "",
    generating: false,
  });

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

        // Get email from token to fetch customer profile
        const token = tokenManager.getAccessToken();
        const decodedToken = token ? tokenManager.decodeToken(token) : null;
        const email = decodedToken?.sub || userInfo.email;

        // Fetch customer profile by email
        if (email) {
          try {
            const customerProfile = await customerAPI.getProfileByEmail(email);
            setProfile(customerProfile);
            
            // Store customer number for future use
            if (customerProfile.customerNumber) {
              tokenManager.setCustomerNumber(customerProfile.customerNumber);
            }

            // Fetch FD accounts using customer_id (customerNumber)
            if (customerProfile.customerNumber) {
              try {
                const fdData = await fdAccountAPI.searchAccounts({ 
                  idType: 'customer_id', 
                  value: customerProfile.customerNumber 
                });
                setFdAccounts(Array.isArray(fdData) ? fdData : []);
              } catch (fdError) {
                console.error('Failed to fetch FD accounts:', fdError);
                setFdAccounts([]);
              }
            }
          } catch (error) {
            console.error('Failed to fetch customer profile:', error);
            // Fallback to token info
            setProfile({
              userId: userInfo.userId,
              email: userInfo.email,
              firstName: userInfo.email.split('@')[0],
              lastName: '',
            });
            setFdAccounts([]);
          }
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

  // Handle view account details
  const handleViewDetails = async (account: any) => {
    setDetailsDialog(prev => ({ ...prev, open: true, account, loadingDetails: true }));
    
    try {
      // Fetch balances, transactions, and withdrawal inquiry in parallel
      const [balances, transactions, withdrawalInfo] = await Promise.all([
        fdAccountAPI.getAccountBalances(account.accountNumber),
        fdAccountAPI.getAccountTransactions(account.accountNumber),
        fdAccountAPI.withdrawalInquiry(account.accountNumber).catch(() => null), // Optional
      ]);

      setDetailsDialog(prev => ({
        ...prev,
        balances: Array.isArray(balances) ? balances : [],
        transactions: Array.isArray(transactions) ? transactions : [],
        withdrawalInfo,
        loadingDetails: false,
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch account details",
        variant: "destructive",
      });
      setDetailsDialog(prev => ({ ...prev, loadingDetails: false }));
    }
  };

  // Handle premature withdrawal
  const handlePrematureWithdrawal = async () => {
    if (!detailsDialog.account || !detailsDialog.withdrawalInfo) return;

    try {
      setDetailsDialog(prev => ({ ...prev, loadingDetails: true }));

      const withdrawalData = {
        accountNumber: detailsDialog.account.accountNumber,
        withdrawalAmount: detailsDialog.withdrawalInfo.finalPayoutAmount,
        withdrawalDate: new Date().toISOString(),
        reason: "PREMATURE_WITHDRAWAL",
      };

      await fdAccountAPI.performWithdrawal(detailsDialog.account.accountNumber, withdrawalData);

      toast({
        title: t('success.saved'),
        description: t('withdrawal.withdrawalSuccess', { amount: detailsDialog.withdrawalInfo.finalPayoutAmount.toLocaleString() }),
      });

      // Close dialog and refresh FD accounts
      setDetailsDialog({ open: false, account: null, balances: [], transactions: [], withdrawalInfo: null, loadingDetails: false });
      
      // Refresh FD accounts list
      if (profile?.customerNumber) {
        const fdData = await fdAccountAPI.searchAccounts({ 
          idType: 'customer_id', 
          value: profile.customerNumber 
        });
        setFdAccounts(Array.isArray(fdData) ? fdData : []);
      }
    } catch (error: any) {
      toast({
        title: t('error.errorOccurred'),
        description: error.message || t('withdrawal.withdrawalFailed'),
        variant: "destructive",
      });
      setDetailsDialog(prev => ({ ...prev, loadingDetails: false }));
    }
  };

  // Handle statement generation
  const handleGenerateStatement = async () => {
    if (!statementDialog.startDate || !statementDialog.endDate) {
      toast({
        title: t('error.errorOccurred'),
        description: "Please provide both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatementDialog(prev => ({ ...prev, generating: true }));

      const statement = await fdAccountAPI.generateStatement(
        statementDialog.accountNumber,
        {
          startDate: statementDialog.startDate,
          endDate: statementDialog.endDate
        }
      );

      toast({
        title: t('statement.success'),
        description: `Statement generated successfully for ${statementDialog.accountNumber}`,
      });

      // You can handle the statement data here (download, display, etc.)
      console.log("Statement:", statement);

      // Close the dialog
      setStatementDialog({
        open: false,
        accountNumber: "",
        startDate: "",
        endDate: "",
        generating: false,
      });
    } catch (error: any) {
      toast({
        title: t('statement.failed'),
        description: error.message || "Failed to generate statement",
        variant: "destructive",
      });
    } finally {
      setStatementDialog(prev => ({ ...prev, generating: false }));
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('dashboard.myDashboard')}</h1>
          <p className="text-muted-foreground">
            {loading ? t('common.loading') : t('dashboard.welcomeBack', { name: profile?.firstName || 'User' })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalFDValue')}</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `₹${totalFDValue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.activeFDs')}: {fdAccounts.length}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.interestEarned')}</CardTitle>
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
              <CardTitle className="text-sm font-medium">{t('dashboard.averageRate')}</CardTitle>
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
              {t('nav.profile')}
            </TabsTrigger>
            <TabsTrigger value="fds" className="gap-2">
              <Wallet className="h-4 w-4" />
              {t('dashboard.fdAccounts')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>{t('customer.customerProfile')}</CardTitle>
                <CardDescription>{t('customer.personalInfo')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">{t('common.loading')}</p>
                ) : profile ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('user.firstName')} & {t('user.lastName')}</label>
                        <p className="text-lg font-semibold mt-1">
                          {profile.firstName} {profile.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('common.email')}</label>
                        <p className="text-lg font-semibold mt-1">{profile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-lg font-semibold mt-1">{profile.phoneNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('customer.customerNumber')}</label>
                        <p className="text-lg font-semibold mt-1">{profile.customerNumber || '-'}</p>
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
                  <p className="text-muted-foreground">{t('dashboard.fdAccounts')}</p>
                </div>
                <Button>Open New FD</Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">{t('dashboard.loadingAccounts')}</p>
                ) : fdAccounts.length === 0 ? (
                  <Card className="shadow-card">
                    <CardContent className="pt-6">
                      <p className="text-center py-8 text-muted-foreground">
                        {t('dashboard.noFDAccounts')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  fdAccounts.map((fd) => (
                    <Card key={fd.accountNumber} className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{fd.accountName || fd.accountNumber}</h3>
                            <p className="text-sm text-muted-foreground">{t('fdAccount.accountNumber')}: {fd.accountNumber}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {fd.interestType} {t('fdAccount.interestType')} • {fd.compoundingFrequency} • {fd.tenureValue} {fd.tenureUnit}
                            </p>
                          </div>
                          <Badge variant={fd.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {fd.status || t('common.active')}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-5 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('fdAccount.principal')}</p>
                            <p className="text-lg font-bold">₹{(fd.principalAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('fdAccount.interestRate')}</p>
                            <p className="text-lg font-bold text-primary">{fd.interestRate || 0}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('fdAccount.apy')}</p>
                            <p className="text-lg font-bold text-info">{fd.apy || 0}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('fdAccount.maturityValue')}</p>
                            <p className="text-lg font-bold text-success">
                              ₹{(fd.maturityAmount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('fdAccount.maturityDate')}</p>
                            <p className="text-sm font-semibold">
                              {fd.maturityDate ? new Date(fd.maturityDate).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              }) : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewDetails(fd)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Account Details Dialog */}
        <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('fdAccount.accountDetails')}</DialogTitle>
              <DialogDescription>
                {t('fdAccount.accountNumber')}: {detailsDialog.account?.accountNumber}
              </DialogDescription>
            </DialogHeader>

            {detailsDialog.loadingDetails ? (
              <div className="py-8 text-center text-muted-foreground">{t('common.loading')}</div>
            ) : (
              <div className="space-y-6">
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('fdAccount.accountInfo')}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.accountName')}</label>
                      <p className="font-semibold">{detailsDialog.account?.accountName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.accountNumber')}</label>
                      <p className="font-semibold">{detailsDialog.account?.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.productCode')}</label>
                      <p className="font-semibold">{detailsDialog.account?.productCode}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.currency')}</label>
                      <p className="font-semibold">{detailsDialog.account?.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.effectiveDate')}</label>
                      <p className="font-semibold">
                        {detailsDialog.account?.effectiveDate 
                          ? new Date(detailsDialog.account.effectiveDate).toLocaleDateString('en-IN') 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.maturityDate')}</label>
                      <p className="font-semibold">
                        {detailsDialog.account?.maturityDate 
                          ? new Date(detailsDialog.account.maturityDate).toLocaleDateString('en-IN') 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.categories')}</label>
                      <p className="font-semibold">
                        {detailsDialog.account?.category1Id && detailsDialog.account?.category2Id 
                          ? `${detailsDialog.account.category1Id} • ${detailsDialog.account.category2Id}` 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.tenure')}</label>
                      <p className="font-semibold">
                        {detailsDialog.account?.tenureValue} {detailsDialog.account?.tenureUnit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interest Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('fdAccount.interestConfig')}</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.interestType')}</label>
                      <p className="font-semibold">{detailsDialog.account?.interestType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.compoundingFrequency')}</label>
                      <p className="font-semibold">{detailsDialog.account?.compoundingFrequency}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.interestRate')}</label>
                      <p className="font-semibold text-primary">{detailsDialog.account?.interestRate}%</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">{t('fdAccount.apy')}</label>
                      <p className="font-semibold text-info">{detailsDialog.account?.apy}%</p>
                    </div>
                  </div>
                </div>

                {/* Balances */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('fdAccount.balances')}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('balance.balanceType')}</TableHead>
                        <TableHead className="text-right">{t('common.amount')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('balance.lastUpdated')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailsDialog.balances.map((balance: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{balance.balanceType}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{(balance.balanceAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={balance.isActive ? 'default' : 'secondary'}>
                              {balance.isActive ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {balance.updatedAt 
                              ? new Date(balance.updatedAt).toLocaleDateString('en-IN')
                              : new Date(balance.createdAt).toLocaleDateString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('fdAccount.transactionHistory')}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.date')}</TableHead>
                        <TableHead>{t('transaction.type')}</TableHead>
                        <TableHead className="text-right">{t('common.amount')}</TableHead>
                        <TableHead>{t('transaction.description')}</TableHead>
                        <TableHead>{t('transaction.reference')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailsDialog.transactions.map((txn: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm">
                            {new Date(txn.transactionDate).toLocaleDateString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{txn.transactionType}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{(txn.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">{txn.description}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {txn.transactionReference?.substring(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Withdrawal Info (if available) */}
                {detailsDialog.withdrawalInfo && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t('fdAccount.withdrawalInquiry')}</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-4 mb-6">
                          <div>
                            <label className="text-sm text-muted-foreground">{t('withdrawal.originalPrincipal')}</label>
                            <p className="text-lg font-bold">
                              ₹{(detailsDialog.withdrawalInfo.originalPrincipal || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">{t('withdrawal.interestAccrued')}</label>
                            <p className="text-lg font-bold text-success">
                              ₹{(detailsDialog.withdrawalInfo.interestAccruedToDate || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">{t('withdrawal.penaltyAmount')}</label>
                            <p className="text-lg font-bold text-destructive">
                              ₹{(detailsDialog.withdrawalInfo.penaltyAmount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">{t('withdrawal.finalPayout')}</label>
                            <p className="text-lg font-bold text-primary">
                              ₹{(detailsDialog.withdrawalInfo.finalPayoutAmount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            {t('withdrawal.inquiryDate')}: {new Date(detailsDialog.withdrawalInfo.inquiryDate).toLocaleDateString('en-IN')}
                          </p>
                          <Button 
                            onClick={handlePrematureWithdrawal}
                            variant="destructive"
                            disabled={detailsDialog.loadingDetails}
                          >
                            {detailsDialog.loadingDetails ? t('withdrawal.processing') : t('withdrawal.confirmWithdrawal')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Account Holders */}
                {detailsDialog.account?.accountHolders && detailsDialog.account.accountHolders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t('fdAccount.accountHolders')}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('customer.customerNumber')}</TableHead>
                          <TableHead>{t('user.role')}</TableHead>
                          <TableHead className="text-right">Ownership %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsDialog.account.accountHolders.map((holder: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{holder.customerId}</TableCell>
                            <TableCell>
                              <Badge>{holder.roleType}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {holder.ownershipPercentage}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Statement Generation Action */}
                <div className="border-t pt-4">
                  <Button
                    onClick={() => setStatementDialog({
                      open: true,
                      accountNumber: detailsDialog.account?.accountNumber || "",
                      startDate: "",
                      endDate: "",
                      generating: false,
                    })}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('statement.generate')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Statement Generation Dialog */}
        <Dialog open={statementDialog.open} onOpenChange={(open) => setStatementDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('statement.title')}</DialogTitle>
              <DialogDescription>
                {t('statement.period')} {statementDialog.accountNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('reports.startDate')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={statementDialog.startDate}
                  onChange={(e) => setStatementDialog(prev => ({ ...prev, startDate: e.target.value }))}
                  disabled={statementDialog.generating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('reports.endDate')}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={statementDialog.endDate}
                  onChange={(e) => setStatementDialog(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={statementDialog.generating}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setStatementDialog({
                  open: false,
                  accountNumber: "",
                  startDate: "",
                  endDate: "",
                  generating: false,
                })}
                disabled={statementDialog.generating}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleGenerateStatement}
                disabled={statementDialog.generating || !statementDialog.startDate || !statementDialog.endDate}
              >
                {statementDialog.generating ? t('statement.generating') : t('statement.generate')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserDashboard;
