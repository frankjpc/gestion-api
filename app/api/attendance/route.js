import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const students = db.prepare('SELECT * FROM students ORDER BY name').all();
    const attendance = db.prepare('SELECT * FROM attendance').all();

    // Build the attendance matrix: one row per student, weeks 1-6
    const attendanceMatrix = students.map((student) => {
      const studentRecords = attendance.filter((a) => a.student_id === student.id);
      const weeks = {};
      for (let w = 1; w <= 6; w++) {
        const record = studentRecords.find((r) => r.week === w);
        weeks[w] = {
          attended: record ? record.attended === 1 : false,
          cancelled: record ? record.cancelled === 1 : false,
          notes: record?.notes || '',
        };
      }
      return {
        student_id: student.id,
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

    const db = getDb();

    // Upsert: insert or replace if (student_id, week) already exists
    db.prepare(`
      INSERT INTO attendance (student_id, week, attended, cancelled, notes, updated_at)
      VALUES (@student_id, @week, @attended, @cancelled, @notes, @updated_at)
      ON CONFLICT(student_id, week) DO UPDATE SET
        attended   = excluded.attended,
        cancelled  = excluded.cancelled,
        notes      = excluded.notes,
        updated_at = excluded.updated_at
    `).run({
      student_id,
      week,
      attended: attended ? 1 : 0,
      cancelled: cancelled ? 1 : 0,
      notes: notes || '',
      updated_at: new Date().toISOString(),
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
