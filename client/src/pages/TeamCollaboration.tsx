/**
 * Team Collaboration Page
 * Real-time chat, project comments, task assignments, activity feeds
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Activity,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  reactions?: Record<string, number>;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  dueDate: Date;
  comments: number;
}

interface ActivityItem {
  id: string;
  type: 'comment' | 'task' | 'member' | 'status';
  user: string;
  action: string;
  timestamp: Date;
  details?: string;
}

type TabType = 'chat' | 'tasks' | 'activity' | 'team';

export default function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  useEffect(() => {
    setMessages([
      {
        id: '1',
        userId: 'user1',
        userName: 'John Smith',
        userAvatar: '👨‍💼',
        content: 'Hey team, how is the roofing project coming along?',
        timestamp: new Date(Date.now() - 3600000),
        reactions: { '👍': 2, '❤️': 1 },
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Johnson',
        userAvatar: '👩‍🔧',
        content: 'Almost done with the measurements. Should have quotes ready by tomorrow.',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: '3',
        userId: 'user1',
        userName: 'John Smith',
        userAvatar: '👨‍💼',
        content: 'Great! Let me know when you need the compliance documents.',
        timestamp: new Date(Date.now() - 600000),
      },
    ]);

    setTasks([
      {
        id: 'task1',
        title: 'Complete site measurements',
        assignedTo: 'Sarah Johnson',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 86400000),
        comments: 3,
      },
      {
        id: 'task2',
        title: 'Generate pricing quotes',
        assignedTo: 'Mike Davis',
        priority: 'critical',
        status: 'todo',
        dueDate: new Date(Date.now() + 172800000),
        comments: 1,
      },
      {
        id: 'task3',
        title: 'Review compliance documents',
        assignedTo: 'John Smith',
        priority: 'medium',
        status: 'review',
        dueDate: new Date(Date.now() + 259200000),
        comments: 2,
      },
      {
        id: 'task4',
        title: 'Schedule client walkthrough',
        assignedTo: 'Sarah Johnson',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 86400000),
        comments: 0,
      },
    ]);

    setActivityFeed([
      {
        id: 'act1',
        type: 'task',
        user: 'Sarah Johnson',
        action: 'marked task as in progress',
        timestamp: new Date(Date.now() - 1800000),
        details: 'Complete site measurements',
      },
      {
        id: 'act2',
        type: 'comment',
        user: 'John Smith',
        action: 'commented on task',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Let me know when you need the compliance documents.',
      },
      {
        id: 'act3',
        type: 'member',
        user: 'Mike Davis',
        action: 'joined the team',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Added as Team Member',
      },
      {
        id: 'act4',
        type: 'status',
        user: 'Admin',
        action: 'changed project status to',
        timestamp: new Date(Date.now() - 10800000),
        details: 'Active',
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        userId: 'current-user',
        userName: 'You',
        userAvatar: '👤',
        content: newMessage,
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Team Collaboration</h1>
                <p className="text-gray-600 mt-1">Real-time communication and task management</p>
              </div>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {(['chat', 'tasks', 'activity', 'team'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'chat' && '💬 Chat'}
              {tab === 'tasks' && '✓ Tasks'}
              {tab === 'activity' && '📊 Activity'}
              {tab === 'team' && '👥 Team'}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {msg.userAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{msg.userName}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 bg-gray-100 rounded-lg px-3 py-2">{msg.content}</p>
                    {msg.reactions && (
                      <div className="flex gap-2 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <span
                            key={emoji}
                            className="text-xs bg-gray-100 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-200"
                          >
                            {emoji} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button variant="ghost" size="icon">
                <Smile className="w-4 h-4" />
              </Button>
              <Button onClick={handleSendMessage} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((priority) => (
                  <Button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    variant={filterPriority === priority ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filterPriority === priority
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                        : ''
                    }
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="backdrop-blur-xl bg-white/95 border-white/20 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Assigned to: {task.assignedTo}</span>
                        <span>Due: {task.dueDate.toLocaleDateString()}</span>
                        <span>{task.comments} comments</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm">
                    {item.type === 'comment' && <MessageSquare className="w-5 h-5" />}
                    {item.type === 'task' && <CheckCircle2 className="w-5 h-5" />}
                    {item.type === 'member' && <Users className="w-5 h-5" />}
                    {item.type === 'status' && <Activity className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-semibold">{item.user}</span>
                      {' '}
                      <span className="text-gray-600">{item.action}</span>
                      {item.details && (
                        <>
                          {' '}
                          <span className="font-medium text-gray-900">{item.details}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'John Smith', role: 'Project Manager', avatar: '👨‍💼', status: 'online' },
              { name: 'Sarah Johnson', role: 'Site Surveyor', avatar: '👩‍🔧', status: 'online' },
              { name: 'Mike Davis', role: 'Estimator', avatar: '👨‍💻', status: 'away' },
              { name: 'Emily Wilson', role: 'Compliance Officer', avatar: '👩‍⚖️', status: 'offline' },
              { name: 'David Brown', role: 'Scheduler', avatar: '👨‍🏫', status: 'online' },
              { name: 'Lisa Anderson', role: 'Quality Assurance', avatar: '👩‍🔬', status: 'online' },
            ].map((member, idx) => (
              <Card key={idx} className="backdrop-blur-xl bg-white/95 border-white/20 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      member.status === 'online'
                        ? 'bg-green-500'
                        : member.status === 'away'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-xs text-gray-600 capitalize">{member.status}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component
const Circle = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" />
  </svg>
);

