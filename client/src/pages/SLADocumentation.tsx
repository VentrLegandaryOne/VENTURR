import { motion } from "framer-motion";
import {
  Shield,
  Clock,
  Server,
  HeadphonesIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  Lock,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SLADocumentation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 text-white">
        <div className="absolute inset-0 triangle-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              <Shield className="w-3 h-3 mr-1" />
              Service Level Agreement
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Service Level Agreement
            </h1>
            <p className="text-xl text-slate-300">
              Our commitment to reliability, security, and support excellence for the VENTURR VALDT platform.
            </p>
            <p className="text-sm text-slate-400 mt-4">
              Effective Date: January 1, 2025 | Version 2.0
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 -mt-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">&lt;2s</div>
                <p className="text-sm text-muted-foreground">Page Load</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">Monitoring</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">&lt;4hr</div>
                <p className="text-sm text-muted-foreground">Critical Response</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Tabs defaultValue="availability" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="availability">
                <Server className="w-4 h-4 mr-2" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Zap className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="support">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    Service Availability
                  </CardTitle>
                  <CardDescription>
                    Our commitment to platform uptime and reliability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-800 text-xl">99.9% Uptime Guarantee</h3>
                        <p className="text-green-700">Monthly uptime commitment for all production services</p>
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Uptime Level</TableHead>
                        <TableHead>Monthly Downtime</TableHead>
                        <TableHead>Service Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">99.9% - 100%</TableCell>
                        <TableCell>&lt; 43.8 minutes</TableCell>
                        <TableCell>No credit</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">99.0% - 99.9%</TableCell>
                        <TableCell>43.8 min - 7.3 hours</TableCell>
                        <TableCell>10% credit</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">95.0% - 99.0%</TableCell>
                        <TableCell>7.3 - 36.5 hours</TableCell>
                        <TableCell>25% credit</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">&lt; 95.0%</TableCell>
                        <TableCell>&gt; 36.5 hours</TableCell>
                        <TableCell>50% credit</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Exclusions</h4>
                    <p className="text-sm text-muted-foreground">
                      The following are excluded from uptime calculations:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Scheduled maintenance windows (announced 48 hours in advance)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Force majeure events (natural disasters, government actions)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Third-party service outages beyond our control
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Customer-caused issues (misconfiguration, abuse)
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Performance Standards
                  </CardTitle>
                  <CardDescription>
                    Response time and throughput commitments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Measurement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Page Load Time</TableCell>
                        <TableCell>&lt; 2 seconds</TableCell>
                        <TableCell>95th percentile</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">API Response Time</TableCell>
                        <TableCell>&lt; 500ms</TableCell>
                        <TableCell>95th percentile</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Quote Analysis Time</TableCell>
                        <TableCell>&lt; 60 seconds</TableCell>
                        <TableCell>Average</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">File Upload Speed</TableCell>
                        <TableCell>&gt; 5 MB/s</TableCell>
                        <TableCell>Sustained</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Search Results</TableCell>
                        <TableCell>&lt; 1 second</TableCell>
                        <TableCell>95th percentile</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Global CDN
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Content delivered via edge locations across Australia and Asia-Pacific for optimal performance.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        Database Performance
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Distributed TiDB database with automatic scaling and 99.99% data durability.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeadphonesIcon className="w-5 h-5 text-primary" />
                    Support Tiers
                  </CardTitle>
                  <CardDescription>
                    Response times and support channels by plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Standard</TableHead>
                        <TableHead>Professional</TableHead>
                        <TableHead>Enterprise</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Badge variant="destructive">Critical</Badge>
                        </TableCell>
                        <TableCell className="text-sm">Service completely unavailable</TableCell>
                        <TableCell>8 hours</TableCell>
                        <TableCell>4 hours</TableCell>
                        <TableCell className="font-semibold text-primary">1 hour</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">High</Badge>
                        </TableCell>
                        <TableCell className="text-sm">Major feature impaired</TableCell>
                        <TableCell>24 hours</TableCell>
                        <TableCell>8 hours</TableCell>
                        <TableCell className="font-semibold text-primary">4 hours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>
                        </TableCell>
                        <TableCell className="text-sm">Minor feature affected</TableCell>
                        <TableCell>48 hours</TableCell>
                        <TableCell>24 hours</TableCell>
                        <TableCell className="font-semibold text-primary">8 hours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge variant="outline">Low</Badge>
                        </TableCell>
                        <TableCell className="text-sm">General inquiry</TableCell>
                        <TableCell>72 hours</TableCell>
                        <TableCell>48 hours</TableCell>
                        <TableCell className="font-semibold text-primary">24 hours</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Email Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">support@venturr.com.au</p>
                        <Badge variant="outline" className="mt-2">All Plans</Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Live Chat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Business hours (AEST)</p>
                        <Badge variant="outline" className="mt-2">Professional+</Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          Phone Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">24/7 dedicated line</p>
                        <Badge variant="outline" className="mt-2">Enterprise Only</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Security & Data Protection
                  </CardTitle>
                  <CardDescription>
                    Our commitment to protecting your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        Data Encryption
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• TLS 1.3 for data in transit</li>
                        <li>• AES-256 for data at rest</li>
                        <li>• End-to-end encryption for sensitive data</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4 text-green-600" />
                        Data Backup
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Continuous replication (RPO &lt; 1 minute)</li>
                        <li>• Daily automated backups</li>
                        <li>• 30-day backup retention</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        Disaster Recovery
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• RTO: 4 hours (Recovery Time Objective)</li>
                        <li>• RPO: 1 hour (Recovery Point Objective)</li>
                        <li>• Multi-region failover capability</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        Compliance
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Australian Privacy Principles (APP)</li>
                        <li>• GDPR compliant for EU users</li>
                        <li>• SOC 2 Type II (in progress)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Data Retention Policy</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Retention Period</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Quote documents</TableCell>
                          <TableCell>7 years</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Verification reports</TableCell>
                          <TableCell>7 years</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>User account data</TableCell>
                          <TableCell>Account lifetime + 2 years</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Audit logs</TableCell>
                          <TableCell>3 years</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Analytics data</TableCell>
                          <TableCell>2 years (anonymized)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Section */}
          <Card className="mt-8">
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Questions About Our SLA?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact our team for custom SLA requirements or enterprise agreements.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Sales
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Full SLA (PDF)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
