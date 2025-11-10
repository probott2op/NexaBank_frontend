import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  communication?: any;
  onSave: () => void;
}

export function CommunicationDialog({ open, onOpenChange, productCode, communication, onSave }: CommunicationDialogProps) {
  const [formData, setFormData] = useState({
    communicationCode: "",
    communicationName: "",
    communicationType: "ALERT",
    communicationChannel: "EMAIL",
    templateContent: "",
    frequencyLimit: "",
    description: "",
  });

  useEffect(() => {
    if (communication) {
      setFormData({
        communicationCode: communication.communicationCode || communication.commCode || "",
        communicationName: communication.communicationName || "",
        communicationType: communication.communicationType || "ALERT",
        communicationChannel: communication.communicationChannel || communication.channel || "EMAIL",
        templateContent: communication.templateContent || communication.template || "",
        frequencyLimit: communication.frequencyLimit?.toString() || "",
        description: communication.description || "",
      });
    } else {
      setFormData({
        communicationCode: "",
        communicationName: "",
        communicationType: "ALERT",
        communicationChannel: "EMAIL",
        templateContent: "",
        frequencyLimit: "",
        description: "",
      });
    }
  }, [communication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        communicationCode: formData.communicationCode,
        communicationName: formData.communicationName,
        communicationType: formData.communicationType,
        communicationChannel: formData.communicationChannel,
        templateContent: formData.templateContent,
      };

      if (formData.frequencyLimit) payload.frequencyLimit = parseInt(formData.frequencyLimit);
      if (formData.description) payload.description = formData.description;

      const { productAPI } = await import("@/services/api");
      
      if (communication) {
        await productAPI.updateCommunication(productCode, formData.communicationCode, payload);
        toast.success("Communication updated successfully");
      } else {
        await productAPI.addCommunication(productCode, payload);
        toast.success("Communication created successfully");
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save communication");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{communication ? "Edit" : "Add"} Communication</DialogTitle>
          <DialogDescription>
            Configure communication template for product {productCode}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="communicationCode">Communication Code *</Label>
              <Input
                id="communicationCode"
                value={formData.communicationCode}
                onChange={(e) => setFormData({ ...formData, communicationCode: e.target.value })}
                placeholder="COMM001"
                required
                disabled={!!communication}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="communicationName">Communication Name *</Label>
              <Input
                id="communicationName"
                value={formData.communicationName}
                onChange={(e) => setFormData({ ...formData, communicationName: e.target.value })}
                placeholder="Account Opening Confirmation"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="communicationType">Communication Type *</Label>
              <Select value={formData.communicationType} onValueChange={(value) => setFormData({ ...formData, communicationType: value })} required>
                <SelectTrigger id="communicationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALERT">Alert</SelectItem>
                  <SelectItem value="NOTICE">Notice</SelectItem>
                  <SelectItem value="STATEMENT">Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="communicationChannel">Communication Channel *</Label>
              <Select value={formData.communicationChannel} onValueChange={(value) => setFormData({ ...formData, communicationChannel: value })} required>
                <SelectTrigger id="communicationChannel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="POST">Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="templateContent">Template Content *</Label>
              <Textarea
                id="templateContent"
                value={formData.templateContent}
                onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
                placeholder="Dear {customerName}, your account..."
                required
                rows={5}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequencyLimit">Frequency Limit (per month)</Label>
              <Input
                id="frequencyLimit"
                type="number"
                value={formData.frequencyLimit}
                onChange={(e) => setFormData({ ...formData, frequencyLimit: e.target.value })}
                placeholder="4"
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
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {communication ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
