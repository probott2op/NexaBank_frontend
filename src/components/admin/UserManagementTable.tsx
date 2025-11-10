import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, User, Mail, Phone, MapPin } from "lucide-react";
import { customerAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const UserManagementTable = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    loading: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerAPI.getAllProfiles();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch customers",
        variant: "destructive",
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCustomers();
      return;
    }
    
    try {
      setLoading(true);
      const data = await customerAPI.searchProfiles(searchQuery);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Search failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer: any) => {
    try {
      setSelectedCustomer(customer);
      setEditData(customer);
      setEditMode(false);
      setDetailsDialog({ open: true, loading: false });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load customer details",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    try {
      setDetailsDialog(prev => ({ ...prev, loading: true }));
      
      await customerAPI.updateProfile(selectedCustomer.customerNumber, editData);
      
      toast({
        title: t('success.saved'),
        description: "Customer profile updated successfully",
      });

      setEditMode(false);
      await fetchCustomers();
      setDetailsDialog({ open: false, loading: false });
      setSelectedCustomer(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setDetailsDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getCustomerStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'CLOSED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell className="font-mono text-sm">{customer.customerNumber}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {customer.firstName} {customer.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {customer.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {customer.city || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getKycStatusColor(customer.kycStatus)}>
                        {customer.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCustomerStatusColor(customer.customerStatus)}>
                        {customer.customerStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={detailsDialog.open} onOpenChange={(open) => {
        setDetailsDialog(prev => ({ ...prev, open }));
        if (!open) {
          setSelectedCustomer(null);
          setEditMode(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Customer Profile</span>
              {!editMode && (
                <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                  Edit Profile
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Customer Number: {selectedCustomer?.customerNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="identification">Identification</TabsTrigger>
                <TabsTrigger value="status">Status & Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        {editMode ? (
                          <Input
                            value={editData.firstName || ''}
                            onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        {editMode ? (
                          <Input
                            value={editData.lastName || ''}
                            onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.lastName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Middle Name</Label>
                        {editMode ? (
                          <Input
                            value={editData.middleName || ''}
                            onChange={(e) => setEditData({ ...editData, middleName: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.middleName || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        {editMode ? (
                          <Input
                            type="email"
                            value={editData.email || ''}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        {editMode ? (
                          <Input
                            value={editData.phoneNumber || ''}
                            onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.phoneNumber}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Alternate Phone</Label>
                        {editMode ? (
                          <Input
                            value={editData.alternatePhone || ''}
                            onChange={(e) => setEditData({ ...editData, alternatePhone: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.alternatePhone || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        {editMode ? (
                          <Input
                            type="date"
                            value={editData.dateOfBirth || ''}
                            onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">
                            {selectedCustomer.dateOfBirth ? new Date(selectedCustomer.dateOfBirth).toLocaleDateString('en-IN') : '-'}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        {editMode ? (
                          <Input
                            value={editData.gender || ''}
                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.gender || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Nationality</Label>
                        {editMode ? (
                          <Input
                            value={editData.nationality || ''}
                            onChange={(e) => setEditData({ ...editData, nationality: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.nationality || '-'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address Line 1</Label>
                        {editMode ? (
                          <Input
                            value={editData.addressLine1 || ''}
                            onChange={(e) => setEditData({ ...editData, addressLine1: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.addressLine1 || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address Line 2</Label>
                        {editMode ? (
                          <Input
                            value={editData.addressLine2 || ''}
                            onChange={(e) => setEditData({ ...editData, addressLine2: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.addressLine2 || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        {editMode ? (
                          <Input
                            value={editData.city || ''}
                            onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.city || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        {editMode ? (
                          <Input
                            value={editData.state || ''}
                            onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.state || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        {editMode ? (
                          <Input
                            value={editData.country || ''}
                            onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.country || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        {editMode ? (
                          <Input
                            value={editData.postalCode || ''}
                            onChange={(e) => setEditData({ ...editData, postalCode: e.target.value })}
                          />
                        ) : (
                          <p className="font-semibold">{selectedCustomer.postalCode || '-'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="identification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Identification Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Aadhar Number</Label>
                        <p className="font-mono">{selectedCustomer.maskedAadhar || '-'}</p>
                        {editMode && (
                          <Input
                            value={editData.aadharNumber || ''}
                            onChange={(e) => setEditData({ ...editData, aadharNumber: e.target.value })}
                            placeholder="Full Aadhar (will be masked)"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>PAN Number</Label>
                        <p className="font-mono">{selectedCustomer.maskedPan || '-'}</p>
                        {editMode && (
                          <Input
                            value={editData.panNumber || ''}
                            onChange={(e) => setEditData({ ...editData, panNumber: e.target.value })}
                            placeholder="Full PAN (will be masked)"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Passport Number</Label>
                        {editMode ? (
                          <Input
                            value={editData.passportNumber || ''}
                            onChange={(e) => setEditData({ ...editData, passportNumber: e.target.value })}
                          />
                        ) : (
                          <p className="font-mono">{selectedCustomer.passportNumber || '-'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Driving License</Label>
                        {editMode ? (
                          <Input
                            value={editData.drivingLicense || ''}
                            onChange={(e) => setEditData({ ...editData, drivingLicense: e.target.value })}
                          />
                        ) : (
                          <p className="font-mono">{selectedCustomer.drivingLicense || '-'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status & Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Customer Type</Label>
                        <p className="font-semibold">{selectedCustomer.customerType || '-'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Customer Status</Label>
                        <Badge variant={getCustomerStatusColor(selectedCustomer.customerStatus)}>
                          {selectedCustomer.customerStatus}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>KYC Status</Label>
                        <Badge variant={getKycStatusColor(selectedCustomer.kycStatus)}>
                          {selectedCustomer.kycStatus}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>KYC Completion Date</Label>
                        <p className="font-semibold">
                          {selectedCustomer.kycCompletionDate 
                            ? new Date(selectedCustomer.kycCompletionDate).toLocaleDateString('en-IN')
                            : '-'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>CRUD Operation</Label>
                        <Badge>{selectedCustomer.crudOperation}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>Version Timestamp</Label>
                        <p className="font-semibold text-sm">
                          {new Date(selectedCustomer.versionTimestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>User ID</Label>
                        <p className="font-mono text-xs">{selectedCustomer.userId}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Customer ID</Label>
                        <p className="font-mono text-xs">{selectedCustomer.customerId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {editMode && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setEditData(selectedCustomer);
                }}
                disabled={detailsDialog.loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={detailsDialog.loading}
              >
                {detailsDialog.loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
