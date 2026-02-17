document.addEventListener("DOMContentLoaded", async () => {

  const form = document.getElementById("formCrear");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;

    try {
      await api.post("/operadores", {
        usuario,
        password,
        rol
      });

      alert("Usuario creado correctamente");
      window.location.href = "lista.html";

    } catch (error) {
      console.error(error);
      alert("Error al crear usuario");
    }
  });

});
