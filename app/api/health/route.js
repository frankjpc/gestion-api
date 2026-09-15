import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const [studentsRes, attendanceRes, gradesRes] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('attendance').select('*', { count: 'exact', head: true }),
      supabase.from('grades').select('*', { count: 'exact', head: true }),
    ]);

    if (studentsRes.error)   throw studentsRes.error;
    if (attendanceRes.error) throw attendanceRes.error;
    if (gradesRes.error)     throw gradesRes.error;

    return Response.json({
      status:  'ok',
      message: 'Database is ready (Supabase)',
      data: {
        students:          studentsRes.count,
        attendance_records: attendanceRes.count,
        grades:            gradesRes.count,
      },
    });
  } catch (error) {
    console.error('[health] check error:', error);
    return Response.json({
      status:  'error',
      message: 'Database connection failed',
      details: error.message,
    }, { status: 500 });
  }
}
