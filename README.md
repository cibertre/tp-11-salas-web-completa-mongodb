# Trabajo práctico 11 - Reservas de salas: aplicación web completa con MongoDB

Esta es una actualización de la aplicación de reservas de salas de estudio que venía haciendo en los TP 06, 07, 08, 09 y 10.

En los trabajos anteriores incorporé las operaciones del CRUD, la conexión con MongoDB Atlas y las consultas con filtros, ordenamiento y paginación desde la API.

En esta entrega trabajé sobre la aplicación web, completando las operaciones para crear, consultar y modificar reservas desde la interfaz HTML. También incorporé la vista de detalle y el formulario de edición, que permite modificar una reserva existente con sus datos precargados.

Además, trabajé sobre las validaciones y el manejo de errores para que, cuando se envían datos incorrectos, la aplicación informe el problema y permita corregirlo sin perder los valores ingresados.

Las reservas siguen guardándose en MongoDB Atlas, por lo que no se pierden cuando reinicio el servidor. Tanto el sitio HTML como la API utilizan el mismo servicio y trabajan sobre los mismos documentos.

Hecho con Node.js, Express 5, EJS y Mongoose. Alumno: Renato G. Trentini.

---

## 1. Inicio del proyecto

- Arranqué desde el proyecto del TP 10, que ya tenía la conexión con MongoDB Atlas, las operaciones del CRUD y las consultas con filtros, ordenamiento y paginación.
- Mantuve la estructura general de carpetas y la separación entre rutas, controladores, servicios y modelos.
- Conservé las operaciones anteriores para crear, consultar, modificar y eliminar reservas desde la API.
- Completé la interfaz web para poder trabajar con las reservas desde el navegador.
- Incorporé la vista de detalle de una reserva.
- Agregué el formulario de edición, con los datos de la reserva cargados previamente.
- Incorporé el tratamiento de errores para mostrar mensajes adecuados cuando se envían datos incorrectos o se intenta acceder a una reserva inexistente.
- Mantuve la conexión con MongoDB Atlas y la persistencia de los documentos.
- No copié el historial de Git, ni `node_modules`, ni el archivo `.env`.

## 2. Versiones

Se mantienen las dependencias del proyecto anterior y se conserva la configuración utilizada en los trabajos anteriores.

| Herramienta | Versión |
| --- | --- |
| Node.js | v22.16.0 |
| Express | ^5.2.1 |
| Mongoose | ^9.11.2 |
| EJS | ^6.0.1 |
| express-ejs-layouts | ^2.5.1 |
| morgan | ^1.12.1 |
| dotenv | ^18.0.9 |
| ESLint (dev) | ^10.12.0 |
| @eslint/js (dev) | ^10.0.1 |
| Prettier (dev) | ^3.9.10 |

Las dependencias están declaradas en `package.json`. Las versiones exactas que se instalaron quedan registradas en `package-lock.json`.

Uso **CommonJS** (`require` y `module.exports`).

Se mantienen las dependencias utilizadas en los trabajos anteriores y se conserva `dotenv` como dependencia del proyecto.

## 3. Preparar MongoDB Atlas

1. Utilizo un cluster gratuito M0 en MongoDB Atlas.
2. Tengo configurado un usuario de base de datos para conectarme.
3. En Network Access agregué la IP desde la que me conecto.
4. La base de datos se llama `reservas_salas_u11`.
5. La colección se llama `reservas`.
6. La colección se crea automáticamente cuando se guarda el primer documento.

El sitio y la API trabajan sobre esta misma base de datos. Por eso, una modificación realizada desde el navegador también puede consultarse desde Postman, y viceversa.

## 4. Variables de entorno y DNS

El archivo `.env` no se entrega ni se sube al repositorio porque contiene los datos de conexión.

Dejé una plantilla `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST_DEL_CLUSTER/reservas_salas_u11?retryWrites=true&w=majority
```

- `USUARIO`, `CLAVE` y `HOST_DEL_CLUSTER` son marcadores y se deben reemplazar por los datos de cada conexión.
- Para preparar el entorno se copia `.env.example` y se completa con la URI correspondiente.
- La base de datos indicada en la URI es `reservas_salas_u11`.
- La corrección de DNS está en `src/config/base-datos.js`, donde se utilizan los servidores `8.8.8.8` y `1.1.1.1`, como en los trabajos anteriores.
- Esta configuración permite resolver la dirección `mongodb+srv` de Atlas.
- El archivo `.env` contiene la URI real y debe mantenerse privado.

