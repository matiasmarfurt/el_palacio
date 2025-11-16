window.onload = () => {
  cargarDatosPedido();
  iniciarActualizacionEstado();
  escucharCambiosEstado();
};

function cargarDatosPedido() {
  const pedidoGuardado = localStorage.getItem("pedidoActual");

  if (!pedidoGuardado) {
    alert("No se encontró información del pedido");
    window.location.href = "index.html";
    return;
  }

  const pedido = JSON.parse(pedidoGuardado);

  // Mostrar número de pedido
  document.getElementById("numeroPedido").textContent =
    pedido.numero_pedido || "EP" + Math.floor(100000 + Math.random() * 900000);

  // Fecha actual
  const fecha = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("fechaPedido").textContent = fecha;

  // Total
  document.getElementById("totalPedido").textContent = `$${
    pedido.total?.toFixed(2) || "0.00"
  }`;

  // Dirección
  document.getElementById("direccionEntrega").textContent =
    pedido.direccion || "";

  // Teléfono
  document.getElementById("telefonoPedido").textContent = pedido.telefono || "";

  // Productos
  const productosLista = document.getElementById("productosLista");
  let html = "";

  // Aquí usamos productos o detalles como fallback
  const productos = pedido.productos || pedido.detalles || [];

  productos.forEach((item) => {
    const subtotal =
      (item.subtotal !== undefined
        ? item.subtotal
        : item.precio * item.cantidad) || 0;
    html += `
      <div class="producto-seguimiento">
        <img src="/placeholder.svg" alt="${
          item.nombre
        }" class="producto-seguimiento-imagen" />
        <div class="producto-seguimiento-info">
          <div class="producto-seguimiento-nombre">${item.nombre}</div>
          <div class="producto-seguimiento-cantidad">Cantidad: ${
            item.cantidad
          }</div>
        </div>
        <div class="producto-seguimiento-precio">$${subtotal.toFixed(2)}</div>
      </div>
    `;
  });

  productosLista.innerHTML = html;
}

function iniciarActualizacionEstado() {
  const pedidoGuardado = localStorage.getItem("pedidoActual");
  if (!pedidoGuardado) return;

  const pedido = JSON.parse(pedidoGuardado);
  if (!pedido.numero_pedido) {
    console.warn("No hay número de pedido, se usará simulación");
    simularActualizacionEstado();
    return;
  }

  // Consultar estado inmediatamente y luego cada 3s
  consultarEstadoPedido(pedido.numero_pedido);
  setInterval(() => consultarEstadoPedido(pedido.numero_pedido), 3000);
}

function consultarEstadoPedido(numero_pedido) {
  fetch(
    `../../backend/api/api_pedidos.php?numero_pedido=${encodeURIComponent(
      numero_pedido
    )}`
  )
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data && !data.error) {
        actualizarVisualizacionEstado(data.estado);
      }
    })
    .catch((err) =>
      console.error("Error al consultar estado del pedido:", err)
    );
}

function actualizarVisualizacionEstado(estado) {
  const estados = {
    recibido: "estadoRecibido",
    preparacion: "estadoPreparacion",
    en_camino: "estadoEnCamino",
    entregado: "estadoEntregado",
  };

  Object.values(estados).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("activo");
  });

  const ordenEstados = ["recibido", "preparacion", "en_camino", "entregado"];
  const indice = ordenEstados.indexOf(estado);
  if (indice === -1) return;

  for (let i = 0; i <= indice; i++) {
    const el = document.getElementById(estados[ordenEstados[i]]);
    if (el) el.classList.add("activo");
  }
}

function simularActualizacionEstado() {
  const estados = [
    "estadoRecibido",
    "estadoPreparacion",
    "estadoEnCamino",
    "estadoEntregado",
  ];
  let indice = 0;
  document.getElementById(estados[indice]).classList.add("activo");

  const interval = setInterval(() => {
    indice++;
    if (indice < estados.length) {
      document.getElementById(estados[indice]).classList.add("activo");
    } else {
      clearInterval(interval);
    }
  }, 5000);
}

function volverAlInicio() {
  localStorage.removeItem("pedidoActual");
  localStorage.removeItem("carritoCompra");
  window.location.href = "index.html";
}

function escucharCambiosEstado() {
  const pedidoGuardado = localStorage.getItem("pedidoActual");
  if (!pedidoGuardado) return;

  const pedido = JSON.parse(pedidoGuardado);

  window.addEventListener("storage", (e) => {
    if (e.key === "notificacion_pedido" && e.newValue) {
      const notificacion = JSON.parse(e.newValue);
      if (notificacion.numero_pedido === pedido.numero_pedido) {
        actualizarVisualizacionEstado(notificacion.nuevo_estado);
        mostrarNotificacionCambio(notificacion.nuevo_estado);
      }
    }
  });

  // Polling para cambios dentro de la misma pestaña
  setInterval(() => {
    const notifStr = localStorage.getItem("notificacion_pedido");
    if (!notifStr) return;

    const notif = JSON.parse(notifStr);
    if (notif.numero_pedido === pedido.numero_pedido) {
      actualizarVisualizacionEstado(notif.nuevo_estado);
      mostrarNotificacionCambio(notif.nuevo_estado);
    }
  }, 500);
}

function mostrarNotificacionCambio(estado) {
  const textos = {
    recibido: "Pedido Recibido",
    preparacion: "En Preparación",
    en_camino: "En Camino",
    entregado: "Entregado",
  };
  const mensaje = textos[estado] || estado;

  const notif = document.createElement("div");
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: bold;
    animation: slideIn 0.3s ease-out;
  `;
  notif.textContent = `✓ Estado actualizado: ${mensaje}`;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}
