/**
 * Customer Portal
 * Public-facing portal for customers to view quotes, track projects, and provide feedback
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APP_LOGO, APP_TITLE } from '@/const';
import { trpc } from '@/lib/trpc';

interface CustomerQuote {
  id: string;
  projectName: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  materials: Array<{ name: string; quantity: number; price: number }>;
}

interface CustomerProject {
  id: string;
  name: string;
  status: 'measuring' | 'quoting' | 'accepted' | 'in_progress' | 'completed';
  progress: number;
  startDate?: Date;
  completionDate?: Date;
  address: string;
}

export default function CustomerPortal() {
  const [, navigate] = useLocation();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<CustomerQuote | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);

  // Fetch customer data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');
    const token = urlParams.get('token');

    if (!customerId || !token) {
      navigate('/');
      return;
    }

    setCustomerId(customerId);
    // In real implementation, would verify token and fetch customer data
  }, [navigate]);

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      // Call tRPC mutation to accept quote
      console.log('Quote accepted:', quoteId);
      // Show success message
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      // Call tRPC mutation to reject quote
      console.log('Quote rejected:', quoteId);
    } catch (error) {
      console.error('Error rejecting quote:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedQuote) return;

    try {
      // Call tRPC mutation to submit feedback
      console.log('Feedback submitted:', { quoteId: selectedQuote.id, rating, feedback });
      setFeedback('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE} Customer Portal</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {customerId && (
          <Tabs defaultValue="quotes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            {/* Quotes Tab */}
            <TabsContent value="quotes" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quotes.length > 0 ? (
                  quotes.map(quote => (
                    <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{quote.projectName}</h3>
                          <p className="text-sm text-gray-600">Quote ID: {quote.id}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-900">
                            ${quote.amount.toLocaleString()}
                          </span>
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <p>Created: {new Date(quote.createdAt).toLocaleDateString()}</p>
                          <p>Expires: {new Date(quote.expiresAt).toLocaleDateString()}</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Materials</h4>
                          <ul className="space-y-1 text-sm">
                            {quote.materials.map((material, idx) => (
                              <li key={idx} className="flex justify-between text-gray-600">
                                <span>{material.name} (x{material.quantity})</span>
                                <span>${material.price.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {quote.status === 'sent' && (
                          <div className="flex gap-2 pt-4">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptQuote(quote.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              onClick={() => handleRejectQuote(quote.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 col-span-full text-center">
                    <p className="text-gray-600">No quotes available yet.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.map(project => (
                    <Card key={project.id} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.address}</p>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {project.startDate && (
                            <div>
                              <p className="text-gray-600">Start Date</p>
                              <p className="font-semibold text-gray-900">
                                {new Date(project.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {project.completionDate && (
                            <div>
                              <p className="text-gray-600">Expected Completion</p>
                              <p className="font-semibold text-gray-900">
                                {new Date(project.completionDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" className="w-full">
                          View Project Details
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-gray-600">No projects yet.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share Your Feedback</h3>

                  {selectedQuote && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Feedback for: <span className="font-semibold">{selectedQuote.projectName}</span>
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-colors ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={5}
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmitFeedback}
                  >
                    Submit Feedback
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            © 2025 {APP_TITLE}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

