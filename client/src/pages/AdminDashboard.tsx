/**
 * Admin Dashboard
 * Manage marketplace apps, view analytics, moderate reviews, approve submissions
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Users,
  Package,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';

interface PendingApp {
  id: string;
  name: string;
  developer: string;
  category: string;
  description: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface UserReview {
  id: string;
  appId: string;
  appName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

interface AdminStats {
  totalApps: number;
  pendingApprovals: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyActiveUsers: number;
  averageAppRating: number;
  pendingReviews: number;
}

type AdminTab = 'overview' | 'apps' | 'reviews' | 'users' | 'analytics';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [pendingApps, setPendingApps] = useState<PendingApp[]>([
    {
      id: 'app-1',
      name: 'Advanced Analytics Pro',
      developer: 'Analytics Corp',
      category: 'analytics',
      description: 'Advanced analytics and reporting for roofing projects',
      submittedAt: new Date(Date.now() - 86400000 * 2),
      status: 'pending',
    },
    {
      id: 'app-2',
      name: 'Inventory Manager',
      developer: 'Inventory Solutions',
      category: 'automation',
      description: 'Real-time inventory tracking and management',
      submittedAt: new Date(Date.now() - 86400000),
      status: 'pending',
    },
  ]);

  const [pendingReviews, setPendingReviews] = useState<UserReview[]>([
    {
      id: 'review-1',
      appId: 'zapier',
      appName: 'Zapier',
      userId: 'user-1',
      userName: 'John Contractor',
      rating: 5,
      title: 'Excellent Integration',
      content: 'Zapier integration works perfectly with our workflow. Highly recommended!',
      status: 'pending',
      submittedAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'review-2',
      appId: 'slack',
      appName: 'Slack',
      userId: 'user-2',
      userName: 'Sarah Manager',
      rating: 4,
      title: 'Good Communication Tool',
      content: 'Great for team communication but sometimes notifications are delayed.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 7200000),
    },
  ]);

  const stats: AdminStats = {
    totalApps: 12,
    pendingApprovals: pendingApps.filter((a) => a.status === 'pending').length,
    totalUsers: 1250,
    totalRevenue: 45000,
    monthlyActiveUsers: 890,
    averageAppRating: 4.6,
    pendingReviews: pendingReviews.filter((r) => r.status === 'pending').length,
  };

  const handleApproveApp = (appId: string) => {
    setPendingApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, status: 'approved' } : app
      )
    );
  };

  const handleRejectApp = (appId: string) => {
    setPendingApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, status: 'rejected' } : app
      )
    );
  };

  const handleApproveReview = (reviewId: string) => {
    setPendingReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, status: 'approved' } : review
      )
    );
  };

  const handleRejectReview = (reviewId: string) => {
    setPendingReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, status: 'rejected' } : review
      )
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      <div className="relative z-2 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage marketplace, reviews, and platform analytics</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Apps</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApps}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.pendingApprovals}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${(stats.totalRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {(['overview', 'apps', 'reviews', 'users', 'analytics'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className={
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                  : ''
              }
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'apps' && 'App Submissions'}
              {tab === 'reviews' && 'Review Moderation'}
              {tab === 'users' && 'Users'}
              {tab === 'analytics' && 'Analytics'}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Monthly Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.monthlyActiveUsers}
                  </p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Average App Rating</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.averageAppRating}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(stats.averageAppRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Pending Reviews</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {stats.pendingReviews}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Action required</p>
                </div>
              </div>
            </Card>

            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 w-full">
                  Review Pending Apps ({stats.pendingApprovals})
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 w-full">
                  Moderate Reviews ({stats.pendingReviews})
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* App Submissions Tab */}
        {activeTab === 'apps' && (
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <Card
                key={app.id}
                className="backdrop-blur-xl bg-white/95 border-white/20 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                      <Badge
                        className={
                          app.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : app.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Developer: <span className="font-semibold">{app.developer}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Category: <span className="font-semibold">{app.category}</span>
                    </p>
                    <p className="text-gray-700 mb-3">{app.description}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {app.submittedAt.toLocaleDateString()}
                    </p>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApproveApp(app.id)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectApp(app.id)}
                        variant="outline"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Review Moderation Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <Card
                key={review.id}
                className="backdrop-blur-xl bg-white/95 border-white/20 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{review.title}</h3>
                        <p className="text-sm text-gray-600">
                          {review.userName} • {review.appName}
                        </p>
                      </div>
                      <Badge
                        className={
                          review.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : review.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {review.submittedAt.toLocaleDateString()}
                    </p>
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApproveReview(review.id)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectReview(review.id)}
                        variant="outline"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Total Users</p>
                  <p className="text-sm text-gray-600">{stats.totalUsers} registered users</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Active Users</p>
                  <p className="text-sm text-gray-600">
                    {stats.monthlyActiveUsers} active this month
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Revenue Trend</p>
                <p className="text-2xl font-bold text-gray-900">↑ 23%</p>
                <p className="text-xs text-green-600 mt-1">Compared to last month</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">User Growth</p>
                <p className="text-2xl font-bold text-gray-900">↑ 18%</p>
                <p className="text-xs text-green-600 mt-1">New users this month</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">App Installations</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
                <p className="text-xs text-green-600 mt-1">This month</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Support Tickets</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
                <p className="text-xs text-orange-600 mt-1">Pending resolution</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

