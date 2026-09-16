'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { loadData } from '@/lib/storage';

export default function Home() {
  const [dbStatus, setDbStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalStudents: 0,
    cancelledStudents: 0,
    totalPaid: 0
  });

  useEffect(() => {
    checkDatabaseStatus();
    fetchStats();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setDbStatus(data.status);
    } catch (error) {
      setDbStatus('error');
    }
  };

  const fetchStats = async () => {
    try {
      const [studentsRes] = await Promise.all([
        fetch('/api/students')
      ]);

      let students = [];
      
      if (studentsRes.ok) {
        students = await studentsRes.json();
      } else {
        // Si falla la API, intenta cargar desde localStorage
        students = await loadData('students');
      }

      const cancelledCount = students.filter((s: any) => s.cancelled).length;
      const paidCount = students.filter((s: any) => s.paid).length;

      setStats({
        totalStudents: students.length,
        cancelledStudents: cancelledCount,
        totalPaid: paidCount
      });
    } catch (error) {
      console.error('[v0] Error fetching stats:', error);
      // Cargar desde localStorage si hay error
      const cachedStudents = await loadData('students');
      if (cachedStudents.length > 0) {
        const cancelledCount = cachedStudents.filter((s: any) => s.cancelled).length;
        const paidCount = cachedStudents.filter((s: any) => s.paid).length;
        setStats({
          totalStudents: cachedStudents.length,
          cancelledStudents: cancelledCount,
          totalPaid: paidCount
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Gestión API Deportivo</h1>
          <p className="text-base md:text-xl text-gray-600">Sistema de asistencia y calificaciones</p>
        </div>

        {dbStatus === 'uninitialized' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Base de datos no inicializada</CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-800">
              <p className="mb-4">
                Necesitas inicializar la base de datos antes de usar la aplicación.
              </p>
              <p className="text-sm">
                Ejecuta: <code className="bg-yellow-100 px-2 py-1 rounded">node scripts/init-db.js</code>
              </p>
            </CardContent>
          </Card>
        )}

        {dbStatus === 'error' && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error de conexión a Supabase</CardTitle>
            </CardHeader>
            <CardContent className="text-red-800 space-y-3">
              <p className="font-semibold">No se pudo conectar con la base de datos.</p>
              <p className="text-sm">Si estás en Vercel, asegúrate de haber configurado las siguientes <strong>Environment Variables</strong>:</p>
              <ul className="text-sm list-disc list-inside space-y-2">
                <li><code className="bg-red-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code className="bg-red-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code></li>
              </ul>
              <p className="text-sm mt-4 pt-4 border-t border-red-200">
                Una vez agregadas, debes hacer un <strong>Redeploy</strong> en Vercel para que tomen efecto.
              </p>
            </CardContent>
          </Card>
        )}

        {dbStatus === 'ok' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg text-gray-600">Estudiantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{stats.totalStudents}</div>
                {stats.cancelledStudents > 0 && (
                  <p className="text-xs md:text-sm text-gray-500 mt-2">
                    {stats.cancelledStudents} cancelados
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg text-gray-600">Pagados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-green-600">
                  {stats.totalPaid}
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-2">estudiantes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg text-gray-600">Semanas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-green-600">6</div>
                <p className="text-xs md:text-sm text-gray-500 mt-2">total de semanas</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Link href="/estudiantes" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg">Gestionar Estudiantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Crear, editar y gestionar estudiantes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/asistencia" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg">Asistencia Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Registrar asistencia de 6 semanas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calificaciones" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg">Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Ver calificaciones automáticas
                </p>
              </CardContent>
            </Card>
          </Link>

          <div className="group">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg">Estado BD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    dbStatus === 'ok' ? 'bg-green-500' :
                    dbStatus === 'uninitialized' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-xs md:text-sm font-medium">
                    {dbStatus === 'ok' ? 'Conectada' :
                     dbStatus === 'uninitialized' ? 'No inicializada' :
                     'Error'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
