'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import StudentsTable from '@/components/StudentsTable';
import AddStudentModal from '@/components/AddStudentModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveData, loadData } from '@/lib/storage';

export default function EstudiantesPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        // Guardar en localStorage
        await saveData('students', data);
      } else {
        // Si falla la API, intenta cargar desde localStorage
        const cachedData = await loadData('students');
        if (cachedData.length > 0) {
          console.log('[v0] Usando datos en caché');
          setStudents(cachedData);
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching students:', error);
      // Cargar desde localStorage si hay error de red
      const cachedData = await loadData('students');
      if (cachedData.length > 0) {
        console.log('[v0] Usando datos en caché después de error');
        setStudents(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: any) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      if (response.ok) {
        const newStudent = await response.json();
        await saveData('students', [...students, newStudent]);
        fetchStudents();
        setShowModal(false);
        alert('Estudiante agregado exitosamente');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error al agregar estudiante');
    }
  };

  const handleUpdateStudent = async (id: number, updates: any) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        const updatedStudents = students.map((s: any) => s.id === id ? updatedStudent : s);
        await saveData('students', updatedStudents);
        setStudents(updatedStudents);
        alert('Estudiante actualizado exitosamente');
      } else {
        alert('Error al actualizar el estudiante');
      }
    } catch (error) {
      console.error('[v0] Error updating student:', error);
      alert('Error de conexión al actualizar');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este estudiante? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const updatedStudents = students.filter((s: any) => s.id !== id);
          await saveData('students', updatedStudents);
          setStudents(updatedStudents);
          alert('Estudiante eliminado exitosamente');
        } else {
          alert('Error al eliminar el estudiante');
        }
      } catch (error) {
        console.error('[v0] Error deleting student:', error);
        alert('Error de conexión al eliminar');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
            <p className="text-gray-600 mt-2">Administra los estudiantes inscritos en el API</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Agregar Estudiante
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">Cargando estudiantes...</p>
            </CardContent>
          </Card>
        ) : (
          <StudentsTable
            students={students}
            onUpdate={handleUpdateStudent}
            onDelete={handleDeleteStudent}
          />
        )}

        {showModal && (
          <AddStudentModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddStudent}
          />
        )}
      </main>
    </div>
  );
}
