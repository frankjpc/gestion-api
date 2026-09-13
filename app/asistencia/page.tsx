'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AttendanceMatrix from '@/components/AttendanceMatrix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { saveData, loadData } from '@/lib/storage';

export default function AsistenciaPage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
        // Guardar en localStorage
        await saveData('attendance', data);
      } else {
        // Si falla la API, intenta cargar desde localStorage
        const cachedData = await loadData('attendance');
        if (cachedData.length > 0) {
          setAttendance(cachedData);
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching attendance:', error);
      // Cargar desde localStorage si hay error de red
      const cachedData = await loadData('attendance');
      if (cachedData.length > 0) {
        setAttendance(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (changes: Array<{ studentId: number; week: number; attended: boolean; cancelled: boolean }>) => {
    try {
      console.log('[v0] Saving attendance changes:', changes);
      
      // Actualizar datos locales
      const updatedAttendance = attendance.map((record: any) => {
        const changes_for_student = changes.filter(c => c.studentId === record.student_id);
        if (changes_for_student.length > 0) {
          return {
            ...record,
            weeks: {
              ...record.weeks,
              ...Object.fromEntries(
                changes_for_student.map(c => [
                  c.week,
                  {
                    attended: c.attended,
                    cancelled: c.cancelled,
                    notes: record.weeks[c.week]?.notes || ''
                  }
                ])
              )
            }
          };
        }
        return record;
      });

      setAttendance(updatedAttendance);
      
      // Guardar en IndexedDB
      await saveData('attendance', changes.map((c, idx) => ({
        id: `${c.studentId}-${c.week}-${idx}`,
        student_id: c.studentId,
        week: c.week,
        attended: c.attended,
        cancelled: c.cancelled,
        created_at: new Date().toISOString()
      })));

      // Sincronizar con servidor
      for (const change of changes) {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: change.studentId,
            week: change.week,
            attended: change.attended,
            cancelled: change.cancelled
          })
        });
      }

      // Recalcular calificaciones
      await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculateAll: true })
      });

      alert('Cambios guardados exitosamente');
    } catch (error) {
      console.error('[v0] Error saving attendance:', error);
      alert('Error al guardar los cambios');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
            <p className="text-gray-600 mt-2">Asistencia semanal (6 semanas)</p>
          </div>
          <Button 
            onClick={fetchAttendance}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Actualizar
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">Cargando datos de asistencia...</p>
            </CardContent>
          </Card>
        ) : attendance.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">No hay estudiantes registrados aún.</p>
            </CardContent>
          </Card>
        ) : (
          <AttendanceMatrix
            attendance={attendance}
            onSave={handleSaveAttendance}
          />
        )}
      </main>
    </div>
  );
}
