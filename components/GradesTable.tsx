'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Grade {
  id: number;
  student_id: number;
  student_name: string;
  weeks_attended: number;
  final_grade: number;
  cancelled: boolean;
  paid: boolean;
  notes?: string;
}

interface GradesTableProps {
  grades: Grade[];
}

export default function GradesTable({ grades }: GradesTableProps) {
  const getGradeColor = (grade: number, cancelled: boolean) => {
    if (cancelled) return 'bg-red-100 text-red-900';
    if (grade === 5) return 'bg-green-100 text-green-900';
    if (grade >= 4) return 'bg-blue-100 text-blue-900';
    if (grade >= 3) return 'bg-yellow-100 text-yellow-900';
    return 'bg-orange-100 text-orange-900';
  };

  const sortedGrades = [...grades].sort((a, b) => {
    // Sort cancelled at the end
    if (a.cancelled && !b.cancelled) return 1;
    if (!a.cancelled && b.cancelled) return -1;
    // Then by grade descending
    return b.final_grade - a.final_grade;
  });

  const averageGrade = grades
    .filter(g => !g.cancelled)
    .reduce((sum, g) => sum + g.final_grade, 0) / grades.filter(g => !g.cancelled).length;

  const cancelledCount = grades.filter(g => g.cancelled).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-lg text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{grades.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-lg text-gray-600">Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {isNaN(averageGrade) ? '0' : averageGrade.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">sin cancel.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-lg text-gray-600">Máximo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {Math.max(...grades.filter(g => !g.cancelled).map(g => g.final_grade), 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">grado alto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-lg text-gray-600">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-red-600">{cancelledCount}</div>
            <p className="text-xs text-gray-500 mt-1">estudiantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Calificaciones por Estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">Sem.</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700">Calif.</th>
                  <th className="hidden sm:table-cell text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700">Pago</th>
                  <th className="hidden md:table-cell text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700">Estado</th>
                  <th className="hidden lg:table-cell text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700">Notas</th>
                </tr>
              </thead>
              <tbody>
                {sortedGrades.map((grade) => (
                  <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900 truncate">{grade.student_name}</td>
                    <td className="text-center py-2 md:py-3 px-2 md:px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full font-semibold text-gray-900 text-xs md:text-base">
                        {grade.cancelled ? '-' : grade.weeks_attended}
                      </span>
                    </td>
                    <td className="text-center py-2 md:py-3 px-2 md:px-4">
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-base md:text-lg ${getGradeColor(
                          grade.final_grade,
                          grade.cancelled
                        )}`}
                      >
                        {grade.cancelled ? 'X' : grade.final_grade}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell text-center py-2 md:py-3 px-2 md:px-4">
                      <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                        grade.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {grade.paid ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell text-center py-2 md:py-3 px-2 md:px-4">
                      {grade.cancelled ? (
                        <span className="inline-flex items-center px-2 md:px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs md:text-sm font-medium">
                          Cancelado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 md:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs md:text-sm font-medium">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell py-2 md:py-3 px-2 md:px-4 text-gray-600 text-xs md:text-sm truncate">{grade.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Grading Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Escala de Calificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {[
              { semanas: '0-1', grado: 0, color: 'bg-orange-100 text-orange-900' },
              { semanas: '2', grado: 2, color: 'bg-yellow-100 text-yellow-900' },
              { semanas: '3', grado: 3, color: 'bg-yellow-100 text-yellow-900' },
              { semanas: '4', grado: 4, color: 'bg-blue-100 text-blue-900' },
              { semanas: '5-6', grado: 5, color: 'bg-green-100 text-green-900' },
              { semanas: 'Cancel.', grado: 'X', color: 'bg-red-100 text-red-900' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold mx-auto mb-1 md:mb-2 text-sm md:text-base ${item.color}`}>
                  {item.grado}
                </div>
                <p className="text-xs md:text-sm text-gray-700">{item.semanas}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
