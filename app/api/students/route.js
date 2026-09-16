import { getSupabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, identification, paid, cancelled, cancellation_date, created_at')
      .order('name');

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching students:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, identification, paid } = body;

    if (!name || !identification) {
      return Response.json(
        { error: 'Name and identification are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('students')
      .insert({ name, email: email || '', identification, paid: paid ?? false })
      .select('id, name, email, identification, paid, cancelled, cancellation_date, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return Response.json(
          { error: 'Student with this identification already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