## 5. Cómo iniciar la aplicación

Primero hay que instalar las dependencias:

```bash
npm install
```

Para iniciar el servidor en el entorno local utilizo:

```bash
npm run start:local
```

Este comando ejecuta:

```bash
node --env-file=.env src/index.js
```

Es importante utilizar `start:local` porque carga las variables del archivo `.env` antes de iniciar la aplicación.

En cambio, `npm start` ejecuta:

```bash
node src/index.js
```

Este último comando no carga automáticamente el archivo `.env`. Por eso, si `MONGODB_URI` no está definida previamente en el entorno, la aplicación muestra el error:

```text
No se pudo iniciar la aplicación: Error: Falta MONGODB_URI en el entorno.
```

Para el desarrollo local utilizo `npm run start:local`.

Después se abre:

```text
http://localhost:3000
```

El arranque se realiza en este orden:

1. Lee la configuración del entorno.
2. Intenta conectarse con MongoDB Atlas.
3. Espera a que la conexión se establezca.
4. Recién después inicia el servidor y abre el puerto.

Si falta la URI o falla la conexión, muestra el error y no inicia el servidor.

Cuando se cierra la aplicación con Ctrl+C (`SIGINT`) o mediante `SIGTERM`, se cierra el servidor y después la conexión con MongoDB.

## 6. Cómo está organizado el proyecto

```text
src/
  config/          configuración del entorno y conexión a MongoDB
  modelos/         esquema de Mongoose
  servicios/       operaciones con MongoDB
  controladores/   reciben las solicitudes y preparan las respuestas
  rutas/           rutas HTML y rutas de la API
  middlewares/     validaciones y manejo de solicitudes
  views/           vistas EJS
  app.js           configuración de Express
  index.js         conexión y arranque del servidor

scripts/            programas para probar desde la terminal
public/             archivos públicos, como CSS
```

La idea es mantener separadas las responsabilidades:

- El modelo define cómo es una reserva y sus validaciones.
- El servicio se comunica con MongoDB y realiza las operaciones de consulta, creación, modificación y eliminación.
- Los controladores reciben las solicitudes y devuelven la respuesta correspondiente.
- Las rutas conectan las direcciones con sus controladores.
- Los middlewares validan los datos antes de que lleguen al servicio y permiten centralizar el tratamiento de errores.

En esta entrega también trabajé sobre los controladores y las vistas para completar el flujo de edición desde el sitio HTML.

Tanto las rutas HTML como las rutas de la API utilizan el mismo servicio de reservas. De esta manera, no se duplica la lógica de acceso a MongoDB.

### Comandos disponibles

Se mantienen los comandos del proyecto anterior:

| Comando | Qué hace |
| --- | --- |
| `npm start` | Inicia la aplicación sin cargar automáticamente el `.env` |
| `npm run start:local` | Inicia la aplicación cargando el `.env` |
| `npm run comprobardb` | Comprueba la conexión con MongoDB |
| `npm run validar` | Ejecuta el script de validación de una reserva |
| `npm run crear` | Ejecuta el script para crear una reserva |
| `npm run listar` | Ejecuta el script para listar reservas |
| `npm run format` | Aplica Prettier sobre `src` y `scripts` |
| `npm run format:check` | Comprueba el formato |
| `npm run lint` | Ejecuta ESLint |
| `npm run check` | Ejecuta la comprobación de formato y ESLint |

## 7. Modelo de reserva

Los campos de una reserva son:

| Campo | Regla |
| --- | --- |
| estudiante | Texto obligatorio, con espacios exteriores eliminados |
| email | Texto obligatorio, debe contener `@` |
| sala | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| fecha | Texto obligatorio |
| turno | `Mañana`, `Tarde` o `Noche` |
| personas | Número entero entre 1 y 6 |
| estado | `pendiente` o `confirmada` |

El estado tiene un valor predeterminado: `pendiente`.

### Diferencia entre crear y modificar

Para crear una reserva mediante POST, el cliente solamente puede enviar los seis campos originales:

