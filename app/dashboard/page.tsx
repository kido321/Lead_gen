// 'use client'
// import React, { useState } from 'react';
// import { 
//   Home, 
//   User, 
//   Users, 
//   Banknote, 
//   Settings,
//   PlusCircle
// } from 'lucide-react';
// import { 
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle 
// } from '@/components/ui/card';

// const DashboardLayout = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
// const [leads] = useState([
//     { id: 1, description: 'Car accident on Main St', status: 'new', created_at: '2025-02-19' },
//     { id: 2, description: 'Workplace injury claim', status: 'in_progress', created_at: '2025-02-18' }
//   ]);

//   const tabs = [
//     { id: 'dashboard', icon: Home, label: 'Dashboard' },
//     { id: 'profile', icon: User, label: 'Profile' },
//     { id: 'team', icon: Users, label: 'My Team' },
//     { id: 'commissions', icon: Banknote, label: 'Commissions' },
//     { id: 'settings', icon: Settings, label: 'Settings' }
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return (
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold">Your Leads</h2>
//               <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
//                 <PlusCircle size={20} />
//                 <span>New Lead</span>
//               </button>
//             </div>
//             {leads.map(lead => (
//               <Card key={lead.id}>
//                 <CardContent className="pt-6">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-medium">{lead.description}</p>
//                       <p className="text-sm text-gray-500">Created: {lead.created_at}</p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-sm ${
//                       lead.status === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
//                     }`}>
//                       {lead.status === 'new' ? 'New' : 'In Progress'}
//                     </span>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         );
//       case 'commissions':
//         return (
//           <div className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Pending Balance</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-3xl font-bold">$1,250.00</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Recent Commissions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {[
//                     { date: '2025-02-19', amount: 250, type: 'Personal' },
//                     { date: '2025-02-18', amount: 175, type: 'Override' }
//                   ].map((commission, idx) => (
//                     <div key={idx} className="flex justify-between items-center border-b pb-2">
//                       <div>
//                         <p className="font-medium">{commission.type}</p>
//                         <p className="text-sm text-gray-500">{commission.date}</p>
//                       </div>
//                       <p className="font-bold">${commission.amount}</p>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         );
//       default:
//         return <div className="text-center text-gray-500 mt-8">Coming Soon</div>;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-lg mx-auto p-4 pb-24">
//         {renderContent()}
//       </div>
      
//       <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
//         <div className="max-w-lg mx-auto px-4 py-2">
//           <div className="flex justify-between items-center">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex flex-col items-center p-2 ${
//                   activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
//                 }`}
//               >
//                 <tab.icon size={24} />
//                 <span className="text-xs mt-1">{tab.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default DashboardLayout;




"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/lib/supabaseClient';
import { 
  Home, 
  User, 
  Users, 
  Banknote, 
  Settings,
  PlusCircle,
  Car,
  Briefcase,
  AlertTriangle,
  Heart,
  Package,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Stats
  const [stats, setStats] = useState({
    pendingBalance: 0,
    totalLeads: 0,
    personalCommissions: 0,
    overrideCommissions: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (isSignedIn && user) {
        try {
          setIsLoading(true);
          const supabase = createClerkSupabaseClient();
          
          // Fetch recent leads
          const { data: leadsData, error: leadsError } = await supabase
            .from('leads')
            .select("id, client_name, accident_type, status, created_at, teams(name)")
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (leadsError) throw leadsError;
          
          // Fetch commissions
          const { data: commissionsData, error: commissionsError } = await supabase
            .from('commissions')
            .select('id, amount, status, commission_type, created_at')
            .order('created_at', { ascending: false });
          
          if (commissionsError) throw commissionsError;
          
          // Fetch teams
          const { data: teamsData, error: teamsError } = await supabase
            .from('team_members')
            .select("role, teams(id, name)")
            
          
          if (teamsError) throw teamsError;
          
          // Set data
          setLeads(leadsData || []);
          setCommissions(commissionsData || []);
          setTeams(teamsData || []);
          
          // Calculate stats
          const totalLeads = leadsData ? leadsData.length : 0;
          
          const pendingBalance = (commissionsData || [])
            .filter(c => c.status === 'pending' || c.status === 'approved')
            .reduce((sum, c) => sum + (c.amount || 0), 0);
          
          const personalCommissions = (commissionsData || [])
            .filter(c => c.commission_type === 'personal')
            .reduce((sum, c) => sum + (c.amount || 0), 0);
          
          const overrideCommissions = (commissionsData || [])
            .filter(c => c.commission_type === 'override')
            .reduce((sum, c) => sum + (c.amount || 0), 0);
          
          setStats({
            pendingBalance,
            totalLeads,
            personalCommissions,
            overrideCommissions
          });
          
        } catch (err) {
          console.error('Error loading dashboard data:', err);
          setError('Failed to load dashboard data');
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadDashboardData();
  }, [isSignedIn, user]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get icon for accident type
  const getAccidentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'auto accident':
        return <Car className="h-4 w-4 text-blue-500" />;
      case 'workplace injury':
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      case 'medical malpractice':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'slip and fall':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'product liability':
        return <Package className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return "bg-green-100 text-green-800";
      case 'contacted':
        return "bg-blue-100 text-blue-800";
      case 'qualified':
        return "bg-purple-100 text-purple-800";
      case 'converted':
        return "bg-indigo-100 text-indigo-800";
      case 'lost':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'team', label: 'My Team', icon: Users },
    { id: 'commissions', label: 'Commissions', icon: Banknote },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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

  // Tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500 font-medium">Pending Balance</h3>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.pendingBalance)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500 font-medium">Total Leads</h3>
                <p className="text-2xl font-bold mt-1">{stats.totalLeads}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500 font-medium">Personal Commission</h3>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.personalCommissions)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500 font-medium">Override Commission</h3>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.overrideCommissions)}</p>
              </div>
            </div>
            
            {/* Recent Leads */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-semibold">Recent Leads</h2>
                <button 
                  onClick={() => router.push('/leads/new')}
                  className="flex items-center text-sm text-blue-600 font-medium"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  New Lead
                </button>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : leads.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4">No leads found</p>
                  <button
                    onClick={() => router.push('/leads/new')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Submit your first lead
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">{lead.client_name}</div>
                            <div className="text-xs text-gray-500">{lead.teams?.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {getAccidentIcon(lead.accident_type)}
                              <span className="ml-1 text-sm">{lead.accident_type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(lead.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {leads.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 text-right">
                  <button 
                    onClick={() => router.push('/leads')}
                    className="text-sm text-blue-600 font-medium"
                  >
                    View all leads →
                  </button>
                </div>
              )}
            </div>
            
            {/* Teams */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Your Teams</h2>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : teams.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4">You are not a member of any team yet</p>
                  <button
                    onClick={() => router.push('/teams/new')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Create a team
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {teams.map((teamMember, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">{teamMember.teams.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{teamMember.role}</p>
                      </div>
                      <button 
                        onClick={() => router.push(`/teams/${teamMember.teams.id}`)}
                        className="text-sm text-blue-600"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'commissions':
        return (
          <div className="space-y-6">
            {/* Commission Summary Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Commission Summary</h2>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-6">
                  <div>
                    <h3 className="text-sm text-gray-500">Pending Balance</h3>
                    <p className="text-3xl font-bold">{formatCurrency(stats.pendingBalance)}</p>
                  </div>
                  <button className="h-10 px-4 py-2 bg-blue-600 text-white rounded-md">
                    Request Payout
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm text-gray-600 mb-1">Personal Commissions</h3>
                    <p className="text-xl font-bold">{formatCurrency(stats.personalCommissions)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-sm text-gray-600 mb-1">Override Commissions</h3>
                    <p className="text-xl font-bold">{formatCurrency(stats.overrideCommissions)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Commissions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Recent Commissions</h2>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : commissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No commissions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {commissions.slice(0, 5).map(commission => (
                        <tr key={commission.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {formatDate(commission.created_at)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                            {commission.commission_type}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            {formatCurrency(commission.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              commission.status === 'approved' ? 'bg-green-100 text-green-800' :
                              commission.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {commissions.length > 5 && (
                <div className="px-4 py-3 bg-gray-50 text-right">
                  <button 
                    onClick={() => router.push('/commissions')}
                    className="text-sm text-blue-600 font-medium"
                  >
                    View all commissions →
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Profile</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {user?.firstName?.[0] || user?.username?.[0] || "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-gray-500">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="w-full py-2 bg-blue-600 text-white rounded-md"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'team':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-semibold">My Teams</h2>
                <button
                  onClick={() => router.push('/teams/new')}
                  className="flex items-center text-sm text-blue-600 font-medium"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  New Team
                </button>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : teams.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4">You are not a member of any team yet</p>
                  <button
                    onClick={() => router.push('/teams/new')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Create a team
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {teams.map((teamMember, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-medium">{teamMember.teams.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                          {teamMember.role}
                        </span>
                      </div>
                      <div className="p-4">
                        <button
                          onClick={() => router.push(`/teams/${teamMember.teams.id}`)}
                          className="w-full py-2 bg-blue-600 text-white rounded-md"
                        >
                          View Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Settings</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage how you receive notifications</p>
                  <button className="mt-3 text-sm text-blue-600">Configure</button>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Account Security</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your password and security settings</p>
                  <button className="mt-3 text-sm text-blue-600">Manage</button>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Payment Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your payment details for commission payouts</p>
                  <button className="mt-3 text-sm text-blue-600">Update</button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Select a tab to view content</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {activeTab === 'dashboard'
              ? 'Dashboard'
              : activeTab === 'commissions'
              ? 'Commissions'
              : activeTab === 'profile'
              ? 'My Profile'
              : activeTab === 'team'
              ? 'My Teams'
              : 'Settings'}
          </h1>
          
          {activeTab === 'dashboard' && (
            <button
              onClick={() => router.push('/leads/new')}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Lead</span>
            </button>
          )}
        </div>
        
        {/* Main content */}
        {renderTabContent()}
      </div>
      
      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}
              >
                <tab.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
