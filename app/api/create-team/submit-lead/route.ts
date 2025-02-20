// app/api/submit-lead/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(request: Request) {
  const { team_id, user_id, description } = await request.json();
  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        team_id,
        user_id,
        description,
        status: 'new',
        created_at: new Date(),
      },
    ])
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ lead: data });
}