- estudiante
- email
- sala
- fecha
- turno
- personas

No puede enviar `estado` ni `_id`. Si intenta agregar alguno de esos campos, la solicitud se rechaza con código 400.

El estado se asigna automáticamente como `pendiente` desde el modelo.

En cambio, para reemplazar una reserva mediante PUT se deben enviar los siete campos, incluido `estado`.

Para PATCH solamente se permiten los campos `personas` y `estado`. Se puede enviar uno o los dos, pero no se aceptan otros campos.

El servicio no pasa directamente `req.body` a Mongoose. Utiliza los campos que fueron validados y preparados por los middlewares.

También se rechazan datos ausentes, campos no permitidos y valores incorrectos para `personas`, como booleanos, arreglos u objetos.

Además de las validaciones del middleware, el modelo de Mongoose también tiene sus propias validaciones.

Ejemplo de una reserva (datos ficticios):

```json
{
  "id": "65f0c0ffee0123456789abcd",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}
```

El `id` es un texto que sale del `_id` de MongoDB. No se convierte a número.

## 8. Consultas, filtros y paginación

Se mantienen las opciones incorporadas en el TP 10 para consultar las reservas desde la API.

La consulta permite:

- Filtrar por sala.
- Ordenar los resultados.
- Consultar una página determinada.
- Establecer cuántas reservas se muestran por página.
- Conocer la cantidad total de reservas que coinciden con el filtro.
- Calcular cuántas páginas se necesitan.

### Parámetros permitidos

| Parámetro | Función |
| --- | --- |
| `sala` | Filtra las reservas por el nombre de la sala |
| `orden` | Indica cómo se ordenan los resultados |
| `pagina` | Indica qué página se quiere consultar |
| `limite` | Indica cuántas reservas se muestran por página |

Los valores permitidos para `orden` son:

- `estudiante`: ordena por nombre del estudiante.
- `personas-asc`: ordena por cantidad de personas de menor a mayor.
- `personas-desc`: ordena por cantidad de personas de mayor a menor.

Los valores predeterminados son:

- Página: `1`.
- Límite: `2`.
- Orden: `estudiante`.

El límite máximo permitido es 20. Si se envía un valor mayor, la API responde con código 400.

### Ejemplo de consulta

