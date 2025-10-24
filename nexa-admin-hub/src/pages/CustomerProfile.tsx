import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { customerAPI, tokenManager } from "@/services/api";
import { ArrowLeft, Save, Loader2, User, MapPin, FileText, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    phoneNumber: "",
    alternatePhone: "",
    email: "",
  });
  
  const [addressInfo, setAddressInfo] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  
  const [identificationInfo, setIdentificationInfo] = useState({
    aadharNumber: "",
    panNumber: "",
    passportNumber: "",
    drivingLicense: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = tokenManager.getAccessToken();
      if (!token) {
        navigate('/auth');
        return;
      }

      // Decode token to get email
      const decodedToken = tokenManager.decodeToken(token);
      const email = decodedToken?.sub;

      if (!email) {
        throw new Error('Email not found in token');
      }

      // Fetch profile by email
      const profileData = await customerAPI.getProfileByEmail(email);
      setProfile(profileData);
      
      // Store customer number
      if (profileData.customerNumber) {
        tokenManager.setCustomerNumber(profileData.customerNumber);
      }

      // Populate form fields
      setPersonalInfo({
        firstName: profileData.firstName || "",
        middleName: profileData.middleName || "",
        lastName: profileData.lastName || "",
        dateOfBirth: profileData.dateOfBirth || "",
        gender: profileData.gender || "",
        nationality: profileData.nationality || "",
        phoneNumber: profileData.phoneNumber || "",
        alternatePhone: profileData.alternatePhone || "",
        email: profileData.email || "",
      });

      setAddressInfo({
        addressLine1: profileData.addressLine1 || "",
        addressLine2: profileData.addressLine2 || "",
        city: profileData.city || "",
        state: profileData.state || "",
        country: profileData.country || "",
        postalCode: profileData.postalCode || "",
      });

      setIdentificationInfo({
        aadharNumber: profileData.aadharNumber || "",
        panNumber: profileData.panNumber || "",
        passportNumber: profileData.passportNumber || "",
        drivingLicense: profileData.drivingLicense || "",
      });

      // Fetch audit trail
      if (profileData.userId) {
        try {
          const audit = await customerAPI.getAuditTrail(profileData.userId);
          setAuditTrail(Array.isArray(audit) ? audit : []);
        } catch (error) {
          console.error('Failed to fetch audit trail:', error);
        }
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalInfo = async () => {
    if (!profile?.customerNumber) return;
    
    setSaving(true);
    try {
      await customerAPI.updateName(profile.customerNumber, {
        firstName: personalInfo.firstName,
        middleName: personalInfo.middleName,
        lastName: personalInfo.lastName,
      });

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update personal information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!profile?.customerNumber) return;
    
    setSaving(true);
    try {
      await customerAPI.updateAddress(profile.customerNumber, addressInfo);

      toast({
        title: "Success",
        description: "Address updated successfully",
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateIdentification = async () => {
    if (!profile?.customerNumber) return;
    
    setSaving(true);
    try {
      await customerAPI.updateIdentification(profile.customerNumber, identificationInfo);

      toast({
        title: "Success",
        description: "Identification documents updated successfully",
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update identification",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and documents</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-sm">
              {profile?.customerNumber}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Status: <span className="font-medium">{profile?.customerStatus}</span>
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="address">
            <MapPin className="h-4 w-4 mr-2" />
            Address
          </TabsTrigger>
          <TabsTrigger value="identification">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={personalInfo.middleName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, middleName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read-only)</Label>
                  <Input id="email" value={personalInfo.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth (Read-only)</Label>
                  <Input id="dob" type="date" value={personalInfo.dateOfBirth} disabled />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={personalInfo.gender}
                    placeholder="Male/Female/Other"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={personalInfo.nationality}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={personalInfo.phoneNumber}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdatePersonalInfo} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Update your residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={addressInfo.addressLine1}
                  onChange={(e) => setAddressInfo({ ...addressInfo, addressLine1: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={addressInfo.addressLine2}
                  onChange={(e) => setAddressInfo({ ...addressInfo, addressLine2: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={addressInfo.city}
                    onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={addressInfo.state}
                    onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={addressInfo.country}
                    onChange={(e) => setAddressInfo({ ...addressInfo, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={addressInfo.postalCode}
                    onChange={(e) => setAddressInfo({ ...addressInfo, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdateAddress} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identification">
          <Card>
            <CardHeader>
              <CardTitle>Identification Documents</CardTitle>
              <CardDescription>Update your identification information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhar">Aadhar Number</Label>
                  <Input
                    id="aadhar"
                    value={identificationInfo.aadharNumber}
                    onChange={(e) => setIdentificationInfo({ ...identificationInfo, aadharNumber: e.target.value })}
                    placeholder="1234-5678-9012"
                  />
                  {profile?.maskedAadhar && (
                    <p className="text-xs text-muted-foreground">Current: {profile.maskedAadhar}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={identificationInfo.panNumber}
                    onChange={(e) => setIdentificationInfo({ ...identificationInfo, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                  />
                  {profile?.maskedPan && (
                    <p className="text-xs text-muted-foreground">Current: {profile.maskedPan}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passport">Passport Number</Label>
                  <Input
                    id="passport"
                    value={identificationInfo.passportNumber}
                    onChange={(e) => setIdentificationInfo({ ...identificationInfo, passportNumber: e.target.value })}
                    placeholder="K1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Driving License</Label>
                  <Input
                    id="license"
                    value={identificationInfo.drivingLicense}
                    onChange={(e) => setIdentificationInfo({ ...identificationInfo, drivingLicense: e.target.value })}
                    placeholder="DL-1234567890"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>KYC Status:</strong> {profile?.kycStatus || 'PENDING'}
                </p>
                {profile?.kycCompletionDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Completed On:</strong> {new Date(profile.kycCompletionDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdateIdentification} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Profile History</CardTitle>
              <CardDescription>View all changes made to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {auditTrail.length > 0 ? (
                <div className="space-y-4">
                  {auditTrail.map((entry, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          entry.crudOperation === 'C' ? 'default' :
                          entry.crudOperation === 'U' ? 'secondary' :
                          'destructive'
                        }>
                          {entry.crudOperation === 'C' ? 'Created' :
                           entry.crudOperation === 'U' ? 'Updated' :
                           'Deleted'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.versionTimestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">Customer ID: {entry.customerId}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.email} • {entry.phoneNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;
