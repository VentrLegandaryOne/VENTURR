import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const COLORS = ['#1E40AF', '#EA580C', '#10B981', '#7C3AED', '#3B82F6'];

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
}

interface DashboardData {
  metrics: MetricCard[];
  revenueData: Array<{ month: string; revenue: number; target: number }>;
  projectStatus: Array<{ name: string; value: number }>;
  taskProgress: Array<{ date: string; completed: number; pending: number }>;
}

const colorMap = {
  primary: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', halo: 'halo-layer-2' },
  secondary: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', halo: 'halo-layer-2' },
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', halo: 'halo-layer-2' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', halo: 'halo-layer-2' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', halo: 'halo-layer-2' }
};

export default function EnhancedDashboard() {
  const dashboardData: DashboardData = {
    metrics: [
      {
        title: 'Total Revenue',
        value: '$48,500',
        change: 12.5,
        icon: <DollarSign size={24} />,
        color: 'primary',
        trend: 'up'
      },
      {
        title: 'Active Projects',
        value: '24',
        change: 8.2,
        icon: <FileText size={24} />,
        color: 'secondary',
        trend: 'up'
      },
      {
        title: 'Total Clients',
        value: '156',
        change: -2.1,
        icon: <Users size={24} />,
        color: 'success',
        trend: 'down'
      },
      {
        title: 'Completed Tasks',
        value: '89%',
        change: 5.3,
        icon: <CheckCircle size={24} />,
        color: 'warning',
        trend: 'up'
      }
    ],
    revenueData: [
      { month: 'Jan', revenue: 4000, target: 4200 },
      { month: 'Feb', revenue: 3000, target: 3800 },
      { month: 'Mar', revenue: 2000, target: 3200 },
      { month: 'Apr', revenue: 2780, target: 3900 },
      { month: 'May', revenue: 1890, target: 4300 },
      { month: 'Jun', revenue: 2390, target: 4100 }
    ],
    projectStatus: [
      { name: 'Completed', value: 45 },
      { name: 'In Progress', value: 30 },
      { name: 'Pending', value: 20 },
      { name: 'On Hold', value: 5 }
    ],
    taskProgress: [
      { date: 'Mon', completed: 12, pending: 8 },
      { date: 'Tue', completed: 15, pending: 6 },
      { date: 'Wed', completed: 10, pending: 10 },
      { date: 'Thu', completed: 18, pending: 4 },
      { date: 'Fri', completed: 20, pending: 2 },
      { date: 'Sat', completed: 8, pending: 5 },
      { date: 'Sun', completed: 5, pending: 3 }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's your business overview.</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.metrics.map((metric, idx) => {
            const colors = colorMap[metric.color];
            return (
              <div
                key={idx}
                className={`
                  ${colors.bg} ${colors.border} border-2 rounded-xl p-6
                  transition-all duration-300 hover:shadow-lg ${colors.halo}
                  cursor-pointer hover:scale-105
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <div className={colors.text}>{metric.icon}</div>
                  </div>
                  <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-2">{metric.title}</h3>
                <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              Revenue Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1E40AF"
                  strokeWidth={3}
                  dot={{ fill: '#1E40AF', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#EA580C"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#EA580C', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Pie Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
              Project Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Progress Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            Weekly Task Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.taskProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#F1F5F9'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group">
            <div className="flex items-start justify-between mb-4">
              <FileText size={32} className="opacity-80 group-hover:opacity-100" />
              <span className="text-xs font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">New</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Create Quote</h3>
            <p className="text-blue-100 text-sm">Generate professional quotes instantly</p>
          </button>

          <button className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group">
            <div className="flex items-start justify-between mb-4">
              <Clock size={32} className="opacity-80 group-hover:opacity-100" />
              <span className="text-xs font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Measure Site</h3>
            <p className="text-orange-100 text-sm">Start a new site measurement</p>
          </button>

          <button className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group">
            <div className="flex items-start justify-between mb-4">
              <Users size={32} className="opacity-80 group-hover:opacity-100" />
              <span className="text-xs font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Manage</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Manage Clients</h3>
            <p className="text-green-100 text-sm">View and update client information</p>
          </button>
        </div>
      </div>
    </div>
  );
}

