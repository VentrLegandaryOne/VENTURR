/**
 * Team Performance Scorecards
 * Individual and team metrics with KPIs, goals, achievements, and recognition
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  joinDate: Date;
}

interface KPI {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  weight: number;
  status: 'exceeding' | 'on_track' | 'at_risk' | 'below_target';
}

interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  progress: number;
  status: 'completed' | 'in_progress' | 'at_risk' | 'not_started';
  priority: 'high' | 'medium' | 'low';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  awardedAt: Date;
  awardedBy: string;
  icon: string;
}

interface Scorecard {
  id: string;
  member: TeamMember;
  kpis: KPI[];
  goals: Goal[];
  achievements: Achievement[];
  overallScore: number;
  reviewPeriod: string;
}

export default function PerformanceScorecard() {
  const [activeTab, setActiveTab] = useState('team');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Smith', role: 'Project Manager', avatar: '👨‍💼', department: 'Management', joinDate: new Date(2022, 0, 15) },
    { id: '2', name: 'Sarah Johnson', role: 'Lead Technician', avatar: '👩‍🔧', department: 'Operations', joinDate: new Date(2021, 5, 20) },
    { id: '3', name: 'Mike Davis', role: 'Technician', avatar: '👨‍🔧', department: 'Operations', joinDate: new Date(2023, 2, 10) },
    { id: '4', name: 'Emily Chen', role: 'Sales Manager', avatar: '👩‍💼', department: 'Sales', joinDate: new Date(2022, 8, 5) },
    { id: '5', name: 'Robert Wilson', role: 'Technician', avatar: '👨‍🔧', department: 'Operations', joinDate: new Date(2023, 6, 1) },
  ]);

  const [scorecards] = useState<Scorecard[]>([
    {
      id: '1',
      member: teamMembers[0],
      kpis: [
        { id: 'k1', name: 'Projects Completed', target: 12, actual: 14, unit: 'projects', weight: 30, status: 'exceeding' },
        { id: 'k2', name: 'Client Satisfaction', target: 90, actual: 92, unit: '%', weight: 25, status: 'exceeding' },
        { id: 'k3', name: 'On-Time Delivery', target: 95, actual: 94, unit: '%', weight: 25, status: 'on_track' },
        { id: 'k4', name: 'Budget Adherence', target: 100, actual: 98, unit: '%', weight: 20, status: 'on_track' },
      ],
      goals: [
        { id: 'g1', title: 'Implement Project Management System', description: 'Deploy new PM software', dueDate: new Date(2025, 11, 31), progress: 75, status: 'in_progress', priority: 'high' },
        { id: 'g2', title: 'Team Training Program', description: 'Complete leadership training', dueDate: new Date(2025, 12, 15), progress: 100, status: 'completed', priority: 'high' },
        { id: 'g3', title: 'Process Optimization', description: 'Reduce project cycle time by 15%', dueDate: new Date(2026, 2, 31), progress: 45, status: 'in_progress', priority: 'medium' },
      ],
      achievements: [
        { id: 'a1', title: 'Employee of the Month', description: 'Outstanding leadership and dedication', awardedAt: new Date(2025, 9, 15), awardedBy: 'CEO', icon: '🏆' },
        { id: 'a2', title: 'Client Excellence Award', description: 'Exceptional client satisfaction scores', awardedAt: new Date(2025, 8, 20), awardedBy: 'VP Sales', icon: '⭐' },
      ],
      overallScore: 92,
      reviewPeriod: 'Q4 2025',
    },
    {
      id: '2',
      member: teamMembers[1],
      kpis: [
        { id: 'k1', name: 'Projects Completed', target: 20, actual: 22, unit: 'projects', weight: 30, status: 'exceeding' },
        { id: 'k2', name: 'Quality Score', target: 95, actual: 96, unit: '%', weight: 25, status: 'exceeding' },
        { id: 'k3', name: 'Safety Record', target: 100, actual: 100, unit: '%', weight: 25, status: 'exceeding' },
        { id: 'k4', name: 'Team Productivity', target: 100, actual: 105, unit: '%', weight: 20, status: 'exceeding' },
      ],
      goals: [
        { id: 'g1', title: 'Mentor Junior Technicians', description: 'Train 3 junior team members', dueDate: new Date(2025, 12, 31), progress: 100, status: 'completed', priority: 'high' },
        { id: 'g2', title: 'Safety Certification', description: 'Obtain advanced safety certification', dueDate: new Date(2026, 1, 31), progress: 80, status: 'in_progress', priority: 'medium' },
      ],
      achievements: [
        { id: 'a1', title: 'Safety Champion', description: 'Zero safety incidents for 12 months', awardedAt: new Date(2025, 9, 1), awardedBy: 'Safety Officer', icon: '🛡️' },
        { id: 'a2', title: 'Top Performer', description: 'Highest project completion rate', awardedAt: new Date(2025, 8, 15), awardedBy: 'Operations Manager', icon: '🥇' },
      ],
      overallScore: 96,
      reviewPeriod: 'Q4 2025',
    },
  ]);

  const [radarData] = useState([
    { category: 'Projects', value: 85 },
    { category: 'Quality', value: 92 },
    { category: 'Satisfaction', value: 88 },
    { category: 'Safety', value: 95 },
    { category: 'Teamwork', value: 90 },
  ]);

  const currentScorecard = scorecards[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_track':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'below_target':
      case 'not_started':
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

  const calculatePerformanceScore = (kpis: KPI[]) => {
    const scores = kpis.map((kpi) => {
      const percentage = (kpi.actual / kpi.target) * 100;
      return Math.min(percentage, 100) * (kpi.weight / 100);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Performance Scorecards</h1>
          <p className="text-slate-600 mt-2">Track KPIs, goals, achievements, and team recognition</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="team">Team Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual Scorecard</TabsTrigger>
            <TabsTrigger value="recognition">Recognition</TabsTrigger>
          </TabsList>

          {/* Team Overview Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {scorecards.map((scorecard) => (
                <Card
                  key={scorecard.id}
                  className={`cursor-pointer transition hover:shadow-lg ${selectedMember === scorecard.member.id ? 'ring-2 ring-blue-600' : ''}`}
                  onClick={() => setSelectedMember(scorecard.member.id)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">{scorecard.member.avatar}</div>
                    <h3 className="font-semibold text-slate-900">{scorecard.member.name}</h3>
                    <p className="text-xs text-slate-600 mb-3">{scorecard.member.role}</p>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{scorecard.overallScore}</div>
                    <Badge className={getStatusColor(scorecard.overallScore >= 90 ? 'exceeding' : 'on_track')}>
                      {scorecard.overallScore >= 90 ? 'Exceeding' : 'On Track'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Team Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scorecards.map((s) => ({ name: s.member.name.split(' ')[0], score: s.overallScore }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="score" fill="#3b82f6" name="Performance Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Scorecard Tab */}
          <TabsContent value="individual" className="space-y-6">
            {/* Member Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">{currentScorecard.member.avatar}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{currentScorecard.member.name}</h2>
                    <p className="text-slate-600">{currentScorecard.member.role} • {currentScorecard.member.department}</p>
                    <p className="text-sm text-slate-600">Joined {currentScorecard.member.joinDate.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-blue-600">{currentScorecard.overallScore}</div>
                    <p className="text-sm text-slate-600">Overall Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* KPIs */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentScorecard.kpis.map((kpi) => (
                  <div key={kpi.id} className="border-l-4 border-blue-300 pl-4 py-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-900">{kpi.name}</h3>
                      <Badge className={getStatusColor(kpi.status)}>{kpi.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">
                        {kpi.actual} / {kpi.target} {kpi.unit}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{Math.round((kpi.actual / kpi.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${Math.min((kpi.actual / kpi.target) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Goals & Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentScorecard.goals.map((goal) => (
                  <div key={goal.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                        <p className="text-sm text-slate-600">{goal.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(goal.status)}>{goal.status.replace('_', ' ')}</Badge>
                        <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 bg-green-600 rounded-full" style={{ width: `${goal.progress}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{goal.progress}%</span>
                      <span className="text-xs text-slate-600 ml-2">Due: {goal.dueDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recognition Tab */}
          <TabsContent value="recognition" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scorecards.map((scorecard) => (
                <Card key={scorecard.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{scorecard.member.avatar}</span>
                      {scorecard.member.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scorecard.achievements.map((achievement) => (
                      <div key={achievement.id} className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                            <p className="text-sm text-slate-600">{achievement.description}</p>
                            <p className="text-xs text-slate-600 mt-1">
                              Awarded by {achievement.awardedBy} on {achievement.awardedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recognition Form */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle>Award Recognition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Team Member</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600">
                    <option>Choose a team member...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Achievement</label>
                  <input
                    type="text"
                    placeholder="e.g., Employee of the Month"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe the achievement..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                    rows={3}
                  />
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">🏆 Award Recognition</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

