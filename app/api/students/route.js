import { getDb, normalizeStudent } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM students ORDER BY name').all();

    const result = rows.map((row) => ({
      id:             row.id,
      name:           row.name,
      email:          row.email,
      identification: row.identification,   // cédula
      paid:           row.paid === 1,
      cancelled:      row.cancelled === 1,
      cancellation_date: row.cancellation_date ?? null,
      created_at:     row.created_at,
    }));

    return Response.json(result);
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

    const db = getDb();

    // Check for duplicate identification
    const existing = db.prepare('SELECT id FROM students WHERE identification = ?').get(identification);
    if (existing) {
      return Response.json(
        { error: 'Student with this identification already exists' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO students (name, email, identification, paid)
      VALUES (@name, @email, @identification, @paid)
    `);

    const result = stmt.run({
      name,
      email: email || '',
      identification,
      paid: paid ? 1 : 0,
    });

    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    return Response.json(normalizeStudent(newStudent), { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
