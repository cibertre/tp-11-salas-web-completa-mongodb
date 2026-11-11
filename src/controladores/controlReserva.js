function crearControladorReservas(servicio, salasPermitidas, turnosPermitidos) {
  async function listar(req, res) {
    const reservas = await servicio.listar();
    res.render("reservas/lista", {
      titulo: "Reservas de salas",
      reservas,
    });
  }
  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores: null,
      valores: {},
      salas: salasPermitidas,
      turnos: turnosPermitidos,
    });
  }
  async function mostrarDetalle(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }
    res.render("reservas/detalle", { titulo: reserva.estudiante, reserva });
  }
  async function crear(req, res, next) {
    try {
      // Usar req.body o req.reservaValidada según cómo devuelva los datos tu middleware
      const datos = req.reservaValidada || req.body;
      const nuevaReserva = await servicio.crear(datos);

      // Si la petición viene de la API (por ejemplo, si la ruta incluye /api/)
      if (req.baseUrl.includes("/api")) {
        return res
          .status(201)
          .location(`${req.baseUrl}/${nuevaReserva.id}`)
          .json(nuevaReserva);
      }

      res.redirect("/reservas");
    } catch (error) {
      if (req.baseUrl.includes("/api")) {
        console.error("Error al crear reserva:", error);

        return res.status(500).json({
          error: "Error interno al crear la reserva.",
        });
      }

      return next(error);
    }
  }

  async function mostrarEdicion(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
        codigo: 404,
      });
    }

    const valores = {
      estudiante: reserva.estudiante,
      email: reserva.email,
      sala: reserva.sala,
      fecha:
        reserva.fecha instanceof Date
          ? reserva.fecha.toISOString().slice(0, 10)
          : String(reserva.fecha).slice(0, 10),
      turno: reserva.turno,
      personas: String(reserva.personas),
      estado: reserva.estado,
    };

    return res.render("reservas/editar", {
      titulo: "Editar reserva",
      error: null,
      id: reserva.id,
      valores,
      salas: salasPermitidas,
      turnos: turnosPermitidos,
    });
  }

  async function guardarEdicion(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    const datos = req.body ?? {};

    // Recuperamos los siete campos enviados por el formulario.
    // Los conservamos como texto para poder volver a mostrarlos
    // si ocurre algún error de validación.
    const valores = {
      estudiante: typeof datos.estudiante === "string" ? datos.estudiante : "",
      email: typeof datos.email === "string" ? datos.email : "",
      sala: typeof datos.sala === "string" ? datos.sala : "",
      fecha: typeof datos.fecha === "string" ? datos.fecha : "",
      turno: typeof datos.turno === "string" ? datos.turno : "",
      personas: typeof datos.personas === "string" ? datos.personas : "",
      estado: typeof datos.estado === "string" ? datos.estado : "",
    };

    // Comprobamos que no se hayan enviado campos adicionales.
    const permitidos = [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
      "estado",
    ];

    const hayCamposExtra = Object.keys(datos).some(
      (campo) => !permitidos.includes(campo),
    );

    // Normalizamos los datos.
    const estudiante = valores.estudiante.trim();
    const email = valores.email.trim();
    const sala = valores.sala.trim();
    const fecha = valores.fecha.trim();
    const turno = valores.turno.trim();
    const estado = valores.estado.trim();

    // Convertimos personas de texto a número.
    const personas =
      valores.personas.trim() === "" ? NaN : Number(valores.personas);

    // Validamos los datos recibidos.
    const emailValido = /@/.test(email);
    const salaValida = salasPermitidas.includes(sala);
    const turnoValido = turnosPermitidos.includes(turno);
    const estadoValido = ["pendiente", "confirmada"].includes(estado);

    const personasValidas =
      Number.isInteger(personas) && personas >= 1 && personas <= 6;

    if (
      hayCamposExtra ||
      !estudiante ||
      !emailValido ||
      !salaValida ||
      !fecha ||
      !turnoValido ||
      !personasValidas ||
      !estadoValido
    ) {
      return res.status(400).render("reservas/editar", {
        titulo: "Editar reserva",
        error:
          "Datos inválidos. Revisá los siete campos y verificá que los valores sean correctos.",
        id: reserva.id,
        valores,
        salas: salasPermitidas,
        turnos: turnosPermitidos,
      });
    }

    // Construimos el objeto completo que reemplazará a la reserva.
    const reemplazo = {
      estudiante,
      email,
      sala,
      fecha,
      turno,
      personas,
      estado,
    };

    // Guardamos el contexto para que el manejador general
    // pueda recuperar el formulario si Mongoose genera un error.
    res.locals.contextoEdicion = {
      titulo: "Editar reserva",
      id: reserva.id,
      valores,
      salas: salasPermitidas,
      turnos: turnosPermitidos,
    };

    const actualizado = await servicio.reemplazar(reserva.id, reemplazo);

    if (!actualizado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    // Redirección 303 después de guardar correctamente.
    return res.redirect(303, `/reservas/${actualizado.id}`);
  }

  async function eliminarApi(req, res) {
    try {
      const eliminado = await servicio.eliminar(req.params.id);

      if (!eliminado) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(204).end();
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al eliminar reserva:", error);

      return res.status(500).json({
        error: "Error interno al eliminar la reserva.",
      });
    }
  }

  async function obtenerApi(req, res) {
    try {
      const reserva = await servicio.obtenerPorId(req.params.id);

      if (!reserva) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al obtener reserva:", error);

      return res.status(500).json({
        error: "Error interno al obtener la reserva.",
      });
    }
  }

  async function listarApi(req, res) {
    const permitidos = ["sala", "orden", "pagina", "limite"];

    for (const campo of Object.keys(req.query)) {
      if (!permitidos.includes(campo)) {
        return res.status(400).json({
          error: "Parámetro no permitido.",
        });
      }
    }

    const sala = req.query.sala;

    if (sala !== undefined) {
      if (typeof sala !== "string" || sala.trim() === "") {
        return res.status(400).json({
          error: "El nombre de la sala debe tener contenido.",
        });
      }
    }
    const orden = req.query.orden;

    const ordenesPermitidos = ["estudiante", "personas-asc", "personas-desc"];

    if (orden !== undefined) {
      if (typeof orden !== "string" || !ordenesPermitidos.includes(orden)) {
        return res.status(400).json({
          error: "El orden solicitado no es válido.",
        });
      }
    }
    // Validar que pagina sea un único texto
    if (
      req.query.pagina !== undefined &&
      typeof req.query.pagina !== "string"
    ) {
      return res.status(400).json({
        error: "El parámetro pagina debe enviarse una sola vez.",
      });
    }

    // Validar que limite sea un único texto
    if (
      req.query.limite !== undefined &&
      typeof req.query.limite !== "string"
    ) {
      return res.status(400).json({
        error: "El parámetro limite debe enviarse una sola vez.",
      });
    }

    // Convertir los valores después de comprobar que son textos únicos
    const pagina =
      req.query.pagina === undefined ? 1 : Number(req.query.pagina);

    const limite =
      req.query.limite === undefined ? 2 : Number(req.query.limite);

    if (
      !Number.isInteger(pagina) ||
      pagina < 1 ||
      pagina > 1000 ||
      !Number.isInteger(limite) ||
      limite < 1 ||
      limite > 20
    ) {
      return res.status(400).json({
        error: "La página o el límite no son válidos.",
      });
    }

    const datos = await servicio.consultar(sala, orden, pagina, limite);
    const total = await servicio.contar(sala);
    const paginas = Math.ceil(total / limite);

    return res.status(200).json({
      datos,
      pagina,
      limite,
      total,
      paginas,
    });
  }
  async function estadoApi(req, res) {
    const total = await servicio.contar();

    return res.status(200).json({
      totalReservas: total,
    });
  }
  async function reemplazarApi(req, res) {
    try {
      const reserva = await servicio.reemplazar(
        req.params.id,
        req.cambiosValidos,
      );

      if (!reserva) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al reemplazar reserva:", error);

      return res.status(500).json({
        error: "Error interno al reemplazar la reserva.",
      });
    }
  }

  async function actualizarApi(req, res) {
    try {
      const reserva = await servicio.actualizar(
        req.params.id,
        req.cambiosValidos,
      );

      if (!reserva) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al actualizar reserva:", error);

      return res.status(500).json({
        error: "Error interno al actualizar la reserva.",
      });
    }
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    mostrarEdicion,
    guardarEdicion,
    listarApi,
    obtenerApi,
    eliminarApi,
    estadoApi,
    reemplazarApi,
    actualizarApi,
    crearApi: crear,
  };
}
module.exports = { crearControladorReservas };
