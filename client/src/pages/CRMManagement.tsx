import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, MessageSquare, TrendingUp, Clock, Star } from "lucide-react";

export default function CRMManagement() {
  const { user } = useAuth();
  const [organizationId] = useState(user?.organizationId || "");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    clientType: "residential" as const,
  });

  // Fetch clients
  const { data: clientsData, isLoading: clientsLoading } = trpc.crm.clients.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // Fetch selected client communications
  const { data: communicationsData } = trpc.crm.communications.list.useQuery(
    { clientId: selectedClient || "" },
    { enabled: !!selectedClient }
  );

  // Fetch recommendations
  const { data: recommendationsData } = trpc.crm.recommendations.useQuery(
    { organizationId, clientId: selectedClient || "" },
    { enabled: !!selectedClient && !!organizationId }
  );

  const clients = clientsData?.data || [];
  const communications = communicationsData?.data || [];
  const recommendations = recommendationsData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "prospect":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "vip":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">CRM Management</h1>
          <p className="text-slate-600">Manage clients, track communications, and grow relationships</p>
        </div>

        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* CLIENTS TAB */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Client Database</h2>
              <Button onClick={() => setShowNewClientForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </div>

            {showNewClientForm && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle>Add New Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Client Name"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    />
                    <Input
                      placeholder="Phone"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    />
                    <Input
                      placeholder="Company"
                      value={newClientData.company}
                      onChange={(e) => setNewClientData({ ...newClientData, company: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default">Save Client</Button>
                    <Button variant="outline" onClick={() => setShowNewClientForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientsLoading ? (
                <p className="text-slate-600">Loading clients...</p>
              ) : clients.length === 0 ? (
                <p className="text-slate-600 col-span-full">No clients yet. Create your first client!</p>
              ) : (
                clients.map((client) => (
                  <Card
                    key={client.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedClient === client.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedClient(client.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <CardDescription>{client.company}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {client.email || "No email"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        {client.phone || "No phone"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TrendingUp className="w-4 h-4" />
                        Total Spent: ${client.totalSpent}
                      </div>
                      <div className="text-xs text-slate-500 pt-2">
                        {client.projectCount} projects • Last: {client.lastProjectDate ? new Date(client.lastProjectDate).toLocaleDateString() : "Never"}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* COMMUNICATIONS TAB */}
          <TabsContent value="communications" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Communication History</h2>

            {!selectedClient ? (
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <p className="text-slate-600">Select a client to view communications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Button className="gap-2 mb-4">
                  <Plus className="w-4 h-4" />
                  Log Communication
                </Button>

                {communications.length === 0 ? (
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <p className="text-slate-600">No communications logged yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  communications.map((comm) => (
                    <Card key={comm.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCommunicationIcon(comm.type)}
                            <div>
                              <CardTitle className="text-base capitalize">{comm.type}</CardTitle>
                              <CardDescription>{comm.subject}</CardDescription>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{comm.content}</p>
                        {comm.outcome && (
                          <p className="text-sm text-slate-600 mt-2">
                            <strong>Outcome:</strong> {comm.outcome}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">AI-Powered Recommendations</h2>

            {!selectedClient ? (
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <p className="text-slate-600">Select a client to view recommendations</p>
                </CardContent>
              </Card>
            ) : recommendations.length === 0 ? (
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <p className="text-slate-600">No recommendations at this time</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <Card
                    key={idx}
                    className={`border-l-4 ${
                      rec.priority === "high"
                        ? "border-l-red-500 bg-red-50"
                        : rec.priority === "medium"
                          ? "border-l-yellow-500 bg-yellow-50"
                          : "border-l-blue-500 bg-blue-50"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{rec.message}</CardTitle>
                          <CardDescription className="capitalize">{rec.type.replace(/_/g, " ")}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {rec.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4">{rec.action}</p>
                      <Button size="sm">Take Action</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">CRM Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{clients.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Active relationships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {clients.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Currently engaged</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">VIP Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">
                    {clients.filter((c) => c.status === "vip").length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">High-value relationships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    ${clients.reduce((sum, c) => sum + parseInt(c.totalSpent || "0"), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Lifetime value</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Client Segmentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["residential", "commercial", "industrial", "government"].map((type) => {
                    const count = clients.filter((c) => c.clientType === type).length;
                    const percentage = clients.length > 0 ? ((count / clients.length) * 100).toFixed(1) : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize text-slate-700">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 w-12">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

