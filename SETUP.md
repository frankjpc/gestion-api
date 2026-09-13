# Gestión API Deportivo - Guía de Instalación

Sistema web para gestionar asistencia y calificaciones de un API deportivo universitario.

## Requisitos Previos

- Node.js 18+ y pnpm
- MySQL 8+ con acceso remoto o local
- Variables de entorno configuradas

## Pasos de Instalación

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
```

Reemplaza los valores con tus credenciales reales.

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Inicializar la Base de Datos

Ejecuta el script de inicialización para crear las tablas necesarias:

```bash
node scripts/init-db.js
```

Deberías ver mensajes de éxito:
```
✓ Students table created
✓ Attendance table created
✓ Grades table created
✓ Database initialized successfully!
```

### 4. Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura de la Aplicación

### Páginas Principales

- **Dashboard** (`/`) - Resumen general y estado de la base de datos
- **Estudiantes** (`/estudiantes`) - Gestión de estudiantes (agregar, editar, cancelar)
- **Asistencia** (`/asistencia`) - Matriz de asistencia semanal (6 semanas)
- **Calificaciones** (`/calificaciones`) - Calificaciones automáticas y reportes

### API Routes

- **GET/POST `/api/students`** - Obtener lista de estudiantes o crear nuevo
- **GET/PUT/DELETE `/api/students/[id]`** - Operaciones con estudiante específico
- **GET/POST `/api/attendance`** - Matriz de asistencia y registro de asistencia
- **GET/POST `/api/grades`** - Obtener calificaciones o recalcular todas
- **GET `/api/health`** - Verificar estado de conexión a la BD

## Funcionalidades Principales

### Gestión de Estudiantes
- Crear nuevos estudiantes (nombre, cédula, email)
- Editar información de estudiantes
- Marcar estudiantes como cancelados con fecha
- Eliminar estudiantes (cascada a asistencia y calificaciones)

### Asistencia Semanal
- Matriz interactiva de 6 semanas × estudiantes
- Marcar asistencia (✓ = presente, ○ = ausente)
- Marcar cancelación por semana (X = cancelado)
- Visualizar total de semanas asistidas por estudiante

### Calificaciones Automáticas
- Escala: 0-5 puntos
- Cálculo: `final_grade = min(semanas_asistidas, 5)`
- Si estudiante está cancelado: `final_grade = 0`
- Mostrar estado de cancelación
- Exportar calificaciones a CSV

## Esquema de Base de Datos

### Tabla `students`
```sql
id (INT, PK)
name (VARCHAR)
email (VARCHAR)
identification (VARCHAR, UNIQUE)
cancelled (BOOLEAN)
cancellation_date (DATE)
created_at, updated_at (TIMESTAMP)
```

### Tabla `attendance`
```sql
id (INT, PK)
student_id (INT, FK)
week (INT, 1-6)
attended (BOOLEAN)
cancelled (BOOLEAN)
notes (VARCHAR)
created_at, updated_at (TIMESTAMP)
UNIQUE(student_id, week)
```

### Tabla `grades`
```sql
id (INT, PK)
student_id (INT, FK)
weeks_attended (INT)
final_grade (INT, 0-5)
cancelled (BOOLEAN)
notes (VARCHAR)
created_at, updated_at (TIMESTAMP)
UNIQUE(student_id)
```

## Resolución de Problemas

### Error: "connect ECONNREFUSED"
- Verifica que tu MySQL está en ejecución
- Verifica las credenciales en `.env.local`
- Comprueba que la base de datos existe

### Tabla "uninitialized" en el Dashboard
- Ejecuta `node scripts/init-db.js` nuevamente
- Verifica que el script no tuvo errores

### Cambios de asistencia no se guardan
- Abre el navegador DevTools (F12) para ver errores en consola
- Verifica que la API está respondiendo en `/api/attendance`

## Características del Sistema

✓ Interfaz intuitiva sin autenticación (acceso público)
✓ Gestión completa de estudiantes
✓ Matriz de asistencia interactiva
✓ Calificaciones automáticas con lógica personalizada
✓ Cancelación de estudiantes con registro de fecha
✓ Exportación de datos a CSV
✓ Responsive design (móvil y escritorio)
✓ Estado en tiempo real de la BD

## Notas Importantes

- El sistema NO requiere autenticación (acceso público)
- Las calificaciones se recalculan automáticamente al cambiar asistencia
- La cancelación de un estudiante pone su calificación en 0
- Los datos de cancelación se registran con fecha para auditoría
- Exportar CSV es útil para reportes y respaldos

## Contacto y Soporte

Para reportar bugs o solicitar características, por favor crea un issue en el repositorio.

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2026
