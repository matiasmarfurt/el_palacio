const API_RESERVAS = "../../backend/api/api_reservas.php"; // URL base del endpoint para reservas

// Cargar reservas al iniciar la página (para CRUD en gestión)
window.onload = function () {
  if (document.getElementById("reservasContainer")) {
    listarReservas();
  }
  setFechaMinima(); // -- ajustar fecha mínima y horas disponibles
};

let reservas = []; // Array para almacenar las reservas

// Obtener todas las reservas (GET)
function listarReservas() {
  fetch(API_RESERVAS)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        reservas = data.reservas;
        console.log("Reservas:", reservas);
        mostrarTablaReservas(reservas);
      } else {
        throw new Error(data.error || "Error al obtener reservas");
      }
    })
    .catch((err) => {
      console.error("Error al obtener reservas:", err);
      mostrarError("No se pudieron cargar las reservas");
    });
}

// --- Configuración de fecha mínima y bloqueo de horas pasadas (UX)
function setFechaMinima() {
  const ahora = new Date();
  const ahoraGMT3 = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);

  const year = ahoraGMT3.getFullYear();
  const month = String(ahoraGMT3.getMonth() + 1).padStart(2, "0");
  const day = String(ahoraGMT3.getDate()).padStart(2, "0");

  const fechaMin = `${year}-${month}-${day}`;
  const fechaInput = document.getElementById("fecha");
  fechaInput.setAttribute("min", fechaMin);

  actualizarHorasDisponibles(); // -- inicializa horas disponibles
}

// --- Deshabilitar horas pasadas si la fecha es hoy (UX)
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");

function actualizarHorasDisponibles() {
  const fechaSeleccionada = new Date(fechaInput.value + "T00:00:00-03:00");
  const ahora = new Date();
  const ahoraGMT3 = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
  const hoy = new Date(
    ahoraGMT3.getFullYear(),
    ahoraGMT3.getMonth(),
    ahoraGMT3.getDate()
  );

  for (let option of horaInput.options) {
    if (!option.value) continue; // saltar placeholder
    const [h, m] = option.value.split(":").map(Number);
    const opcionFecha = new Date(fechaSeleccionada);
    opcionFecha.setHours(h, m, 0, 0);

    option.disabled = opcionFecha < ahoraGMT3; // -- bloquea horas pasadas
  }
}

// -- Event listener cada vez que cambie la fecha
fechaInput.addEventListener("change", actualizarHorasDisponibles);

// --- Validación de email
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Validación de fecha y hora (UX)
function validarFechaHora(fecha, hora) {
  const fechaHora = new Date(fecha + "T" + hora + ":00-03:00");
  const ahora = new Date();
  const ahoraGMT3 = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);

  if (fechaHora < ahoraGMT3) {
    mostrarError("No se puede reservar en el pasado");
    return false;
  }
  return true;
}

// Crear nueva reserva (POST)
function crearReserva(event) {
  event.preventDefault();

  // -- Obtener valores del formulario
  const formData = {
    nombre: document.getElementById("nombre").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefono:
      document.getElementById("pais").value.trim() +
      " " +
      document.getElementById("telefono").value.trim(),
    personas: parseInt(document.getElementById("personas").value),
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    comentarios: document.getElementById("comentarios").value.trim(),
  };

  // Validaciones básicas
  if (
    !formData.nombre ||
    !formData.email ||
    !formData.telefono ||
    !formData.personas ||
    !formData.fecha ||
    !formData.hora
  ) {
    mostrarError("Por favor, complete todos los campos obligatorios");
    return;
  }

  if (!validarEmail(formData.email)) {
    mostrarError("Por favor, ingrese un email válido");
    return;
  }

  // -- Validación de fecha y hora
  if (!validarFechaHora(formData.fecha, formData.hora)) return;

  // --- Enviar reserva al backend (POST)
  fetch(API_RESERVAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        mostrarMensaje(
          "¡Reserva realizada con éxito! Te contactaremos para confirmar."
        );
        document.getElementById("formReserva").reset();
        setFechaMinima(); // -- reinicia fecha mínima y horas
      } else {
        throw new Error(data.error || "No se pudo procesar la reserva");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      mostrarError(
        "Hubo un problema al procesar tu reserva. Por favor, intenta nuevamente."
      );
    });
}

// Eliminar reserva (DELETE)
function eliminarReserva(id) {
  if (!confirm("¿Está seguro de cancelar esta reserva?")) return;

  fetch(`${API_RESERVAS}?id=${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        mostrarMensaje("Reserva cancelada con éxito");
        listarReservas();
      } else {
        throw new Error(data.error || "Error al cancelar la reserva");
      }
    })
    .catch((err) => {
      console.error("Error al eliminar reserva:", err);
      mostrarError("No se pudo cancelar la reserva");
    });
}

// -- Funciones para mostrar mensajes al usuario
function mostrarMensaje(mensaje) {
  const mensajeDiv = document.getElementById("mensaje-reserva");
  mensajeDiv.textContent = mensaje;
  mensajeDiv.className = "exito";
  mensajeDiv.style.display = "block";
  mensajeDiv.style.opacity = "1";

  // -- Scroll hacia el mensaje
  mensajeDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // -- Ocultar después de 5 segundos con transición
  setTimeout(() => {
    mensajeDiv.style.opacity = "0";
    setTimeout(() => (mensajeDiv.style.display = "none"), 300);
  }, 5000);
}

function mostrarError(mensaje) {
  const mensajeDiv = document.getElementById("mensaje-reserva");
  mensajeDiv.textContent = mensaje;
  mensajeDiv.className = "error";
  mensajeDiv.style.display = "block";
  mensajeDiv.style.opacity = "1";

  // -- Scroll hacia el mensaje
  mensajeDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // -- Ocultar después de 5 segundos con transición
  setTimeout(() => {
    mensajeDiv.style.opacity = "0";
    setTimeout(() => (mensajeDiv.style.display = "none"), 300);
  }, 5000);
}

// Event Listeners
document
  .getElementById("formReserva")
  ?.addEventListener("submit", crearReserva);
document.addEventListener("DOMContentLoaded", () => {
  const formReserva = document.getElementById("formReserva");
  if (formReserva) formReserva.addEventListener("submit", crearReserva);
});
