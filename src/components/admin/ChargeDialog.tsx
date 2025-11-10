import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ChargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  charge?: any;
  onSave: () => void;
}

export function ChargeDialog({ open, onOpenChange, productCode, charge, onSave }: ChargeDialogProps) {
  const [formData, setFormData] = useState({
    chargeCode: "",
    chargeName: "",
    chargeType: "FEE",
    calculationType: "FLAT",
    chargeValue: "",
    frequency: "ONE_TIME",
    debitCredit: "DEBIT",
  });

  useEffect(() => {
    if (charge) {
      setFormData({
        chargeCode: charge.chargeCode || "",
        chargeName: charge.chargeName || "",
        chargeType: charge.chargeType || "FEE",
        calculationType: charge.calculationType || "FLAT",
        chargeValue: (charge.chargeValue || charge.amount)?.toString() || "",
        frequency: charge.frequency || "ONE_TIME",
        debitCredit: charge.debitCredit || "DEBIT",
      });
    } else {
      setFormData({
        chargeCode: "",
        chargeName: "",
        chargeType: "FEE",
        calculationType: "FLAT",
        chargeValue: "",
        frequency: "ONE_TIME",
        debitCredit: "DEBIT",
      });
    }
  }, [charge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        chargeCode: formData.chargeCode,
        chargeName: formData.chargeName,
        chargeType: formData.chargeType,
        calculationType: formData.calculationType,
        chargeValue: parseFloat(formData.chargeValue),
        frequency: formData.frequency,
        debitCredit: formData.debitCredit,
      };

      const { productAPI } = await import("@/services/api");
      
      if (charge) {
        await productAPI.updateCharge(productCode, formData.chargeCode, payload);
        toast.success("Charge updated successfully");
      } else {
        await productAPI.addCharge(productCode, payload);
        toast.success("Charge created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save charge");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{charge ? "Edit" : "Add"} Charge</DialogTitle>
          <DialogDescription>
            Configure charge for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chargeCode">Charge Code *</Label>
              <Input
                id="chargeCode"
                value={formData.chargeCode}
                onChange={(e) => setFormData({ ...formData, chargeCode: e.target.value })}
                placeholder="CHG001"
                required
                disabled={!!charge}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chargeName">Charge Name</Label>
              <Input
                id="chargeName"
                value={formData.chargeName}
                onChange={(e) => setFormData({ ...formData, chargeName: e.target.value })}
                placeholder="Account Maintenance Fee"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chargeType">Charge Type</Label>
              <Select value={formData.chargeType} onValueChange={(value) => setFormData({ ...formData, chargeType: value })}>
                <SelectTrigger id="chargeType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEREST">Interest</SelectItem>
                  <SelectItem value="FEE">Fee</SelectItem>
                  <SelectItem value="TAX">Tax</SelectItem>
                  <SelectItem value="PENALTY">Penalty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="calculationType">Calculation Type *</Label>
              <Select value={formData.calculationType} onValueChange={(value) => setFormData({ ...formData, calculationType: value })} required>
                <SelectTrigger id="calculationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Amount</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chargeValue">Charge Value</Label>
              <Input
                id="chargeValue"
                type="number"
                step="0.01"
                value={formData.chargeValue}
                onChange={(e) => setFormData({ ...formData, chargeValue: e.target.value })}
                placeholder={formData.calculationType === "PERCENTAGE" ? "2.50" : "100.00"}
                min="0"
              />
              <p className="text-sm text-muted-foreground">
                {formData.calculationType === "PERCENTAGE" ? "Percentage value" : "Flat amount"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_TIME">One Time</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUALLY">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="debitCredit">Debit/Credit</Label>
              <Select value={formData.debitCredit} onValueChange={(value) => setFormData({ ...formData, debitCredit: value })}>
                <SelectTrigger id="debitCredit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {charge ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
