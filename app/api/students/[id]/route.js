import { getSupabase } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, identification, paid, cancelled, cancellation_date, created_at')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }
    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabase();

    const updates = {};
    if (body.name !== undefined)              updates.name = body.name;
    if (body.email !== undefined)             updates.email = body.email;
    if (body.identification !== undefined)    updates.identification = body.identification;
    if (body.paid !== undefined)              updates.paid = body.paid;
    if (body.cancelled !== undefined)         updates.cancelled = body.cancelled;
    if (body.cancellation_date !== undefined) updates.cancellation_date = body.cancellation_date;

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, identification, paid, cancelled, cancellation_date, created_at')
      .single();

    if (error?.code === 'PGRST116') {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }
    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error updating student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
