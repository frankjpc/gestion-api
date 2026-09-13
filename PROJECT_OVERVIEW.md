# Resumen del Proyecto

## Descripción General

Esta aplicación es un **Sistema de Gestión de Asistencia y Calificaciones** para un API Deportivo Universitario. Permite registrar la asistencia semanal de estudiantes durante 6 semanas y calcular automáticamente sus calificaciones basadas en la asistencia.

## Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Node.js
- **Base de Datos**: MySQL 8+
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gestor de Paquetes**: pnpm

## Estructura del Proyecto

```
/vercel/share/v0-project/
├── app/
│   ├── api/                          # API Routes (Backend)
│   │   ├── health/route.js           # Health check de la BD
│   │   ├── students/
│   │   │   ├── route.js              # GET/POST estudiantes
│   │   │   └── [id]/route.js         # GET/PUT/DELETE estudiante
│   │   ├── attendance/route.js       # GET/POST asistencia
│   │   └── grades/route.js           # GET/POST calificaciones
│   ├── estudiantes/page.tsx          # Página de gestión de estudiantes
│   ├── asistencia/page.tsx           # Página de asistencia
│   ├── calificaciones/page.tsx       # Página de calificaciones
│   ├── page.tsx                      # Dashboard principal
│   ├── layout.tsx                    # Layout raíz
│   └── globals.css                   # Estilos globales
├── components/
│   ├── Navigation.tsx                # Barra de navegación
│   ├── StudentsTable.tsx             # Tabla de estudiantes
│   ├── AddStudentModal.tsx           # Modal para agregar estudiante
│   ├── AttendanceMatrix.tsx          # Matriz de asistencia
│   ├── GradesTable.tsx               # Tabla de calificaciones
│   └── ui/                           # Componentes shadcn/ui
├── lib/
│   └── db.js                         # Pool de conexión MySQL
├── scripts/
│   └── init-db.js                    # Script de inicialización de BD
├── public/                           # Archivos estáticos
├── styles/                           # Estilos adicionales
├── SETUP.md                          # Guía de instalación
├── PROJECT_OVERVIEW.md               # Este archivo
├── package.json                      # Dependencias
├── tsconfig.json                     # Configuración TypeScript
└── tailwind.config.ts                # Configuración Tailwind
```

## Funcionalidades Clave

### 1. Gestión de Estudiantes
- **Crear**: Agregar nuevos estudiantes con nombre, cédula y email
- **Leer**: Visualizar lista completa de estudiantes
- **Actualizar**: Editar información y estado de cancelación
- **Eliminar**: Remover estudiantes (con cascada a datos relacionados)

### 2. Registro de Asistencia
- Matriz interactiva de 6 semanas × estudiantes
- Estados: Presente (✓), Ausente (○), Cancelado (X)
- Actualización en tiempo real
- Cálculo automático del total de semanas

### 3. Calificaciones Automáticas
- Cálculo: `final_grade = min(semanas_asistidas, 5)`
- Rango: 0-5 puntos
- Si estudiante está cancelado: `final_grade = 0`
- Recálculo automático al cambiar asistencia

### 4. Cancelación
- Marcar estudiantes como cancelados
- Registro de fecha de cancelación
- Marca visual en toda la interfaz
- Excluye de cálculos de calificación

### 5. Reportes
- Estadísticas en el dashboard
- Exportación a CSV
- Visualización de promedios

## Flujo de Datos

```
Estudiante → Asistencia (6 semanas) → Calificación (0-5)
                                          ↓
                                    Si canceled=true
                                          ↓
                                    final_grade = 0
```

## API Endpoints

### Estudiantes
- `GET /api/students` - Obtener todos los estudiantes
- `POST /api/students` - Crear nuevo estudiante
- `GET /api/students/[id]` - Obtener estudiante específico
- `PUT /api/students/[id]` - Actualizar estudiante
- `DELETE /api/students/[id]` - Eliminar estudiante

### Asistencia
- `GET /api/attendance` - Obtener matriz de asistencia
- `POST /api/attendance` - Registrar/actualizar asistencia

