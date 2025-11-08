/**
 * Comprehensive Onboarding Flow
 * Interactive tutorial, welcome wizard, and guided setup for new users
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  required: boolean;
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    teamSize: '',
    experience: '',
    goals: '',
  });

  const [showTutorial, setShowTutorial] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Venturr',
      description: 'Get started with your AI-powered operating system for trade businesses',
      icon: '👋',
      completed: false,
      required: true,
    },
    {
      id: 'company',
      title: 'Company Setup',
      description: 'Tell us about your business',
      icon: '🏢',
      completed: false,
      required: true,
    },
    {
      id: 'team',
      title: 'Team Setup',
      description: 'Invite your team members',
      icon: '👥',
      completed: false,
      required: false,
    },
    {
      id: 'projects',
      title: 'Create Your First Project',
      description: 'Set up your first project',
      icon: '📋',
      completed: false,
      required: true,
    },
    {
      id: 'features',
      title: 'Explore Features',
      description: 'Learn about key features',
      icon: '🚀',
      completed: false,
      required: false,
    },
  ];

  const handleStepComplete = () => {
    const stepId = steps[currentStep].id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  // Step 1: Welcome
  const WelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Venturr!</h2>
        <p className="text-lg text-slate-600 mb-6">
          Your AI-powered operating system for trade businesses
        </p>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">What you'll get:</h3>
        <ul className="space-y-2 text-blue-800">
          <li>✅ AI-powered quote generation and pricing optimization</li>
          <li>✅ Real-time team collaboration and project management</li>
          <li>✅ Advanced analytics and business intelligence</li>
          <li>✅ Automated workflows and integrations</li>
          <li>✅ 24/7 customer support</li>
        </ul>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={handleStepComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
        >
          Get Started →
        </Button>
        <Button variant="outline" className="w-full">
          Watch Demo Video (2 min)
        </Button>
      </div>
    </div>
  );

  // Step 2: Company Setup
  const CompanySetupStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Tell us about your company</h2>
        <p className="text-slate-600">This helps us customize Venturr for your needs</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Company Name
          </label>
          <Input
            type="text"
            placeholder="e.g., Smith Roofing Co."
            value={formData.companyName}
            onChange={(e) => handleFormChange('companyName', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleFormChange('industry', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your industry</option>
            <option value="roofing">Roofing</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="construction">General Construction</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Team Size
          </label>
          <select
            value={formData.teamSize}
            onChange={(e) => handleFormChange('teamSize', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select team size</option>
            <option value="1-5">1-5 people</option>
            <option value="6-20">6-20 people</option>
            <option value="21-50">21-50 people</option>
            <option value="50+">50+ people</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Years of Experience
          </label>
          <select
            value={formData.experience}
            onChange={(e) => handleFormChange('experience', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            What are your main goals? (Optional)
          </label>
          <textarea
            placeholder="e.g., Improve quote accuracy, streamline team communication, increase profitability"
            value={formData.goals}
            onChange={(e) => handleFormChange('goals', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>
      </div>

      <Button
        onClick={handleStepComplete}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
        disabled={!formData.companyName || !formData.industry}
      >
        Continue →
      </Button>
    </div>
  );

  // Step 3: Team Setup
  const TeamSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Invite your team</h2>
        <p className="text-slate-600">Add team members to collaborate in Venturr</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="team@example.com"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add</Button>
        </div>

        <Card className="p-4 bg-slate-50">
          <p className="text-sm text-slate-600 mb-3">Team members to invite:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-900">john@example.com</span>
              <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-900">sarah@example.com</span>
              <Badge className="bg-green-100 text-green-800">Team Member</Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 You can invite more team members later from the Settings page
        </p>
      </div>

      <Button
        onClick={handleStepComplete}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
      >
        Continue →
      </Button>
    </div>
  );

  // Step 4: Create First Project
  const ProjectSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your first project</h2>
        <p className="text-slate-600">Let's set up a sample project to get you started</p>
      </div>

      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold text-slate-900 mb-2">Sample Project: Smith Residence</h3>
          <p className="text-sm text-slate-600 mb-4">
            A complete example project showing all features
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create Sample Project
          </Button>
        </div>
      </Card>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-slate-900 mb-3">Or create your own:</h4>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Project name"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <Input
            type="text"
            placeholder="Client name"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <Input
            type="text"
            placeholder="Project address"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <Button
        onClick={handleStepComplete}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
      >
        Create Project →
      </Button>
    </div>
  );

  // Step 5: Explore Features
  const FeaturesStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Explore key features</h2>
        <p className="text-slate-600">Here's what you can do with Venturr</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: '🤖', title: 'AI Quote Generator', desc: 'Generate accurate quotes in seconds' },
          { icon: '📊', title: 'Analytics Dashboard', desc: 'Track revenue, profit, and team performance' },
          { icon: '💬', title: 'Team Chat', desc: 'Real-time communication with your team' },
          { icon: '📱', title: 'Mobile App', desc: 'Manage projects on-the-go' },
          { icon: '💰', title: 'Payment Processing', desc: 'Accept payments directly in the app' },
          { icon: '📈', title: 'Pricing Engine', desc: 'AI-powered pricing optimization' },
        ].map((feature, idx) => (
          <Card key={idx} className="p-4">
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h4 className="font-semibold text-slate-900">{feature.title}</h4>
            <p className="text-sm text-slate-600">{feature.desc}</p>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">
          ✅ You're all set! Start exploring Venturr and building your business.
        </p>
      </div>

      <Button
        onClick={() => {
          setShowTutorial(false);
          handleStepComplete();
        }}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
      >
        Go to Dashboard →
      </Button>
    </div>
  );

  const stepComponents = [
    WelcomeStep,
    CompanySetupStep,
    TeamSetupStep,
    ProjectSetupStep,
    FeaturesStep,
  ];

  const CurrentStepComponent = stepComponents[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900">Getting Started</h1>
            <Button variant="outline" onClick={() => setShowTutorial(false)}>
              Skip for now
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Step {currentStep + 1} of {steps.length}
              </p>
              <p className="text-sm font-medium text-slate-900">{Math.round(progressPercentage)}%</p>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8 mb-6">
          <CurrentStepComponent />
        </Card>

        {/* Step Indicators */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`p-3 rounded-lg text-center transition ${
                idx === currentStep
                  ? 'bg-blue-600 text-white'
                  : completedSteps.includes(step.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              <div className="text-lg mb-1">{step.icon}</div>
              <p className="text-xs font-medium">{step.title.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

