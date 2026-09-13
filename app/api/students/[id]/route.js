import { getDb, normalizeStudent } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(parseInt(id));

    if (!row) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    return Response.json({
      id:             row.id,
      name:           row.name,
      email:          row.email,
      identification: row.identification,   // cédula
      paid:           row.paid === 1,
      cancelled:      row.cancelled === 1,
      cancellation_date: row.cancellation_date ?? null,
      created_at:     row.created_at,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(parseInt(id));
    if (!existing) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const updated = {
      name: body.name ?? existing.name,
      email: body.email ?? existing.email,
      identification: body.identification ?? existing.identification,
      paid: body.paid !== undefined ? (body.paid ? 1 : 0) : existing.paid,
      cancelled: body.cancelled !== undefined ? (body.cancelled ? 1 : 0) : existing.cancelled,
      cancellation_date: body.cancellation_date !== undefined ? body.cancellation_date : existing.cancellation_date,
      updated_at: new Date().toISOString(),
    };

    db.prepare(`
      UPDATE students
      SET name = @name,
          email = @email,
          identification = @identification,
          paid = @paid,
          cancelled = @cancelled,
          cancellation_date = @cancellation_date,
          updated_at = @updated_at
      WHERE id = @id
    `).run({ ...updated, id: parseInt(id) });

    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(parseInt(id));
    return Response.json(normalizeStudent(row));
  } catch (error) {
    console.error('Error updating student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(parseInt(id));
    if (!existing) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // CASCADE will automatically delete attendance and grades
    db.prepare('DELETE FROM students WHERE id = ?').run(parseInt(id));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
