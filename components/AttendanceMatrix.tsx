'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Week {
  attended: boolean;
  cancelled: boolean;
  notes: string;
}

interface AttendanceData {
  student_id: number;
  student_name: string;
  weeks: Record<number, Week>;
}

interface AttendanceMatrixProps {
  attendance: AttendanceData[];
  onSave: (changes: Array<{ studentId: number; week: number; attended: boolean; cancelled: boolean }>) => Promise<void>;
}

export default function AttendanceMatrix({
  attendance,
  onSave
}: AttendanceMatrixProps) {
  const [localAttendance, setLocalAttendance] = useState(attendance);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());

  const handleWeekClick = (
    studentId: number,
    week: number,
    currentAttended: boolean,
    currentCancelled: boolean
  ) => {
    setLocalAttendance(prev =>
      prev.map(record => {
        if (record.student_id === studentId) {
          return {
            ...record,
            weeks: {
              ...record.weeks,
              [week]: {
                ...record.weeks[week],
                attended: currentCancelled ? false : !currentAttended,
                cancelled: false
              }
            }
          };
        }
        return record;
      })
    );
    setChangedCells(prev => new Set(prev).add(`${studentId}-${week}`));
    setHasChanges(true);
  };

  const handleCancelClick = (
    e: React.MouseEvent,
    studentId: number,
    week: number,
    currentCancelled: boolean
  ) => {
    e.stopPropagation();
    setLocalAttendance(prev =>
      prev.map(record => {
        if (record.student_id === studentId) {
          return {
            ...record,
            weeks: {
              ...record.weeks,
              [week]: {
                ...record.weeks[week],
                cancelled: !currentCancelled,
                attended: !currentCancelled ? false : record.weeks[week].attended
              }
            }
          };
        }
        return record;
      })
    );
    setChangedCells(prev => new Set(prev).add(`${studentId}-${week}`));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const changes: Array<{ studentId: number; week: number; attended: boolean; cancelled: boolean }> = [];
      
      localAttendance.forEach(record => {
        [1, 2, 3, 4, 5, 6].forEach(week => {
          const newData = record.weeks[week];
          const oldData = attendance.find(a => a.student_id === record.student_id)?.weeks[week];
          
          if (oldData && (newData.attended !== oldData.attended || newData.cancelled !== oldData.cancelled)) {
            changes.push({
              studentId: record.student_id,
              week,
              attended: newData.attended,
              cancelled: newData.cancelled
            });
          }
        });
      });

      if (changes.length > 0) {
        await onSave(changes);
        setHasChanges(false);
        setChangedCells(new Set());
      }
    } catch (error) {
      console.error('[v0] Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Matriz de Asistencia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr>
                <th className="sticky left-0 bg-gray-100 text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 border-b border-gray-200 z-10">
                  Estudiante
                </th>
                {[1, 2, 3, 4, 5, 6].map((week) => (
                  <th
                    key={week}
                    className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-gray-700 border-b border-gray-200 min-w-16 md:min-w-20"
                  >
                    <span className="hidden md:inline">Semana {week}</span>
                    <span className="md:hidden">S{week}</span>
                  </th>
                ))}
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-700 border-b border-gray-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {localAttendance.map((record) => {
                const totalAttended = Object.values(record.weeks).filter(
                  (w) => w.attended && !w.cancelled
                ).length;

                return (
                  <tr key={record.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 bg-white py-3 px-4 font-medium text-gray-900 border-b border-gray-100 z-10">
                      {record.student_name}
                    </td>
                    {[1, 2, 3, 4, 5, 6].map((week) => {
                      const weekData = record.weeks[week];
                      const isCancelled = weekData.cancelled;
                      const isAttended = weekData.attended && !isCancelled;
                      const cellKey = `${record.student_id}-${week}`;
                      const isChanged = changedCells.has(cellKey);

                      return (
                        <td
                          key={week}
                          className={`text-center py-3 px-2 border-b border-gray-100 transition-all duration-300 ${
                            isChanged ? 'bg-yellow-100 scale-110' : ''
                          }`}
                        >
                          <div className="relative inline-flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleWeekClick(
                                  record.student_id,
                                  week,
                                  weekData.attended,
                                  isCancelled
                                )
                              }
                              className={`w-12 h-12 rounded-lg font-medium transition-colors cursor-pointer relative ${
                                isCancelled
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : isAttended
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {isCancelled ? 'X' : isAttended ? '✓' : '○'}
                            </button>

                            {!isCancelled && (
                              <button
                                onClick={(e) =>
                                  handleCancelClick(e, record.student_id, week, false)
                                }
                                title="Marcar como cancelado"
                                className="text-gray-400 hover:text-gray-600 text-sm"
                              >
                                ✕
                              </button>
                            )}

                            {isCancelled && (
                              <button
                                onClick={(e) =>
                                  handleCancelClick(e, record.student_id, week, true)
                                }
                                title="Quitar cancelación"
                                className="text-red-400 hover:text-red-600 text-sm"
                              >
                                ↺
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-4 font-semibold text-blue-600 border-b border-gray-100">
                      {totalAttended}/6
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">Leyenda:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ = Presente (click para marcar/desmarcar)</li>
              <li>○ = Ausente (click para marcar presente)</li>
              <li>X = Cancelado (no cuenta en calificación)</li>
              <li>✕ = Click para cancelar esta semana</li>
              <li>↺ = Click para quitar cancelación</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : hasChanges ? 'Guardar Cambios' : 'Sin cambios'}
            </Button>
            {hasChanges && (
              <p className="text-sm text-yellow-700 flex items-center">
                ⚠️ Tienes cambios sin guardar
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
