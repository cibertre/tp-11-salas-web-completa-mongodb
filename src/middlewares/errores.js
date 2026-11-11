function crearManejadorErrores({ vistaFormulario, tituloFormulario }) {
  return function manejarErrores(error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }
    const esValidacion = error.name === "ValidationError";
    const esEntrada =
      esValidacion ||
      error.codigo === "ID_INVALIDO" ||
      error.codigo === "FILTRO_INVALIDO" ||
      error.type === "entity.parse.failed";
    const estado = esEntrada ? 400 : 500;
    let mensaje = esEntrada
      ? "Revisá los datos enviados."
      : "No se pudo completar la operación.";
    if (error.codigo === "ID_INVALIDO") {
      mensaje = "El identificador debe tener 24 caracteres hexadecimales.";
    }
    console.error("Solicitud fallida:", res.locals.solicitudId, error.name);
    if (req.path.startsWith("/api/")) {
      return res.status(estado).json({
        error: mensaje,
        campos: esValidacion ? Object.keys(error.errors) : [],
      });
    }
    const contextoEdicion = res.locals.contextoEdicion;

    if (req.method === "POST" && contextoEdicion) {
      return res.status(estado).render("reservas/editar", {
        ...contextoEdicion,
        error: mensaje,
      });
    }
    if (esValidacion && req.method === "POST") {
      return res.status(400).render(vistaFormulario, {
        titulo: tituloFormulario,
        error: mensaje,
        valores: req.body ?? {},
      });
    }
    return res.status(estado).render("no-encontrado", {
      titulo: esEntrada ? "Solicitud inválida" : "Error del servicio",
      mensaje,
      codigo: estado,
    });
  };
}
module.exports = { crearManejadorErrores };
