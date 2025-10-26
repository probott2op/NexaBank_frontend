import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export const FDCalculator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // Available categories based on backend mapping
  const availableCategories = [
    { code: "SR", name: "Senior Citizen", variants: ["SENIOR", "SENIOR_CITIZEN", "SR"] },
    { code: "JR", name: "Junior", variants: ["JUNIOR", "JR"] },
    { code: "DY", name: "Digi Youth", variants: ["DIGI_YOUTH", "DY"] },
    { code: "GOLD", name: "Gold", variants: ["GOLD"] },
    { code: "SIL", name: "Silver", variants: ["SILVER", "SIL"] },
    { code: "PLAT", name: "Platinum", variants: ["PLATINUM", "PLAT"] },
    { code: "EMP", name: "Employee", variants: ["EMPLOYEE", "EMP"] },
  ];

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { productAPI } = await import("@/services/api");
        const response = await productAPI.getAllProducts();
        console.log("Products API response:", response);
        // The API returns { data: [...], totalPages, totalElements, etc }
        const productsData = response?.data || response || [];
        console.log("Products data:", productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: "Failed to load products",
          description: "Could not fetch product list. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
    fetchProducts();
  }, []);

  const calculateFD = async () => {
    if (!principal || !tenure) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
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

      // Call FD Calculation API
      const response = await fdCalcAPI.calculate(payload);

      setCalculationResult(response);

      toast({
        title: "Calculation Complete",
        description: "Your FD maturity value has been calculated",
      });
      
    } catch (error: any) {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate FD. Please try again.",
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
    
    createFDAccount();
  };

  const createFDAccount = async () => {
    if (!calculationResult) {
      toast({
        title: "No Calculation",
        description: "Please calculate FD first before creating an account",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAccount(true);
    
    try {
      const userInfo = tokenManager.getUserInfo();
      
      // Create FD account
      const accountData = await fdAccountAPI.createAccount({
        calculationId: calculationResult.result_id,
        productCode: productCode,
        maturityInstruction: "PAYOUT"
      });

      toast({
        title: "FD Account Created",
        description: `Your FD account ${accountData.accountNumber} has been created successfully!`,
      });
      
      // Navigate to dashboard
      navigate(userInfo.userType === "ADMIN" ? "/admin" : "/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Account Creation Failed",
        description: error.message || "Failed to create FD account. Please try again.",
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
            <CardTitle>Fixed Deposit Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your FD maturity value with compound interest
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount (₹)</Label>
              <Input
                id="principal"
                type="number"
                placeholder="100000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="text-lg"
                disabled={isCalculating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCode">Product</Label>
              <Select value={productCode} onValueChange={setProductCode} disabled={isCalculating}>
                <SelectTrigger id="productCode">
                  <SelectValue placeholder="Select product" />
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
              <Label htmlFor="tenure">Tenure</Label>
              <Input
                id="tenure"
                type="number"
                placeholder="5"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="text-lg"
                disabled={isCalculating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenureUnit">Tenure Unit</Label>
              <Select value={tenureUnit} onValueChange={setTenureUnit} disabled={isCalculating}>
                <SelectTrigger id="tenureUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YEARS">Years</SelectItem>
                  <SelectItem value="MONTHS">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category1">Category 1 (Optional)</Label>
              <Select value={category1 || undefined} onValueChange={setCategory1} disabled={isCalculating}>
                <SelectTrigger id="category1">
                  <SelectValue placeholder="None - Select category" />
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
              <Label htmlFor="category2">Category 2 (Optional)</Label>
              <Select value={category2 || undefined} onValueChange={setCategory2} disabled={isCalculating}>
                <SelectTrigger id="category2">
                  <SelectValue placeholder="None - Select category" />
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
              <Label htmlFor="fdType">FD Type</Label>
              <Select value={isCumulative ? "CUMULATIVE" : "NON_CUMULATIVE"} onValueChange={(val) => setIsCumulative(val === "CUMULATIVE")} disabled={isCalculating}>
                <SelectTrigger id="fdType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUMULATIVE">Cumulative</SelectItem>
                  <SelectItem value="NON_CUMULATIVE">Non-Cumulative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isCumulative && (
              <div className="space-y-2">
                <Label htmlFor="payout">Payout Frequency</Label>
                <Select value={payoutFreq} onValueChange={setPayoutFreq} disabled={isCalculating}>
                  <SelectTrigger id="payout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
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
            {isCalculating ? 'Calculating...' : 'Calculate Maturity Value'}
          </Button>

          {calculationResult && (
            <div className="mt-6 space-y-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="font-semibold">Calculation Results</h3>
                </div>
                <Button 
                  onClick={handleCreateAccount} 
                  disabled={isCreatingAccount}
                  size="sm"
                >
                  {isCreatingAccount ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCreatingAccount ? 'Creating...' : 'Create FD Account'}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Maturity Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{calculationResult.maturity_value?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Interest Earned</p>
                  <p className="text-2xl font-bold text-success">
                    ₹{calculationResult.interest_earned?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Effective APY</p>
                  <p className="text-2xl font-bold text-primary">
                    {calculationResult.apy?.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              {!isCumulative && calculationResult.payout_amount && (
                <div className="pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Periodic Payout ({payoutFreq})</p>
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
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to login to create an FD account. Would you like to login now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
