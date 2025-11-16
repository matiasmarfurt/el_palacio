window.addEventListener("DOMContentLoaded", () => {
  sincronizarCarritoPagoTarjeta();
  configurarFormularioTarjeta();
});

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

function sincronizarCarritoPagoTarjeta() {
  const guardado = localStorage.getItem("carrito");
  if (!guardado)
    return alert("Carrito vacío") || (window.location.href = "index.html");

  const carrito = JSON.parse(guardado);
  renderResumenCarritoTarjeta(carrito);
}

function renderResumenCarritoTarjeta(carrito) {
  const cont = document.getElementById("resumenProductos");
  let total = 0;
  let html = "";

  carrito.forEach((p) => {
    const sub = p.precio * p.cantidad;
    total += sub;
    html += `<div class='resumen-item'><div>${p.nombre}</div><div>Cant: ${
      p.cantidad
    }</div><div>$${sub.toFixed(2)}</div></div>`;
  });

  cont.innerHTML = html;
  document.getElementById("totalPago").textContent = `$${total.toFixed(2)}`;
}

function configurarFormularioTarjeta() {
  const inputTarjeta = document.getElementById("numeroTarjeta");
  const inputFecha = document.getElementById("fechaExpiracion");
  const inputCVV = document.getElementById("cvv");
  const inputTelefono = document.getElementById("telefono");

  // Formato número de tarjeta
  inputTarjeta.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, ""); // solo números
    v = v.substring(0, 16); // máximo 16 dígitos
    e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
    detectarTipoTarjeta(v);
  });

  // Formato fecha MM/AA
  inputFecha.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length >= 3) v = v.substring(0, 2) + "/" + v.substring(2, 4);
    e.target.value = v.substring(0, 5);
  });

  // Solo números para CVV
  inputCVV.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
  });

  // Limpieza del teléfono
  inputTelefono.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  // Submit
  document.getElementById("formPago").addEventListener("submit", (e) => {
    e.preventDefault();
    procesarPagoTarjeta();
  });
}

// Detectar tipo de tarjeta
function detectarTipoTarjeta(num) {
  const label = document.getElementById("tipoTarjetaLabel");
  if (!label) return;

  label.classList.remove("visa", "master");

  if (/^4/.test(num)) {
    label.textContent = "💳 Visa";
    label.classList.add("visa");
  } else if (/^(5[1-5]|22[2-9]|2[3-7])/.test(num)) {
    label.textContent = "💳 MasterCard";
    label.classList.add("master");
  } else {
    label.textContent = "";
  }
}

function procesarPagoTarjeta() {
  const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  if (carrito.length === 0) return alert("Carrito vacío");

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  const datosPago = {
    numeroTarjeta: document.getElementById("numeroTarjeta").value,
    nombreTitular: document.getElementById("nombreTitular").value,
    telefono: document.getElementById("telefono").value,
    direccion: document.getElementById("direccion").value,
    fechaExpiracion: document.getElementById("fechaExpiracion").value,
    cvv: document.getElementById("cvv").value,
  };

  for (const [k, v] of Object.entries(datosPago)) {
    if (!v.trim()) console.warn(`Campo incompleto: ${k}`);
  }

  const pedidoData = {
    id_usuario: obtenerIdUsuario(), // ✅ Uso de la función común
    total,
    direccion_entrega: datosPago.direccion,
    telefono: datosPago.telefono,
    metodo_pago: "tarjeta",
    productos: carrito,
  };

  fetch("../../backend/api/api_pedidos.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedidoData),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.error) return alert(data.error);
      localStorage.removeItem("carrito");
      window.location.href = "seguimiento.html";
    });
}
