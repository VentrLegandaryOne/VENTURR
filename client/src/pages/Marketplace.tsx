/**
 * Marketplace UI Pages
 * App discovery, installation flow, and user dashboard
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Download, Settings, Trash2, Search, Filter, Grid, List } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  developer: string;
  version: string;
  rating: number;
  reviews: number;
  installs: number;
  price: 'free' | 'paid' | 'freemium';
  monthlyPrice?: number;
  icon: string;
  featured: boolean;
}

interface Installation {
  id: string;
  appId: string;
  status: 'active' | 'inactive' | 'revoked';
  installDate: Date;
  lastUsed: Date;
}

type Tab = 'discover' | 'installed' | 'analytics';

export default function Marketplace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'installs' | 'newest'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const appsQuery = trpc.advancedFeatures.marketplace.getApps.useQuery({
    category: selectedCategory || undefined,
    sort: sortBy,
  });

  const featuredQuery = trpc.advancedFeatures.marketplace.getFeatured.useQuery();
  const installationsQuery = trpc.advancedFeatures.marketplace.getInstallations.useQuery();
  const analyticsQuery = trpc.advancedFeatures.marketplace.getAnalytics.useQuery();

  const installMutation = trpc.advancedFeatures.marketplace.installApp.useMutation();
  const uninstallMutation = trpc.advancedFeatures.marketplace.uninstallApp.useMutation();

  const categories = ['automation', 'communication', 'crm', 'accounting', 'analytics'];

  const filteredApps = (appsQuery.data || []).filter((app: App) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstallApp = async (app: App) => {
    try {
      await installMutation.mutateAsync({
        appId: app.id,
        settings: {},
      });
      setShowInstallDialog(false);
      setSelectedApp(null);
      installationsQuery.refetch();
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };

  const handleUninstallApp = async (installationId: string) => {
    try {
      await uninstallMutation.mutateAsync({ installationId });
      installationsQuery.refetch();
    } catch (error) {
      console.error('Failed to uninstall app:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      <div className="relative z-2 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">App Marketplace</h1>
              <p className="text-gray-600 mt-1">Extend Venturr with powerful integrations</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {(['discover', 'installed', 'analytics'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className={
                activeTab === tab
                  ? 'bg-gradient-to-r from-orange-500 to-red-600'
                  : ''
              }
            >
              {tab === 'discover' && 'Discover Apps'}
              {tab === 'installed' && 'My Apps'}
              {tab === 'analytics' && 'Analytics'}
            </Button>
          ))}
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Featured Apps */}
            {featuredQuery.data && featuredQuery.data.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredQuery.data.map((app: any) => (
                    <Card
                      key={app.id}
                      className="backdrop-blur-xl bg-white/95 border-white/20 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedApp(app);
                        setShowInstallDialog(true);
                      }}
                    >
                      <div className="p-4">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-12 h-12 rounded-lg mb-3"
                        />
                        <h3 className="font-bold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {app.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          {renderStars(app.rating)}
                          <span className="text-sm text-gray-600">({app.reviews})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                          <Download className="w-4 h-4" />
                          {app.installs.toLocaleString()} installs
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(null)}
                    size="sm"
                  >
                    All Categories
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(cat)}
                      size="sm"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === 'rating' ? 'default' : 'outline'}
                      onClick={() => setSortBy('rating')}
                      size="sm"
                    >
                      Top Rated
                    </Button>
                    <Button
                      variant={sortBy === 'installs' ? 'default' : 'outline'}
                      onClick={() => setSortBy('installs')}
                      size="sm"
                    >
                      Most Popular
                    </Button>
                    <Button
                      variant={sortBy === 'newest' ? 'default' : 'outline'}
                      onClick={() => setSortBy('newest')}
                      size="sm"
                    >
                      Newest
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      size="icon"
                    >
                      <Grid className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      size="icon"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Apps Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map((app: App) => (
                  <Card
                    key={app.id}
                    className="backdrop-blur-xl bg-white/95 border-white/20 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedApp(app);
                      setShowInstallDialog(true);
                    }}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <Badge className="bg-blue-100 text-blue-800">
                          {app.price === 'free' ? 'Free' : `$${app.monthlyPrice}/mo`}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {app.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        {renderStars(app.rating)}
                        <span className="text-sm text-gray-600">({app.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                        <Download className="w-4 h-4" />
                        {app.installs.toLocaleString()} installs
                      </div>
                      <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600">
                        Install
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredApps.map((app: App) => (
                  <Card
                    key={app.id}
                    className="backdrop-blur-xl bg-white/95 border-white/20 hover:shadow-lg transition-all cursor-pointer p-4"
                    onClick={() => {
                      setSelectedApp(app);
                      setShowInstallDialog(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{app.name}</h3>
                          <p className="text-sm text-gray-600">{app.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {renderStars(app.rating)}
                          <span className="text-sm text-gray-600">({app.reviews})</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {app.price === 'free' ? 'Free' : `$${app.monthlyPrice}/mo`}
                        </Badge>
                        <Button className="bg-gradient-to-r from-orange-500 to-red-600">
                          Install
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Installed Tab */}
        {activeTab === 'installed' && (
          <div className="space-y-4">
            {installationsQuery.data && installationsQuery.data.length > 0 ? (
              installationsQuery.data.map((installation: Installation) => (
                <Card
                  key={installation.id}
                  className="backdrop-blur-xl bg-white/95 border-white/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">App {installation.appId}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Installed: {new Date(installation.installDate).toLocaleDateString()}
                      </p>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        {installation.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Settings className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUninstallApp(installation.id)}
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-8 text-center">
                <p className="text-gray-600">No apps installed yet</p>
                <Button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 bg-gradient-to-r from-orange-500 to-red-600"
                >
                  Discover Apps
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analyticsQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <p className="text-gray-600 text-sm">Total Apps</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analyticsQuery.data.totalApps}
              </p>
            </Card>
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <p className="text-gray-600 text-sm">Total Installs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analyticsQuery.data.totalInstalls.toLocaleString()}
              </p>
            </Card>
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analyticsQuery.data.averageRating.toFixed(1)}
              </p>
            </Card>
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${analyticsQuery.data.totalRevenue.toLocaleString()}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

