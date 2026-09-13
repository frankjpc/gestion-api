import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const studentsCount    = db.prepare('SELECT COUNT(*) AS cnt FROM students').get().cnt;
    const attendanceCount  = db.prepare('SELECT COUNT(*) AS cnt FROM attendance').get().cnt;
    const gradesCount      = db.prepare('SELECT COUNT(*) AS cnt FROM grades').get().cnt;

    return Response.json({
      status: 'ok',
      message: 'Database is ready (SQLite)',
      data: {
        students: studentsCount,
        attendance_records: attendanceCount,
        grades: gradesCount,
      },
    });
  } catch (error) {
    console.error('[health] check error:', error);
    return Response.json({
      status: 'error',
      message: 'Database initialization failed',
      details: error.message,
    }, { status: 500 });
  }
}
