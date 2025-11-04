import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

export default function EnhancedUserProfile() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>(['Roofing', 'Project Management']);
  const [expertise, setExpertise] = useState<string[]>(['Residential', 'Commercial']);
  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [bio, setBio] = useState('Experienced roofing contractor with 10+ years in the industry');

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setExpertise([...expertise, newExpertise]);
      setNewExpertise('');
    }
  };

  const removeExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, skills, expertise }),
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-600 mb-8">{user.email}</p>

          {/* Bio Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Bio</h2>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full"
            />
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {/* Expertise Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {expertise.map((exp, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {exp}
                  <button
                    onClick={() => removeExpertise(index)}
                    className="hover:text-red-200"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                placeholder="Add expertise..."
                onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
              />
              <Button onClick={addExpertise} className="bg-blue-600 hover:bg-blue-700">
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
          >
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
