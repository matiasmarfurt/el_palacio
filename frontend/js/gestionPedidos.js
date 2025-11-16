const API_PEDIDOS_URL = "../../backend/api/api_pedidos.php"; // URL base del endpoint para pedidos

window.onload = function () {
  listarPedidos();
};

let pedidos = [];

// Listar todos los pedidos (GET)
function listarPedidos() {
  console.log("Cargando pedidos");

  fetch(API_PEDIDOS_URL)
    .then((res) => {
      console.log("Respuesta recibida, status:", res.status);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("Pedidos obtenidos:", data);
      pedidos = data;
      mostrarTablaPedidos(data);
    })
    .catch((err) => {
      console.error("Error al obtener pedidos:", err);
      const container = document.getElementById("pedidosContainer");
      if (container) {
        container.innerHTML = `<p class='no-data'>Error al cargar pedidos: ${err.message}</p>`;
      }
    });
}

// Mostrar tabla de pedidos
function mostrarTablaPedidos(pedidos) {
  const container = document.getElementById("pedidosContainer");
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    container.innerHTML = "<p class='no-data'>No hay pedidos para mostrar.</p>";
    return;
  }

  let html = `
    <div class="table-container">
      <table class="responsive-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  pedidos.forEach((pedido) => {
    const fecha = new Date(pedido.fecha).toLocaleDateString("es-ES");
    const estadoClass = obtenerClaseEstado(pedido.estado);
    const estadoTexto = obtenerTextoEstado(pedido.estado);

    html += `
      <tr>
        <td data-label="Número">${pedido.numero_pedido || "N/A"}</td>
        <td data-label="Cliente">${pedido.nombre_usuario || "Invitado"}</td>
        <td data-label="Fecha">${fecha}</td>
        <td data-label="Total">$${Number.parseFloat(pedido.total).toFixed(
          2
        )}</td>
        <td data-label="Estado">
          <span class="estado-badge ${estadoClass}">${estadoTexto}</span>
        </td>
        <td data-label="Acciones">
          <button onclick="verDetallePedido(${
            pedido.id_pedido
          })">Ver Detalle</button>
          <button onclick="cambiarEstadoPedido(${pedido.id_pedido}, '${
      pedido.estado
    }')">Cambiar Estado</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

// Obtener clase CSS según estado
function obtenerClaseEstado(estado) {
  const clases = {
    recibido: "estado-recibido",
    preparacion: "estado-preparacion",
    en_camino: "estado-encamino",
    entregado: "estado-entregado",
    cancelado: "estado-cancelado",
  };
  return clases[estado] || "estado-recibido";
}

// Obtener texto legible del estado
function obtenerTextoEstado(estado) {
  const textos = {
    recibido: "Recibido",
    preparacion: "En Preparación",
    en_camino: "En Camino",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };
  return textos[estado] || estado;
}

