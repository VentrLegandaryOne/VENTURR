/**
 * Advanced Inventory Management System
 * Material tracking, equipment management, low-stock alerts, reorder automation, cost tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  reorderPoint: number;
  lastRestocked: Date;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock';
}

interface ReorderAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  recommendedQuantity: number;
  estimatedCost: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  status: 'pending' | 'ordered' | 'received';
}

interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'purchase' | 'usage' | 'adjustment' | 'return';
  quantity: number;
  cost: number;
  date: Date;
  reference: string;
  notes: string;
}

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Asphalt Shingles (Bundle)',
      sku: 'ASH-001',
      category: 'Roofing Materials',
      quantity: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 45.99,
      reorderPoint: 30,
      lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supplier: 'Roofing Supply Co',
      status: 'in_stock',
    },
    {
      id: '2',
      name: 'Galvanized Nails (1 lb box)',
      sku: 'NAI-002',
      category: 'Fasteners',
      quantity: 12,
      minStock: 30,
      maxStock: 150,
      unitCost: 8.50,
      reorderPoint: 40,
      lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      supplier: 'Hardware Plus',
      status: 'critical',
    },
    {
      id: '3',
      name: 'Roofing Felt (15 lb roll)',
      sku: 'FEL-003',
      category: 'Roofing Materials',
      quantity: 8,
      minStock: 10,
      maxStock: 50,
      unitCost: 32.75,
      reorderPoint: 15,
      lastRestocked: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      supplier: 'Roofing Supply Co',
      status: 'low_stock',
    },
    {
      id: '4',
      name: 'Ladder (20 ft Aluminum)',
      sku: 'LAD-004',
      category: 'Equipment',
      quantity: 3,
      minStock: 2,
      maxStock: 5,
      unitCost: 189.99,
      reorderPoint: 3,
      lastRestocked: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      supplier: 'Equipment Rental Plus',
      status: 'in_stock',
    },
    {
      id: '5',
      name: 'Safety Harness',
      sku: 'SAF-005',
      category: 'Safety Equipment',
      quantity: 0,
      minStock: 5,
      maxStock: 20,
      unitCost: 125.00,
      reorderPoint: 8,
      lastRestocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      supplier: 'Safety First Inc',
      status: 'out_of_stock',
    },
    {
      id: '6',
      name: 'Flashing (Aluminum, 50 ft)',
      sku: 'FLA-006',
      category: 'Roofing Materials',
      quantity: 25,
      minStock: 15,
      maxStock: 75,
      unitCost: 78.50,
      reorderPoint: 20,
      lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      supplier: 'Roofing Supply Co',
      status: 'in_stock',
    },
  ]);

  const [reorderAlerts] = useState<ReorderAlert[]>([
    {
      id: '1',
      itemId: '2',
      itemName: 'Galvanized Nails (1 lb box)',
      currentStock: 12,
      recommendedQuantity: 100,
      estimatedCost: 850.0,
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
    },
    {
      id: '2',
      itemId: '3',
      itemName: 'Roofing Felt (15 lb roll)',
      currentStock: 8,
      recommendedQuantity: 30,
      estimatedCost: 982.5,
      priority: 'high',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'pending',
    },
    {
      id: '3',
      itemId: '5',
      itemName: 'Safety Harness',
      currentStock: 0,
      recommendedQuantity: 15,
      estimatedCost: 1875.0,
      priority: 'high',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
    },
  ]);

  const [transactions] = useState<InventoryTransaction[]>([
    {
      id: '1',
      itemId: '1',
      itemName: 'Asphalt Shingles (Bundle)',
      type: 'usage',
      quantity: -5,
      cost: -229.95,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reference: 'Project #2025-001',
      notes: 'Used on Oak Street project',
    },
    {
      id: '2',
      itemId: '2',
      itemName: 'Galvanized Nails (1 lb box)',
      type: 'purchase',
      quantity: 50,
      cost: 425.0,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reference: 'PO-2025-045',
      notes: 'Restocking order',
    },
    {
      id: '3',
      itemId: '4',
      itemName: 'Ladder (20 ft Aluminum)',
      type: 'adjustment',
      quantity: -1,
      cost: -189.99,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reference: 'INV-2025-012',
      notes: 'Damaged in transit, returned to supplier',
    },
  ]);

  const [categoryData] = useState([
    { category: 'Roofing Materials', value: 2850, color: '#3b82f6' },
    { category: 'Fasteners', value: 102, color: '#10b981' },
    { category: 'Equipment', value: 570, color: '#f59e0b' },
    { category: 'Safety Equipment', value: 0, color: '#ef4444' },
  ]);

  const [costTrendData] = useState([
    { month: 'Aug', spent: 3200, budget: 4000 },
    { month: 'Sep', spent: 3800, budget: 4000 },
    { month: 'Oct', spent: 2900, budget: 4000 },
    { month: 'Nov', spent: 4100, budget: 4000 },
  ]);

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const lowStockItems = inventoryItems.filter((item) => item.status === 'low_stock' || item.status === 'critical' || item.status === 'out_of_stock').length;
  const totalAlerts = reorderAlerts.filter((alert) => alert.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600 mt-2">Track materials, equipment, and supplies with automated reordering</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">➕ Add Item</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Total Value</p>
                <div className="text-3xl font-bold text-blue-600">${(totalInventoryValue / 1000).toFixed(1)}K</div>
                <p className="text-xs text-slate-600 mt-1">Across all items</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Total Items</p>
                <div className="text-3xl font-bold text-green-600">{inventoryItems.length}</div>
                <p className="text-xs text-slate-600 mt-1">In inventory</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Low Stock</p>
                <div className="text-3xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-slate-600 mt-1">Need attention</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Reorder Alerts</p>
                <div className="text-3xl font-bold text-red-600">{totalAlerts}</div>
                <p className="text-xs text-slate-600 mt-1">Pending orders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="alerts">Reorder Alerts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Inventory Value by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ category, value }) => `${category}: $${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {categoryData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700">{item.category}</span>
                        </div>
                        <span className="font-semibold text-slate-900">${item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                    <Bar dataKey="budget" fill="#10b981" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Item</th>
                    <th className="px-4 py-3 text-left font-semibold">SKU</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-right font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-right font-semibold">Unit Cost</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Value</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.sku}</td>
                      <td className="px-4 py-3 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3 text-right font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">${(item.quantity * item.unitCost).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={getStatusColor(item.status)}>{item.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Reorder Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {reorderAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{alert.itemName}</h3>
                        <Badge className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                        <Badge className={alert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>{alert.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Current Stock</p>
                          <p className="font-semibold text-slate-900">{alert.currentStock} units</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Recommended Qty</p>
                          <p className="font-semibold text-slate-900">{alert.recommendedQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Est. Cost</p>
                          <p className="font-semibold text-slate-900">${alert.estimatedCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {alert.status === 'pending' && (
                        <>
                          <Button className="bg-green-600 hover:bg-green-700">✓ Approve Order</Button>
                          <Button variant="outline">✎ Edit</Button>
                        </>
                      )}
                      {alert.status === 'ordered' && <Button disabled>📦 Ordered</Button>}
                      {alert.status === 'received' && <Button disabled className="bg-green-600">✓ Received</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{transaction.itemName}</h3>
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{transaction.notes}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">Ref: {transaction.reference}</span>
                        <span className="text-slate-600">{transaction.date.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-semibold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} units
                      </p>
                      <p className={`text-lg font-semibold ${transaction.cost > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${Math.abs(transaction.cost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

