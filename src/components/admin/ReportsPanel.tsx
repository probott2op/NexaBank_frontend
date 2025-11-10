import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fdAccountAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar, Clock } from "lucide-react";

const ReportsPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Maturing accounts state
  const [maturingData, setMaturingData] = useState({
    days: "30",
    accounts: [] as any[],
    loading: false,
  });

  // Created accounts state
  const [createdData, setCreatedData] = useState({
    startDate: "",
    endDate: "",
    accounts: [] as any[],
    loading: false,
  });

  // Closed accounts state
  const [closedData, setClosedData] = useState({
    startDate: "",
    endDate: "",
    status: "",
    accounts: [] as any[],
    loading: false,
  });

  // Fetch maturing accounts
  const fetchMaturingAccounts = async () => {
    try {
      setMaturingData(prev => ({ ...prev, loading: true }));
      const data = await fdAccountAPI.getMaturingAccounts(parseInt(maturingData.days));
      setMaturingData(prev => ({ ...prev, accounts: data || [], loading: false }));
      
      toast({
        title: t('reports.title'),
        description: `Found ${data?.length || 0} maturing accounts`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch maturing accounts",
        variant: "destructive",
      });
      setMaturingData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch created accounts
  const fetchCreatedAccounts = async () => {
    if (!createdData.startDate || !createdData.endDate) {
      toast({
        title: "Error",
        description: "Please provide both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatedData(prev => ({ ...prev, loading: true }));
      const data = await fdAccountAPI.getCreatedAccounts(createdData.startDate, createdData.endDate);
      setCreatedData(prev => ({ ...prev, accounts: data || [], loading: false }));
      
      toast({
        title: t('reports.title'),
        description: `Found ${data?.length || 0} created accounts`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch created accounts",
        variant: "destructive",
      });
      setCreatedData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch closed accounts
  const fetchClosedAccounts = async () => {
    if (!closedData.startDate || !closedData.endDate) {
      toast({
        title: "Error",
        description: "Please provide both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      setClosedData(prev => ({ ...prev, loading: true }));
      const data = await fdAccountAPI.getClosedAccounts(
        closedData.startDate,
        closedData.endDate,
        closedData.status || undefined
      );
      setClosedData(prev => ({ ...prev, accounts: data || [], loading: false }));
      
      toast({
        title: t('reports.title'),
        description: `Found ${data?.length || 0} closed accounts`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch closed accounts",
        variant: "destructive",
      });
      setClosedData(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('reports.title')}
        </CardTitle>
        <CardDescription>
          Generate and view FD account reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="maturing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maturing">{t('reports.maturingAccounts')}</TabsTrigger>
            <TabsTrigger value="created">{t('reports.createdAccounts')}</TabsTrigger>
            <TabsTrigger value="closed">{t('reports.closedAccounts')}</TabsTrigger>
          </TabsList>

          {/* Maturing Accounts Tab */}
          <TabsContent value="maturing" className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="days">{t('reports.daysToMaturity')}</Label>
                <Input
                  id="days"
                  type="number"
                  value={maturingData.days}
                  onChange={(e) => setMaturingData(prev => ({ ...prev, days: e.target.value }))}
                  placeholder="30"
                />
              </div>
              <Button onClick={fetchMaturingAccounts} disabled={maturingData.loading}>
                <Calendar className="mr-2 h-4 w-4" />
                {maturingData.loading ? t('reports.loading') : t('reports.generateReport')}
              </Button>
            </div>

            {maturingData.accounts.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('fdAccount.accountNumber')}</TableHead>
                      <TableHead>{t('fdAccount.accountName')}</TableHead>
                      <TableHead>{t('fdAccount.maturityDate')}</TableHead>
                      <TableHead className="text-right">{t('balance.currentBalance')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maturingData.accounts.map((account: any) => (
                      <TableRow key={account.accountNumber}>
                        <TableCell className="font-mono">{account.accountNumber}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>{new Date(account.maturityDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{(account.currentBalance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge>{account.accountStatus}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {maturingData.loading ? t('reports.loading') : t('reports.noAccounts')}
              </div>
            )}
          </TabsContent>

          {/* Created Accounts Tab */}
          <TabsContent value="created" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="created-start">{t('reports.startDate')}</Label>
                <Input
                  id="created-start"
                  type="date"
                  value={createdData.startDate}
                  onChange={(e) => setCreatedData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="created-end">{t('reports.endDate')}</Label>
                <Input
                  id="created-end"
                  type="date"
                  value={createdData.endDate}
                  onChange={(e) => setCreatedData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchCreatedAccounts} disabled={createdData.loading} className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  {createdData.loading ? t('reports.loading') : t('reports.generateReport')}
                </Button>
              </div>
            </div>

            {createdData.accounts.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('fdAccount.accountNumber')}</TableHead>
                      <TableHead>{t('fdAccount.accountName')}</TableHead>
                      <TableHead>{t('fdAccount.effectiveDate')}</TableHead>
                      <TableHead>{t('fdAccount.productCode')}</TableHead>
                      <TableHead className="text-right">{t('fdAccount.principalAmount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {createdData.accounts.map((account: any) => (
                      <TableRow key={account.accountNumber}>
                        <TableCell className="font-mono">{account.accountNumber}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>{new Date(account.effectiveDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{account.productCode}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{(account.principalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge>{account.accountStatus}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {createdData.loading ? t('reports.loading') : t('reports.noAccounts')}
              </div>
            )}
          </TabsContent>

          {/* Closed Accounts Tab */}
          <TabsContent value="closed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="closed-start">{t('reports.startDate')}</Label>
                <Input
                  id="closed-start"
                  type="date"
                  value={closedData.startDate}
                  onChange={(e) => setClosedData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closed-end">{t('reports.endDate')}</Label>
                <Input
                  id="closed-end"
                  type="date"
                  value={closedData.endDate}
                  onChange={(e) => setClosedData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t('reports.accountStatus')}</Label>
                <Select value={closedData.status} onValueChange={(value) => setClosedData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="CLOSED">CLOSED</SelectItem>
                    <SelectItem value="MATURED">MATURED</SelectItem>
                    <SelectItem value="WITHDRAWN">WITHDRAWN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchClosedAccounts} disabled={closedData.loading} className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  {closedData.loading ? t('reports.loading') : t('reports.generateReport')}
                </Button>
              </div>
            </div>

            {closedData.accounts.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('fdAccount.accountNumber')}</TableHead>
                      <TableHead>{t('fdAccount.accountName')}</TableHead>
                      <TableHead>{t('fdAccount.closureDate')}</TableHead>
                      <TableHead className="text-right">{t('fdAccount.principalAmount')}</TableHead>
                      <TableHead className="text-right">{t('fdAccount.finalPayout')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closedData.accounts.map((account: any) => (
                      <TableRow key={account.accountNumber}>
                        <TableCell className="font-mono">{account.accountNumber}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>
                          {account.closureDate ? new Date(account.closureDate).toLocaleDateString('en-IN') : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{(account.principalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ₹{(account.finalPayout || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{account.accountStatus}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {closedData.loading ? t('reports.loading') : t('reports.noAccounts')}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportsPanel;
