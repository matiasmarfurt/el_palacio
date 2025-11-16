// URL base del endpoint para usuarios (API REST PHP)
const API_URL_USUARIOS = "../../backend/api/api_usuarios.php";

// Esperar a que el DOM esté listo para agregar el listener al formulario de login
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", enviarLogin);
});

function mostrarOverlayDeCarga() {
  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");
}

function ocultarOverlayDeCarga() {
  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.remove("active");
}

function mostrarAnimacionExito() {
  const spinner = document.getElementById("loadingSpinner");
  const check = document.getElementById("successCheck");
  const text = document.getElementById("loadingText");

  spinner.classList.add("hidden");
  check.classList.remove("hidden");
  text.innerText = "¡Sesión iniciada correctamente!";
}

// Función para manejar el submit del formulario de login
function enviarLogin(event) {
  event.preventDefault();

  const usuarioOEmail = document.getElementById("username").value.trim();
  const contrasena = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!usuarioOEmail || !contrasena) {
    errorMsg.textContent = "Completa todos los campos.";
    return;
  }

  mostrarOverlayDeCarga();

  fetch(API_URL_USUARIOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre_usuario: usuarioOEmail, // tu backend puede aceptar usuario o email
      password: contrasena,
    }),
  })
    .then((res) =>
      res.json().then((data) => ({ status: res.status, body: data }))
    )
    .then(({ status, body }) => {
      ocultarOverlayDeCarga();

      if (body.success && body.usuario && body.token) {
        // Guardar usuario y token
        localStorage.setItem("usuario", JSON.stringify(body.usuario));
        localStorage.setItem("token", body.token);

        mostrarAnimacionExito();

        setTimeout(() => {
          if (body.usuario.tipo === "admin") {
            window.location.href = "../page/gestion.html";
          } else {
            window.location.href = "../page/index.html";
          }
        }, 1000);
      } else {
        errorMsg.textContent =
          body.error || "Usuario/email o contraseña incorrectos.";
      }
    })
    .catch((err) => {
      ocultarOverlayDeCarga();
      console.error(err);
      errorMsg.textContent = "No se pudo conectar al servidor.";
    });
}
