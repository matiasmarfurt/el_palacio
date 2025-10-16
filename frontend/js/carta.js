const API_URL = "../../backend/api/api_productos.php"; // URL base del endpoint para productos (API REST PHP)

window.onload = function () {
  listarProductosCarta();
};

let productos = []; // Variable array para almacenar los productos
let carrito = [];

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
}

function actualizarCarritoVista() {
  document.getElementById("carritoCantidad").textContent = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );
  const contenido = document.getElementById("carritoContenido");
  if (carrito.length === 0) {
    contenido.innerHTML = "<p>Tu carrito está vacío.</p>";
    // También limpia el precio total en el modal-footer si lo deseas
    document.querySelector("#carritoModal .modal-footer .carrito-total")?.remove();
    return;
  }
  let html = "<ul class='list-group'>";
  let total = 0;
  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    html += `<li class='list-group-item d-flex justify-content-between align-items-center'>
      ${item.nombre} x${item.cantidad} <span>$${subtotal}</span>
      <button class="btn btn-sm btn-danger" onclick="quitarDelCarrito(${item.id})">Quitar</button>
    </li>`;
  });
  html += "</ul>";
  contenido.innerHTML = html;

  // Muestra el precio total arriba de los botones en el modal-footer
  const modalFooter = document.querySelector("#carritoModal .modal-footer");
  if (modalFooter) {
    let totalDiv = modalFooter.querySelector(".carrito-total");
    if (!totalDiv) {
      totalDiv = document.createElement("div");
      totalDiv.className = "carrito-total me-auto";
      modalFooter.prepend(totalDiv);
    }
    totalDiv.innerHTML = `<strong>Precio Total: $${total}</strong>`;
  }
}

function quitarDelCarrito(productoId) {
  carrito = carrito.filter((item) => item.id != productoId);
  actualizarCarritoVista();
}

function finalizarCompra() {
  alert("¡Gracias por tu compra!");
  carrito = [];
  actualizarCarritoVista();
  cerrarCarrito();
}

document.getElementById("carritoBtn").addEventListener("click", () => {
  document.getElementById("carritoModal").style.display = "block";
});

function cerrarCarrito() {
  document.getElementById("carritoModal").style.display = "none";
}

// Obtener todos los productos (GET)
function listarProductosCarta() {
  fetch(API_URL)
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
    html += `
    <div class="grid-item">
      <img src="" alt="${p.nombre}" />
      <h3>${p.nombre}</h3>
      <p class="descripcion">${p.descripcion}</p>
      <span class="precio">$${p.precio}</span>
      <button class="btn-agregar" onclick="agregarAlCarrito(${p.id})">Agregar al carrito</button>
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