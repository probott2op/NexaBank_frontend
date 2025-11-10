import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  transaction?: any;
  onSave: () => void;
}

export function TransactionDialog({ open, onOpenChange, productCode, transaction, onSave }: TransactionDialogProps) {
  const [formData, setFormData] = useState({
    transactionCode: "",
    transactionType: "",
    allowed: "true",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        transactionCode: transaction.transactionCode || "",
        transactionType: transaction.transactionType || "",
        allowed: transaction.allowed !== undefined ? transaction.allowed.toString() : "true",
      });
    } else {
      setFormData({
        transactionCode: "",
        transactionType: "",
        allowed: "true",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        transactionCode: formData.transactionCode,
        transactionType: formData.transactionType,
        allowed: formData.allowed === "true",
      };

      const { productAPI } = await import("@/services/api");
      
      if (transaction) {
        await productAPI.updateTransaction(productCode, formData.transactionCode, payload);
        toast.success("Transaction updated successfully");
      } else {
        await productAPI.addTransaction(productCode, payload);
        toast.success("Transaction created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit" : "Add"} Transaction</DialogTitle>
          <DialogDescription>
            Configure allowed transaction for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="transactionCode">Transaction Code *</Label>
              <Input
                id="transactionCode"
                value={formData.transactionCode}
                onChange={(e) => setFormData({ ...formData, transactionCode: e.target.value })}
                placeholder="FD_DEPOSIT"
                required
                disabled={!!transaction}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Input
                id="transactionType"
                value={formData.transactionType}
                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                placeholder="DEPOSIT / WITHDRAWAL / INTEREST_ACCRUED"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allowed">Allowed *</Label>
              <Select
                value={formData.allowed}
                onValueChange={(value) => setFormData({ ...formData, allowed: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select if transaction is allowed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {transaction ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
