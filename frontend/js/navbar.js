// Script para darle dinamismo al menú hamburguesa del Navbar

document.addEventListener("DOMContentLoaded", () => {
  const navbarToggler = document.querySelector(".navbar-toggler")
  const navbarCollapse = document.getElementById("navbarNav")
  const navLinks = document.querySelectorAll(".nav-link")

  // Cerrar el menú al hacer clic en un enlace
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navbarToggler && navbarToggler.offsetParent !== null) {
        navbarToggler.click()
      }
    })
  })

  // Mostrar animación o cambio de ícono
  if (navbarToggler) {
    navbarToggler.addEventListener("click", () => {
      navbarToggler.classList.toggle("active")
    })
  }

  mostrarNombreUsuarioEnNavbar()
})

function mostrarNombreUsuarioEnNavbar() {
  const usuarioJSON = localStorage.getItem("usuario")

  if (usuarioJSON) {
    try {
      const usuario = JSON.parse(usuarioJSON)
      const nombreCompleto = `${usuario.nombre_usuario} ${usuario.apellido_usuario}`

      // Buscar en navbar estándar (última posición)
      let userLink = document.querySelector(".navbar-nav .nav-item:last-child .nav-link")

      // Si no se encuentra, buscar en el admin header
      if (!userLink) {
        userLink = document.getElementById("userLinkAdmin")
      }

      if (userLink) {
        // Reemplazar el icono con el nombre del usuario
        userLink.textContent = nombreCompleto
        userLink.href = "#" // Cambiar href para que no sea un enlace de navegación
        userLink.style.cursor = "pointer"

        // Agregar evento para cerrar sesión al hacer clic
        userLink.addEventListener("click", (e) => {
          e.preventDefault()
          mostrarMenuUsuario(usuario, userLink)
        })
      }
    } catch (error) {
      console.error("Error al parsear datos del usuario:", error)
    }
  }
}

function mostrarMenuUsuario(usuario, userLink) {
  const menuExistente = document.getElementById("userMenu")

  if (menuExistente) {
    menuExistente.remove()
    return
  }

  const navbar = document.querySelector(".navbar")
  const navbarHeight = navbar ? navbar.offsetHeight : 56

  console.log("[v0] Navbar height:", navbarHeight)
  console.log("[v0] Creating dropdown menu")

  const menu = document.createElement("div")
  menu.id = "userMenu"

  const rect = userLink.getBoundingClientRect()
  console.log("[v0] UserLink position:", rect)

  menu.style.cssText = `
    position: fixed;
    top: ${navbarHeight}px;
    right: 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 10000;
    min-width: 200px;
  `

  menu.innerHTML = `
    <div style="padding: 10px;">
      <p style="margin: 0 0 10px 0; font-weight: bold;">${usuario.nombre_usuario} ${usuario.apellido_usuario}</p>
      <p style="margin: 0 0 10px 0; font-size: 0.9em; color: #666;">${usuario.email}</p>
      <button id="cerrarSesionBtn" style="width: 100%; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar Sesión</button>
    </div>
  `

  document.body.appendChild(menu)
  console.log("[v0] Dropdown menu appended to body")

  document.getElementById("cerrarSesionBtn").addEventListener("click", () => {
    localStorage.removeItem("usuario")
    window.location.href = "../page/index.html"
  })

  // Cerrar menú al hacer clic fuera
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target) && e.target !== userLink) {
        console.log("[v0] Closing dropdown menu")
        menu.remove()
        document.removeEventListener("click", closeMenu)
      }
    })
  }, 0)
}
