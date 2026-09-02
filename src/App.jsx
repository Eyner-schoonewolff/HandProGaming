import { Toaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import { AppProvider } from '@/lib/AppContext';
import RoleGuard from '@/components/RoleGuard';
import Layout from '@/components/Layout';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Settings from '@/pages/Settings';

import StudentDashboard from '@/pages/StudentDashboard';
import StudentCourses from '@/pages/StudentCourses';
import StudentCourseDetail from '@/pages/StudentCourseDetail';
import StudentActivities from '@/pages/StudentActivities';
import StudentActivityDetail from '@/pages/StudentActivityDetail';
import StudentProgress from '@/pages/StudentProgress';
import StudentTutorial from '@/pages/StudentTutorial';

import FreeEditor from '@/pages/FreeEditor';

import ProfessorDashboard from '@/pages/ProfessorDashboard';
import ProfessorCourses from '@/pages/ProfessorCourses';
import ProfessorCourseDetail from '@/pages/ProfessorCourseDetail';
import ProfessorNewActivity from '@/pages/ProfessorNewActivity';
import ProfessorActivityDetail from '@/pages/ProfessorActivityDetail';
import ProfessorDeliveries from '@/pages/ProfessorDeliveries';
import ProfessorDeliveryDetail from '@/pages/ProfessorDeliveryDetail';
import ProfessorStudents from '@/pages/ProfessorStudents';

import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminCourses from '@/pages/AdminCourses';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />

              {/* Protegidas (requieren sesión) */}
              <Route element={<RoleGuard roles={["estudiante", "profesor", "admin"]}><Layout /></RoleGuard>}>
                {/* Estudiante */}
                <Route path="/estudiante" element={<RoleGuard roles={["estudiante"]}><StudentDashboard /></RoleGuard>} />
                <Route path="/estudiante/cursos" element={<RoleGuard roles={["estudiante"]}><StudentCourses /></RoleGuard>} />
                <Route path="/estudiante/cursos/:cursoId" element={<RoleGuard roles={["estudiante"]}><StudentCourseDetail /></RoleGuard>} />
                <Route path="/estudiante/actividades" element={<RoleGuard roles={["estudiante"]}><StudentActivities /></RoleGuard>} />
                <Route path="/estudiante/actividades/:id" element={<RoleGuard roles={["estudiante"]}><StudentActivityDetail /></RoleGuard>} />
                <Route path="/estudiante/progreso" element={<RoleGuard roles={["estudiante"]}><StudentProgress /></RoleGuard>} />
                <Route path="/estudiante/tutorial" element={<RoleGuard roles={["estudiante"]}><StudentTutorial /></RoleGuard>} />

                {/* Editor libre (estudiante y profesor) */}
                <Route path="/editor" element={<RoleGuard roles={["estudiante", "profesor"]}><FreeEditor /></RoleGuard>} />

                {/* Profesor */}
                <Route path="/profesor" element={<RoleGuard roles={["profesor"]}><ProfessorDashboard /></RoleGuard>} />
                <Route path="/profesor/cursos" element={<RoleGuard roles={["profesor"]}><ProfessorCourses /></RoleGuard>} />
                <Route path="/profesor/cursos/:id" element={<RoleGuard roles={["profesor"]}><ProfessorCourseDetail /></RoleGuard>} />
                <Route path="/profesor/actividades/nueva" element={<RoleGuard roles={["profesor"]}><ProfessorNewActivity /></RoleGuard>} />
                <Route path="/profesor/actividades/:id" element={<RoleGuard roles={["profesor"]}><ProfessorActivityDetail /></RoleGuard>} />
                <Route path="/profesor/entregas" element={<RoleGuard roles={["profesor"]}><ProfessorDeliveries /></RoleGuard>} />
                <Route path="/profesor/entregas/:id" element={<RoleGuard roles={["profesor"]}><ProfessorDeliveryDetail /></RoleGuard>} />
                <Route path="/profesor/estudiantes" element={<RoleGuard roles={["profesor"]}><ProfessorStudents /></RoleGuard>} />

                {/* Administrador */}
                <Route path="/admin" element={<RoleGuard roles={["admin"]}><AdminDashboard /></RoleGuard>} />
                <Route path="/admin/usuarios" element={<RoleGuard roles={["admin"]}><AdminUsers /></RoleGuard>} />
                <Route path="/admin/cursos" element={<RoleGuard roles={["admin"]}><AdminCourses /></RoleGuard>} />

                {/* Transversal */}
                <Route path="/configuracion" element={<Settings />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;