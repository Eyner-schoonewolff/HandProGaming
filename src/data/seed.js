/**
 * Datos semilla del MVP. Se cargan una única vez en localStorage y desde ahí
 * la app trabaja sobre esa copia (ver src/lib/AppContext.jsx).
 */

const dias = (n) => new Date(Date.now() + n * 86400000).toISOString();
const fecha = (n) => dias(n).slice(0, 10);

export const CUENTAS_DEMO = {
  estudiante: { correo: "ana@demo.co", password: "demo1234" },
  profesor: { correo: "luis@demo.co", password: "demo1234" },
  admin: { correo: "admin@demo.co", password: "demo1234" },
};

const programaSaludo = {
  id: "prog_saludo",
  actualizadoEn: dias(-13),
  bloques: [
    { id: "sb1", tipo: "inicio", parametros: {}, siguienteId: "sb2" },
    { id: "sb2", tipo: "salida", parametros: { expresion: '"Hola mundo"' }, siguienteId: "sb3" },
    { id: "sb3", tipo: "fin", parametros: {}, siguienteId: null },
  ],
};

export function datosSemilla() {
  return {
    users: [
      { id: "usr_ana", nombre: "Ana Gómez", correo: "ana@demo.co", password: "demo1234", rol: "estudiante", activo: true, creadoEn: dias(-40) },
      { id: "usr_carlos", nombre: "Carlos Ruiz", correo: "carlos@demo.co", password: "demo1234", rol: "estudiante", activo: true, creadoEn: dias(-38) },
      { id: "usr_sofia", nombre: "Sofía Peña", correo: "sofia@demo.co", password: "demo1234", rol: "estudiante", activo: true, creadoEn: dias(-30) },
      { id: "usr_luis", nombre: "Luis Martínez", correo: "luis@demo.co", password: "demo1234", rol: "profesor", activo: true, creadoEn: dias(-60) },
      { id: "usr_admin", nombre: "Marta Admin", correo: "admin@demo.co", password: "demo1234", rol: "admin", activo: true, creadoEn: dias(-90) },
    ],

    cursos: [
      {
        id: "cur_logica",
        nombre: "Lógica de programación I",
        descripcion: "Primer contacto con secuencias, variables, condicionales y ciclos usando bloques visuales.",
        profesorId: "usr_luis",
        codigo: "LOG-101",
        color: "indigo",
        totalActividades: 3,
      },
      {
        id: "cur_algoritmos",
        nombre: "Pensamiento algorítmico",
        descripcion: "Resolución de problemas paso a paso: descomposición, patrones y trazas de ejecución.",
        profesorId: "usr_luis",
        codigo: "ALG-102",
        color: "teal",
        totalActividades: 1,
      },
    ],

    matriculas: [
      { id: "mat_1", cursoId: "cur_logica", estudianteId: "usr_ana", fecha: dias(-20) },
      { id: "mat_2", cursoId: "cur_logica", estudianteId: "usr_carlos", fecha: dias(-18) },
      { id: "mat_3", cursoId: "cur_algoritmos", estudianteId: "usr_carlos", fecha: dias(-12) },
    ],

    actividades: [
      {
        id: "act_saludo",
        cursoId: "cur_logica",
        titulo: "Tu primer programa: saludar",
        enunciado:
          'Arma un programa que muestre el texto "Hola mundo" en la consola. Todo programa empieza en el bloque Inicio y termina en el bloque Fin.',
        dificultad: "basica",
        bloquesPermitidos: ["inicio", "fin", "salida"],
        fechaLimite: fecha(5),
        creadaEn: dias(-15),
      },
      {
        id: "act_par_impar",
        cursoId: "cur_logica",
        titulo: "¿Par o impar?",
        enunciado:
          "Pide un número al usuario y muestra si es par o impar. Necesitas un bloque Leer, una Operación con el operador % y un Si / Si-No.",
        dificultad: "intermedia",
        bloquesPermitidos: ["inicio", "fin", "variable", "asignacion", "entrada", "salida", "operacion", "condicional"],
        fechaLimite: fecha(9),
        creadaEn: dias(-10),
      },
      {
        id: "act_tabla",
        cursoId: "cur_logica",
        titulo: "Tabla de multiplicar",
        enunciado: "Pide un número y muestra su tabla de multiplicar del 1 al 10 usando un ciclo Repetir.",
        dificultad: "avanzada",
        bloquesPermitidos: [
          "inicio", "fin", "variable", "asignacion", "entrada",
          "salida", "operacion", "condicional", "mientras", "repetir",
        ],
        fechaLimite: fecha(14),
        creadaEn: dias(-6),
      },
      {
        id: "act_traza",
        cursoId: "cur_algoritmos",
        titulo: "Contar de 2 en 2",
        enunciado:
          "Usando un ciclo Mientras, muestra los números pares del 2 al 10. Antes de ejecutar, escribe en papel la traza esperada.",
        dificultad: "intermedia",
        bloquesPermitidos: ["inicio", "fin", "variable", "asignacion", "salida", "operacion", "mientras"],
        fechaLimite: fecha(11),
        creadaEn: dias(-4),
      },
    ],

    asignaciones: [
      { id: "asg_1", actividadId: "act_saludo", estudianteId: "usr_ana", estado: "revisada", asignadaEn: dias(-14) },
      { id: "asg_2", actividadId: "act_par_impar", estudianteId: "usr_ana", estado: "pendiente", asignadaEn: dias(-9) },
      { id: "asg_3", actividadId: "act_tabla", estudianteId: "usr_ana", estado: "pendiente", asignadaEn: dias(-5) },
      { id: "asg_4", actividadId: "act_saludo", estudianteId: "usr_carlos", estado: "entregada", asignadaEn: dias(-14) },
      { id: "asg_5", actividadId: "act_traza", estudianteId: "usr_carlos", estado: "en_progreso", asignadaEn: dias(-3) },
    ],

    entregas: [
      { id: "ent_1", asignacionId: "asg_1", programa: programaSaludo, salida: ["Hola mundo"], entregadaEn: dias(-13) },
      {
        id: "ent_2",
        asignacionId: "asg_4",
        programa: { ...programaSaludo, id: "prog_saludo_carlos" },
        salida: ["Hola mundo"],
        entregadaEn: dias(-12),
      },
    ],

    retro: [
      {
        id: "ret_1",
        entregaId: "ent_1",
        profesorId: "usr_luis",
        comentario:
          "Muy bien, Ana. El programa está completo y la cadena de bloques es correcta. Para la próxima, prueba mostrar el saludo desde una variable.",
        calificacion: 5,
        creadaEn: dias(-12),
      },
    ],
  };
}
