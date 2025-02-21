import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/lib/supabaseClient';
import { ChevronLeft, Loader2 } from 'lucide-react';

// Define types for team and form data
interface Team {
  id: string;
  name: string;
}

interface FormData {
  team_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  accident_type: string;
  accident_date: string;
  accident_location: string;
  notes: string;
}

const accidentTypes = [
  'Auto Accident',
  'Workplace Injury',
  'Medical Malpractice',
  'Slip and Fall',
  'Product Liability',
  'Other'
];

export default function LeadForm() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: '',
    text: ''
  });
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    team_id: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    accident_type: 'Auto Accident',
    accident_date: '',
    accident_location: '',
    notes: ''
  });

  // Load user's teams on component mount
  useEffect(() => {
    async function loadTeams() {
      if (isSignedIn && user) {
        try {
          const supabase = createClerkSupabaseClient();
          const { data, error } = await supabase
            .from('team_members')
            .select(`
              team_id,
              teams(id, name)
            `)
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            const formattedTeams = data.map((item: any) => ({
              id: item.teams.id,
              name: item.teams.name
            }));
            
            setTeams(formattedTeams);
            
            // Auto-select the first team if there's only one
            if (formattedTeams.length === 1) {
              setFormData(prev => ({ ...prev, team_id: formattedTeams[0].id }));
            }
          }
        } catch (err) {
          console.error('Error loading teams:', err);
          setMessage({ 
            type: 'error', 
            text: 'Failed to load your teams. Please refresh the page.' 
          });
        }
      }
    }
    
    loadTeams();
  }, [isSignedIn, user]);

  // Handle form field changes with proper event typing
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission with proper event typing
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    // Validate required fields
    if (!formData.team_id || !formData.client_name || !formData.accident_type) {
      setMessage({ 
        type: 'error', 
        text: 'Please fill in all required fields.' 
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const supabase = createClerkSupabaseClient();
      
      // Insert the lead
      const { data, error } = await supabase
        .from('leads')
        .insert({
          team_id: formData.team_id,
          submitted_by: user?.id,
          client_name: formData.client_name,
          client_phone: formData.client_phone || null,
          client_email: formData.client_email || null,
          accident_type: formData.accident_type,
          accident_date: formData.accident_date || null,
          accident_location: formData.accident_location || null,
          status: 'new',
          notes: formData.notes || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Check for commission rules
      const { data: commissionRule } = await supabase
        .from('commission_rules')
        .select('amount, override_percentage')
        .eq('team_id', formData.team_id)
        .eq('accident_type', formData.accident_type)
        .eq('active', true)
        .single();
      
      if (commissionRule) {
        // Create personal commission
        await supabase.from('commissions').insert({
          lead_id: data.id,
          user_id: user?.id,
          amount: commissionRule.amount,
          commission_type: 'personal',
          status: 'pending'
        });
        
        // Check for sponsor
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('sponsor_id')
          .eq('user_id', user?.id)
          .single();
        
        if (userProfile?.sponsor_id && commissionRule.override_percentage) {
          const overrideAmount = (commissionRule.amount * commissionRule.override_percentage) / 100;
          
          if (overrideAmount > 0) {
            await supabase.from('commissions').insert({
              lead_id: data.id,
              user_id: userProfile.sponsor_id,
              amount: overrideAmount,
              commission_type: 'override',
              status: 'pending'
            });
          }
        }
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Lead submitted successfully!' 
      });
      
      // Reset form (keep selected team)
      setFormData({
        team_id: formData.team_id,
        client_name: '',
        client_phone: '',
        client_email: '',
        accident_type: 'Auto Accident',
        accident_date: '',
        accident_location: '',
        notes: ''
      });
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting lead:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to submit lead. Please try again.' 
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
        <h1 className="text-xl font-bold">Submit New Lead</h1>
      </div>
      
      {/* Form card */}
      <div className="bg-white rounded-lg shadow-md max-w-md mx-auto">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">Lead Details</h2>
          <p className="text-sm text-gray-500">Enter accident victim information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Team Selection */}
          <div>
            <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 mb-1">
              Team *
            </label>
            <select
              id="team_id"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          
          {/* Client Info */}
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              id="client_name"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="client_phone"
                name="client_phone"
                value={formData.client_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="client_email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Accident Info */}
          <div>
            <label htmlFor="accident_type" className="block text-sm font-medium text-gray-700 mb-1">
              Accident Type *
            </label>
            <select
              id="accident_type"
              name="accident_type"
              value={formData.accident_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {accidentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accident_date" className="block text-sm font-medium text-gray-700 mb-1">
                Accident Date
              </label>
              <input
                type="date"
                id="accident_date"
                name="accident_date"
                value={formData.accident_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="accident_location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="accident_location"
                name="accident_location"
                value={formData.accident_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, State"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional details about the accident..."
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
                Submitting...
              </span>
            ) : (
              'Submit Lead'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
