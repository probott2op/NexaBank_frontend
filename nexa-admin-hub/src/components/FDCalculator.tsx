import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FDCalculator = () => {
  const { toast } = useToast();
  const [principal, setPrincipal] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureUnit, setTenureUnit] = useState("YEARS");
  const [category, setCategory] = useState("REGULAR");
  const [result, setResult] = useState<{
    maturityValue: number;
    interest: number;
    apy: number;
  } | null>(null);

  const calculateFD = () => {
    if (!principal || !tenure) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const p = parseFloat(principal);
    const t = parseFloat(tenure);
    
    // Base interest rates based on tenure
    let baseRate = 6.5; // Default rate
    if (tenureUnit === "YEARS") {
      if (t < 1) baseRate = 5.5;
      else if (t < 2) baseRate = 6.0;
      else if (t < 3) baseRate = 6.5;
      else baseRate = 7.0;
    }

    // Category-based additional interest
    const categoryBonus: { [key: string]: number } = {
      REGULAR: 0,
      SENIOR: 0.75,
      JR: 0.5,
      GOLD: 0.25,
      SILVER: 0.15,
      PLAT: 0.35,
      EMP: 1.0,
    };

    const finalRate = baseRate + (categoryBonus[category] || 0);
    const tenureInYears = tenureUnit === "MONTHS" ? t / 12 : t;
    
    // Compound interest formula: A = P(1 + r/n)^(nt)
    // Assuming quarterly compounding (n=4)
    const n = 4;
    const r = finalRate / 100;
    const maturityValue = p * Math.pow(1 + r / n, n * tenureInYears);
    const interest = maturityValue - p;
    const apy = (Math.pow(1 + r / n, n) - 1) * 100;

    setResult({
      maturityValue: Math.round(maturityValue * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      apy: Math.round(apy * 100) / 100,
    });

    toast({
      title: "Calculation Complete",
      description: "Your FD maturity value has been calculated",
    });
  };

  return (
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Customer Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="SENIOR">Senior Citizen (+0.75%)</SelectItem>
                <SelectItem value="JR">Junior Citizen (+0.50%)</SelectItem>
                <SelectItem value="GOLD">Gold (+0.25%)</SelectItem>
                <SelectItem value="SILVER">Silver (+0.15%)</SelectItem>
                <SelectItem value="PLAT">Platinum (+0.35%)</SelectItem>
                <SelectItem value="EMP">Employee (+1.00%)</SelectItem>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenureUnit">Tenure Unit</Label>
            <Select value={tenureUnit} onValueChange={setTenureUnit}>
              <SelectTrigger id="tenureUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YEARS">Years</SelectItem>
                <SelectItem value="MONTHS">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculateFD} className="w-full" size="lg">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate Maturity Value
        </Button>

        {result && (
          <div className="mt-6 space-y-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              <h3 className="font-semibold">Calculation Results</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Maturity Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{result.maturityValue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interest Earned</p>
                <p className="text-2xl font-bold text-success">
                  ₹{result.interest.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Effective APY</p>
                <p className="text-2xl font-bold text-primary">
                  {result.apy}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
