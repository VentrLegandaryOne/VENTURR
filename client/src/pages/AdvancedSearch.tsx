/**
 * Advanced Search & Filtering
 * Full-text search across projects, quotes, payments with filters and saved searches
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchResult {
  id: string;
  type: 'project' | 'quote' | 'payment';
  title: string;
  subtitle: string;
  amount?: number;
  status: string;
  date: Date;
  relevance: number;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: Date;
  resultCount: number;
}

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    client: '',
    type: 'all',
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'High Value Projects',
      filters: { type: 'project', minAmount: '10000' },
      createdAt: new Date(Date.now() - 7 * 86400000),
      resultCount: 12,
    },
    {
      id: '2',
      name: 'Pending Quotes',
      filters: { type: 'quote', status: 'pending' },
      createdAt: new Date(Date.now() - 14 * 86400000),
      resultCount: 8,
    },
    {
      id: '3',
      name: 'Recent Payments',
      filters: { type: 'payment', dateFrom: '2025-10-08' },
      createdAt: new Date(Date.now() - 30 * 86400000),
      resultCount: 24,
    },
  ]);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    {
      id: '1',
      type: 'project',
      title: 'Smith Residence Roof Replacement',
      subtitle: 'Sydney, NSW 2000',
      amount: 15000,
      status: 'in_progress',
      date: new Date(Date.now() - 5 * 86400000),
      relevance: 95,
    },
    {
      id: '2',
      type: 'quote',
      title: 'Quote for Johnson Commercial Building',
      subtitle: 'Melbourne, VIC 3000',
      amount: 45000,
      status: 'sent',
      date: new Date(Date.now() - 2 * 86400000),
      relevance: 88,
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment from Brown Construction',
      subtitle: 'Project: Office Building Renovation',
      amount: 8500,
      status: 'completed',
      date: new Date(),
      relevance: 82,
    },
    {
      id: '4',
      type: 'project',
      title: 'Williams Estate Restoration',
      subtitle: 'Brisbane, QLD 4000',
      amount: 22000,
      status: 'quoted',
      date: new Date(Date.now() - 10 * 86400000),
      relevance: 75,
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery, 'with filters:', filters);
    // Call search API
  };

  const handleSaveSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (searchName) {
      const newSearch: SavedSearch = {
        id: `search-${Date.now()}`,
        name: searchName,
        filters,
        createdAt: new Date(),
        resultCount: searchResults.length,
      };
      setSavedSearches([...savedSearches, newSearch]);
    }
  };

  const handleDeleteSavedSearch = (id: string) => {
    setSavedSearches(savedSearches.filter((s) => s.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📋';
      case 'quote':
        return '📄';
      case 'payment':
        return '💰';
      default:
        return '📌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Advanced Search</h1>
          <p className="text-slate-600">
            Search across projects, quotes, and payments with powerful filters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Saved Searches */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Saved Searches</h3>
              <div className="space-y-2">
                {savedSearches.map((search) => (
                  <div key={search.id} className="p-3 bg-slate-50 rounded-lg group hover:bg-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{search.name}</p>
                        <p className="text-xs text-slate-600">{search.resultCount} results</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedSearch(search.id)}
                        className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Filters */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Filters</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100">
                  🔥 High Priority
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100">
                  ⏰ This Week
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100">
                  💰 High Value
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100">
                  ⚠️ Overdue
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <Card className="p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search projects, quotes, payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    🔍 Search
                  </Button>
                </div>

                {/* Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
                </button>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Min Amount
                      </label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Max Amount
                      </label>
                      <input
                        type="number"
                        placeholder="$999,999"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        placeholder="Search client..."
                        value={filters.client}
                        onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    onClick={handleSaveSearch}
                    variant="outline"
                    className="flex-1"
                  >
                    💾 Save Search
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        dateFrom: '',
                        dateTo: '',
                        status: 'all',
                        minAmount: '',
                        maxAmount: '',
                        client: '',
                        type: 'all',
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ↺ Clear
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {searchResults.length} Results
                </h3>
                <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sort by Relevance</option>
                  <option>Sort by Date (Newest)</option>
                  <option>Sort by Date (Oldest)</option>
                  <option>Sort by Amount (High to Low)</option>
                  <option>Sort by Amount (Low to High)</option>
                </select>
              </div>

              {searchResults.map((result) => (
                <Card key={result.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(result.type)}</span>
                        <div>
                          <h4 className="font-semibold text-slate-900">{result.title}</h4>
                          <p className="text-sm text-slate-600">{result.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        {result.amount && (
                          <Badge className="bg-slate-100 text-slate-800">
                            ${result.amount.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-2">
                        {result.date.toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-slate-600">Relevance:</span>
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${result.relevance}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-900">
                          {result.relevance}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

