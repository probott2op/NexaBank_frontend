import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  role?: any;
  onSave: () => void;
}

export function RoleDialog({ open, onOpenChange, productCode, role, onSave }: RoleDialogProps) {
  const [formData, setFormData] = useState({
    roleCode: "",
    roleName: "",
    roleType: "",
    maxCount: "",
    mandatory: "false",
  });

  useEffect(() => {
    if (role) {
      setFormData({
        roleCode: role.roleCode || "",
        roleName: role.roleName || "",
        roleType: role.roleType || "",
        maxCount: role.maxCount?.toString() || "",
        mandatory: role.mandatory !== undefined ? role.mandatory.toString() : "false",
      });
    } else {
      setFormData({
        roleCode: "",
        roleName: "",
        roleType: "",
        maxCount: "",
        mandatory: "false",
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        roleCode: formData.roleCode,
        roleName: formData.roleName,
        roleType: formData.roleType,
        mandatory: formData.mandatory === "true",
      };

      if (formData.maxCount) payload.maxCount = parseInt(formData.maxCount);

      const { productAPI } = await import("@/services/api");
      
      if (role) {
        await productAPI.updateRole(productCode, formData.roleCode, payload);
        toast.success("Role updated successfully");
      } else {
        await productAPI.addRole(productCode, payload);
        toast.success("Role created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit" : "Add"} Role</DialogTitle>
          <DialogDescription>
            Configure role for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roleCode">Role Code *</Label>
              <Input
                id="roleCode"
                value={formData.roleCode}
                onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                placeholder="ROLE001"
                required
                disabled={!!role}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                placeholder="OWNER"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roleType">Role Type *</Label>
              <Input
                id="roleType"
                value={formData.roleType}
                onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                placeholder="OWNER / CO_OWNER / GUARDIAN / NOMINEE"
                required
              />
              <p className="text-sm text-muted-foreground">
                Common types: OWNER, CO_OWNER, GUARDIAN, NOMINEE, BORROWER, GUARANTOR
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxCount">Max Count</Label>
              <Input
                id="maxCount"
                type="number"
                value={formData.maxCount}
                onChange={(e) => setFormData({ ...formData, maxCount: e.target.value })}
                placeholder="1"
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of people allowed for this role
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mandatory">Mandatory *</Label>
              <Select
                value={formData.mandatory}
                onValueChange={(value) => setFormData({ ...formData, mandatory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Is this role mandatory?" />
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
              {role ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
