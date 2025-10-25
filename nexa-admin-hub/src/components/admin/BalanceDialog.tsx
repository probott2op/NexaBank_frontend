import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface BalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  balance?: any;
  onSave: () => void;
}

export function BalanceDialog({ open, onOpenChange, productCode, balance, onSave }: BalanceDialogProps) {
  const [balanceType, setBalanceType] = useState("LOAN_PRINCIPAL");

  useEffect(() => {
    if (balance) {
      setBalanceType(balance.balanceType || "LOAN_PRINCIPAL");
    } else {
      setBalanceType("LOAN_PRINCIPAL");
    }
  }, [balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        balanceType: balanceType,
      };

      const { productAPI } = await import("@/services/api");
      
      if (balance) {
        await productAPI.updateBalance(productCode, balance.id, payload);
        toast.success("Balance type updated successfully");
      } else {
        await productAPI.addBalance(productCode, payload);
        toast.success("Balance type created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save balance type");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{balance ? "Edit" : "Add"} Balance Type</DialogTitle>
          <DialogDescription>
            Configure balance type for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="balanceType">Balance Type *</Label>
              <Select value={balanceType} onValueChange={setBalanceType} required>
                <SelectTrigger id="balanceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOAN_PRINCIPAL">Loan Principal</SelectItem>
                  <SelectItem value="LOAN_INTEREST">Loan Interest</SelectItem>
                  <SelectItem value="FD_PRINCIPAL">FD Principal</SelectItem>
                  <SelectItem value="FD_INTEREST">FD Interest</SelectItem>
                  <SelectItem value="OVERDRAFT">Overdraft</SelectItem>
                  <SelectItem value="PENALTY">Penalty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {balance ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
