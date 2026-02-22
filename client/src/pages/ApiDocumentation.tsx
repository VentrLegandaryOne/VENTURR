import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Copy,
  Check,
  Key,
  Shield,
  Zap,
  FileJson,
  Server,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Terminal,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Code examples
const codeExamples = {
  authentication: {
    curl: `curl -X POST https://api.venturr.com.au/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }'`,
    javascript: `const response = await fetch('https://api.venturr.com.au/v1/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'your_client_id',
    client_secret: 'your_client_secret'
  })
});

const { access_token } = await response.json();`,
    python: `import requests

response = requests.post(
    'https://api.venturr.com.au/v1/auth/token',
    json={
        'client_id': 'your_client_id',
        'client_secret': 'your_client_secret'
    }
)

access_token = response.json()['access_token']`,
  },
  verifyQuote: {
    curl: `curl -X POST https://api.venturr.com.au/v1/quotes/verify \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@quote.pdf" \\
  -F "trade_type=electrician" \\
  -F "state=NSW"`,
    javascript: `const formData = new FormData();
formData.append('file', quoteFile);
formData.append('trade_type', 'electrician');
formData.append('state', 'NSW');

const response = await fetch('https://api.venturr.com.au/v1/quotes/verify', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${accessToken}\` },
  body: formData
});

const verification = await response.json();`,
    python: `import requests

with open('quote.pdf', 'rb') as f:
    response = requests.post(
        'https://api.venturr.com.au/v1/quotes/verify',
        headers={'Authorization': f'Bearer {access_token}'},
        files={'file': f},
        data={'trade_type': 'electrician', 'state': 'NSW'}
    )

verification = response.json()`,
  },
  bulkVerify: {
    curl: `curl -X POST https://api.venturr.com.au/v1/quotes/bulk-verify \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "quotes": [
      {"url": "https://storage.example.com/quote1.pdf", "trade_type": "electrician"},
      {"url": "https://storage.example.com/quote2.pdf", "trade_type": "plumber"}
    ],
    "state": "NSW",
    "webhook_url": "https://your-server.com/webhook"
  }'`,
    javascript: `const response = await fetch('https://api.venturr.com.au/v1/quotes/bulk-verify', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quotes: [
      { url: 'https://storage.example.com/quote1.pdf', trade_type: 'electrician' },
      { url: 'https://storage.example.com/quote2.pdf', trade_type: 'plumber' }
    ],
    state: 'NSW',
    webhook_url: 'https://your-server.com/webhook'
  })
});

const { batch_id, status } = await response.json();`,
    python: `import requests

response = requests.post(
    'https://api.venturr.com.au/v1/quotes/bulk-verify',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    },
    json={
        'quotes': [
            {'url': 'https://storage.example.com/quote1.pdf', 'trade_type': 'electrician'},
            {'url': 'https://storage.example.com/quote2.pdf', 'trade_type': 'plumber'}
        ],
        'state': 'NSW',
        'webhook_url': 'https://your-server.com/webhook'
    }
)

result = response.json()`,
  },
  verifyContractor: {
    curl: `curl -X GET "https://api.venturr.com.au/v1/contractors/verify?abn=12345678901&license=ABC123&state=NSW" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
    javascript: `const params = new URLSearchParams({
  abn: '12345678901',
  license: 'ABC123',
  state: 'NSW'
});

const response = await fetch(
  \`https://api.venturr.com.au/v1/contractors/verify?\${params}\`,
  { headers: { 'Authorization': \`Bearer \${accessToken}\` } }
);

const contractor = await response.json();`,
    python: `import requests

response = requests.get(
    'https://api.venturr.com.au/v1/contractors/verify',
    headers={'Authorization': f'Bearer {access_token}'},
    params={'abn': '12345678901', 'license': 'ABC123', 'state': 'NSW'}
)

contractor = response.json()`,
  },
  marketRates: {
    curl: `curl -X GET "https://api.venturr.com.au/v1/rates?trade=electrician&city=sydney&category=labour" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
    javascript: `const params = new URLSearchParams({
  trade: 'electrician',
  city: 'sydney',
  category: 'labour'
});

const response = await fetch(
  \`https://api.venturr.com.au/v1/rates?\${params}\`,
  { headers: { 'Authorization': \`Bearer \${accessToken}\` } }
);

const rates = await response.json();`,
    python: `import requests

response = requests.get(
    'https://api.venturr.com.au/v1/rates',
    headers={'Authorization': f'Bearer {access_token}'},
    params={'trade': 'electrician', 'city': 'sydney', 'category': 'labour'}
)

rates = response.json()`,
  },
};

// API Endpoints
const endpoints = [
  {
    method: "POST",
    path: "/v1/auth/token",
    description: "Obtain an access token for API authentication",
    category: "Authentication",
  },
  {
    method: "POST",
    path: "/v1/quotes/verify",
    description: "Verify a single construction quote",
    category: "Quote Verification",
  },
  {
    method: "POST",
    path: "/v1/quotes/bulk-verify",
    description: "Verify multiple quotes in a batch (async)",
    category: "Quote Verification",
  },
  {
    method: "GET",
    path: "/v1/quotes/{id}",
    description: "Retrieve verification results for a quote",
    category: "Quote Verification",
  },
  {
    method: "GET",
    path: "/v1/quotes/{id}/report",
    description: "Download PDF report for a verified quote",
    category: "Quote Verification",
  },
  {
    method: "GET",
    path: "/v1/contractors/verify",
    description: "Verify contractor credentials (ABN, license)",
    category: "Contractor Verification",
  },
  {
    method: "GET",
    path: "/v1/contractors/{abn}",
    description: "Get contractor profile and ratings",
    category: "Contractor Verification",
  },
  {
    method: "GET",
    path: "/v1/rates",
    description: "Get current market rates by trade and location",
    category: "Market Data",
  },
  {
    method: "GET",
    path: "/v1/standards",
    description: "List Australian Standards for compliance checking",
    category: "Compliance",
  },
  {
    method: "GET",
    path: "/v1/export/quotes",
    description: "Export quote data as CSV or JSON",
    category: "Data Export",
  },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

export default function ApiDocumentation() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python">("javascript");

  const methodColors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-500 border-green-500/20",
    POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const categories = Array.from(new Set(endpoints.map((e) => e.category)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 triangle-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Code className="w-3 h-3 mr-1" />
              API Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              VENTURR VALDT API
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Integrate quote verification, contractor validation, and market rate data into your applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <Key className="w-4 h-4 mr-2" />
                Get API Key
              </Button>
              <Button size="lg" variant="outline">
                <Terminal className="w-4 h-4 mr-2" />
                Try in Sandbox
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">1. Get API Credentials</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sign up for an Enterprise account and generate your API client ID and secret from the dashboard.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">2. Authenticate</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Exchange your credentials for an access token. Tokens expire after 1 hour.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">3. Make Requests</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Include your access token in the Authorization header for all API requests.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Authentication Example */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Authentication</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                OAuth 2.0 Client Credentials
              </CardTitle>
              <CardDescription>
                All API requests require a valid access token. Exchange your client credentials for a token:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as typeof selectedLanguage)}>
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <CodeBlock code={codeExamples.authentication.curl} language="bash" />
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <CodeBlock code={codeExamples.authentication.javascript} language="javascript" />
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <CodeBlock code={codeExamples.authentication.python} language="python" />
                </TabsContent>
              </Tabs>

              <Alert className="mt-4">
                <Shield className="w-4 h-4" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  Never expose your client secret in client-side code. Always make authentication requests from your server.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>
          
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                {category}
              </h3>
              <div className="space-y-2">
                {endpoints
                  .filter((e) => e.category === category)
                  .map((endpoint) => (
                    <Card
                      key={endpoint.path}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        setExpandedEndpoint(
                          expandedEndpoint === endpoint.path ? null : endpoint.path
                        )
                      }
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`font-mono text-xs ${methodColors[endpoint.method]}`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          {expandedEndpoint === endpoint.path ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {endpoint.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Code Examples</h2>

          {/* Verify Quote */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Verify a Quote</CardTitle>
              <CardDescription>
                Upload a quote document for AI-powered verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as typeof selectedLanguage)}>
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <CodeBlock code={codeExamples.verifyQuote.curl} language="bash" />
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <CodeBlock code={codeExamples.verifyQuote.javascript} language="javascript" />
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <CodeBlock code={codeExamples.verifyQuote.python} language="python" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Bulk Verify */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bulk Quote Verification</CardTitle>
              <CardDescription>
                Verify multiple quotes asynchronously with webhook notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as typeof selectedLanguage)}>
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <CodeBlock code={codeExamples.bulkVerify.curl} language="bash" />
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <CodeBlock code={codeExamples.bulkVerify.javascript} language="javascript" />
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <CodeBlock code={codeExamples.bulkVerify.python} language="python" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Verify Contractor */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Verify Contractor Credentials</CardTitle>
              <CardDescription>
                Check ABN validity and license status for a contractor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as typeof selectedLanguage)}>
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <CodeBlock code={codeExamples.verifyContractor.curl} language="bash" />
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <CodeBlock code={codeExamples.verifyContractor.javascript} language="javascript" />
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <CodeBlock code={codeExamples.verifyContractor.python} language="python" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Market Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Get Market Rates</CardTitle>
              <CardDescription>
                Retrieve current market rates by trade type and location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as typeof selectedLanguage)}>
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <CodeBlock code={codeExamples.marketRates.curl} language="bash" />
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <CodeBlock code={codeExamples.marketRates.javascript} language="javascript" />
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <CodeBlock code={codeExamples.marketRates.python} language="python" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rate Limits & Support */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Plan</th>
                      <th className="text-left py-2">Requests/min</th>
                      <th className="text-left py-2">Quotes/month</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Starter</td>
                      <td className="py-2">60</td>
                      <td className="py-2">100</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Professional</td>
                      <td className="py-2">300</td>
                      <td className="py-2">1,000</td>
                    </tr>
                    <tr>
                      <td className="py-2">Enterprise</td>
                      <td className="py-2">Unlimited</td>
                      <td className="py-2">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our developer support team is here to help you integrate successfully.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:api@venturr.com.au">
                      <FileJson className="w-4 h-4 mr-2" />
                      api@venturr.com.au
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/help">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Help Center
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
