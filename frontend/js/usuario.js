const API_URL = "../../backend/api/api_usuarios.php"; // URL base del endpoint para usuarios (API REST PHP)

// Esperar a que el DOM esté listo para agregar el listener al formulario de login
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("loginForm")
    .addEventListener("submit", enviarLogin);
});

// Función para manejar el submit del formulario de login
function enviarLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById("username").value.trim();
  const contrasena = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // Validar campos vacíos
  if (!usuario || !contrasena) {
    errorMsg.textContent = "Completa todos los campos.";
    return;
  }

  // Enviar datos al backend para login (POST)
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre_usuario: usuario,
      password: contrasena,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error de conexión");
      return res.json();
    })
    .then((data) => {
      // Si el login es exitoso, guardar usuario en localStorage y redirigir
      if (data.success && data.token && data.usuario) {
           localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario)); // Guarda la sesión del usuario

        // En función del tipo de usuario, redirigir a la página correspondiente
        if (data.usuario.tipo === "admin") {
          window.location.href = "../page/gestion.html"; // Panel de administración para admins
        } else {
          window.location.href = "../page/index.html"; // Página principal para usuarios normales
        }

      } else {
        // Mostrar mensaje de error si las credenciales son incorrectas
        errorMsg.textContent =
          data.error || "Usuario o contraseña incorrectos.";
      }
    })
    .catch((err) => {
      // Mostrar mensaje de error si hay problemas de conexión o servidor
      errorMsg.textContent = "Error de conexión o servidor.";
      console.error(err);
    });
}