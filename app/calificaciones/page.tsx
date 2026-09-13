'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import GradesTable from '@/components/GradesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { saveData, loadData } from '@/lib/storage';

export default function CalificacionesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grades');
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
        // Guardar en localStorage
        await saveData('grades', data);
      } else {
        // Si falla la API, intenta cargar desde localStorage
        const cachedData = await loadData('grades');
        if (cachedData.length > 0) {
          setGrades(cachedData);
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching grades:', error);
      // Cargar desde localStorage si hay error de red
      const cachedData = await loadData('grades');
      if (cachedData.length > 0) {
        setGrades(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateGrades = async () => {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculateAll: true })
      });

      if (response.ok) {
        const updatedGrades = await response.json();
        await saveData('grades', Array.isArray(updatedGrades) ? updatedGrades : grades);
        fetchGrades();
        alert('Calificaciones recalculadas exitosamente');
      }
    } catch (error) {
      console.error('Error recalculating grades:', error);
      alert('Error al recalcular calificaciones');
    }
  };

  const handleExportCSV = () => {
    if (grades.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Create CSV content
    const headers = ['Nombre', 'Semanas Asistidas', 'Calificación Final', 'Estado'];
    const rows = grades.map(g => [
      g.student_name,
      g.weeks_attended,
      g.final_grade,
      g.cancelled ? 'Cancelado' : 'Activo'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `calificaciones_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calificaciones</h1>
            <p className="text-gray-600 mt-2">Calificaciones automáticas basadas en asistencia (0-5)</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRecalculateGrades}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Recalcular
            </Button>
            <Button 
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700"
            >
              Descargar CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">Cargando calificaciones...</p>
            </CardContent>
          </Card>
        ) : grades.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">No hay calificaciones aún. Asegúrate de registrar asistencia primero.</p>
            </CardContent>
          </Card>
        ) : (
          <GradesTable grades={grades} />
        )}
      </main>
    </div>
  );
}
