import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const rows = db.prepare(`
      SELECT g.*, s.name AS student_name, s.paid
      FROM grades g
      JOIN students s ON g.student_id = s.id
      ORDER BY s.name
    `).all();

    const result = rows.map((row) => ({
      ...row,
      cancelled: row.cancelled === 1,
      paid: row.paid === 1,
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

    const db = getDb();
    const students = db.prepare('SELECT * FROM students').all();

    const upsertGrade = db.prepare(`
      INSERT INTO grades (student_id, weeks_attended, final_grade, cancelled, updated_at)
      VALUES (@student_id, @weeks_attended, @final_grade, @cancelled, @updated_at)
      ON CONFLICT(student_id) DO UPDATE SET
        weeks_attended = excluded.weeks_attended,
        final_grade    = excluded.final_grade,
        cancelled      = excluded.cancelled,
        updated_at     = excluded.updated_at
    `);

    // Run all upserts in a single transaction for performance
    const calculateAll_tx = db.transaction(() => {
      for (const student of students) {
        if (student.cancelled === 1) {
          upsertGrade.run({
            student_id: student.id,
            weeks_attended: 0,
            final_grade: 0,
            cancelled: 1,
            updated_at: new Date().toISOString(),
          });
        } else {
          const weeksAttended = db.prepare(`
            SELECT COUNT(*) AS cnt
            FROM attendance
            WHERE student_id = ? AND attended = 1 AND cancelled = 0
          `).get(student.id).cnt;

          const finalGrade = Math.min(weeksAttended, 5);

          upsertGrade.run({
            student_id: student.id,
            weeks_attended: weeksAttended,
            final_grade: finalGrade,
            cancelled: 0,
            updated_at: new Date().toISOString(),
          });
        }
      }
    });

    calculateAll_tx();

    return Response.json({ success: true, message: 'All grades calculated' });
  } catch (error) {
    console.error('Error calculating grades:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
