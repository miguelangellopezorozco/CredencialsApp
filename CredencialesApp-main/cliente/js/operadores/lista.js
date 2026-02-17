document.addEventListener("DOMContentLoaded", async () => {
  cargarUsuarios();
});

async function cargarUsuarios() {
  try {
    const usuarios = await api.get("/operadores");

    const contenedor = document.querySelector(".row-cols-1");
    contenedor.innerHTML = "";

    usuarios.forEach(usuario => {
      contenedor.innerHTML += `
        <div class="col">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <h5>${usuario.usuario}</h5>
              <p class="text-muted">${usuario.rol}</p>
            </div>
            <div class="card-footer d-flex justify-content-between">
              <button class="btn btn-sm btn-outline-danger"
                onclick="eliminarUsuario(${usuario.id})">
                <i class="bi bi-trash me-1"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
}

async function eliminarUsuario(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este usuario?");
  if (!confirmar) return;

  try {
    await api.delete(`/operadores/${id}`);
    alert("Usuario eliminado correctamente");

    cargarUsuarios(); // recargar lista

  } catch (error) {
    console.error("Error eliminando:", error);
    alert(error.mensaje || "No se pudo eliminar");
  }
}

