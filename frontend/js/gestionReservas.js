async function listarReservas() {
  try {
    const response = await fetch("../../backend/api/api_reservas.php");
    const data = await response.json();

    if (!data.success) {
      console.error("Error cargando reservas:", data.error);
      return;
    }

    renderizarTablaReservas(data.reservas);
  } catch (error) {
    console.error("Error listando reservas:", error);
  }
}

// BUSCADOR
document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.getElementById("buscadorReservas");
  if (buscador) {
    buscador.addEventListener("input", () => {
      const texto = buscador.value.toLowerCase();
      filtrarReservas(texto);
    });
  }
});

let reservasGlobales = [];

function renderizarTablaReservas(reservas) {
  reservasGlobales = reservas;

  const container = document.getElementById("reservasContainer");

  let html = `
        <table class="responsive-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Personas</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Comentarios</th>
                </tr>
            </thead>
            <tbody>
    `;

  reservas.forEach((r) => {
    html += `
            <tr>
                <td data-label="Nombre">${r.nombre}</td>
                <td data-label="Email">${r.email}</td>
                <td data-label="Teléfono">${r.telefono}</td>
                <td data-label="Personas">${r.personas}</td>
                <td data-label="Fecha">${r.fecha}</td>
                <td data-label="Hora">${r.hora}</td>
                <td data-label="Comentarios">${r.comentarios || "-"}</td>
            </tr>
        `;
  });

  html += `</tbody></table>`;

  container.innerHTML = html;
}

// FILTRO DEL BUSCADOR
function filtrarReservas(texto) {
  const filtradas = reservasGlobales.filter(
    (r) =>
      r.nombre.toLowerCase().includes(texto) ||
      r.email.toLowerCase().includes(texto) ||
      r.fecha.toLowerCase().includes(texto)
  );

  renderizarTablaReservas(filtradas);
}
