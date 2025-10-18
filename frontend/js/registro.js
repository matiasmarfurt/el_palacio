const API_URL = "../../backend/api/api_usuarios.php" // URL base del endpoint para usuarios (API REST PHP)

// Espera que el DOM esté completamente cargado para registrar el evento del formulario
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerForm").addEventListener("submit", enviarRegistro)
})

// Función que maneja el envío del formulario de registro
function enviarRegistro(event) {
  event.preventDefault()

  // Obtiene y limpia los valores del formulario
  const nombre = document.getElementById("nombre").value.trim()
  const apellido = document.getElementById("apellido").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()

  // Valida que ningún campo esté vacío
  if (!nombre || !apellido || !email || !password) {
    alert("Completa todos los campos por favor")
    return
  }

  // Llama a la función que realiza la solicitud al backend
  registrarUsuario(nombre, apellido, email, password)
}

function mostrarOverlayDeCarga() {
  const overlay = document.getElementById("loadingOverlay")
  overlay.classList.add("active")
}

function ocultarOverlayDeCarga() {
  const overlay = document.getElementById("loadingOverlay")
  overlay.classList.remove("active")
}

function mostrarAnimacionExito() {
  const spinner = document.getElementById("loadingSpinner")
  const check = document.getElementById("successCheck")
  const text = document.getElementById("loadingText")

  spinner.classList.add("hidden")
  check.classList.remove("hidden")
  text.innerText = "¡Usuario registrado exitosamente!"
}

// Función que envía los datos al backend para registrar al usuario
function registrarUsuario(nombre, apellido, email, password) {
  const datos = {
    nombre_usuario: nombre,
    apellido_usuario: apellido,
    email: email,
    tipo: "cliente", // Por defecto se asigna el tipo de usuario "cliente"
    password: password,
  }

  mostrarOverlayDeCarga()

  // Hace una solicitud POST a la API de usuarios con los datos a registrar
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos), // Convierte la respuesta a JSON
  })
    .then((res) => {
      // Verifica si la respuesta fue exitosa
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      return res.json()
    })
    .then((data) => {
      // Si el backend respondió con éxito
      if (data.success) {
        mostrarAnimacionExito()

        // Redirige al login después de mostrar el mensaje (espera 3 segundos)
        setTimeout(() => {
          window.location.href = "../page/login.html"
        }, 3000)

        // Si hay un error conocido desde el backend
      } else if (data.error) {
        ocultarOverlayDeCarga()
        alert("Error: " + data.message + (data.error ? `\nDetalle: ${data.error}` : ""))

        // En caso de una respuesta inesperada
      } else {
        ocultarOverlayDeCarga()
        console.log("Respuesta inesperada:", data)
      }
    })
    .catch((err) => {
      ocultarOverlayDeCarga()
      console.error("Error en la solicitud:", err)
      alert("Error de conexión o servidor.")
    })
}
