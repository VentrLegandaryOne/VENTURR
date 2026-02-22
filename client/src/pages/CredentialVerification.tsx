import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Building2, FileCheck, Search, ExternalLink, Info, Loader2 } from "lucide-react";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

type AustralianState = 'nsw' | 'vic' | 'qld' | 'sa' | 'wa' | 'tas' | 'nt' | 'act';

const stateLabels: Record<AustralianState, string> = {
  nsw: 'New South Wales', vic: 'Victoria', qld: 'Queensland', sa: 'South Australia',
  wa: 'Western Australia', tas: 'Tasmania', nt: 'Northern Territory', act: 'Australian Capital Territory',
};

const tradeOptions = [
  { value: 'electrician', label: 'Electrician' }, { value: 'plumber', label: 'Plumber' },
  { value: 'builder', label: 'Builder' }, { value: 'roofer', label: 'Roofer' }, { value: 'landscaper', label: 'Landscaper' },
];

export default function CredentialVerification() {
  const [abnInput, setAbnInput] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [selectedState, setSelectedState] = useState<AustralianState>('nsw');
  const [selectedTrade, setSelectedTrade] = useState('electrician');

  const { data: abnResult, isLoading: abnLoading, refetch: verifyABN, error: errorAbnResult } = trpc.credentials.verifyABN.useQuery({ abn: abnInput }, { enabled: false, retry: 2 });
  const { data: licenseResult, isLoading: licenseLoading, refetch: verifyLicense, error: errorLicenseResult } = trpc.credentials.verifyLicense.useQuery({ licenseNumber: licenseInput, state: selectedState }, { enabled: false, retry: 2 });
  const { data: insuranceReqs, error: errorInsuranceReqs } = trpc.credentials.getInsuranceRequirements.useQuery({ trade: selectedTrade, state: selectedState });
  const { data: authorities, error: errorAuthorities } = trpc.credentials.getLicensingAuthorities.useQuery();

  const handleABNVerify = () => { if (abnInput.length >= 11) verifyABN(); };
  const handleLicenseVerify = () => { if (licenseInput) verifyLicense(); };
  const formatABN = (abn: string) => { const clean = abn.replace(/\D/g, ''); return clean.length === 11 ? `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}` : abn; };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Credential Verification</h1>
            <p className="text-muted-foreground mt-1">Verify contractor ABN, licenses, and insurance requirements</p>
          </div>
          <Badge variant="outline" className="w-fit"><Shield className="w-4 h-4 mr-2" />Australian Business Registry</Badge>
        </div>

        <Tabs defaultValue="abn" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="abn">ABN Verification</TabsTrigger>
            <TabsTrigger value="license">License Check</TabsTrigger>
            <TabsTrigger value="insurance">Insurance Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="abn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />ABN Verification</CardTitle>
                <CardDescription>Verify an Australian Business Number against the ABR</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input placeholder="Enter ABN (e.g., 51 824 753 556)" value={abnInput} onChange={(e) => setAbnInput(e.target.value.replace(/[^\d\s]/g, ''))} maxLength={14} />
                  </div>
                  <Button onClick={handleABNVerify} disabled={abnInput.replace(/\s/g, '').length < 11 || abnLoading}>
                    {abnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}<span className="ml-2">Verify</span>
                  </Button>
                </div>
                {abnResult && (
                  <div className={`p-6 rounded-lg border ${abnResult.isValid ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {abnResult.isValid ? <CheckCircle2 className="w-8 h-8 text-success" /> : <XCircle className="w-8 h-8 text-destructive" />}
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{abnResult.isValid ? 'Valid ABN' : 'Invalid ABN'}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{formatABN(abnResult.abn)}</p>
                        </div>
                      </div>
                      <Badge variant={abnResult.status === 'active' ? 'default' : 'destructive'}>{abnResult.status}</Badge>
                    </div>
                    {abnResult.isValid && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div><p className="text-sm text-muted-foreground">Entity Name</p><p className="font-medium text-foreground">{abnResult.entityName || 'N/A'}</p></div>
                        <div><p className="text-sm text-muted-foreground">Entity Type</p><p className="font-medium text-foreground">{abnResult.entityType || 'N/A'}</p></div>
                        <div><p className="text-sm text-muted-foreground">GST Registered</p><p className="font-medium text-foreground">{abnResult.gstRegistered ? 'Yes' : 'No'}</p></div>
                        <div><p className="text-sm text-muted-foreground">Last Updated</p><p className="font-medium text-foreground">{abnResult.lastUpdated ? new Date(abnResult.lastUpdated).toLocaleDateString() : 'N/A'}</p></div>
                      </div>
                    )}
                    <div className="mt-4 p-3 rounded bg-muted/50"><p className="text-sm text-muted-foreground">{abnResult.message}</p></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="license" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" />License Verification</CardTitle>
                <CardDescription>Verify contractor licenses against state licensing authorities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">State</label>
                    <Select value={selectedState} onValueChange={(v) => setSelectedState(v as AustralianState)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(stateLabels).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">License Number</label>
                    <Input placeholder="Enter license number" value={licenseInput} onChange={(e) => setLicenseInput(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleLicenseVerify} className="w-full" disabled={!licenseInput || licenseLoading}>
                      {licenseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}<span className="ml-2">Verify</span>
                    </Button>
                  </div>
                </div>
                {licenseResult && (
                  <div className={`p-6 rounded-lg border ${licenseResult.isValid ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {licenseResult.isValid ? <CheckCircle2 className="w-8 h-8 text-success" /> : <AlertTriangle className="w-8 h-8 text-warning" />}
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">License: {licenseResult.licenseNumber}</h3>
                          <p className="text-sm text-muted-foreground">{licenseResult.authorityName}</p>
                        </div>
                      </div>
                      <Badge variant={licenseResult.status === 'active' ? 'default' : 'secondary'}>{licenseResult.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div><p className="text-sm text-muted-foreground">Holder Name</p><p className="font-medium text-foreground">{licenseResult.holderName || 'Verification required'}</p></div>
                      <div><p className="text-sm text-muted-foreground">License Type</p><p className="font-medium text-foreground">{licenseResult.licenseType || 'N/A'}</p></div>
                      <div><p className="text-sm text-muted-foreground">State</p><p className="font-medium text-foreground">{stateLabels[licenseResult.state]}</p></div>
                      <div><p className="text-sm text-muted-foreground">Expiry Date</p><p className="font-medium text-foreground">{licenseResult.expiryDate ? new Date(licenseResult.expiryDate).toLocaleDateString() : 'N/A'}</p></div>
                    </div>
                    <div className="mt-4 p-3 rounded bg-muted/50"><p className="text-sm text-muted-foreground">{licenseResult.message}</p></div>
                  </div>
                )}
                {authorities && authorities.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-foreground mb-4">State Licensing Authorities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {authorities.map((auth: any) => (
                        <div key={auth.state} className="p-4 rounded-lg border border-border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{auth.state.toUpperCase()}</Badge>
                            {auth.websiteUrl && (<a href={auth.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">Visit <ExternalLink className="w-3 h-3" /></a>)}
                          </div>
                          <p className="font-medium text-foreground">{auth.authorityName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Code: {auth.authorityCode}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Insurance Requirements</CardTitle>
                <CardDescription>View minimum insurance requirements by trade and state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Trade</label>
                    <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{tradeOptions.map((trade) => (<SelectItem key={trade.value} value={trade.value}>{trade.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">State</label>
                    <Select value={selectedState} onValueChange={(v) => setSelectedState(v as AustralianState)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(stateLabels).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                {insuranceReqs && (
                  <div className="mt-6 p-6 rounded-lg border border-border bg-card">
                    <h4 className="font-semibold text-lg text-foreground mb-4">{tradeOptions.find(t => t.value === selectedTrade)?.label} - {stateLabels[selectedState]}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Public Liability</p>
                        <p className="text-2xl font-bold text-primary">${(insuranceReqs.publicLiabilityMin / 1000000).toFixed(0)}M</p>
                        <p className="text-xs text-muted-foreground mt-1">Minimum required</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground mb-1">Professional Indemnity</p>
                        <p className="text-2xl font-bold text-foreground">{insuranceReqs.professionalIndemnityMin ? `$${(insuranceReqs.professionalIndemnityMin / 1000000).toFixed(0)}M` : 'N/A'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insuranceReqs.professionalIndemnityMin ? 'Minimum required' : 'Not required'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground mb-1">Workers Compensation</p>
                        <div className="flex items-center gap-2 mt-2">
                          {insuranceReqs.workersCompRequired ? (<><CheckCircle2 className="w-6 h-6 text-success" /><span className="font-semibold text-success">Required</span></>) : (<><Info className="w-6 h-6 text-muted-foreground" /><span className="font-semibold text-muted-foreground">Not Required</span></>)}
                        </div>
                      </div>
                    </div>
                    {insuranceReqs.notes && (<div className="mt-4 p-4 rounded bg-muted/50"><p className="text-sm text-muted-foreground"><Info className="w-4 h-4 inline mr-2" />{insuranceReqs.notes}</p></div>)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
