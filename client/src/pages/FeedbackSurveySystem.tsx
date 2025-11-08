/**
 * Customer Feedback & Survey System
 * In-app surveys, feedback forms, and NPS tracking for customer insights
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'nps' | 'satisfaction' | 'feedback' | 'custom';
  status: 'active' | 'draft' | 'closed' | 'archived';
  createdAt: Date;
  closesAt?: Date;
  responseCount: number;
  targetCount: number;
  responseRate: number;
}

interface NPSData {
  date: string;
  promoters: number;
  passives: number;
  detractors: number;
  nps: number;
}

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  submittedAt: Date;
  customerName: string;
  projectName: string;
}

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'nps';
  required: boolean;
  options?: string[];
}

export default function FeedbackSurveySystem() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [showNewSurvey, setShowNewSurvey] = useState(false);

  const [surveys] = useState<Survey[]>([
    {
      id: '1',
      title: 'Project Completion Satisfaction',
      description: 'How satisfied are you with the completed project?',
      type: 'satisfaction',
      status: 'active',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      responseCount: 34,
      targetCount: 50,
      responseRate: 68,
    },
    {
      id: '2',
      title: 'Overall Service NPS',
      description: 'How likely are you to recommend our services?',
      type: 'nps',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      responseCount: 127,
      targetCount: 200,
      responseRate: 63.5,
    },
    {
      id: '3',
      title: 'Q4 Customer Feedback',
      description: 'General feedback about our services',
      type: 'feedback',
      status: 'closed',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      responseCount: 89,
      targetCount: 100,
      responseRate: 89,
    },
    {
      id: '4',
      title: 'Team Performance Feedback',
      description: 'Rate your experience with our team',
      type: 'custom',
      status: 'draft',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      responseCount: 0,
      targetCount: 0,
      responseRate: 0,
    },
  ]);

  const [npsData] = useState<NPSData[]>([
    { date: 'Week 1', promoters: 45, passives: 25, detractors: 10, nps: 64 },
    { date: 'Week 2', promoters: 52, passives: 28, detractors: 12, nps: 67 },
    { date: 'Week 3', promoters: 58, passives: 30, detractors: 9, nps: 71 },
    { date: 'Week 4', promoters: 62, passives: 32, detractors: 8, nps: 74 },
  ]);

  const [feedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      rating: 5,
      comment: 'Excellent work! The team was professional and completed the project on time.',
      category: 'Quality',
      sentiment: 'positive',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      customerName: 'John Anderson',
      projectName: 'Roof Replacement - Oak Street',
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good service, but communication could have been better during the project.',
      category: 'Communication',
      sentiment: 'neutral',
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      customerName: 'Sarah Miller',
      projectName: 'Gutter Installation - Maple Ave',
    },
    {
      id: '3',
      rating: 5,
      comment: 'Outstanding quality and very professional team. Highly recommend!',
      category: 'Overall',
      sentiment: 'positive',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      customerName: 'Michael Chen',
      projectName: 'Roof Inspection - Pine Road',
    },
    {
      id: '4',
      rating: 3,
      comment: 'Decent work but pricing was higher than expected.',
      category: 'Pricing',
      sentiment: 'negative',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      customerName: 'Emily Davis',
      projectName: 'Shingle Repair - Elm Street',
    },
  ]);

  const [surveyQuestions] = useState<SurveyQuestion[]>([
    { id: '1', question: 'How likely are you to recommend our services?', type: 'nps', required: true },
    { id: '2', question: 'How satisfied are you with the quality of work?', type: 'rating', required: true },
    { id: '3', question: 'How would you rate our communication?', type: 'rating', required: true },
    { id: '4', question: 'What could we improve?', type: 'text', required: false },
    { id: '5', question: 'Which aspect was most important to you?', type: 'multiple_choice', required: true, options: ['Quality', 'Price', 'Timeline', 'Communication'] },
  ]);

  const [sentimentData] = useState([
    { name: 'Positive', value: 65, color: '#10b981' },
    { name: 'Neutral', value: 25, color: '#f59e0b' },
    { name: 'Negative', value: 10, color: '#ef4444' },
  ]);

  const [categoryData] = useState([
    { category: 'Quality', count: 45 },
    { category: 'Communication', count: 32 },
    { category: 'Pricing', count: 28 },
    { category: 'Timeline', count: 35 },
    { category: 'Overall', count: 52 },
  ]);

  const currentSurvey = surveys.find((s) => s.id === selectedSurvey) || surveys[0];
  const avgRating = (feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length).toFixed(1);
  const npsScore = npsData[npsData.length - 1].nps;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-slate-100 text-slate-800';
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
            <h1 className="text-4xl font-bold text-slate-900">Feedback & Survey System</h1>
            <p className="text-slate-600 mt-2">Collect customer insights and track satisfaction metrics</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewSurvey(true)}>
            ➕ New Survey
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">NPS Score</p>
                <div className="text-4xl font-bold text-blue-600">{npsScore}</div>
                <p className="text-xs text-slate-600 mt-1">+5 from last week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Avg Rating</p>
                <div className="text-4xl font-bold text-yellow-600">⭐ {avgRating}</div>
                <p className="text-xs text-slate-600 mt-1">Out of 5.0</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Total Responses</p>
                <div className="text-4xl font-bold text-green-600">{feedbackItems.length}</div>
                <p className="text-xs text-slate-600 mt-1">This month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Active Surveys</p>
                <div className="text-4xl font-bold text-purple-600">{surveys.filter((s) => s.status === 'active').length}</div>
                <p className="text-xs text-slate-600 mt-1">Running now</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="nps">NPS Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {sentimentData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Feedback Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            {surveys.map((survey) => (
              <Card
                key={survey.id}
                className={`cursor-pointer transition hover:shadow-lg ${selectedSurvey === survey.id ? 'ring-2 ring-blue-600' : ''}`}
                onClick={() => setSelectedSurvey(survey.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{survey.title}</h3>
                      <p className="text-sm text-slate-600">{survey.description}</p>
                    </div>
                    <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-600">Type</p>
                      <p className="font-semibold text-slate-900 capitalize">{survey.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Responses</p>
                      <p className="font-semibold text-slate-900">
                        {survey.responseCount}/{survey.targetCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Response Rate</p>
                      <p className="font-semibold text-slate-900">{survey.responseRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Created</p>
                      <p className="font-semibold text-slate-900">{survey.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${survey.responseRate}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            {feedbackItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{item.customerName}</h3>
                        <Badge className={getSentimentColor(item.sentiment)}>{item.sentiment}</Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{item.projectName}</p>
                      <p className="text-slate-700">{item.comment}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl mb-1">{'⭐'.repeat(item.rating)}</div>
                      <p className="text-xs text-slate-600">{item.submittedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* NPS Analysis Tab */}
          <TabsContent value="nps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NPS Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={npsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="nps" stroke="#3b82f6" strokeWidth={2} name="NPS Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NPS Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={npsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="promoters" fill="#10b981" name="Promoters (9-10)" />
                    <Bar dataKey="passives" fill="#f59e0b" name="Passives (7-8)" />
                    <Bar dataKey="detractors" fill="#ef4444" name="Detractors (0-6)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