// Ver detalle del pedido
function verDetallePedido(id) {
  const pedido = pedidos.find((p) => p.id_pedido == id);
  if (!pedido) return alert("Pedido no encontrado");

  let detallesHTML = '<div class="detalle-productos">';
  if (pedido.detalles && pedido.detalles.length > 0) {
    pedido.detalles.forEach((detalle) => {
      detallesHTML += `
        <div class="detalle-item">
          <span class="detalle-nombre">${detalle.nombre}</span>
          <span class="detalle-cantidad">x${detalle.cantidad}</span>
          <span class="detalle-precio">$${Number.parseFloat(
            detalle.subtotal
          ).toFixed(2)}</span>
        </div>
      `;
    });
  }
  detallesHTML += "</div>";

  const modalHTML = `
    <div class="modal-overlay" onclick="cerrarModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Detalle del Pedido #${
            pedido.numero_pedido || pedido.id_pedido
          }</h3>
          <button class="modal-close" onclick="cerrarModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="info-group">
            <label>Cliente:</label>
            <span>${pedido.nombre_usuario || "Invitado"} ${
    pedido.apellido_usuario || ""
  }</span>
          </div>
          <div class="info-group">
            <label>Email:</label>
            <span>${pedido.email || "N/A"}</span>
          </div>
          <div class="info-group">
            <label>Teléfono:</label>
            <span>${pedido.telefono || "N/A"}</span>
          </div>
          <div class="info-group">
            <label>Dirección:</label>
            <span>${pedido.direccion_entrega}</span>
          </div>
          <div class="info-group">
            <label>Método de Pago:</label>
            <span>${pedido.metodo_pago || "Efectivo"}</span>
          </div>
          <div class="info-group">
            <label>Estado:</label>
            <span class="estado-badge ${obtenerClaseEstado(
              pedido.estado
            )}">${obtenerTextoEstado(pedido.estado)}</span>
          </div>
          <div class="info-group">
            <label>Productos:</label>
            ${detallesHTML}
          </div>
          <div class="info-group total-group">
            <label>Total:</label>
            <span class="total-amount">$${Number.parseFloat(
              pedido.total
            ).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Cambiar estado del pedido
function cambiarEstadoPedido(id, estadoActual) {
  const pedido = pedidos.find((p) => p.id_pedido == id);
  if (!pedido) return alert("Pedido no encontrado");

  const modalHTML = `
    <div class="modal-overlay" onclick="cerrarModal()">
      <div class="modal-content modal-small" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Cambiar Estado del Pedido</h3>
          <button class="modal-close" onclick="cerrarModal()">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Pedido:</strong> #${
            pedido.numero_pedido || pedido.id_pedido
          }</p>
          <p><strong>Estado actual:</strong> ${obtenerTextoEstado(
            estadoActual
          )}</p>
          <div class="form-field">
            <label class="field-label">Nuevo Estado:</label>
            <select id="nuevoEstado" class="field-input">
              <option value="recibido" ${
                estadoActual === "recibido" ? "selected" : ""
              }>Recibido</option>
              <option value="preparacion" ${
                estadoActual === "preparacion" ? "selected" : ""
              }>En Preparación</option>
              <option value="en_camino" ${
                estadoActual === "en_camino" ? "selected" : ""
              }>En Camino</option>
              <option value="entregado" ${
                estadoActual === "entregado" ? "selected" : ""
              }>Entregado</option>
              <option value="cancelado" ${
                estadoActual === "cancelado" ? "selected" : ""
              }>Cancelado</option>
            </select>
          </div>
          <button class="btn-submit" onclick="confirmarCambioEstado(${id})">Actualizar Estado</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Confirmar cambio de estado (PUT)
function confirmarCambioEstado(id) {
  const nuevoEstado = document.getElementById("nuevoEstado").value;
  const pedido = pedidos.find((p) => p.id_pedido == id);

  console.log("Iniciando cambio de estado de pedido ID:", id);

  fetch(API_PEDIDOS_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, estado: nuevoEstado }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        console.error("Error al actualizar estado:", data.error);
        alert("Error: " + data.error);
      } else {
        console.log("Estado actualizado exitosamente:", data);

        const notificacion = {
          tipo: "cambio_estado",
          numero_pedido: pedido.numero_pedido,
          nuevo_estado: nuevoEstado,
          timestamp: Date.now(),
        };

        localStorage.setItem(
          "notificacion_pedido",
          JSON.stringify(notificacion)
        );
        setTimeout(() => localStorage.removeItem("notificacion_pedido"), 5000);

        alert("Estado actualizado correctamente");
        cerrarModal();
        listarPedidos();
      }
    })
    .catch((err) => {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado: " + err.message);
    });
}

// Cerrar modal
function cerrarModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

// Buscar pedidos por texto
function buscarPedidos(texto) {
  fetch(`${API_PEDIDOS_URL}?buscar=${encodeURIComponent(texto)}`)
    .then((res) => res.json())
    .then((data) => mostrarTablaPedidos(data))
    .catch((err) => console.error("Error al buscar pedidos:", err));
}

document
  .getElementById("buscadorPedidos")
  ?.addEventListener("input", function () {
    const texto = this.value.trim();
    if (texto === "") {
      listarPedidos();
    } else {
      buscarPedidos(texto);
    }
  });

window.verDetallePedido = verDetallePedido;
window.cambiarEstadoPedido = cambiarEstadoPedido;
window.confirmarCambioEstado = confirmarCambioEstado;
window.cerrarModal = cerrarModal;
