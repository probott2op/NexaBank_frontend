import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSave: (data: any) => void;
}

export const ProductDialog = ({ open, onOpenChange, product, onSave }: ProductDialogProps) => {
  const [formData, setFormData] = useState({
    productCode: '',
    productName: '',
    productType: '',
    productDescription: '',
    currency: 'INR',
    status: 'ACTIVE',
    interestType: 'SIMPLE',
    compoundingFrequency: '',
    effectiveStartDate: '',
    effectiveEndDate: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productCode: product.productCode || '',
        productName: product.productName || '',
        productType: product.productType || '',
        productDescription: product.productDescription || '',
        currency: product.currency || 'INR',
        status: product.status || 'ACTIVE',
        interestType: product.interestType || 'SIMPLE',
        compoundingFrequency: product.compoundingFrequency || '',
        effectiveStartDate: product.effectiveStartDate || '',
        effectiveEndDate: product.effectiveEndDate || '',
      });
    } else {
      setFormData({
        productCode: '',
        productName: '',
        productType: '',
        productDescription: '',
        currency: 'INR',
        status: 'ACTIVE',
        interestType: 'SIMPLE',
        compoundingFrequency: '',
        effectiveStartDate: new Date().toISOString().split('T')[0],
        effectiveEndDate: '',
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      effectiveEndDate: formData.effectiveEndDate || null,
    };
    onSave(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Create Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code *</Label>
                <Input
                  id="productCode"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  required
                  disabled={!!product}
                  placeholder="FD-STANDARD-2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productType">Product Type *</Label>
                <Select value={formData.productType} onValueChange={(value) => setFormData({ ...formData, productType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                    <SelectItem value="CURRENT">Current Account</SelectItem>
                    <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                    <SelectItem value="RECURRING_DEPOSIT">Recurring Deposit</SelectItem>
                    <SelectItem value="LOAN">Loan</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestType">Interest Type *</Label>
                <Select value={formData.interestType} onValueChange={(value) => setFormData({ ...formData, interestType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                    <SelectItem value="COMPOUND">Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compoundingFrequency">Compounding</Label>
                <Select value={formData.compoundingFrequency} onValueChange={(value) => setFormData({ ...formData, compoundingFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="SEMI_ANNUALLY">Semi-Annually</SelectItem>
                    <SelectItem value="ANNUALLY">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveStartDate">Start Date *</Label>
                <Input
                  id="effectiveStartDate"
                  type="date"
                  value={formData.effectiveStartDate}
                  onChange={(e) => setFormData({ ...formData, effectiveStartDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveEndDate">End Date</Label>
                <Input
                  id="effectiveEndDate"
                  type="date"
                  value={formData.effectiveEndDate}
                  onChange={(e) => setFormData({ ...formData, effectiveEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
