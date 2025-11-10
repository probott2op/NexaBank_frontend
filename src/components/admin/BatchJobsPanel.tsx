import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fdAccountAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Play, Loader2, Calendar, DollarSign } from "lucide-react";

const BatchJobsPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [runningJobs, setRunningJobs] = useState({
    interestCalculation: false,
    maturityProcessing: false,
  });

  // Run interest calculation job
  const runInterestCalculation = async () => {
    try {
      setRunningJobs(prev => ({ ...prev, interestCalculation: true }));
      const result = await fdAccountAPI.runInterestCalculationJob();
      
      toast({
        title: t('batchJobs.jobStarted'),
        description: `Interest calculation job started successfully. Job ID: ${result?.jobId || 'N/A'}`,
      });
    } catch (error: any) {
      toast({
        title: t('batchJobs.jobFailed'),
        description: error.message || "Failed to start interest calculation job",
        variant: "destructive",
      });
    } finally {
      setRunningJobs(prev => ({ ...prev, interestCalculation: false }));
    }
  };

  // Run maturity processing job
  const runMaturityProcessing = async () => {
    try {
      setRunningJobs(prev => ({ ...prev, maturityProcessing: true }));
      const result = await fdAccountAPI.runMaturityProcessingJob();
      
      toast({
        title: t('batchJobs.jobStarted'),
        description: `Maturity processing job started successfully. Job ID: ${result?.jobId || 'N/A'}`,
      });
    } catch (error: any) {
      toast({
        title: t('batchJobs.jobFailed'),
        description: error.message || "Failed to start maturity processing job",
        variant: "destructive",
      });
    } finally {
      setRunningJobs(prev => ({ ...prev, maturityProcessing: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {t('batchJobs.title')}
        </CardTitle>
        <CardDescription>
          Execute batch jobs for FD account processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interest Calculation Job */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  {t('batchJobs.interestCalculation')}
                </CardTitle>
                <CardDescription>
                  Calculate and accrue interest for all active FD accounts
                </CardDescription>
              </div>
              <Badge variant={runningJobs.interestCalculation ? "default" : "secondary"}>
                {runningJobs.interestCalculation ? "Running" : "Ready"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This job calculates interest for all active accounts based on their interest rate, 
              compounding frequency, and current balance. It should be run daily.
            </p>
            <Button
              onClick={runInterestCalculation}
              disabled={runningJobs.interestCalculation}
              className="w-full sm:w-auto"
            >
              {runningJobs.interestCalculation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {t('batchJobs.runJob')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Maturity Processing Job */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  {t('batchJobs.maturityProcessing')}
                </CardTitle>
                <CardDescription>
                  Process matured accounts and handle auto-renewals
                </CardDescription>
              </div>
              <Badge variant={runningJobs.maturityProcessing ? "default" : "secondary"}>
                {runningJobs.maturityProcessing ? "Running" : "Ready"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This job identifies accounts that have reached maturity date, processes auto-renewals 
              based on renewal instructions, and updates account statuses accordingly.
            </p>
            <Button
              onClick={runMaturityProcessing}
              disabled={runningJobs.maturityProcessing}
              className="w-full sm:w-auto"
            >
              {runningJobs.maturityProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {t('batchJobs.runJob')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default BatchJobsPanel;
