'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Student {
  id: number;
  name: string;
  email: string;
  identification: string;
  paid: boolean;
  cancelled: boolean;
  cancellation_date?: string;
}

interface StudentsTableProps {
  students: Student[];
  onUpdate: (id: number, updates: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function StudentsTable({ students, onUpdate, onDelete }: StudentsTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData({ ...student });
  };

  const handleSave = async (id: number) => {
    await onUpdate(id, editData);
    setEditingId(null);
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-gray-500">No hay estudiantes registrados aún.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Estudiantes Inscritos ({students.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-3 md:px-4 font-semibold text-gray-700">Nombre</th>
                <th className="hidden sm:table-cell text-left py-3 px-3 md:px-4 font-semibold text-gray-700">Cédula</th>
                <th className="hidden lg:table-cell text-left py-3 px-3 md:px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-3 md:px-4 font-semibold text-gray-700">Pago</th>
                <th className="text-center py-3 px-2 md:px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 md:px-4">
                    {editingId === student.id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{student.name}</span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell py-3 px-3 md:px-4 text-gray-600">
                    {editingId === student.id ? (
                      <input
                        type="text"
                        value={editData.identification}
                        onChange={(e) => setEditData({ ...editData, identification: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      student.identification
                    )}
                  </td>
                  <td className="hidden lg:table-cell py-3 px-3 md:px-4 text-gray-600">
                    {editingId === student.id ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="truncate">{student.email || '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 md:px-4">
                    {editingId === student.id ? (
                      <select
                        value={editData.paid ? 'true' : 'false'}
                        onChange={(e) => setEditData({ ...editData, paid: e.target.value === 'true' })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="true">Pagado</option>
                        <option value="false">Pendiente</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        student.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.paid ? 'Pagado' : 'Pendiente'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 md:px-4">
                    <div className="flex justify-center gap-1 md:gap-2">
                      {editingId === student.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSave(student.id)}
                            className="bg-green-600 text-white hover:bg-green-700 text-xs md:text-sm px-2 md:px-3"
                          >
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="bg-gray-400 text-white hover:bg-gray-500 text-xs md:text-sm px-2 md:px-3"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(student)}
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs md:text-sm px-2 md:px-3"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(student.id)}
                            className="bg-red-600 text-white hover:bg-red-700 text-xs md:text-sm px-2 md:px-3"
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
