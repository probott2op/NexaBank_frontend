import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  rule?: any;
  onSave: () => void;
}

export function RuleDialog({ open, onOpenChange, productCode, rule, onSave }: RuleDialogProps) {
  const [formData, setFormData] = useState({
    ruleCode: "",
    ruleName: "",
    ruleType: "SIMPLE",
    dataType: "NUMBER",
    validationType: "MIN_MAX",
    ruleValue: "",
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        ruleCode: rule.ruleCode || "",
        ruleName: rule.ruleName || "",
        ruleType: rule.ruleType || "SIMPLE",
        dataType: rule.dataType || "NUMBER",
        validationType: rule.validationType || "MIN_MAX",
        ruleValue: rule.ruleValue || "",
      });
    } else {
      setFormData({
        ruleCode: "",
        ruleName: "",
        ruleType: "SIMPLE",
        dataType: "NUMBER",
        validationType: "MIN_MAX",
        ruleValue: "",
      });
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ruleCode: formData.ruleCode,
        ruleName: formData.ruleName,
        ruleType: formData.ruleType,
        dataType: formData.dataType,
        validationType: formData.validationType,
        ruleValue: formData.ruleValue,
      };

      const { productAPI } = await import("@/services/api");
      
      if (rule) {
        await productAPI.updateRule(productCode, formData.ruleCode, payload);
        toast.success("Rule updated successfully");
      } else {
        await productAPI.addRule(productCode, payload);
        toast.success("Rule created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save rule");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit" : "Add"} Rule</DialogTitle>
          <DialogDescription>
            Configure business rule for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ruleCode">Rule Code *</Label>
              <Input
                id="ruleCode"
                value={formData.ruleCode}
                onChange={(e) => setFormData({ ...formData, ruleCode: e.target.value })}
                placeholder="RULE001"
                required
                disabled={!!rule}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input
                id="ruleName"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                placeholder="Minimum Balance Requirement"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ruleType">Rule Type *</Label>
              <Select value={formData.ruleType} onValueChange={(value) => setFormData({ ...formData, ruleType: value })} required>
                <SelectTrigger id="ruleType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLE">Simple</SelectItem>
                  <SelectItem value="COMPLEX">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataType">Data Type *</Label>
              <Select value={formData.dataType} onValueChange={(value) => setFormData({ ...formData, dataType: value })} required>
                <SelectTrigger id="dataType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NUMBER">Number</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="DATE">Date</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="CURRENCY">Currency</SelectItem>
                  <SelectItem value="DURATION">Duration</SelectItem>
                  <SelectItem value="FREQUENCY">Frequency</SelectItem>
                  <SelectItem value="AMOUNT_WITH_CURRENCY">Amount with Currency</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="JSON_MATRIX">JSON Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="validationType">Validation Type *</Label>
              <Select value={formData.validationType} onValueChange={(value) => setFormData({ ...formData, validationType: value })} required>
                <SelectTrigger id="validationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIN_MAX">Min-Max Range</SelectItem>
                  <SelectItem value="EXACT">Exact Value</SelectItem>
                  <SelectItem value="LIST">List of Values</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ruleValue">Rule Value *</Label>
              <Textarea
                id="ruleValue"
                value={formData.ruleValue}
                onChange={(e) => setFormData({ ...formData, ruleValue: e.target.value })}
                placeholder={
                  formData.validationType === "MIN_MAX" ? '{"min": 1000, "max": 100000}' :
                  formData.validationType === "EXACT" ? '{"value": 5000}' :
                  '{"values": ["MONTHLY", "QUARTERLY", "YEARLY"]}'
                }
                required
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {formData.validationType === "MIN_MAX" && "JSON format: {\"min\": value, \"max\": value}"}
                {formData.validationType === "EXACT" && "JSON format: {\"value\": exactValue}"}
                {formData.validationType === "LIST" && "JSON format: {\"values\": [val1, val2, ...]}"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {rule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
