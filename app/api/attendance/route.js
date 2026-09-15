import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .order('name');

    if (studentsError) throw studentsError;

    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('student_id, week, attended, cancelled, notes');

    if (attendanceError) throw attendanceError;

    // Build the attendance matrix: one entry per student with weeks 1-6
    const attendanceMatrix = students.map((student) => {
      const studentRecords = attendance.filter((a) => a.student_id === student.id);
      const weeks = {};
      for (let w = 1; w <= 6; w++) {
        const record = studentRecords.find((r) => r.week === w);
        weeks[w] = {
          attended:  record?.attended  ?? false,
          cancelled: record?.cancelled ?? false,
          notes:     record?.notes     ?? '',
        };
      }
      return {
        student_id:   student.id,
        student_name: student.name,
        weeks,
      };
    });

    return Response.json(attendanceMatrix);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { student_id, week, attended, cancelled, notes } = body;

    if (!student_id || !week) {
      return Response.json(
        { error: 'student_id and week are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('attendance')
      .upsert(
        {
          student_id,
          week,
          attended:  attended  ?? false,
          cancelled: cancelled ?? false,
          notes:     notes     ?? '',
        },
        { onConflict: 'student_id,week' }
      );

    if (error) throw error;

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
