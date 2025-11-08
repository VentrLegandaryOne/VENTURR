/**
 * Role-Based Dashboard Customization
 * Widget customization, reordering, saved views, role preferences
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Widget {
  id: string;
  name: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  refreshRate: number;
  order: number;
}

interface DashboardView {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'team_member';
  widgets: Widget[];
  isDefault: boolean;
}

export default function DashboardCustomization() {
  const [activeTab, setActiveTab] = useState('customize');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'team_member'>('admin');
  const [editMode, setEditMode] = useState(false);

  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', name: 'Revenue Overview', type: 'metric', enabled: true, size: 'medium', refreshRate: 300, order: 1 },
    { id: '2', name: 'Active Projects', type: 'metric', enabled: true, size: 'medium', refreshRate: 300, order: 2 },
    { id: '3', name: 'Team Utilization', type: 'metric', enabled: true, size: 'medium', refreshRate: 300, order: 3 },
    { id: '4', name: 'Revenue Trend', type: 'chart', enabled: true, size: 'large', refreshRate: 600, order: 4 },
    { id: '5', name: 'Team Performance', type: 'table', enabled: true, size: 'large', refreshRate: 600, order: 5 },
    { id: '6', name: 'Recent Projects', type: 'list', enabled: true, size: 'medium', refreshRate: 300, order: 6 },
    { id: '7', name: 'Upcoming Deadlines', type: 'list', enabled: false, size: 'medium', refreshRate: 300, order: 7 },
    { id: '8', name: 'Customer Satisfaction', type: 'chart', enabled: false, size: 'medium', refreshRate: 600, order: 8 },
  ]);

  const [dashboardViews] = useState<DashboardView[]>([
    {
      id: '1',
      name: 'Admin Dashboard',
      role: 'admin',
      widgets: widgets,
      isDefault: true,
    },
    {
      id: '2',
      name: 'Manager Dashboard',
      role: 'manager',
      widgets: widgets.filter((w) => ['1', '2', '3', '4', '5'].includes(w.id)),
      isDefault: true,
    },
    {
      id: '3',
      name: 'Team Member Dashboard',
      role: 'team_member',
      widgets: widgets.filter((w) => ['2', '3', '6', '7'].includes(w.id)),
      isDefault: true,
    },
  ]);

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)));
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex((w) => w.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === widgets.length - 1)) return;

    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];

    setWidgets(
      newWidgets.map((w, i) => ({
        ...w,
        order: i + 1,
      }))
    );
  };

  const updateWidgetSize = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, size } : w)));
  };

  const updateRefreshRate = (id: string, rate: number) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, refreshRate: rate } : w)));
  };

  const enabledWidgets = widgets.filter((w) => w.enabled);
  const disabledWidgets = widgets.filter((w) => !w.enabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard Customization</h1>
            <p className="text-slate-600 mt-2">Customize widgets, layout, and preferences by role</p>
          </div>
          <Button onClick={() => setEditMode(!editMode)} className={editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}>
            {editMode ? '✓ Save Changes' : '✎ Edit Dashboard'}
          </Button>
        </div>

        {/* Role Selector */}
        <div className="mb-6 flex gap-2">
          {(['admin', 'manager', 'team_member'] as const).map((role) => (
            <Button
              key={role}
              onClick={() => setSelectedRole(role)}
              variant={selectedRole === role ? 'default' : 'outline'}
              className={selectedRole === role ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {role === 'admin' ? '👤 Admin' : role === 'manager' ? '👥 Manager' : '👤 Team Member'}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="customize">Customize Widgets</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Customize Tab */}
          <TabsContent value="customize" className="space-y-6">
            {/* Enabled Widgets */}
            <Card>
              <CardHeader>
                <CardTitle>Active Widgets ({enabledWidgets.length})</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Drag to reorder, or use buttons to adjust</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {enabledWidgets.map((widget, index) => (
                  <div key={widget.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-slate-600">{widget.order}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{widget.name}</p>
                          <p className="text-xs text-slate-600">
                            {widget.type} • {widget.size} • Refresh: {widget.refreshRate}s
                          </p>
                        </div>
                      </div>
                    </div>

                    {editMode && (
                      <div className="flex gap-2">
                        <select
                          value={widget.size}
                          onChange={(e) => updateWidgetSize(widget.id, e.target.value as 'small' | 'medium' | 'large')}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>

                        <select
                          value={widget.refreshRate}
                          onChange={(e) => updateRefreshRate(widget.id, Number(e.target.value))}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value={300}>5s</option>
                          <option value={600}>10s</option>
                          <option value={1800}>30s</option>
                          <option value={3600}>1m</option>
                        </select>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveWidget(widget.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveWidget(widget.id, 'down')}
                          disabled={index === enabledWidgets.length - 1}
                        >
                          ↓
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWidget(widget.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Disabled Widgets */}
            <Card>
              <CardHeader>
                <CardTitle>Available Widgets ({disabledWidgets.length})</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Click to add widgets to your dashboard</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {disabledWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => toggleWidget(widget.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{widget.name}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {widget.type} • {widget.size}
                          </p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          + Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Views */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle>Save Custom View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g., My Custom Dashboard"
                  className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Save View</Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Preview - {selectedRole.replace('_', ' ').toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enabledWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={`bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4 ${
                        widget.size === 'large' ? 'md:col-span-2 lg:col-span-3' : widget.size === 'medium' ? 'md:col-span-1' : 'md:col-span-1'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{widget.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {widget.type}
                        </Badge>
                      </div>
                      <div className="h-32 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-500">
                        {widget.type === 'metric' && <div className="text-center">📊 Metric Widget</div>}
                        {widget.type === 'chart' && <div className="text-center">📈 Chart Widget</div>}
                        {widget.type === 'table' && <div className="text-center">📋 Table Widget</div>}
                        {widget.type === 'list' && <div className="text-center">📝 List Widget</div>}
                      </div>
                      <p className="text-xs text-slate-600 mt-2">Refresh: {widget.refreshRate}s</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