### Calificaciones
- `GET /api/grades` - Obtener calificaciones
- `POST /api/grades` - Recalcular todas las calificaciones

### Health Check
- `GET /api/health` - Verificar estado de la BD

## Variables de Entorno

```env
DB_HOST=localhost           # Host del servidor MySQL
DB_USER=usuario            # Usuario de MySQL
DB_PASSWORD=contraseña     # Contraseña de MySQL
DB_NAME=nombre_bd          # Nombre de la base de datos
```

## Esquema de Datos

### students
- id (INT, PK)
- name (VARCHAR 255)
- email (VARCHAR 255, nullable)
- identification (VARCHAR 50, UNIQUE)
- cancelled (BOOLEAN, default false)
- cancellation_date (DATE, nullable)
- created_at, updated_at (TIMESTAMP)

### attendance
- id (INT, PK)
- student_id (INT, FK → students)
- week (INT, 1-6)
- attended (BOOLEAN)
- cancelled (BOOLEAN)
- notes (VARCHAR 255)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(student_id, week)

### grades
- id (INT, PK)
- student_id (INT, FK → students)
- weeks_attended (INT, 0-6)
- final_grade (INT, 0-5)
- cancelled (BOOLEAN)
- notes (VARCHAR 255)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(student_id)

## Componentes React

### Páginas
- `EstudiantesPage` - Gestión de estudiantes
- `AsistenciaPage` - Registro de asistencia
- `CalificacionesPage` - Visualización de calificaciones
- `HomePage` - Dashboard principal

### Componentes Reutilizables
- `Navigation` - Barra de navegación
- `StudentsTable` - Tabla con edición inline
- `AddStudentModal` - Modal de agregar estudiante
- `AttendanceMatrix` - Matriz interactiva de asistencia
- `GradesTable` - Tabla con estadísticas de calificaciones

## Consideraciones de Diseño

- **Sin Autenticación**: Acceso público a toda la aplicación
- **Actualización en Tiempo Real**: La UI se sincroniza con cambios en BD
- **Cascada de Datos**: Eliminar estudiante elimina datos relacionados
- **Validaciones**: Campos requeridos en formularios
- **UX Intuitiva**: Interfaz limpia y fácil de usar
- **Responsive**: Funciona en dispositivos móviles y escritorio

## Flujos Principales

### 1. Crear Estudiante
```
Click "Agregar Estudiante" 
  → Modal abierto 
  → Llenar formulario 
  → POST /api/students 
  → Tabla actualizada
```

### 2. Registrar Asistencia
```
Click celda en matriz 
  → Toggle estado (presente/ausente) 
  → POST /api/attendance 
  → POST /api/grades (recalcular) 
  → Matriz actualizada
```

### 3. Cancelar Estudiante
```
Click "Cancelar" en estudiante 
  → PUT /api/students/[id] (cancelled=true) 
  → final_grade = 0 
  → Estado visual actualizado
```

## Próximas Mejoras Potenciales

- Autenticación de usuarios (profesor/admin)
- Historial de cambios/auditoría
- Gráficos de progreso
- Importación de estudiantes desde CSV
- Notificaciones por email
- Backup automático de datos
- Paginación en tablas grandes
- Búsqueda y filtrado avanzado

## Deployment

Para desplegar en Vercel:
1. Push del código a GitHub
2. Conectar en Vercel dashboard
3. Configurar variables de entorno
4. Deploy automático

## Troubleshooting

### Problema: La BD no conecta
- Verificar credenciales en `.env.local`
- Verificar que MySQL está corriendo
- Verificar que la BD existe

### Problema: Tablas no creadas
- Ejecutar `node scripts/init-db.js`
- Ver que no haya errores en la salida

### Problema: Cambios no se guardan
- Abrir DevTools → Console
- Ver qué error devuelve la API
- Verificar que la BD está conectada

## Contribución

Para contribuir:
1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

**Versión**: 1.0.0  
**Estado**: Producción  
**Última actualización**: Mayo 2026
