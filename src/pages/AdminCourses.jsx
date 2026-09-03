import React, { useState } from "react";
import {
BookOpen,
Search,
Users,
ClipboardList,
UserRound,
ChevronDown,
ChevronUp,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function AdminCourses() {
const { db } = useApp();
const [search, setSearch] = useState("");
const [profesor, setProfesor] = useState("todos");
const [cursoAbierto, setCursoAbierto] = useState(null);

const cursos = db.cursos.filter((c) => {
const texto = String(search || "").toLowerCase();


const coincide =
  String(c.nombre || "").toLowerCase().includes(texto) ||
  String(c.codigo || "").toLowerCase().includes(texto);

return coincide && (profesor === "todos" || c.profesorId === profesor);


});

const profesores = db.users.filter((u) =>
db.cursos.some((c) => c.profesorId === u.id)
);

const toggleCurso = (id) => {
setCursoAbierto(cursoAbierto === id ? null : id);
};

return ( <div className="space-y-6"> <div> <h1 className="text-2xl font-bold text-slate-900">
Administrar cursos </h1> <p className="text-sm text-slate-500">
Gestiona el catálogo de cursos y sus estudiantes </p> </div>


  {db.cursos.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
      <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm text-slate-500">
        No hay cursos registrados.
      </p>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <BookOpen className="mb-2 text-indigo-500" />
          <p className="text-sm text-slate-500">Cursos</p>
          <p className="text-2xl font-bold">{db.cursos.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Users className="mb-2 text-blue-500" />
          <p className="text-sm text-slate-500">Estudiantes</p>
          <p className="text-2xl font-bold">{db.matriculas.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ClipboardList className="mb-2 text-green-500" />
          <p className="text-sm text-slate-500">Actividades</p>
          <p className="text-2xl font-bold">{db.actividades.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar curso o código..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <select
          value={profesor}
          onChange={(e) => setProfesor(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
        >
          <option value="todos">Todos los profesores</option>

          {profesores.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Profesor</th>
              <th className="px-4 py-3">Actividades</th>
              <th className="px-4 py-3">Estudiantes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {cursos.map((c) => {
              const prof = db.users.find(
                (u) => u.id === c.profesorId
              );

              const estudiantes = db.matriculas.filter(
                (m) => m.cursoId === c.id
              );

              const nActs = db.actividades.filter(
                (a) => a.cursoId === c.id
              ).length;

              const abierto = cursoAbierto === c.id;

              return (
                <React.Fragment key={c.id}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-indigo-500" />

                        <div>
                          <p className="font-medium text-slate-800">
                            {c.nombre}
                          </p>

                          <p className="text-xs text-slate-400">
                            {c.descripcion}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {c.codigo}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <UserRound size={15} />
                        {prof?.nombre || "Sin asignar"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {nActs}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleCurso(c.id)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Users size={16} />
                        <span>{estudiantes.length}</span>

                        {abierto ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                  </tr>

                  {abierto && (
                    <tr>
                      <td
                        colSpan="5"
                        className="bg-slate-50 px-6 py-4"
                      >
                        <p className="mb-3 font-medium text-slate-700">
                          Estudiantes matriculados
                        </p>

                        {estudiantes.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No hay estudiantes matriculados en este curso.
                          </p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {estudiantes.map((matricula) => {
                              const estudiante = db.users.find(
                                (u) => u.id === matricula.usuarioId
                              );

                              return (
                                <div
                                  key={matricula.id}
                                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                                >
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                    <UserRound size={17} />
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-slate-700">
                                      {estudiante?.nombre || "Estudiante"}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                      {estudiante?.email || ""}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>


);
}
