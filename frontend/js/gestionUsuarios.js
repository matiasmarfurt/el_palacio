// URL base del endpoint para usuarios (API REST PHP)
const API_URL_USUARIOS = "../../backend/api/api_usuarios.php";

// Ejecutar listado de usuarios al cargar la página (si aplica)
window.onload = () => {
  listarUsuarios();
};

// Array global de usuarios (por si necesitás usarlo después)
let usuarios = [];

// Obtener todos los usuarios (GET)
function listarUsuarios() {
  console.log("listando usuarios...");

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No hay token de sesión disponible.");
    document.getElementById("usuariosContainer").innerHTML =
      "<p style='color:red;'>Debes iniciar sesión como admin para ver los usuarios.</p>";
    return;
  }

  fetch(API_URL_USUARIOS, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) =>
      res.json().then((data) => ({ status: res.status, body: data }))
    )
    .then(({ status, body }) => {
      if (!body.success) {
        console.error("Error al obtener usuarios:", body.error);
        document.getElementById(
          "usuariosContainer"
        ).innerHTML = `<p style='color:red;'>Error: ${body.error}</p>`;
        return;
      }
      usuarios = body.usuarios;
      console.log("Usuarios obtenidos:", usuarios);
      mostrarTablaUsuarios(usuarios);
    })
    .catch((err) => {
      console.error("Error al listar usuarios:", err);
      document.getElementById("usuariosContainer").innerHTML =
        "<p style='color:red;'>Error al cargar usuarios.</p>";
    });
}

// Mostrar tabla de usuarios en el div 'usuariosContainer'
function mostrarTablaUsuarios(usuarios) {
  const container = document.getElementById("usuariosContainer");

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    container.innerHTML = "<p>No hay usuarios para mostrar.</p>";
    return;
  }

  let html = `
    <div class="table-container">
      <table class="responsive-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>¿Eliminar?</th>
            <th>¿Modificar?</th>
          </tr>
        </thead>
        <tbody>
  `;

  usuarios.forEach((u) => {
    html += `
      <tr>
        <td data-label="ID">${u.id_usuario}</td>
        <td data-label="Nombre">${u.nombre_usuario}</td>
        <td data-label="Apellido">${u.apellido_usuario}</td>
        <td data-label="Email">${u.email}</td>
        <td data-label="Tipo">${u.tipo}</td>
        <td data-label="¿Eliminar?">
          <button class="btn-eliminar" onclick="eliminarUsuario(${
            u.id_usuario
          })">Eliminar</button>
        </td>
        <td data-label="¿Modificar?">
          <button class="btn-modificar" onclick='abrirFormularioModificarUsuario(${JSON.stringify(
            u
          )})'>Modificar</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>

    <form id="formModificarUsuario" class="form-modificar" style="display:none;" onsubmit="enviarModificacionUsuario(event)">
      <input type="hidden" id="modificarIdUsuario">

      <label>Nombre:
        <input type="text" id="modificarNombreUsuario" class="input-modificar" required>
      </label>

      <label>Apellido:
        <input type="text" id="modificarApellidoUsuario" class="input-modificar" required>
      </label>

      <label>Email:
        <input type="email" id="modificarEmailUsuario" class="input-modificar" required>
      </label>

      <label>Tipo:
        <select id="modificarTipoUsuario" class="input-modificar" required>
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <button type="submit" class="btn-guardar">Guardar cambios</button>
    </form>
  `;

  container.innerHTML = html;
}

// Abrir formulario de modificación con datos actuales del usuario
function abrirFormularioModificarUsuario(usuario) {
  console.log("Abriendo formulario para usuario:", usuario);

  document.getElementById("formModificarUsuario").style.display = "block";
  document.getElementById("modificarIdUsuario").value = usuario.id_usuario;
  document.getElementById("modificarNombreUsuario").value =
    usuario.nombre_usuario;
  document.getElementById("modificarApellidoUsuario").value =
    usuario.apellido_usuario;
  document.getElementById("modificarEmailUsuario").value = usuario.email;
  document.getElementById("modificarTipoUsuario").value = usuario.tipo;

  document.getElementById("formModificarUsuario").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Enviar modificación de usuario al backend (PUT)
function enviarModificacionUsuario(event) {
  event.preventDefault();
  console.log("Enviando modificación de usuario...");

  const id = document.getElementById("modificarIdUsuario").value;
  const nombre = document.getElementById("modificarNombreUsuario").value;
  const apellido = document.getElementById("modificarApellidoUsuario").value;
  const email = document.getElementById("modificarEmailUsuario").value;
  const tipo = document.getElementById("modificarTipoUsuario").value;

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No hay token de sesión disponible.");
    alert("Debes iniciar sesión como admin para modificar usuarios.");
    return;
  }

  fetch(API_URL_USUARIOS, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      id_usuario: id,
      nombre_usuario: nombre,
      apellido_usuario: apellido,
      email,
      tipo,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Usuario modificado:", data);
      alert(data.message || data.error);
      listarUsuarios(); // refrescar tabla
    })
    .catch((err) => console.error("Error al modificar usuario:", err));
}

// Eliminar usuario por ID (DELETE)
function eliminarUsuario(id) {
  console.log("Intentando eliminar usuario ID:", id);

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No hay token de sesión disponible.");
    alert("Debes iniciar sesión como admin para eliminar usuarios.");
    return;
  }

  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  fetch(API_URL_USUARIOS, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ id_usuario: id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log("Usuario eliminado correctamente:", id);
        alert("Usuario eliminado correctamente.");
        listarUsuarios(); // refrescar tabla
      } else {
        console.error("Error al eliminar usuario:", data.error);
        alert("Error al eliminar usuario: " + data.error);
      }
    })
    .catch((err) => {
      console.error("No se pudo eliminar el usuario:", err);
      alert("No se pudo eliminar el usuario.");
    });
}
