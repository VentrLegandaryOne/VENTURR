/**
 * Knowledge Base & Help Center
 * Searchable documentation, video tutorials, FAQ section, and community forum
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Article {
  id: string;
  title: string;
  category: string;
  description: string;
  readTime: number;
  views: number;
  helpful: number;
  tags: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface ForumPost {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  timestamp: Date;
  solved: boolean;
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const articles: Article[] = [
    {
      id: '1',
      title: 'Getting Started with Venturr',
      category: 'Getting Started',
      description: 'Learn the basics of setting up your Venturr account and first project',
      readTime: 5,
      views: 2450,
      helpful: 89,
      tags: ['setup', 'beginner', 'account'],
    },
    {
      id: '2',
      title: 'AI Quote Generation Guide',
      category: 'Features',
      description: 'Master the AI-powered quote generation tool to create accurate estimates',
      readTime: 8,
      views: 1890,
      helpful: 92,
      tags: ['quotes', 'ai', 'intermediate'],
    },
    {
      id: '3',
      title: 'Team Management Best Practices',
      category: 'Team',
      description: 'Organize your team, assign roles, and manage permissions effectively',
      readTime: 6,
      views: 1234,
      helpful: 85,
      tags: ['team', 'management', 'permissions'],
    },
    {
      id: '4',
      title: 'Analytics Dashboard Overview',
      category: 'Analytics',
      description: 'Understand key metrics and use analytics to grow your business',
      readTime: 7,
      views: 1567,
      helpful: 88,
      tags: ['analytics', 'reports', 'metrics'],
    },
    {
      id: '5',
      title: 'Mobile App Features',
      category: 'Mobile',
      description: 'Explore the mobile app and manage projects on the go',
      readTime: 5,
      views: 987,
      helpful: 91,
      tags: ['mobile', 'app', 'features'],
    },
    {
      id: '6',
      title: 'API Integration Guide',
      category: 'API',
      description: 'Integrate Venturr with your existing tools and workflows',
      readTime: 10,
      views: 654,
      helpful: 87,
      tags: ['api', 'integration', 'advanced'],
    },
  ];

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Complete Venturr Setup in 10 Minutes',
      description: 'Quick walkthrough of initial setup and configuration',
      duration: 10,
      difficulty: 'beginner',
      views: 3421,
    },
    {
      id: '2',
      title: 'Creating Your First Project',
      description: 'Step-by-step guide to creating and managing projects',
      duration: 8,
      difficulty: 'beginner',
      views: 2876,
    },
    {
      id: '3',
      title: 'Advanced Pricing Optimization',
      description: 'Learn how to use AI pricing engine for maximum profit',
      duration: 15,
      difficulty: 'advanced',
      views: 1245,
    },
    {
      id: '4',
      title: 'Team Collaboration Workflows',
      description: 'Best practices for team communication and project management',
      duration: 12,
      difficulty: 'intermediate',
      views: 1876,
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer:
        'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox.',
      category: 'Account',
      helpful: 234,
    },
    {
      id: '2',
      question: 'Can I export my data?',
      answer:
        'Yes, go to Settings > Data Export and choose your preferred format (JSON, CSV, or Excel).',
      category: 'Data',
      helpful: 189,
    },
    {
      id: '3',
      question: 'How accurate is the AI quote generator?',
      answer:
        'Our AI achieves 85%+ accuracy based on historical data. Accuracy improves as you add more projects.',
      category: 'Features',
      helpful: 312,
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, bank transfers, and PayPal. Enterprise customers can arrange custom billing.',
      category: 'Billing',
      helpful: 156,
    },
    {
      id: '5',
      question: 'Is there a mobile app?',
      answer:
        'Yes, Venturr is available on iOS and Android. Download from the App Store or Google Play.',
      category: 'Mobile',
      helpful: 267,
    },
  ];

  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Best practices for team communication',
      author: 'John Smith',
      category: 'Team Management',
      replies: 12,
      views: 456,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      solved: true,
    },
    {
      id: '2',
      title: 'How to improve quote accuracy',
      author: 'Sarah Johnson',
      category: 'Features',
      replies: 8,
      views: 234,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      solved: true,
    },
    {
      id: '3',
      title: 'Mobile app offline mode questions',
      author: 'Mike Chen',
      category: 'Mobile',
      replies: 3,
      views: 89,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      solved: false,
    },
    {
      id: '4',
      title: 'API rate limiting concerns',
      author: 'Alex Rodriguez',
      category: 'API',
      replies: 5,
      views: 167,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      solved: true,
    },
  ];

  const filteredArticles = articles.filter(
    (article) =>
      (selectedCategory === 'all' || article.category === selectedCategory) &&
      (searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = ['all', ...new Set(articles.map((a) => a.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Knowledge Base & Help Center</h1>
          <p className="text-slate-600">Find answers, tutorials, and community support</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search documentation, tutorials, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-4 pl-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="forum">Community Forum</TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className={
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700'
                    }
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-blue-100 text-blue-800">{article.category}</Badge>
                      <span className="text-sm text-slate-500">{article.readTime} min read</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{article.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {article.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs bg-slate-50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-slate-500">
                        👁 {article.views} • 👍 {article.helpful}%
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      className={
                        tutorial.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-800'
                          : tutorial.difficulty === 'intermediate'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                      }
                    >
                      {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
                    </Badge>
                    <span className="text-sm text-slate-500">⏱ {tutorial.duration} min</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{tutorial.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{tutorial.description}</p>
                  <div className="flex items-center justify-between">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Watch Video
                    </Button>
                    <span className="text-sm text-slate-500">👁 {tutorial.views}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">{faq.question}</h3>
                    <Badge className="bg-slate-100 text-slate-800 ml-2">{faq.category}</Badge>
                  </div>
                  <p className="text-slate-600 mb-4">{faq.answer}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      👍 Helpful ({faq.helpful})
                    </Button>
                    <Button variant="outline" size="sm">
                      👎 Not helpful
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Forum Tab */}
          <TabsContent value="forum">
            <div className="space-y-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                + Start New Discussion
              </Button>

              {forumPosts.map((post) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                        {post.solved && (
                          <Badge className="bg-green-100 text-green-800">Solved</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        by {post.author} • {post.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-800">{post.category}</Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span>💬 {post.replies} replies</span>
                    <span>👁 {post.views} views</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              📧 Contact Support
            </Button>
            <Button variant="outline" className="justify-start">
              📱 Download Mobile App
            </Button>
            <Button variant="outline" className="justify-start">
              🔗 API Documentation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

