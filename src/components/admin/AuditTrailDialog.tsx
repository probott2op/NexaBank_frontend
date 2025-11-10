import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, History } from "lucide-react";
import { productAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AuditTrailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCode: string;
  category: "interest-rates" | "charges" | "balances" | "rules" | "transactions" | "communications" | "roles";
  itemCode?: string; // Optional: if provided, shows single item audit trail
  categoryLabel: string;
}

export const AuditTrailDialog = ({
  open,
  onOpenChange,
  productCode,
  category,
  itemCode,
  categoryLabel,
}: AuditTrailDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchAuditTrail();
    }
  }, [open, productCode, category, itemCode]);

  const fetchAuditTrail = async () => {
    setLoading(true);
    try {
      let data;
      
      // Call the appropriate API based on category and whether itemCode is provided
      if (itemCode) {
        // Single item audit trail
        switch (category) {
          case "interest-rates":
            data = await productAPI.getInterestRateAuditTrail(productCode, itemCode);
            break;
          case "charges":
            data = await productAPI.getChargeAuditTrail(productCode, itemCode);
            break;
          case "balances":
            data = await productAPI.getBalanceAuditTrail(productCode, itemCode);
            break;
          case "rules":
            data = await productAPI.getRuleAuditTrail(productCode, itemCode);
            break;
          case "transactions":
            data = await productAPI.getTransactionAuditTrail(productCode, itemCode);
            break;
          case "communications":
            data = await productAPI.getCommunicationAuditTrail(productCode, itemCode);
            break;
          case "roles":
            data = await productAPI.getRoleAuditTrail(productCode, itemCode);
            break;
        }
      } else {
        // All items audit trail
        switch (category) {
          case "interest-rates":
            data = await productAPI.getAllInterestRatesAuditTrail(productCode);
            break;
          case "charges":
            data = await productAPI.getAllChargesAuditTrail(productCode);
            break;
          case "balances":
            data = await productAPI.getAllBalancesAuditTrail(productCode);
            break;
          case "rules":
            data = await productAPI.getAllRulesAuditTrail(productCode);
            break;
          case "transactions":
            data = await productAPI.getAllTransactionsAuditTrail(productCode);
            break;
          case "communications":
            data = await productAPI.getAllCommunicationsAuditTrail(productCode);
            break;
          case "roles":
            data = await productAPI.getAllRolesAuditTrail(productCode);
            break;
        }
      }

      setAuditData(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch audit trail:", error);
      toast({
        title: "Failed to load audit trail",
        description: error.message || "Could not fetch audit trail data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCrudBadgeVariant = (crudValue: string) => {
    switch (crudValue) {
      case "C":
        return "default"; // Create - blue
      case "U":
        return "secondary"; // Update - gray
      case "D":
        return "destructive"; // Delete - red
      default:
        return "outline";
    }
  };

  const getCrudLabel = (crudValue: string) => {
    switch (crudValue) {
      case "C":
        return "Created";
      case "U":
        return "Updated";
      case "D":
        return "Deleted";
      default:
        return crudValue;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  // Get main identifier field based on category
  const getMainIdentifier = (item: any) => {
    switch (category) {
      case "interest-rates":
        return item.rateCode;
      case "charges":
        return item.chargeCode;
      case "balances":
        return item.balanceType;
      case "rules":
        return item.ruleCode;
      case "transactions":
        return item.transactionCode;
      case "communications":
        return item.communicationCode;
      case "roles":
        return item.roleCode;
      default:
        return "N/A";
    }
  };

  // Get main data fields (excluding audit fields)
  const getMainDataFields = (item: any) => {
    const auditFields = [
      "createdAt", "efctv_date", "crud_value", "user_id", "ws_id",
      "prgm_id", "host_ts", "local_ts", "acpt_ts", "acpt_ts_utc_ofst", "uuid_reference"
    ];
    
    const mainFields: Record<string, any> = {};
    Object.keys(item).forEach(key => {
      if (!auditFields.includes(key)) {
        mainFields[key] = item[key];
      }
    });
    
    return mainFields;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <DialogTitle>
              {itemCode ? `Audit Trail: ${itemCode}` : `All ${categoryLabel} Audit Trail`}
            </DialogTitle>
          </div>
          <DialogDescription>
            Complete history of changes including creates, updates, and deletes
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : auditData.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground">
            No audit trail data available
          </div>
        ) : (
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 py-4">
                {auditData.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-3 bg-card shadow-sm"
                  >
                    {/* Header with CRUD badge and timestamp */}
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getCrudBadgeVariant(item.crud_value)}>
                          {getCrudLabel(item.crud_value)}
                        </Badge>
                        <span className="font-semibold text-lg">
                          {getMainIdentifier(item)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>

                    {/* Main Data */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      {Object.entries(getMainDataFields(item)).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-muted-foreground font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="font-mono text-foreground">
                            {value !== null && value !== undefined
                              ? typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)
                              : "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Audit Information */}
                    <div className="border-t pt-3 mt-3">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        Audit Information
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">User: </span>
                          <span className="font-mono">{item.user_id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Workstation: </span>
                          <span className="font-mono">{item.ws_id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Program: </span>
                          <span className="font-mono">{item.prgm_id || "N/A"}</span>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <span className="text-muted-foreground">Host TS: </span>
                          <span className="font-mono text-xs">
                            {formatDate(item.host_ts)}
                          </span>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <span className="text-muted-foreground">Local TS: </span>
                          <span className="font-mono text-xs">
                            {formatDate(item.local_ts)}
                          </span>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <span className="text-muted-foreground">UUID: </span>
                          <span className="font-mono text-xs truncate block max-w-full">
                            {item.uuid_reference || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
