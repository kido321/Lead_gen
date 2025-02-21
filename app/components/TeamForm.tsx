import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/lib/supabaseClient';
import { ChevronLeft, Loader2, Users } from 'lucide-react';

export default function TeamForm() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Handle form field changes
  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e :any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    // Validate required fields
    if (!formData.name) {
      setMessage({ 
        type: 'error', 
        text: 'Team name is required.' 
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const supabase = createClerkSupabaseClient();
      
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          description: formData.description,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Add current user as team admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user?.id,
          role: 'admin'
        });
      
      if (memberError) throw memberError;
      
      // Create default commission rules
      const defaultAccidentTypes = [
        'Auto Accident',
        'Workplace Injury',
        'Medical Malpractice',
        'Slip and Fall',
        'Product Liability',
        'Other'
      ];
      
      const commissionRules = defaultAccidentTypes.map(type => ({
        team_id: team.id,
        accident_type: type,
        amount: type === 'Auto Accident' ? 100 : 
                type === 'Medical Malpractice' ? 150 : 
                type === 'Workplace Injury' ? 125 : 75,
        override_percentage: 10,
        active: true
      }));
      
      const { error: rulesError } = await supabase
        .from('commission_rules')
        .insert(commissionRules);
      
      if (rulesError) throw rulesError;
      
      setMessage({ 
        type: 'success', 
        text: 'Team created successfully!' 
      });
      
      // Navigate to teams page after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating team:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to create team. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/dashboard')}
          className="mr-2 p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Create New Team</h1>
      </div>
      
      {/* Form card */}
      <div className="bg-white rounded-lg shadow-md max-w-md mx-auto">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">Team Details</h2>
          <p className="text-sm text-gray-500">Create a team to manage leads and commissions</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. West Coast Sales Team"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Briefly describe your team's purpose..."
            />
          </div>
          
          {/* Message display */}
          {message.text && (
            <div className={`p-3 rounded-md ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Team...
              </span>
            ) : (
              'Create Team'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}