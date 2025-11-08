/**
 * Team Collaboration Chat
 * Real-time messaging with channels, direct messages, file sharing, and project integration
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  reactions: Record<string, number>;
  attachments?: Array<{ id: string; name: string; url: string; type: string }>;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  unread: number;
  isPrivate: boolean;
}

interface DirectMessage {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  lastMessage: string;
  unread: number;
  online: boolean;
}

export default function TeamChat() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageInput, setMessageInput] = useState('');
  const [channels] = useState<Channel[]>([
    {
      id: 'general',
      name: 'general',
      description: 'General team discussion',
      members: 12,
      unread: 0,
      isPrivate: false,
    },
    {
      id: 'projects',
      name: 'projects',
      description: 'Project updates and discussions',
      members: 8,
      unread: 3,
      isPrivate: false,
    },
    {
      id: 'announcements',
      name: 'announcements',
      description: 'Important announcements',
      members: 12,
      unread: 1,
      isPrivate: false,
    },
    {
      id: 'random',
      name: 'random',
      description: 'Off-topic fun stuff',
      members: 10,
      unread: 0,
      isPrivate: false,
    },
  ]);

  const [directMessages] = useState<DirectMessage[]>([
    {
      id: '1',
      userId: 'user-1',
      userName: 'John Smith',
      avatar: '👨‍💼',
      lastMessage: 'Got the quote, will review it',
      unread: 0,
      online: true,
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      avatar: '👩‍💼',
      lastMessage: 'Thanks for the update!',
      unread: 2,
      online: true,
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Mike Davis',
      avatar: '👨‍🔧',
      lastMessage: 'I\'ll start on the project tomorrow',
      unread: 0,
      online: false,
    },
  ]);

  const [messages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: { id: 'user-1', name: 'John Smith', avatar: '👨‍💼' },
      content: 'Hey team, just finished the Smith residence quote',
      timestamp: new Date(Date.now() - 30 * 60000),
      reactions: { '👍': 3, '🎉': 1 },
    },
    {
      id: '2',
      sender: { id: 'user-2', name: 'Sarah Johnson', avatar: '👩‍💼' },
      content: 'Great! Can you send me the details?',
      timestamp: new Date(Date.now() - 20 * 60000),
      reactions: {},
    },
    {
      id: '3',
      sender: { id: 'user-1', name: 'John Smith', avatar: '👨‍💼' },
      content: 'Sure, I\'ll email it to you now',
      timestamp: new Date(Date.now() - 15 * 60000),
      reactions: { '✅': 1 },
      attachments: [
        { id: 'att-1', name: 'Smith_Quote.pdf', url: '#', type: 'pdf' },
      ],
    },
    {
      id: '4',
      sender: { id: 'user-3', name: 'Mike Davis', avatar: '👨‍🔧' },
      content: 'Looks good! When can we start?',
      timestamp: new Date(Date.now() - 5 * 60000),
      reactions: { '⏰': 1 },
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold">💬 Team Chat</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="channels" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 rounded-none border-b border-slate-700">
            <TabsTrigger value="channels" className="text-white data-[state=active]:bg-slate-700">
              Channels
            </TabsTrigger>
            <TabsTrigger value="direct" className="text-white data-[state=active]:bg-slate-700">
              Direct
            </TabsTrigger>
          </TabsList>

          {/* Channels Tab */}
          <TabsContent value="channels" className="flex-1 overflow-y-auto p-3 space-y-2">
            <Button variant="outline" className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800">
              + Create Channel
            </Button>

            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeChannel === channel.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">#{channel.name}</p>
                    <p className="text-xs opacity-75">{channel.members} members</p>
                  </div>
                  {channel.unread > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {channel.unread}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </TabsContent>

          {/* Direct Messages Tab */}
          <TabsContent value="direct" className="flex-1 overflow-y-auto p-3 space-y-2">
            <Button variant="outline" className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800">
              + New Message
            </Button>

            {directMessages.map((dm) => (
              <button
                key={dm.id}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-2xl">{dm.avatar}</span>
                    {dm.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{dm.userName}</p>
                    <p className="text-xs text-slate-400 truncate">{dm.lastMessage}</p>
                  </div>
                  {dm.unread > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {dm.unread}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </TabsContent>
        </Tabs>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">You</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              #{channels.find((c) => c.id === activeChannel)?.name}
            </h2>
            <p className="text-sm text-slate-600">
              {channels.find((c) => c.id === activeChannel)?.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">ℹ️ Info</Button>
            <Button variant="outline">📌 Pinned</Button>
            <Button variant="outline">🔍 Search</Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              <div className="text-3xl">{message.sender.avatar}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="font-semibold text-slate-900">{message.sender.name}</p>
                  <p className="text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-slate-700 mb-2">{message.content}</p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {message.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                      >
                        <span className="text-xl">📎</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{att.name}</p>
                        </div>
                        <span className="text-slate-500">↓</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                {Object.entries(message.reactions).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(message.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-sm transition"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                    <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-sm transition">
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-slate-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="outline" size="icon">
              📎
            </Button>
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Send
            </Button>
          </form>
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" size="sm">
              😊 Emoji
            </Button>
            <Button type="button" variant="outline" size="sm">
              @mention
            </Button>
            <Button type="button" variant="outline" size="sm">
              #hashtag
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

