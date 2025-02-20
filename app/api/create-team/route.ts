import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(request: Request) {
  const { name } = await request.json();
  const { data, error } = await supabase
    .from('teams')
    .insert([{ name, created_at: new Date() }])
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ team: data });
}