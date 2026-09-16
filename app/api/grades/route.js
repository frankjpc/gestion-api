import { getSupabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('grades')
      .select(`
        id,
        student_id,
        weeks_attended,
        final_grade,
        cancelled,
        notes,
        created_at,
        students ( name, paid )
      `)
      .order('students(name)');

    if (error) throw error;

    const result = data.map((row) => ({
      id:             row.id,
      student_id:     row.student_id,
      student_name:   row.students?.name ?? 'Unknown',
      paid:           row.students?.paid  ?? false,
      weeks_attended: row.weeks_attended,
      final_grade:    row.final_grade,
      cancelled:      row.cancelled,
      notes:          row.notes,
      created_at:     row.created_at,
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { calculateAll } = body;

    if (!calculateAll) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, cancelled');
    if (studentsError) throw studentsError;

    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('student_id, attended, cancelled');
    if (attendanceError) throw attendanceError;

    const gradesToUpsert = students.map((student) => {
      if (student.cancelled) {
        return { student_id: student.id, weeks_attended: 0, final_grade: 0, cancelled: true };
      }
      const weeksAttended = attendance.filter(
        (a) => a.student_id === student.id && a.attended && !a.cancelled
      ).length;
      return {
        student_id:     student.id,
        weeks_attended: weeksAttended,
        final_grade:    Math.min(weeksAttended, 5),
        cancelled:      false,
      };
    });

    const { error: upsertError } = await supabase
      .from('grades')
      .upsert(gradesToUpsert, { onConflict: 'student_id' });

    if (upsertError) throw upsertError;

    return Response.json({ success: true, message: 'All grades calculated' });
  } catch (error) {
    console.error('Error calculating grades:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
