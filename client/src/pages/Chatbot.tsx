/**
 * Chatbot UI Component
 * Real-time chat interface with message history, sentiment indicators, and streaming responses
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Loader2, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  status: 'active' | 'closed' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
}

export default function Chatbot() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const createSessionMutation = trpc.advancedFeatures.chatbot.createSession.useMutation();
  const sendMessageMutation = trpc.advancedFeatures.chatbot.sendMessage.useMutation();
  const getSessionsQuery = trpc.advancedFeatures.chatbot.getSessions.useQuery();
  const getSessionQuery = trpc.advancedFeatures.chatbot.getSession.useQuery(
    { sessionId: activeSession?.id || '' },
    { enabled: !!activeSession?.id, retry: false }
  );

  // Load sessions on mount
  useEffect(() => {
    if (getSessionsQuery.data) {
      setSessions(getSessionsQuery.data as any);
      if (!activeSession && getSessionsQuery.data.length > 0) {
        setActiveSession(getSessionsQuery.data[0] as any);
      }
    }
  }, [getSessionsQuery.data]);

  // Load active session messages
  useEffect(() => {
    if (getSessionQuery.data) {
      setMessages(getSessionQuery.data.messages || []);
    }
  }, [getSessionQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;

    try {
      const session = await createSessionMutation.mutateAsync({
        title: newSessionTitle,
      });

      const newSession: ChatSession = {
        id: session.id,
        title: session.title,
        messages: [],
        status: 'active',
        createdAt: session.createdAt,
        updatedAt: session.createdAt,
      };

      setSessions([newSession, ...sessions]);
      setActiveSession(newSession);
      setNewSessionTitle('');
      setShowNewSessionForm(false);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeSession || isLoading) return;

    const messageContent = inputValue;
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId: activeSession.id,
        message: messageContent,
      });

      if (response.success && response.response) {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: response.response || '',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="w-4 h-4" />;
      case 'negative':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      <div className="relative z-2 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Support Assistant</h1>
              <p className="text-gray-600 mt-1">24/7 intelligent customer support powered by Claude</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <Button
                  onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  + New Chat
                </Button>
              </div>

              {showNewSessionForm && (
                <div className="p-4 border-b border-gray-200 space-y-2">
                  <Input
                    placeholder="Chat title..."
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateSession}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewSessionForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setActiveSession(session);
                        setMessages(session.messages);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeSession?.id === session.id
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {session.messages.length} messages
                      </div>
                      {session.status === 'escalated' && (
                        <Badge className="mt-2 bg-red-100 text-red-800">Escalated</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {activeSession ? (
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{activeSession.title}</h2>
                    <p className="text-sm text-gray-500">
                      {activeSession.status === 'escalated'
                        ? 'Escalated to support team'
                        : 'Active conversation'}
                    </p>
                  </div>
                  <Badge
                    className={
                      activeSession.status === 'escalated'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {activeSession.status}
                  </Badge>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <HelpCircle className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-center">
                          Start a conversation with our AI assistant.<br />
                          Ask questions about Venturr features, pricing, or get help with your projects.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                              {message.sentiment && message.role === 'user' && (
                                <>
                                  {getSentimentIcon(message.sentiment)}
                                  <span className="capitalize">{message.sentiment}</span>
                                </>
                              )}
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                {activeSession.status !== 'closed' && (
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask me anything..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            ) : (
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No active chat session</p>
                  <Button
                    onClick={() => setShowNewSessionForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Start New Chat
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

