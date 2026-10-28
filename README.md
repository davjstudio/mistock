# MiStock web

Aplicación principal de MiStock: inventario, movimientos, alertas de stock, perfil y exportación CSV. Usa la identidad visual y el proyecto Firebase de las apps de Android y Windows.

- Web principal: https://davjstudio.github.io/mistock/
- Demostración: https://davjstudio.github.io/mistock/?demo=1
- Descargas para Windows y Android: https://davjstudio.github.io/mistock-descargas/

## Uso

Inicia sesión con tu cuenta de MiStock o crea una cuenta desde el formulario. También puedes explorar con datos de ejemplo sin acceder a una cuenta real. Para usar la web en iPhone, abre la dirección principal con Safari y selecciona Compartir → Añadir a pantalla de inicio.

La sesión se mantiene en memoria y puede requerir iniciar sesión otra vez al recargar. Para consultar y guardar el inventario se necesita internet. El service worker guarda solo la interfaz pública; no guarda contraseñas, tokens ni inventarios.

## Datos y publicación

`config.json` contiene la configuración pública del cliente Firebase. No se incluyen credenciales de administrador. Las operaciones de Firestore utilizan la identidad del usuario y las reglas del proyecto existente.

Sitio estático publicado con GitHub Pages desde la raíz de `main`. Los instaladores permanecen en el repositorio `mistock-descargas`.

Se verificaron los flujos con datos simulados y la demostración. La prueba de acceso e inventario con una cuenta real y la instalación en un iPhone real siguen pendientes.
