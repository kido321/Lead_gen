'use client'
import React, { useState } from 'react';
import { 
  Home, 
  User, 
  Users, 
  Banknote, 
  Settings,
  PlusCircle
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([
    { id: 1, description: 'Car accident on Main St', status: 'new', created_at: '2025-02-19' },
    { id: 2, description: 'Workplace injury claim', status: 'in_progress', created_at: '2025-02-18' }
  ]);

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'team', icon: Users, label: 'My Team' },
    { id: 'commissions', icon: Banknote, label: 'Commissions' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Leads</h2>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                <PlusCircle size={20} />
                <span>New Lead</span>
              </button>
            </div>
            {leads.map(lead => (
              <Card key={lead.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{lead.description}</p>
                      <p className="text-sm text-gray-500">Created: {lead.created_at}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      lead.status === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.status === 'new' ? 'New' : 'In Progress'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'commissions':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$1,250.00</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2025-02-19', amount: 250, type: 'Personal' },
                    { date: '2025-02-18', amount: 175, type: 'Override' }
                  ].map((commission, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{commission.type}</p>
                        <p className="text-sm text-gray-500">{commission.date}</p>
                      </div>
                      <p className="font-bold">${commission.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div className="text-center text-gray-500 mt-8">Coming Soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 pb-24">
        {renderContent()}
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <tab.icon size={24} />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;