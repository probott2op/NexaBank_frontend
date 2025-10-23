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
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [compoundingFreq, setCompoundingFreq] = useState("QUARTERLY");
  const [isCumulative, setIsCumulative] = useState(true);
  const [payoutFreq, setPayoutFreq] = useState("MONTHLY");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fdCalcAPI.getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
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
      // Call FD Calculation API
      const response = await fdCalcAPI.calculate({
        principal_amount: parseFloat(principal),
        tenure_value: parseInt(tenure),
        tenure_unit: tenureUnit,
        interest_type: "COMPOUND",
        compounding_frequency: compoundingFreq,
        category1_id: category || undefined,
        cumulative: isCumulative,
        payout_freq: isCumulative ? undefined : payoutFreq,
        product_code: "FD001",
        currency_code: "INR"
      });

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
        productCode: "FD001",
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
              <Label htmlFor="category">Customer Category (Optional)</Label>
              <Select value={category} onValueChange={setCategory} disabled={isCalculating}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_code} value={cat.category_code}>
                      {cat.category_name} (+{cat.additional_percentage}%)
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
              <Label htmlFor="compounding">Compounding Frequency</Label>
              <Select value={compoundingFreq} onValueChange={setCompoundingFreq} disabled={isCalculating}>
                <SelectTrigger id="compounding">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
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
              <div className="space-y-2 md:col-span-2">
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
