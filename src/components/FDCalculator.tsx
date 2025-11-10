import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fdCalcAPI, fdAccountAPI, tokenManager } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FDCalculatorProps {
  onAccountCreated?: () => void;
  isEmbedded?: boolean;
}

export const FDCalculator = ({ onAccountCreated, isEmbedded = false }: FDCalculatorProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [principal, setPrincipal] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureUnit, setTenureUnit] = useState("YEARS");
  const [category1, setCategory1] = useState("");
  const [category2, setCategory2] = useState("");
  const [productCode, setProductCode] = useState("FD001");
  const [products, setProducts] = useState<any[]>([]);
  const [isCumulative, setIsCumulative] = useState(true);
  const [payoutFreq, setPayoutFreq] = useState("YEARLY");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAccountNameDialog, setShowAccountNameDialog] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // Available categories based on backend mapping
  const availableCategories = [
    { code: "SR", name: t('calculator.seniorCitizen'), variants: ["SENIOR", "SENIOR_CITIZEN", "SR"] },
    { code: "JR", name: t('calculator.junior'), variants: ["JUNIOR", "JR"] },
    { code: "DY", name: t('calculator.digiYouth'), variants: ["DIGI_YOUTH", "DY"] },
    { code: "GOLD", name: t('calculator.gold'), variants: ["GOLD"] },
    { code: "SIL", name: t('calculator.silver'), variants: ["SILVER", "SIL"] },
    { code: "PLAT", name: t('calculator.platinum'), variants: ["PLATINUM", "PLAT"] },
    { code: "EMP", name: t('calculator.employee'), variants: ["EMPLOYEE", "EMP"] },
  ];

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { productAPI } = await import("@/services/api");
        const response = await productAPI.getAllProducts();
        console.log("Products API response:", response);
        // The API returns paginated response with products in 'content' array
        const productsData = response?.content || [];
        console.log("Products data:", productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: t('error.fetchError'),
          description: t('productShowcase.loading'),
          variant: "destructive",
        });
      }
    };
    fetchProducts();
  }, []);

  // Check for pending calculation after login
  useEffect(() => {
    const pendingCalc = sessionStorage.getItem('pendingFDCalculation');
    if (pendingCalc && tokenManager.getAccessToken()) {
      try {
        const { result, productCode: savedProductCode, timestamp } = JSON.parse(pendingCalc);
        // Check if calculation is less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setCalculationResult(result);
          setProductCode(savedProductCode);
          // Show account name dialog for logged-in user
          setShowAccountNameDialog(true);
          // Clear from storage
          sessionStorage.removeItem('pendingFDCalculation');
          
          toast({
            title: "Welcome back!",
            description: "Let's create your FD account with your previous calculation",
          });
        } else {
          // Calculation too old, clear it
          sessionStorage.removeItem('pendingFDCalculation');
        }
      } catch (error) {
        console.error('Failed to restore calculation:', error);
        sessionStorage.removeItem('pendingFDCalculation');
      }
    }
  }, []);

  const calculateFD = async () => {
    if (!principal || !tenure) {
      toast({
        title: t('calculator.missingInfo'),
        description: t('calculator.missingInfoDesc'),
        variant: "destructive",
      });
      return;
    }

    // Validate that categories are different if both are selected
    if (category1 && category2 && category1 === category2) {
      toast({
        title: t('calculator.invalidCategories'),
        description: t('calculator.invalidCategoriesDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Build request payload based on API spec
      const payload: any = {
        principal_amount: parseFloat(principal),
        tenure_value: parseInt(tenure),
        tenure_unit: tenureUnit,
        currency_code: "INR",
        cumulative: isCumulative,
        product_code: productCode,
      };

      // Add category1_id if selected
      if (category1) {
        payload.category1_id = category1;
      }

      // Add category2_id if selected
      if (category2) {
        payload.category2_id = category2;
      }

      // Add payout_freq for non-cumulative FD
      if (!isCumulative) {
        payload.payout_freq = payoutFreq;
      }

      // Call FD Calculation API directly to get proper error response
      const token = tokenManager.getAccessToken();
      const response = await fetch('http://localhost:8081/api/fd/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle error response
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        
        let errorMessage = "Failed to calculate FD. Please try again.";
        
        try {
          // Try to parse as JSON
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || jsonError.message || errorData;
        } catch {
          // If not JSON, use the text directly
          errorMessage = errorData || `HTTP Error ${response.status}`;
        }
        
        toast({
          title: t('calculator.calculationFailed'),
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      setCalculationResult(result);

      toast({
        title: t('calculator.calculationComplete'),
        description: t('calculator.calculationCompleteDesc'),
      });

      // Save calculation to sessionStorage for retrieval after login
      sessionStorage.setItem('pendingFDCalculation', JSON.stringify({
        result,
        productCode,
        timestamp: Date.now()
      }));
      
    } catch (error: any) {
      console.error("Calculation error:", error);
      
      toast({
        title: t('calculator.calculationFailed'),
        description: error.message || t('error.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCreateAccount = () => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Show account name dialog
    setShowAccountNameDialog(true);
  };

  const createFDAccount = async () => {
    if (!calculationResult) {
      toast({
        title: t('calculator.noCalculation'),
        description: t('calculator.noCalculationDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!accountName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an account name",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAccount(true);
    
    try {
      const userInfo = tokenManager.getUserInfo();
      
      // Create FD account using calcId and accountName
      const accountData = await fdAccountAPI.createAccount({
        accountName: accountName.trim(),
        calcId: calculationResult.result_id || calculationResult.calc_id
      });

      toast({
        title: t('calculator.accountCreated'),
        description: t('calculator.accountCreatedDesc', { accountNumber: accountData.accountNumber }),
      });

      // Close dialogs and reset
      setShowAccountNameDialog(false);
      setAccountName("");
      setCalculationResult(null);
      setPrincipal("");
      setTenure("");
      
      // Call callback if in embedded mode
      if (isEmbedded && onAccountCreated) {
        onAccountCreated();
      } else {
        // Navigate to dashboard if not embedded
        navigate(userInfo.userType === "ADMIN" ? "/admin" : "/dashboard");
      }
      
    } catch (error: any) {
      toast({
        title: t('calculator.accountCreationFailed'),
        description: error.message || t('error.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate("/auth");
  };

  return (
    <>
      <Card className="shadow-elevated border-primary/20">
        <CardHeader className="space-y-1 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>{t('calculator.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('calculator.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="principal">{t('calculator.principal')} (₹)</Label>
              <Input
                id="principal"
                type="number"
                placeholder={t('calculator.principalPlaceholder')}
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="text-lg"
                disabled={isCalculating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCode">{t('calculator.product')}</Label>
              <Select value={productCode} onValueChange={setProductCode} disabled={isCalculating}>
                <SelectTrigger id="productCode">
                  <SelectValue placeholder={t('calculator.selectProduct')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.productCode} value={product.productCode}>
                      {product.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenure">{t('calculator.tenure')}</Label>
              <Input
                id="tenure"
                type="number"
                placeholder={t('calculator.tenurePlaceholder')}
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="text-lg"
                disabled={isCalculating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenureUnit">{t('calculator.tenureUnit')}</Label>
              <Select value={tenureUnit} onValueChange={setTenureUnit} disabled={isCalculating}>
                <SelectTrigger id="tenureUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YEARS">{t('calculator.years')}</SelectItem>
                  <SelectItem value="MONTHS">{t('calculator.months')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category1">{t('calculator.category1')}</Label>
              <Select value={category1 || undefined} onValueChange={setCategory1} disabled={isCalculating}>
                <SelectTrigger id="category1">
                  <SelectValue placeholder={t('calculator.noneSelectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category2">{t('calculator.category2')}</Label>
              <Select value={category2 || undefined} onValueChange={setCategory2} disabled={isCalculating}>
                <SelectTrigger id="category2">
                  <SelectValue placeholder={t('calculator.noneSelectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fdType">{t('calculator.fdType')}</Label>
              <Select value={isCumulative ? "CUMULATIVE" : "NON_CUMULATIVE"} onValueChange={(val) => setIsCumulative(val === "CUMULATIVE")} disabled={isCalculating}>
                <SelectTrigger id="fdType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUMULATIVE">{t('calculator.cumulative')}</SelectItem>
                  <SelectItem value="NON_CUMULATIVE">{t('calculator.nonCumulative')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isCumulative && (
              <div className="space-y-2">
                <Label htmlFor="payout">{t('calculator.payoutFrequency')}</Label>
                <Select value={payoutFreq} onValueChange={setPayoutFreq} disabled={isCalculating}>
                  <SelectTrigger id="payout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">{t('calculator.monthly')}</SelectItem>
                    <SelectItem value="QUARTERLY">{t('calculator.quarterly')}</SelectItem>
                    <SelectItem value="YEARLY">{t('calculator.yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={calculateFD} className="w-full" size="lg" disabled={isCalculating}>
            {isCalculating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 h-4 w-4" />
            )}
            {isCalculating ? t('calculator.calculating') : t('calculator.calculate')}
          </Button>

          {calculationResult && (
            <div className="mt-6 space-y-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="font-semibold">{t('calculator.calculationResults')}</h3>
                </div>
                <Button 
                  onClick={handleCreateAccount} 
                  disabled={isCreatingAccount}
                  size="sm"
                >
                  {isCreatingAccount ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCreatingAccount ? t('calculator.creating') : t('calculator.createFDAccount')}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('calculator.maturityValue')}</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{calculationResult.maturity_value?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('calculator.interestEarned')}</p>
                  <p className="text-2xl font-bold text-success">
                    ₹{(() => {
                      const principalNum = parseFloat(principal);
                      const interest = calculationResult.maturity_value - principalNum;
                      return interest.toLocaleString('en-IN');
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('calculator.effectiveAPY')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {calculationResult.apy?.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              {!isCumulative && calculationResult.payout_amount && (
                <div className="pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('calculator.periodicPayout')} ({payoutFreq})</p>
                    <p className="text-xl font-bold text-info">
                      ₹{calculationResult.payout_amount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Prompt Dialog */}
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('calculator.loginRequired')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('calculator.loginRequiredDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>{t('common.login')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Name Dialog */}
      <Dialog open={showAccountNameDialog} onOpenChange={setShowAccountNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Fixed Deposit</DialogTitle>
            <DialogDescription>
              Give your FD account a name to easily identify it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g., Retirement Fund, Child Education, Emergency Savings"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={isCreatingAccount}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                3-100 characters
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAccountNameDialog(false)}
              disabled={isCreatingAccount}
            >
              Cancel
            </Button>
            <Button
              onClick={createFDAccount}
              disabled={isCreatingAccount || !accountName.trim()}
            >
              {isCreatingAccount ? "Creating Account..." : "Create FD Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