```text
GET http://localhost:3000/api/reservas?sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

En este caso se buscan las reservas de Sala Norte, ordenadas por cantidad de personas de menor a mayor, mostrando los primeros dos resultados.

### Respuesta de la consulta

La respuesta devuelve un objeto con cinco propiedades:

```json
{
  "datos": [
    {
      "id": "6ae8a31281fd53a85c6e0c0c",
      "estudiante": "Juan Ejemplo",
      "email": "juanjo.ejemplo@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-11-18",
      "turno": "Mañana",
      "personas": 2,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 2,
  "paginas": 1
}
```

Las propiedades significan lo siguiente:

- `datos`: contiene las reservas que corresponden a la página solicitada.
- `pagina`: indica la página actual.
- `limite`: indica cuántos resultados se muestran por página.
- `total`: indica la cantidad total de reservas que cumplen el filtro.
- `paginas`: indica la cantidad total de páginas.

Para obtener los datos se utiliza `find()` con el filtro correspondiente, el ordenamiento y la paginación.

Para calcular el total se utiliza `countDocuments()`. Este método cuenta todos los documentos que coinciden con el filtro, sin aplicar la paginación.

Esto es importante porque, aunque una página no tenga resultados, el total debe seguir indicando cuántas reservas existen para ese filtro.

Por ejemplo, si se solicitan las reservas de una sala y se consulta una página que no tiene registros, `datos` devuelve un arreglo vacío, pero `total` conserva la cantidad de reservas encontradas para esa sala.

### Validaciones de los parámetros

El controlador solamente acepta los parámetros `sala`, `orden`, `pagina` y `limite`.

También controla que:

- La sala tenga contenido.
- No se repita el parámetro `sala`.
- El orden corresponda a uno de los valores permitidos.
- La página sea un número entero mayor o igual a 1.
- El límite sea un número entero mayor o igual a 1 y no supere 20.
- No se repitan parámetros como `pagina`.
- No se envíen parámetros que no estén permitidos, como `select`.

Si alguna de estas condiciones no se cumple, la consulta responde con código 400.

## 9. Endpoints

### API JSON

Se mantienen los endpoints incorporados en el TP 10:

| Método y dirección | Resultado |
| --- | --- |
| `GET /api/reservas` | Lista las reservas con paginación |
| `GET /api/reservas?sala=Sala%20Norte` | Lista las reservas de esa sala |
| `GET /api/reservas?orden=personas-asc` | Ordena por cantidad de personas |
| `GET /api/reservas?pagina=2&limite=2` | Consulta una página determinada |
| `GET /api/reservas/estado` | Devuelve la cantidad total de reservas |
| `GET /api/reservas/:id` | Busca una reserva por su ID |
| `POST /api/reservas` | Crea una reserva |
| `PUT /api/reservas/:id` | Reemplaza todos los campos permitidos de una reserva |
| `PATCH /api/reservas/:id` | Modifica `personas`, `estado` o ambos |
| `DELETE /api/reservas/:id` | Elimina físicamente una reserva |

### Ruta de estado

También se mantiene la consulta para conocer cuántas reservas hay guardadas.

La dirección es:

```text
GET http://localhost:3000/api/reservas/estado
```

La respuesta tiene esta estructura:

```json
{
  "totalReservas": 7
}
```

El número depende de la cantidad de documentos que haya guardados en MongoDB.

Para obtenerlo se utiliza `countDocuments()` sin un filtro, por lo que cuenta todas las reservas de la colección.

### Respuestas de la API

| Situación | Código HTTP |
| --- | --- |
| Consulta correcta | 200 |
| Reserva creada correctamente | 201 |
| Eliminación correcta | 204 |
| ID mal formado | 400 |
| Datos inválidos o campos no permitidos | 400 |
| Parámetros de consulta inválidos | 400 |
| ID válido pero reserva inexistente | 404 |
| Ruta de API inexistente | 404 |
| Error inesperado del servidor | 500 |

### Sitio HTML

En esta entrega se completa el trabajo desde el navegador, incorporando el detalle y la edición de las reservas.

| Dirección | Qué hace |
| --- | --- |
| `GET /` | Página de inicio |
| `GET /reservas` | Muestra el listado de reservas |
| `GET /reservas/nueva` | Muestra el formulario de creación |
| `POST /reservas` | Guarda una reserva desde el formulario |
| `GET /reservas/:id` | Muestra el detalle de una reserva |
| `GET /reservas/:id/editar` | Muestra el formulario de edición con los datos cargados |
| `POST /reservas/:id/editar` | Valida y guarda los cambios de una reserva |
| `GET /estado` | Devuelve información de las reservas guardadas |

El sitio sigue utilizando MongoDB. Por eso, los cambios que se hacen desde la API también se reflejan cuando se consulta el listado o el detalle desde el navegador.

### Edición desde el sitio HTML

El flujo de edición funciona de la siguiente manera:

1. Desde el listado o el detalle se accede a la opción de editar una reserva.
2. La aplicación busca la reserva en MongoDB mediante su identificador.
3. Si existe, muestra el formulario de edición con los datos actuales.
4. El usuario puede modificar los campos y enviar el formulario.
5. El controlador recibe los datos y realiza las validaciones correspondientes.
6. Si los datos son correctos, el servicio reemplaza los valores de la reserva en MongoDB.
7. La aplicación redirige al detalle de la reserva actualizada.

El formulario permite modificar los siete campos:

- estudiante
- email
- sala
- fecha
- turno
- personas
- estado

Los valores se muestran previamente cargados para que el usuario pueda modificarlos sin tener que ingresar toda la información nuevamente.

Si se cancela la edición, se vuelve al detalle sin guardar los cambios.

Si se envían datos inválidos, la aplicación responde con código 400, muestra el mensaje correspondiente y conserva los valores ingresados para poder corregirlos.

Si la reserva no existe, responde con código 404.

### Manejo de errores

También se trabajó sobre el manejo de errores de la aplicación.

El middleware centralizado permite diferenciar los errores de entrada de los errores inesperados del servidor.

Para las solicitudes de la API se devuelve una respuesta JSON con el mensaje de error y los campos que presentan problemas cuando corresponde.

Para las solicitudes del sitio HTML se muestran las vistas correspondientes con el mensaje de error.

En el formulario de edición, cuando se produce un error de validación, se conserva el contexto de la reserva y los valores enviados para que el usuario pueda corregirlos.

De esta manera, el sitio y la API mantienen respuestas diferentes según el tipo de solicitud, pero utilizan las mismas validaciones y el mismo servicio de reservas.

## 10. Cómo probar en Postman

Para realizar las pruebas hay que tener el servidor iniciado con:

```bash
npm run start:local
```

La dirección base es:

```text
http://localhost:3000
```

En las solicitudes que llevan datos se utiliza `Body > raw > JSON`.

### Ejemplo de consulta con filtros y paginación

**Método:** GET

**URL:**

```text
http://localhost:3000/api/reservas
```

En la pestaña Params se pueden cargar los siguientes valores:

| Key | Value |
| --- | --- |
| sala | Sala Norte |
| orden | personas-asc |
| pagina | 1 |
| limite | 2 |

Postman genera la dirección con los parámetros correspondientes.

La respuesta esperada es un objeto que contiene los resultados y los datos de paginación.

### Ejemplo de consulta general

```text
GET http://localhost:3000/api/reservas
```

Al no enviar parámetros, la aplicación utiliza los valores predeterminados: página 1, límite 2 y orden por estudiante.

### Ejemplo de POST

**Método:** POST

**URL:**

```text
http://localhost:3000/api/reservas
```

**Body:**

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 2
}
```

La respuesta esperada es `201 Created`, con el ID generado por MongoDB y el estado `pendiente`.

### Ejemplo de PUT

**Método:** PUT

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

**Body:**

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Sur",
  "fecha": "2026-11-11",
  "turno": "Tarde",
  "personas": 3,
  "estado": "pendiente"
}
```

La respuesta esperada es `200 OK`, con la reserva actualizada y el mismo ID.

Para PUT es obligatorio enviar los siete campos. Si falta alguno, la solicitud responde con código 400 y la reserva no se modifica.

### Ejemplo de PATCH

**Método:** PATCH

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

**Body:**

```json
{
  "estado": "confirmada"
}
```

En este caso solamente cambia el estado. Los demás campos se conservan.

### Ejemplo de DELETE

**Método:** DELETE

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

Si la reserva existe, la respuesta es `204 No Content`.

Si se repite la misma solicitud, la respuesta es `404`, porque ya fue eliminada.

**Importante:** para las pruebas de creación, modificación y eliminación conviene utilizar reservas de prueba. El POST crea documentos reales y el DELETE los elimina de la base.

### Pruebas de edición desde el navegador

Para probar el formulario de edición no es necesario utilizar Postman.

1. Iniciar la aplicación con `npm run start:local`.
2. Abrir el listado de reservas.
3. Seleccionar una reserva existente.
4. Ingresar a la opción de edición.
5. Comprobar que los siete campos aparezcan precargados.
6. Modificar los datos y guardar.
7. Comprobar que la aplicación redirija al detalle actualizado.
8. Consultar el mismo ID desde Postman para verificar que los cambios también estén guardados en MongoDB.

También se puede cancelar la edición y comprobar que los datos originales permanezcan sin modificaciones.

## 11. Matriz de resultados de las pruebas

En esta sección anoté los resultados que fui comprobando en Postman, el navegador y la terminal durante las pruebas del TP 11.

### Edición desde el sitio HTML

| Caso probado | Resultado esperado | Resultado observado |
| --- | --- | --- |
| GET al formulario de edición con ID existente | 200 y formulario con los siete campos precargados | 200. Se mostraron los siete campos con los datos de la reserva |
| Cancelar una edición | Volver al detalle sin guardar cambios | Se volvió al detalle y los datos originales permanecieron intactos |
| Guardar una edición válida | 303 y redirección al detalle actualizado | 303. Se guardaron los cambios y se mostró el detalle actualizado |
| GET por API después de editar desde HTML | 200 y los datos actualizados | 200. Se comprobó que la API devolvía los mismos cambios realizados desde el navegador |
| Enviar datos inválidos desde el formulario | 400 y conservación de los valores enviados | 400. Se mostró el mensaje de validación y se conservaron los valores ingresados |
| Intentar editar una reserva inexistente | 404 | 404. Se mostró la vista de error correspondiente |
| Intentar editar con un ID inválido | 400 | 400. Se mostró el mensaje indicando que el identificador debe tener 24 caracteres hexadecimales |

### Pruebas de la API

| Caso probado | Resultado esperado | Resultado observado |
| --- | --- | --- |
| PUT con todos los campos válidos | 200 y reserva reemplazada | 200. Se actualizaron los siete campos y se conservó el mismo ID |
| PUT sin enviar el campo `estado` | 400 y mensaje indicando el campo obligatorio faltante | 400. La API informó `Falta el campo obligatorio: estado` |
| GET después del PUT incompleto | 200 y datos anteriores sin modificaciones | 200. La reserva conservó los datos del PUT completo anterior |

### Prueba de persistencia después de reiniciar

También comprobé que los datos continúan guardados en MongoDB después de cerrar y volver a iniciar el servidor.

1. Realicé un PUT completo desde Postman sobre una reserva existente.
2. La API respondió `200 OK` y devolvió los datos actualizados.
3. Intenté realizar otro PUT sin enviar el campo obligatorio `estado`.
4. La API respondió `400 Bad Request` y explicó qué campo faltaba.
5. Consulté nuevamente el mismo ID y comprobé que los datos del PUT anterior permanecían intactos.
6. Cerré el servidor con Ctrl+C.
7. Volví a iniciar la aplicación mediante `npm run start:local`.
8. Consulté nuevamente el mismo ID desde Postman.
9. La API respondió `200 OK` y devolvió los mismos datos.

Los datos comprobados después del reinicio fueron:

```json
{
  "id": "6aedc1b931932bd2c2d7e8b0",
  "estudiante": "Prueba PUT TP11",
  "email": "prueba.put@example.com",
  "sala": "Sala Sur",
  "fecha": "2026-11-20",
  "turno": "Mañana",
  "personas": 3,
  "estado": "pendiente"
}
```

Con esta prueba comprobé que los datos permanecen guardados en MongoDB y que reiniciar el servidor no genera una nueva carga de las reservas.

### Verificaciones de formato, código y conexión

También ejecuté los comandos disponibles para comprobar el proyecto desde la terminal.

| Comando | Resultado esperado | Resultado observado |
| --- | --- | --- |
| `npm run format` | Aplicar el formato de Prettier | Correcto. Los archivos indicaron `(unchanged)` |
| `npm run check` | Comprobar formato y ejecutar ESLint | Correcto. Prettier informó que todos los archivos cumplen el formato y ESLint no mostró errores |
| `npm run comprobardb` | Establecer conexión con MongoDB | Correcto. Se mostró `Conexion con MongoDB establecida` |

## 12. Cosas que fallaron durante las pruebas y cómo las arreglé

Durante el desarrollo aparecieron algunos problemas que tuve que corregir.

| Qué pasaba | Qué hice |
| --- | --- |
| La vista de detalle no mostraba correctamente todos los datos de la reserva | Revisé la estructura de la vista y completé la presentación de los campos |
| La vista de detalle tenía una etiqueta de cierre faltante | Corregí la estructura HTML de la vista |
| La vista de error mostraba siempre el código 404 | Modifiqué la vista para que pudiera recibir y mostrar el código correspondiente |
| Al intentar mostrar un error podía producirse un problema cuando la variable `codigo` no estaba definida | Utilicé una comprobación para establecer el valor predeterminado cuando la variable no existe |
| El formulario de edición debía mostrar los datos actuales de la reserva | Incorporé la búsqueda de la reserva y la carga de sus valores en los campos |
| Al guardar una edición había que validar los datos antes de modificar MongoDB | Se utilizaron las validaciones correspondientes antes de llamar al servicio |
| Cuando se enviaban datos inválidos desde la edición había que conservar los valores ingresados | Se incorporó el contexto de edición para poder volver a mostrar el formulario con los datos enviados |
| Al intentar editar una reserva inexistente había que evitar que se modificara o creara un documento | Se verificó la existencia de la reserva y se respondió con código 404 |
| El navegador podía impedir el envío de algunos datos inválidos por sus validaciones HTML | Para comprobar la respuesta del servidor se desactivó temporalmente la validación del formulario desde la consola del navegador |
| El comando `npm start` no encontraba `MONGODB_URI` | Para el entorno local utilicé `npm run start:local`, que carga el archivo `.env` |

Una cuestión importante de esta entrega fue completar el flujo de edición sin duplicar la lógica de acceso a MongoDB.

El controlador recibe los datos, realiza las comprobaciones correspondientes y utiliza el servicio para modificar la reserva. De esta manera, tanto la API como el sitio HTML siguen trabajando sobre los mismos documentos.

También fue importante diferenciar los errores de validación de los errores inesperados del servidor, para devolver el código HTTP correspondiente y mostrar una respuesta adecuada según se trate de una solicitud HTML o de una solicitud de API.

## 13. Pequeña decisión de diseño

Si en un futuro incorporáramos información sobre las salas, podríamos guardar datos propios de cada una, como su nombre, capacidad, ubicación y los recursos disponibles. En cambio, una reserva contiene información relacionada con el estudiante, la fecha, el turno y la cantidad de personas.

Considero que tendría sentido utilizar una referencia entre la reserva y la sala, porque una misma sala puede tener muchas reservas y así evitaríamos repetir sus datos en cada registro. También podrían utilizarse datos embebidos si necesitáramos guardar información pequeña y específica de la sala dentro de la reserva. La elección dependería de cómo necesitemos consultar y mantener esa información.

No implementé otro modelo ni utilicé `populate`, porque el ejercicio solamente pide explicar esta decisión de diseño.

## 14. Lo que todavía no valida mi aplicación

La aplicación tiene las validaciones solicitadas para esta entrega, pero todavía hay cuestiones que no contempla:

- No comprueba que el email sea una dirección real. Solamente verifica que tenga `@`.
- La fecha se guarda como texto obligatorio, pero no se comprueba si es una fecha real o futura.
- No verifica si dos reservas se superponen en el mismo horario.
- No controla disponibilidad real de las salas.
- No tiene autenticación ni permisos de usuarios.
- No comprueba si una reserva ya existe con los mismos datos.

Estas cuestiones podrían agregarse en futuras versiones, pero no forman parte de lo que implementé en este trabajo.

## 15. Comparación con el TP 10

| | TP 10 | TP 11 |
| --- | --- | --- |
| Base de datos | MongoDB Atlas | MongoDB Atlas |
| Colección | `reservas` | `reservas` |
| Operaciones API | GET, POST, PUT, PATCH y DELETE | Se mantienen las mismas |
| Crear reserva desde API | Sí | Sí |
| Consultar por ID desde API | Sí | Sí |
| Reemplazar una reserva desde API | Sí, con PUT | Se mantiene |
| Modificar algunos campos desde API | Sí, con PATCH | Se mantiene |
| Eliminar una reserva desde API | Sí, con DELETE | Se mantiene |
| Filtrar por sala | Sí | Se mantiene |
| Ordenar resultados | Sí | Se mantiene |
| Paginación | Sí | Se mantiene |
| Conteo de reservas | Sí | Se mantiene |
| Interfaz HTML | Listado y formularios anteriores | Se completa el flujo de edición y detalle |
| Formulario de edición | No estaba completo | Se incorpora con los datos precargados |
| Validación de edición web | No estaba completa | Se incorpora |
| Manejo centralizado de errores | Se mantenía el manejo anterior | Se amplía para las respuestas HTML y API |
| Persistencia | MongoDB Atlas | Se mantiene y se vuelve a comprobar |
| Calidad del código | Formato y lint | Se vuelven a comprobar |

## 16. Calidad del código

Para revisar el formato y los errores de código ejecuté:

```bash
npm run format
```

El resultado indicó que los archivos no necesitaban modificaciones de formato (`unchanged`).

Luego ejecuté:

```bash
npm run check
```

El comando ejecuta:

```bash
npm run format:check
npm run lint
```

El resultado fue correcto:

- Prettier informó que todos los archivos cumplen con el formato.
- ESLint terminó sin mostrar errores.

También comprobé la conexión con MongoDB mediante:

```bash
npm run comprobardb
```

El resultado fue:

```text
Conexion con MongoDB establecida
```

Finalmente, realicé las pruebas funcionales desde el navegador y Postman, incluyendo la edición de reservas, las validaciones, las respuestas de error y la persistencia de los datos después de reiniciar el servidor.

