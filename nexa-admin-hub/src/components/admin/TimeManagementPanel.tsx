import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fdAccountAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Clock, AlertTriangle, Calendar, FastForward, RotateCcw } from "lucide-react";

const TimeManagementPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [currentTime, setCurrentTime] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [logicalDate, setLogicalDate] = useState("");
  const [logicalInstant, setLogicalInstant] = useState("");
  const [advanceDays, setAdvanceDays] = useState("");
  const [advanceHours, setAdvanceHours] = useState("");

  // Fetch current logical time
  const fetchCurrentTime = async () => {
    try {
      setLoading(true);
      const data = await fdAccountAPI.getCurrentLogicalTime();
      setCurrentTime(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch current time",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTime();
  }, []);

  // Set logical date
  const handleSetDate = async () => {
    if (!logicalDate) {
      toast({
        title: "Error",
        description: "Please provide a date",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      await fdAccountAPI.setLogicalDate(logicalDate);
      
      toast({
        title: t('timeManagement.timeUpdated'),
        description: `Logical date set to ${logicalDate}`,
      });

      await fetchCurrentTime();
      setLogicalDate("");
    } catch (error: any) {
      toast({
        title: t('timeManagement.timeFailed'),
        description: error.message || "Failed to set logical date",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Set logical instant
  const handleSetInstant = async () => {
    if (!logicalInstant) {
      toast({
        title: "Error",
        description: "Please provide a date-time",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      // Convert datetime-local format to ISO 8601 with Z suffix
      const isoInstant = logicalInstant.includes('Z') ? logicalInstant : `${logicalInstant}:00Z`;
      await fdAccountAPI.setLogicalInstant(isoInstant);
      
      toast({
        title: t('timeManagement.timeUpdated'),
        description: `Logical instant set to ${isoInstant}`,
      });

      await fetchCurrentTime();
      setLogicalInstant("");
    } catch (error: any) {
      toast({
        title: t('timeManagement.timeFailed'),
        description: error.message || "Failed to set logical instant",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Advance time
  const handleAdvanceTime = async () => {
    if (!advanceDays && !advanceHours) {
      toast({
        title: "Error",
        description: "Please provide days or hours to advance",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      await fdAccountAPI.advanceLogicalTime(
        advanceDays ? parseInt(advanceDays) : undefined,
        advanceHours ? parseInt(advanceHours) : undefined
      );
      
      toast({
        title: t('timeManagement.timeUpdated'),
        description: `Time advanced by ${advanceDays || 0} days and ${advanceHours || 0} hours`,
      });

      await fetchCurrentTime();
      setAdvanceDays("");
      setAdvanceHours("");
    } catch (error: any) {
      toast({
        title: t('timeManagement.timeFailed'),
        description: error.message || "Failed to advance time",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Reset to system time
  const handleResetTime = async () => {
    try {
      setUpdating(true);
      await fdAccountAPI.resetToSystemTime();
      
      toast({
        title: t('timeManagement.timeUpdated'),
        description: "Time reset to system time",
      });

      await fetchCurrentTime();
    } catch (error: any) {
      toast({
        title: t('timeManagement.timeFailed'),
        description: error.message || "Failed to reset time",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('timeManagement.title')}
        </CardTitle>
        <CardDescription>
          Manage logical time for testing and simulation (Test Environment Only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Alert */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('timeManagement.warning')}
          </AlertDescription>
        </Alert>

        {/* Current Time Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('timeManagement.currentTime')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : currentTime ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">{t('timeManagement.logicalDate')}</Label>
                  <p className="text-lg font-semibold">
                    {currentTime.logicalDate || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('timeManagement.logicalDateTime')}</Label>
                  <p className="text-lg font-semibold font-mono">
                    {currentTime.logicalInstant ? new Date(currentTime.logicalInstant).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">System Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentTime.systemTime ? new Date(currentTime.systemTime).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={currentTime.isLogicalTimeActive ? "default" : "secondary"}>
                      {currentTime.isLogicalTimeActive ? "Logical Time Active" : "System Time"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No time data available</div>
            )}
          </CardContent>
        </Card>

        {/* Set Logical Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('timeManagement.setDate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logicalDate">{t('timeManagement.date')}</Label>
              <Input
                id="logicalDate"
                type="date"
                value={logicalDate}
                onChange={(e) => setLogicalDate(e.target.value)}
                disabled={updating}
              />
            </div>
            <Button onClick={handleSetDate} disabled={updating || !logicalDate}>
              {t('timeManagement.apply')}
            </Button>
          </CardContent>
        </Card>

        {/* Set Logical Instant */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('timeManagement.setInstant')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logicalInstant">{t('timeManagement.instant')}</Label>
              <Input
                id="logicalInstant"
                type="datetime-local"
                value={logicalInstant}
                onChange={(e) => setLogicalInstant(e.target.value)}
                disabled={updating}
              />
            </div>
            <Button onClick={handleSetInstant} disabled={updating || !logicalInstant}>
              {t('timeManagement.apply')}
            </Button>
          </CardContent>
        </Card>

        {/* Advance Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FastForward className="h-5 w-5" />
              {t('timeManagement.advanceTime')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="advanceDays">{t('timeManagement.days')}</Label>
                <Input
                  id="advanceDays"
                  type="number"
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(e.target.value)}
                  placeholder="0"
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advanceHours">{t('timeManagement.hours')}</Label>
                <Input
                  id="advanceHours"
                  type="number"
                  value={advanceHours}
                  onChange={(e) => setAdvanceHours(e.target.value)}
                  placeholder="0"
                  disabled={updating}
                />
              </div>
            </div>
            <Button onClick={handleAdvanceTime} disabled={updating || (!advanceDays && !advanceHours)}>
              {t('timeManagement.apply')}
            </Button>
          </CardContent>
        </Card>

        {/* Reset to System Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              {t('timeManagement.resetTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Reset logical time back to the actual system time
            </p>
            <Button onClick={handleResetTime} variant="destructive" disabled={updating}>
              {t('timeManagement.reset')}
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default TimeManagementPanel;
