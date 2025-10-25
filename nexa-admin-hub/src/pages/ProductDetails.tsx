import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  DollarSign, 
  Receipt, 
  BarChart3, 
  Shield, 
  ArrowLeftRight, 
  Mail, 
  Users,
  Plus,
  Pencil
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InterestRateDialog } from "@/components/admin/InterestRateDialog";
import { ChargeDialog } from "@/components/admin/ChargeDialog";
import { RuleDialog } from "@/components/admin/RuleDialog";
import { TransactionDialog } from "@/components/admin/TransactionDialog";
import { CommunicationDialog } from "@/components/admin/CommunicationDialog";
import { RoleDialog } from "@/components/admin/RoleDialog";
import { BalanceDialog } from "@/components/admin/BalanceDialog";

const ProductDetails = () => {
  const { productCode } = useParams<{ productCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [interestRates, setInterestRates] = useState<any[]>([]);
  const [charges, setCharges] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [interestRateDialog, setInterestRateDialog] = useState({ open: false, data: null });
  const [chargeDialog, setChargeDialog] = useState({ open: false, data: null });
  const [ruleDialog, setRuleDialog] = useState({ open: false, data: null });
  const [transactionDialog, setTransactionDialog] = useState({ open: false, data: null });
  const [communicationDialog, setCommunicationDialog] = useState({ open: false, data: null });
  const [roleDialog, setRoleDialog] = useState({ open: false, data: null });
  const [balanceDialog, setBalanceDialog] = useState({ open: false, data: null });

  useEffect(() => {
    if (productCode) {
      fetchAllData();
    }
  }, [productCode]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch product details
      const productData = await productAPI.getProductByCode(productCode!);
      setProduct(productData);

      // Fetch all related entities in parallel
      const [
        interestData,
        chargesData,
        balancesData,
        rulesData,
        transactionsData,
        communicationsData,
        rolesData
      ] = await Promise.all([
        productAPI.getInterestRates(productCode!).catch(() => ({ content: [] })),
        productAPI.getCharges(productCode!).catch(() => ({ content: [] })),
        productAPI.getBalances(productCode!).catch(() => ({ content: [] })),
        productAPI.getRules(productCode!).catch(() => ({ content: [] })),
        productAPI.getTransactions(productCode!).catch(() => ({ content: [] })),
        productAPI.getCommunications(productCode!).catch(() => ({ content: [] })),
        productAPI.getRoles(productCode!).catch(() => ({ content: [] })),
      ]);

      setInterestRates(interestData.content || interestData || []);
      setCharges(chargesData.content || chargesData || []);
      setBalances(balancesData.content || balancesData || []);
      setRules(rulesData.content || rulesData || []);
      setTransactions(transactionsData.content || transactionsData || []);
      setCommunications(communicationsData.content || communicationsData || []);
      setRoles(rolesData.content || rolesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleAddInterestRate = () => {
    setInterestRateDialog({ open: true, data: null });
  };

  const handleEditInterestRate = (rate: any) => {
    setInterestRateDialog({ open: true, data: rate });
  };

  const handleAddCharge = () => {
    setChargeDialog({ open: true, data: null });
  };

  const handleEditCharge = (charge: any) => {
    setChargeDialog({ open: true, data: charge });
  };

  const handleAddRule = () => {
    setRuleDialog({ open: true, data: null });
  };

  const handleEditRule = (rule: any) => {
    setRuleDialog({ open: true, data: rule });
  };

  const handleAddTransaction = () => {
    setTransactionDialog({ open: true, data: null });
  };

  const handleEditTransaction = (transaction: any) => {
    setTransactionDialog({ open: true, data: transaction });
  };

  const handleAddCommunication = () => {
    setCommunicationDialog({ open: true, data: null });
  };

  const handleEditCommunication = (communication: any) => {
    setCommunicationDialog({ open: true, data: communication });
  };

  const handleAddRole = () => {
    setRoleDialog({ open: true, data: null });
  };

  const handleEditRole = (role: any) => {
    setRoleDialog({ open: true, data: role });
  };

  const handleAddBalance = () => {
    setBalanceDialog({ open: true, data: null });
  };

  const handleEditBalance = (balance: any) => {
    setBalanceDialog({ open: true, data: balance });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Product not found</div>
          <Button onClick={() => navigate('/admin')}>Back to Admin Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.productName}</h1>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
                <span className="text-muted-foreground">Code: {product.productCode}</span>
                <span className="text-muted-foreground">Type: {product.productType}</span>
              </div>
              {product.description && (
                <p className="text-muted-foreground max-w-2xl">{product.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Currency</div>
              <div className="text-2xl font-bold">{product.currency}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {product.interestType} Interest
                {product.compoundingFrequency && ` (${product.compoundingFrequency})`}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different configurations */}
        <Tabs defaultValue="interest" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="interest" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Interest Rates
            </TabsTrigger>
            <TabsTrigger value="charges" className="gap-2">
              <Receipt className="h-4 w-4" />
              Charges
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Shield className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-2">
              <Mail className="h-4 w-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Users className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="balances" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Balances
            </TabsTrigger>
          </TabsList>

          {/* Interest Rates Tab */}
          <TabsContent value="interest">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Interest Rate Configuration</CardTitle>
                    <CardDescription>
                      Manage tiered interest rates and balance ranges
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddInterestRate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rate Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {interestRates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No interest rates configured. Add your first rate tier to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rate Code</TableHead>
                        <TableHead>Term (Months)</TableHead>
                        <TableHead>Cumulative</TableHead>
                        <TableHead>Monthly</TableHead>
                        <TableHead>Quarterly</TableHead>
                        <TableHead>Yearly</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interestRates.map((rate) => (
                        <TableRow key={rate.rateId}>
                          <TableCell className="font-medium">{rate.rateCode}</TableCell>
                          <TableCell>{rate.termInMonths}</TableCell>
                          <TableCell>{rate.rateCumulative}%</TableCell>
                          <TableCell>{rate.rateNonCumulativeMonthly}%</TableCell>
                          <TableCell>{rate.rateNonCumulativeQuarterly}%</TableCell>
                          <TableCell>{rate.rateNonCumulativeYearly}%</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditInterestRate(rate)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charges Tab */}
          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Charges & Fees</CardTitle>
                    <CardDescription>
                      Manage account maintenance fees, transaction charges, and penalties
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddCharge}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Charge
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {charges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No charges configured. Add charges and fees for this product.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Charge Code</TableHead>
                        <TableHead>Charge Name</TableHead>
                        <TableHead>Charge Type</TableHead>
                        <TableHead>Calculation Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Debit/Credit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {charges.map((charge) => (
                        <TableRow key={charge.chargeId}>
                          <TableCell className="font-medium">{charge.chargeCode}</TableCell>
                          <TableCell>{charge.chargeName}</TableCell>
                          <TableCell>{charge.chargeType}</TableCell>
                          <TableCell>{charge.calculationType}</TableCell>
                          <TableCell>
                            {charge.calculationType === 'PERCENTAGE' 
                              ? `${charge.chargeValue || charge.amount}%` 
                              : `₹${charge.chargeValue || charge.amount}`}
                          </TableCell>
                          <TableCell>{charge.frequency}</TableCell>
                          <TableCell>
                            <Badge variant={charge.debitCredit === 'DEBIT' ? 'destructive' : 'default'}>
                              {charge.debitCredit}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCharge(charge)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Rules Tab */}
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Rules</CardTitle>
                    <CardDescription>
                      Configure validation rules, eligibility criteria, and constraints
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No business rules configured. Add rules to govern product behavior.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Code</TableHead>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Rule Type</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Validation Type</TableHead>
                        <TableHead>Rule Value</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.ruleId}>
                          <TableCell className="font-medium">{rule.ruleCode}</TableCell>
                          <TableCell>{rule.ruleName}</TableCell>
                          <TableCell>{rule.ruleType}</TableCell>
                          <TableCell>{rule.dataType}</TableCell>
                          <TableCell>{rule.validationType}</TableCell>
                          <TableCell className="max-w-xs truncate">{rule.ruleValue}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Types Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction Types</CardTitle>
                    <CardDescription>
                      Configure allowed transaction types, limits, and channel availability
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddTransaction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transaction types configured. Add transaction configurations.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction Code</TableHead>
                        <TableHead>Transaction Name</TableHead>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Debit/Credit</TableHead>
                        <TableHead>Min Amount</TableHead>
                        <TableHead>Max Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((txn) => (
                        <TableRow key={txn.transactionId}>
                          <TableCell className="font-medium">{txn.transactionCode}</TableCell>
                          <TableCell>{txn.transactionName}</TableCell>
                          <TableCell>{txn.transactionType}</TableCell>
                          <TableCell>{txn.debitCreditIndicator}</TableCell>
                          <TableCell>₹{txn.minimumAmount?.toLocaleString() || '-'}</TableCell>
                          <TableCell>₹{txn.maximumAmount?.toLocaleString() || '-'}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTransaction(txn)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Communication Templates</CardTitle>
                    <CardDescription>
                      Manage customer notifications and automated messages
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddCommunication}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {communications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No communication templates configured. Add templates for customer notifications.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Comm Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Frequency Limit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {communications.map((comm) => (
                        <TableRow key={comm.commId}>
                          <TableCell className="font-medium">{comm.communicationCode || comm.commCode}</TableCell>
                          <TableCell>{comm.communicationType}</TableCell>
                          <TableCell>{comm.communicationChannel || comm.channel}</TableCell>
                          <TableCell>{comm.event || '-'}</TableCell>
                          <TableCell className="max-w-xs truncate">{comm.template || '-'}</TableCell>
                          <TableCell>{comm.frequencyLimit || '-'}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCommunication(comm)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>
                      Configure which user roles can access this product
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddRole}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {roles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No roles configured. Add role access configurations.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Code</TableHead>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Role Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.roleId}>
                          <TableCell className="font-medium">{role.roleCode}</TableCell>
                          <TableCell>{role.roleName}</TableCell>
                          <TableCell>{role.roleType}</TableCell>
                          <TableCell className="max-w-xs truncate">{role.description || '-'}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Types Tab */}
          <TabsContent value="balances">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Balance Types</CardTitle>
                    <CardDescription>
                      Configure which balance types are applicable for this product
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddBalance}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Balance Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {balances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No balance types configured. Add balance type configurations.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Balance Type</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.map((balance) => (
                        <TableRow key={balance.balanceId}>
                          <TableCell className="font-medium">{balance.balanceType}</TableCell>
                          <TableCell>
                            {balance.createdAt 
                              ? new Date(balance.createdAt).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditBalance(balance)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <InterestRateDialog
        open={interestRateDialog.open}
        onOpenChange={(open) => setInterestRateDialog({ ...interestRateDialog, open })}
        productCode={productCode!}
        interestRate={interestRateDialog.data}
        onSave={fetchAllData}
      />

      <ChargeDialog
        open={chargeDialog.open}
        onOpenChange={(open) => setChargeDialog({ ...chargeDialog, open })}
        productCode={productCode!}
        charge={chargeDialog.data}
        onSave={fetchAllData}
      />

      <RuleDialog
        open={ruleDialog.open}
        onOpenChange={(open) => setRuleDialog({ ...ruleDialog, open })}
        productCode={productCode!}
        rule={ruleDialog.data}
        onSave={fetchAllData}
      />

      <TransactionDialog
        open={transactionDialog.open}
        onOpenChange={(open) => setTransactionDialog({ ...transactionDialog, open })}
        productCode={productCode!}
        transaction={transactionDialog.data}
        onSave={fetchAllData}
      />

      <CommunicationDialog
        open={communicationDialog.open}
        onOpenChange={(open) => setCommunicationDialog({ ...communicationDialog, open })}
        productCode={productCode!}
        communication={communicationDialog.data}
        onSave={fetchAllData}
      />

      <RoleDialog
        open={roleDialog.open}
        onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}
        productCode={productCode!}
        role={roleDialog.data}
        onSave={fetchAllData}
      />

      <BalanceDialog
        open={balanceDialog.open}
        onOpenChange={(open) => setBalanceDialog({ ...balanceDialog, open })}
        productCode={productCode!}
        balance={balanceDialog.data}
        onSave={fetchAllData}
      />
    </div>
  );
};

export default ProductDetails;
