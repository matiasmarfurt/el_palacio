window.onload = () => {
  cargarResumen();
  configurarFormularioEfectivo();
};

// Función común para obtener id_usuario desde localStorage
function obtenerIdUsuario() {
  const usuarioLS = localStorage.getItem("usuario");
  if (!usuarioLS) return null;

  try {
    const usuario = JSON.parse(usuarioLS);
    if (usuario.id_usuario && typeof usuario.id_usuario === "number") {
      return usuario.id_usuario;
    }
    return null;
  } catch (e) {
    console.error("Error leyendo usuario desde localStorage:", e);
    return null;
  }
}

// Carga los productos del carrito y arma el resumen visual
function cargarResumen() {
  const carritoGuardado = localStorage.getItem("carrito");

  if (!carritoGuardado) {
    alert("No hay productos en el carrito.");
    window.location.href = "index.html";
    return;
  }

  const carrito = JSON.parse(carritoGuardado);
  const contenedor = document.getElementById("resumenProductos");
  let total = 0;
  let html = "";

  carrito.forEach((prod) => {
    const subtotal = prod.precio * prod.cantidad;
    total += subtotal;

    html += `
      <div class="resumen-item">
        <img src="/placeholder.svg" alt="${
          prod.nombre
        }" class="resumen-item-imagen" />
        <div class="resumen-item-info">
          <div class="resumen-item-nombre">${prod.nombre}</div>
          <div class="resumen-item-cantidad">Cantidad: ${prod.cantidad}</div>
        </div>
        <div class="resumen-item-precio">$${subtotal.toFixed(2)}</div>
      </div>
    `;
  });

  contenedor.innerHTML = html;
  document.getElementById("totalPago").textContent = `$${total.toFixed(2)}`;
}

// Configura evento del formulario para enviar el pedido
function configurarFormularioEfectivo() {
  const form = document.getElementById("formEfectivo");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    procesarPedidoEfectivo();
  });
}

// Envía el pedido con datos mínimos (efectivo)
function procesarPedidoEfectivo() {
  const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  if (carrito.length === 0) return alert("No hay productos en el carrito.");

  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;
  const notas = document.getElementById("notasAdicionales").value;

  if (!telefono || !direccion || !notas) {
    return alert("Por favor, completa todos los campos.");
  }

  const total = carrito.reduce(
    (acc, prod) => acc + prod.precio * prod.cantidad,
    0
  );

  const pedidoData = {
    id_usuario: obtenerIdUsuario(),
    total,
    direccion_entrega: direccion,
    telefono,
    notas,
    metodo_pago: "efectivo",
    productos: carrito,
  };

  fetch("../../backend/api/api_pedidos.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedidoData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error)
        return alert("Error al procesar el pedido: " + data.error);

      localStorage.setItem(
        "pedidoActual",
        JSON.stringify({
          numero_pedido: data.numero_pedido,
          id_pedido: data.id_pedido,
          estado: "recibido",
          total,
          direccion,
          telefono,
          notas,
        })
      );
      localStorage.removeItem("carrito");
      window.location.href = "seguimiento.html";
    })
    .catch((err) => {
      console.error("Error al enviar pedido:", err);
      alert("Hubo un problema procesando el pedido.");
    });
}
function volverAlCarrito() {
  window.location.href = "index.html";
}
