import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface InterestRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  interestRate?: any;
  onSave: () => void;
}

export function InterestRateDialog({ open, onOpenChange, productCode, interestRate, onSave }: InterestRateDialogProps) {
  const [formData, setFormData] = useState({
    rateCode: "",
    termInMonths: "",
    rateCumulative: "",
    rateNonCumulativeMonthly: "",
    rateNonCumulativeQuarterly: "",
    rateNonCumulativeYearly: "",
  });

  useEffect(() => {
    if (interestRate) {
      setFormData({
        rateCode: interestRate.rateCode || "",
        termInMonths: interestRate.termInMonths?.toString() || "",
        rateCumulative: interestRate.rateCumulative?.toString() || "",
        rateNonCumulativeMonthly: interestRate.rateNonCumulativeMonthly?.toString() || "",
        rateNonCumulativeQuarterly: interestRate.rateNonCumulativeQuarterly?.toString() || "",
        rateNonCumulativeYearly: interestRate.rateNonCumulativeYearly?.toString() || "",
      });
    } else {
      setFormData({
        rateCode: "",
        termInMonths: "",
        rateCumulative: "",
        rateNonCumulativeMonthly: "",
        rateNonCumulativeQuarterly: "",
        rateNonCumulativeYearly: "",
      });
    }
  }, [interestRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        rateCode: formData.rateCode,
        termInMonths: parseInt(formData.termInMonths),
        rateCumulative: parseFloat(formData.rateCumulative),
        rateNonCumulativeMonthly: parseFloat(formData.rateNonCumulativeMonthly),
        rateNonCumulativeQuarterly: parseFloat(formData.rateNonCumulativeQuarterly),
        rateNonCumulativeYearly: parseFloat(formData.rateNonCumulativeYearly),
      };

      const { productAPI } = await import("@/services/api");
      
      if (interestRate) {
        await productAPI.updateInterestRate(productCode, formData.rateCode, payload);
        toast.success("Interest rate updated successfully");
      } else {
        await productAPI.addInterestRate(productCode, payload);
        toast.success("Interest rate created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save interest rate");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{interestRate ? "Edit" : "Add"} Interest Rate</DialogTitle>
          <DialogDescription>
            Configure interest rate for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rateCode">Rate Code *</Label>
              <Input
                id="rateCode"
                value={formData.rateCode}
                onChange={(e) => setFormData({ ...formData, rateCode: e.target.value })}
                placeholder="RATE001"
                required
                disabled={!!interestRate}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="termInMonths">Term (Months) *</Label>
              <Input
                id="termInMonths"
                type="number"
                value={formData.termInMonths}
                onChange={(e) => setFormData({ ...formData, termInMonths: e.target.value })}
                placeholder="12"
                required
                min="1"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rateCumulative">Cumulative Rate (%) *</Label>
              <Input
                id="rateCumulative"
                type="number"
                step="0.01"
                value={formData.rateCumulative}
                onChange={(e) => setFormData({ ...formData, rateCumulative: e.target.value })}
                placeholder="6.50"
                required
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rateNonCumulativeMonthly">Non-Cumulative Monthly Rate (%) *</Label>
              <Input
                id="rateNonCumulativeMonthly"
                type="number"
                step="0.01"
                value={formData.rateNonCumulativeMonthly}
                onChange={(e) => setFormData({ ...formData, rateNonCumulativeMonthly: e.target.value })}
                placeholder="0.50"
                required
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rateNonCumulativeQuarterly">Non-Cumulative Quarterly Rate (%) *</Label>
              <Input
                id="rateNonCumulativeQuarterly"
                type="number"
                step="0.01"
                value={formData.rateNonCumulativeQuarterly}
                onChange={(e) => setFormData({ ...formData, rateNonCumulativeQuarterly: e.target.value })}
                placeholder="1.50"
                required
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rateNonCumulativeYearly">Non-Cumulative Yearly Rate (%) *</Label>
              <Input
                id="rateNonCumulativeYearly"
                type="number"
                step="0.01"
                value={formData.rateNonCumulativeYearly}
                onChange={(e) => setFormData({ ...formData, rateNonCumulativeYearly: e.target.value })}
                placeholder="6.00"
                required
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {interestRate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
