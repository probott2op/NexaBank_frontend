import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    description: "",
  });

  useEffect(() => {
    if (role) {
      setFormData({
        roleCode: role.roleCode || "",
        roleName: role.roleName || "",
        roleType: role.roleType || "",
        description: role.description || "",
      });
    } else {
      setFormData({
        roleCode: "",
        roleName: "",
        roleType: "",
        description: "",
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
      };

      if (formData.description) payload.description = formData.description;

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
                placeholder="Primary Account Holder"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roleType">Role Type *</Label>
              <Input
                id="roleType"
                value={formData.roleType}
                onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                placeholder="OWNER / CO_OWNER / GUARDIAN / NOMINEE / BORROWER / GUARANTOR"
                required
              />
              <p className="text-sm text-muted-foreground">
                Common types: OWNER, CO_OWNER, GUARDIAN, NOMINEE, BORROWER, GUARANTOR
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of the role and its responsibilities"
                rows={4}
              />
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
