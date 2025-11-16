const API_PRODUCTOS = "../../backend/api/api_productos.php"; // URL base del endpoint para productos (API REST PHP)

window.onload = () => {
  listarProductosCarta();
};

let productos = []; // Variable array para almacenar los productos
let carrito = [];
let metodoPagoSeleccionado = null;

function persistirCarrito() {
  try {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    return true;
  } catch (e) {
    console.error("Error guardando carrito en localStorage:", e);
    return false;
  }
}

// cargar carrito desde localStorage al inicio de la página (si existe)
(function cargarCarritoInicial() {
  const guardado = localStorage.getItem("carrito");
  if (guardado) {
    try {
      carrito = JSON.parse(guardado);
    } catch (e) {
      console.warn("Carrito corrupto en localStorage, reseteando.", e);
      carrito = [];
      persistirCarrito();
    }
  }
})();

function abrirCarrito() {
  document.getElementById("carritoPanel").classList.add("abierto");
  document.getElementById("carritoOverlay").classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carritoPanel").classList.remove("abierto");
  document.getElementById("carritoOverlay").classList.remove("activo");
}

function seleccionarMetodoPago(metodo) {
  metodoPagoSeleccionado = metodo;

  // Actualizar estilos de los botones
  document.getElementById("btnEfectivo").classList.remove("seleccionado");
  document.getElementById("btnTarjeta").classList.remove("seleccionado");

  if (metodo === "efectivo") {
    document.getElementById("btnEfectivo").classList.add("seleccionado");
  } else {
    document.getElementById("btnTarjeta").classList.add("seleccionado");
  }

  // Habilitar botón de finalizar compra
  document.getElementById("btnFinalizar").disabled = false;
}

function agregarAlCarrito(productoId) {
  const producto = productos.find((p) => p.id == productoId);
  if (!producto) return;

  const existente = carrito.find((item) => item.id == productoId);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarritoVista();

  mostrarNotificacion("Producto añadido al carrito");

  // Mostrar feedback visual
  const badge = document.getElementById("carritoBadge");
  badge.style.transform = "scale(1.3)";
  setTimeout(() => {
    badge.style.transform = "scale(1)";
  }, 200);
}

function aumentarCantidad(productoId) {
  const item = carrito.find((item) => item.id == productoId);
  if (item) {
    item.cantidad += 1;
    actualizarCarritoVista();
  }
}

function disminuirCantidad(productoId) {
  const item = carrito.find((item) => item.id == productoId);
  if (item) {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      actualizarCarritoVista();
    } else {
      quitarDelCarrito(productoId);
    }
  }
}

function actualizarCarritoVista() {
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  document.getElementById("carritoBadge").textContent = totalItems;

  const contenido = document.getElementById("carritoContenido");
  const footer = document.getElementById("carritoFooter");

  if (carrito.length === 0) {
    contenido.innerHTML = `
      <div class="carrito-vacio">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/>
          <path d="M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <p>Tu carrito está vacío</p>
      </div>
    `;
    footer.style.display = "none";
    return;
  }

  let html = "";
  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const imagenSrc = item.imagen
      ? `../../backend/img/${item.imagen}`
      : "/placeholder.svg";

    html += `
      <div class="carrito-item">
        <img src="${imagenSrc}" alt="${
      item.nombre
    }" class="carrito-item-imagen" />
        <div class="carrito-item-info">
          <h4 class="carrito-item-nombre">${item.nombre}</h4>
          <div class="carrito-item-precio">$${subtotal.toFixed(2)}</div>
          <div class="carrito-item-controles">
            <button class="carrito-item-btn" onclick="disminuirCantidad(${
              item.id
            })">−</button>
            <span class="carrito-item-cantidad">${item.cantidad}</span>
            <button class="carrito-item-btn" onclick="aumentarCantidad(${
              item.id
            })">+</button>
          </div>
        </div>
        <button class="carrito-item-eliminar" onclick="quitarDelCarrito(${
          item.id
        })">✕</button>
      </div>
    `;
  });

  contenido.innerHTML = html;
  document.getElementById("carritoTotal").textContent = `$${total.toFixed(2)}`;
  footer.style.display = "block";

  // Resetear método de pago si el carrito cambia
  if (metodoPagoSeleccionado) {
    document.getElementById("btnFinalizar").disabled = false;
  }
}

function quitarDelCarrito(productoId) {
  carrito = carrito.filter((item) => item.id != productoId);
  actualizarCarritoVista();
  metodoPagoSeleccionado = null;
  document.getElementById("btnEfectivo").classList.remove("seleccionado");
  document.getElementById("btnTarjeta").classList.remove("seleccionado");
  document.getElementById("btnFinalizar").disabled = true;
}

function finalizarCompra() {
  if (!metodoPagoSeleccionado) {
    alert("Por favor, selecciona un método de pago");
    return;
  }

  // Guardar carrito
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Redirigir según método de pago
  if (metodoPagoSeleccionado === "tarjeta") {
    window.location.href = "pago.html";
  } else {
    window.location.href = "pago-efectivo.html";
  }
}

// Obtener todos los productos (GET)
function listarProductosCarta() {
  fetch(API_PRODUCTOS)
    .then((res) => res.json())
    .then((data) => {
      productos = data;
      mostrarCartaPorCategoria(productos, "Carnes", "carnesContainer");
      mostrarCartaPorCategoria(productos, "Bebidas", "bebidasContainer");
      mostrarCartaPorCategoria(productos, "Pastas", "pastasContainer");
    })
    .catch((err) => console.error("Error al obtener productos:", err));
}

// Mostrar productos por categoría en su overlay
function mostrarCartaPorCategoria(productos, categoria, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const filtrados = productos.filter(
    (p) => p.categoria.trim().toLowerCase() === categoria.toLowerCase()
  );
  if (filtrados.length === 0) {
    container.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }
  let html = "";
  filtrados.forEach((p) => {
    const imagenSrc = p.imagen
      ? `../../backend/img/${p.imagen}`
      : "/placeholder.svg";

    html += `
    <div class="grid-item">
      <img src="${imagenSrc}" alt="${p.nombre}" />
      <h3>${p.nombre}</h3>
      <p class="descripcion">${p.descripcion}</p>
      <span class="precio">$${p.precio}</span>
      <button class="btn-agregar" onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>
    </div>
  `;
  });
  container.innerHTML = html;
}

// Mostrar overlay de la categoría seleccionada
function mostrarOverlay(categoria) {
  document.getElementById("carnes").style.display = "none";
  document.getElementById("bebidas").style.display = "none";
  document.getElementById("pastas").style.display = "none";
  document.getElementById(categoria).style.display = "block";
}

// Ocultar todos los overlays
function cerrarOverlay() {
  document.getElementById("carnes").style.display = "none";
  document.getElementById("bebidas").style.display = "none";
  document.getElementById("pastas").style.display = "none";
}

function mostrarNotificacion(mensaje) {
  // Crear elemento de notificación si no existe
  let notificacion = document.getElementById("notificacionProducto");
  if (!notificacion) {
    notificacion = document.createElement("div");
    notificacion.id = "notificacionProducto";
    notificacion.className = "notificacion-producto";
    document.body.appendChild(notificacion);
  }

  notificacion.textContent = mensaje;
  notificacion.classList.add("mostrar");

  // Ocultar después de 2 segundos
  setTimeout(() => {
    notificacion.classList.remove("mostrar");
  }, 2000);
}
