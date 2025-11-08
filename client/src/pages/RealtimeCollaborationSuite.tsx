/**
 * Real-Time Collaboration Suite
 * Live co-editing, video conferencing, screen sharing, persistent chat with AI transcription
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CollaborativeSession {
  id: string;
  title: string;
  type: 'editing' | 'video' | 'mixed';
  participants: number;
  duration: string;
  status: 'active' | 'paused' | 'ended';
  startTime: string;
  createdBy: string;
  lastActivity: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'away' | 'offline';
  joinedAt: string;
  avatar: string;
  cursorPosition?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'mention';
  reactions: string[];
}

interface TranscriptionSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  actionItems?: string[];
}

interface DocumentVersion {
  id: string;
  title: string;
  version: number;
  lastModified: string;
  modifiedBy: string;
  changes: number;
  status: 'saved' | 'editing' | 'conflict';
}

interface ScreenShare {
  id: string;
  sharedBy: string;
  startTime: string;
  duration: string;
  viewers: number;
  recording: boolean;
  recordingUrl?: string;
}

export default function RealtimeCollaborationSuite() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSession, setSelectedSession] = useState<CollaborativeSession | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

  const [sessions] = useState<CollaborativeSession[]>([
    {
      id: '1',
      title: 'Q1 Budget Planning',
      type: 'mixed',
      participants: 8,
      duration: '1h 23m',
      status: 'active',
      startTime: '2025-01-31 14:00',
      createdBy: 'john.smith@company.com',
      lastActivity: '2 seconds ago',
    },
    {
      id: '2',
      title: 'Project Proposal Review',
      type: 'video',
      participants: 5,
      duration: '45m',
      status: 'active',
      startTime: '2025-01-31 13:15',
      createdBy: 'sarah.johnson@company.com',
      lastActivity: '30 seconds ago',
    },
    {
      id: '3',
      title: 'Design System Update',
      type: 'editing',
      participants: 3,
      duration: '2h 15m',
      status: 'paused',
      startTime: '2025-01-31 10:30',
      createdBy: 'mike.davis@company.com',
      lastActivity: '5 minutes ago',
    },
    {
      id: '4',
      title: 'Client Presentation',
      type: 'mixed',
      participants: 12,
      duration: '1h 5m',
      status: 'ended',
      startTime: '2025-01-31 09:00',
      createdBy: 'admin@company.com',
      lastActivity: '3 hours ago',
    },
  ]);

  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'John Smith',
      role: 'Project Manager',
      status: 'active',
      joinedAt: '2025-01-31 14:00',
      avatar: '👨‍💼',
      cursorPosition: 'Line 45',
      videoEnabled: true,
      audioEnabled: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Designer',
      status: 'active',
      joinedAt: '2025-01-31 14:05',
      avatar: '👩‍🎨',
      cursorPosition: 'Line 78',
      videoEnabled: true,
      audioEnabled: true,
    },
    {
      id: '3',
      name: 'Mike Davis',
      role: 'Developer',
      status: 'idle',
      joinedAt: '2025-01-31 14:02',
      avatar: '👨‍💻',
      cursorPosition: 'Line 120',
      videoEnabled: false,
      audioEnabled: true,
    },
    {
      id: '4',
      name: 'Emma Wilson',
      role: 'Analyst',
      status: 'away',
      joinedAt: '2025-01-31 14:10',
      avatar: '👩‍💼',
      videoEnabled: false,
      audioEnabled: false,
    },
  ]);

  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'John Smith',
      message: 'Let\'s start with the budget review',
      timestamp: '14:32',
      type: 'text',
      reactions: ['👍', '👍'],
    },
    {
      id: '2',
      sender: 'Sarah Johnson',
      message: '@John I\'ve updated the Q1 projections',
      timestamp: '14:33',
      type: 'mention',
      reactions: [],
    },
    {
      id: '3',
      sender: 'System',
      message: 'Mike Davis joined the session',
      timestamp: '14:35',
      type: 'system',
      reactions: [],
    },
    {
      id: '4',
      sender: 'Mike Davis',
      message: 'I\'ve completed the technical assessment',
      timestamp: '14:36',
      type: 'text',
      reactions: ['✅'],
    },
  ]);

  const [transcription] = useState<TranscriptionSegment[]>([
    {
      id: '1',
      speaker: 'John Smith',
      text: 'Good afternoon everyone. Let\'s begin with the Q1 budget review. Sarah, can you walk us through the projections?',
      timestamp: '14:00:15',
      confidence: 0.98,
      actionItems: ['Review Q1 projections'],
    },
    {
      id: '2',
      speaker: 'Sarah Johnson',
      text: 'Of course. We\'re looking at a 12% increase in operational costs due to the new team expansion.',
      timestamp: '14:00:45',
      confidence: 0.97,
      actionItems: [],
    },
    {
      id: '3',
      speaker: 'Mike Davis',
      text: 'Have we factored in the infrastructure upgrades from the technical assessment?',
      timestamp: '14:01:20',
      confidence: 0.96,
      actionItems: ['Factor in infrastructure costs'],
    },
    {
      id: '4',
      speaker: 'John Smith',
      text: 'Good point. Let\'s add that to the revised budget. Mike, can you send the detailed breakdown?',
      timestamp: '14:02:00',
      confidence: 0.98,
      actionItems: ['Send technical breakdown to John'],
    },
  ]);

  const [documents] = useState<DocumentVersion[]>([
    {
      id: '1',
      title: 'Q1 Budget Spreadsheet',
      version: 5,
      lastModified: '2025-01-31 14:32',
      modifiedBy: 'Sarah Johnson',
      changes: 12,
      status: 'editing',
    },
    {
      id: '2',
      title: 'Project Proposal',
      version: 3,
      lastModified: '2025-01-31 14:28',
      modifiedBy: 'John Smith',
      changes: 8,
      status: 'saved',
    },
    {
      id: '3',
      title: 'Technical Assessment',
      version: 2,
      lastModified: '2025-01-31 14:15',
      modifiedBy: 'Mike Davis',
      changes: 15,
      status: 'saved',
    },
  ]);

  const [screenShares] = useState<ScreenShare[]>([
    {
      id: '1',
      sharedBy: 'Sarah Johnson',
      startTime: '2025-01-31 14:10',
      duration: '8m 32s',
      viewers: 7,
      recording: true,
      recordingUrl: '/recordings/screen-share-1.mp4',
    },
    {
      id: '2',
      sharedBy: 'Mike Davis',
      startTime: '2025-01-31 14:25',
      duration: '5m 15s',
      viewers: 8,
      recording: true,
      recordingUrl: '/recordings/screen-share-2.mp4',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'saved':
        return 'bg-green-100 text-green-800';
      case 'paused':
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
      case 'away':
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'editing':
      case 'conflict':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const totalParticipants = sessions.reduce((sum, s) => sum + s.participants, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Real-Time Collaboration Suite</h1>
              <p className="text-slate-600 mt-2">Live co-editing, video conferencing, screen sharing, AI transcription</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">+ New Session</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Active Sessions</p>
              <p className="text-3xl font-bold text-green-600">{activeSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Participants</p>
              <p className="text-3xl font-bold text-slate-900">{totalParticipants}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Avg Session Duration</p>
              <p className="text-3xl font-bold text-slate-900">1h 22m</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="screen">Screen Shares</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                          <Badge variant="outline">{session.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">Created by {session.createdBy}</p>
                        <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-slate-600">Started</p>
                            <p className="font-semibold text-slate-900">{session.startTime}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Duration</p>
                            <p className="font-semibold text-slate-900">{session.duration}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Participants</p>
                            <p className="font-semibold text-slate-900">{session.participants}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Last Activity</p>
                            <p className="font-semibold text-slate-900">{session.lastActivity}</p>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">Join</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedSession && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedSession.title}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedSession(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className={getStatusColor(selectedSession.status)}>
                        {selectedSession.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Type</p>
                      <Badge variant="outline">{selectedSession.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Participants</p>
                      <p className="text-lg font-bold text-slate-900">{selectedSession.participants}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Duration</p>
                      <p className="text-lg font-bold text-slate-900">{selectedSession.duration}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Recording
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Join Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((participant) => (
                <Card key={participant.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{participant.avatar}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{participant.name}</h3>
                          <p className="text-sm text-slate-600">{participant.role}</p>
                        </div>
                        <Badge className={getStatusColor(participant.status)}>{participant.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Joined</p>
                          <p className="font-semibold text-slate-900">{participant.joinedAt}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Cursor Position</p>
                          <p className="font-semibold text-slate-900">{participant.cursorPosition || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-sm">
                        <Badge variant={participant.videoEnabled ? 'default' : 'outline'}>
                          {participant.videoEnabled ? '📹 Video On' : '📹 Video Off'}
                        </Badge>
                        <Badge variant={participant.audioEnabled ? 'default' : 'outline'}>
                          {participant.audioEnabled ? '🎤 Audio On' : '🎤 Audio Off'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-slate-900">{msg.sender}</p>
                    <p className="text-xs text-slate-600">{msg.timestamp}</p>
                  </div>
                  <p className="text-sm text-slate-700">{msg.message}</p>
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {msg.reactions.map((reaction, idx) => (
                        <span key={idx} className="text-sm">
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
            </div>
          </TabsContent>

          {/* Transcription Tab */}
          <TabsContent value="transcription" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Meeting Transcription</h3>
                <p className="text-sm text-slate-600">AI-powered with action items</p>
              </div>
              <Button
                onClick={() => setShowTranscription(!showTranscription)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showTranscription ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>

            <div className="space-y-3">
              {transcription.map((segment) => (
                <div key={segment.id} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-900">{segment.speaker}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">{segment.timestamp}</span>
                      <Badge variant="outline">{Math.round(segment.confidence * 100)}%</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{segment.text}</p>
                  {segment.actionItems && segment.actionItems.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs font-semibold text-blue-900">Action Items:</p>
                      {segment.actionItems.map((item, idx) => (
                        <p key={idx} className="text-xs text-blue-800">
                          • {item}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Version</p>
                          <p className="font-semibold text-slate-900">v{doc.version}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Last Modified</p>
                          <p className="font-semibold text-slate-900">{doc.lastModified}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Modified By</p>
                          <p className="font-semibold text-slate-900">{doc.modifiedBy}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Changes</p>
                          <p className="font-semibold text-slate-900">{doc.changes}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      <Button variant="outline">Open</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Screen Shares Tab */}
          <TabsContent value="screen" className="space-y-4">
            {screenShares.map((share) => (
              <Card key={share.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">Screen Share by {share.sharedBy}</h3>
                        <p className="text-sm text-slate-600 mt-1">{share.startTime}</p>
                      </div>
                      <Badge variant="outline">📹 Recorded</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Duration</p>
                        <p className="font-semibold text-slate-900">{share.duration}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Viewers</p>
                        <p className="font-semibold text-slate-900">{share.viewers}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Recording</p>
                        <p className="font-semibold text-slate-900">{share.recording ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      {share.recording ? 'Download Recording' : 'View Details'}
                    </Button>
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

