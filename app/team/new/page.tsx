// app/teams/new/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import TeamForm from '@/app/components/TeamForm';
import { Loader2 } from 'lucide-react';

export default function NewTeamPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

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

  return <TeamForm />;
}
