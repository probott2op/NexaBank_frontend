import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    transactionName: "",
    transactionType: "",
    debitCreditIndicator: "",
    minimumAmount: "",
    maximumAmount: "",
    description: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        transactionCode: transaction.transactionCode || "",
        transactionName: transaction.transactionName || "",
        transactionType: transaction.transactionType || "",
        debitCreditIndicator: transaction.debitCreditIndicator || "",
        minimumAmount: transaction.minimumAmount?.toString() || "",
        maximumAmount: transaction.maximumAmount?.toString() || "",
        description: transaction.description || "",
      });
    } else {
      setFormData({
        transactionCode: "",
        transactionName: "",
        transactionType: "",
        debitCreditIndicator: "",
        minimumAmount: "",
        maximumAmount: "",
        description: "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        transactionCode: formData.transactionCode,
        transactionName: formData.transactionName,
        transactionType: formData.transactionType,
        debitCreditIndicator: formData.debitCreditIndicator,
      };

      if (formData.minimumAmount) payload.minimumAmount = parseFloat(formData.minimumAmount);
      if (formData.maximumAmount) payload.maximumAmount = parseFloat(formData.maximumAmount);
      if (formData.description) payload.description = formData.description;

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
                placeholder="TXN001"
                required
                disabled={!!transaction}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transactionName">Transaction Name *</Label>
              <Input
                id="transactionName"
                value={formData.transactionName}
                onChange={(e) => setFormData({ ...formData, transactionName: e.target.value })}
                placeholder="Deposit"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Input
                id="transactionType"
                value={formData.transactionType}
                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                placeholder="DEPOSIT / WITHDRAWAL / TRANSFER"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="debitCreditIndicator">Debit/Credit Indicator *</Label>
              <Input
                id="debitCreditIndicator"
                value={formData.debitCreditIndicator}
                onChange={(e) => setFormData({ ...formData, debitCreditIndicator: e.target.value })}
                placeholder="DEBIT / CREDIT"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minimumAmount">Minimum Amount</Label>
              <Input
                id="minimumAmount"
                type="number"
                step="0.01"
                value={formData.minimumAmount}
                onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                placeholder="100.00"
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maximumAmount">Maximum Amount</Label>
              <Input
                id="maximumAmount"
                type="number"
                step="0.01"
                value={formData.maximumAmount}
                onChange={(e) => setFormData({ ...formData, maximumAmount: e.target.value })}
                placeholder="50000.00"
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
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
