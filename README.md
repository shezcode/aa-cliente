# PASS SAVER

Actividad de aprendizaje de la primera evaluacion.
Desarrollo web en Entorno Cliente.
a28009.

## Instalación 👩‍💻

Después de clonar el repositorio será necesario instalar las dependencias mediante

```
npm install
```

Esto instalará las dependencias del proyecto

Una vez instaladas, es necesario inicializar la BD, para ello:

```
npm run db:init
```

## Ejecución 🏃

Para poder ver la aplicación funcionando (y poder desarrollar), será necesario lanzar 2 procesos independientes.

Para ello, será necesario tener 2 consolas distinas abierta.

💾 En la primera consola lanzaremos el backend, que se quedará ejecutando en el puerto 3000

```
npm start

> node index.js

Example app listening on port 3000
```

🌐 En la segunda consola lanzaremos el proceso que se encarga de que podamos acceder a la página web

```
npm run www

> live-server www/

Serving "www/" at http://127.0.0.1:8080
```

Con esto, podemos arrancar el navegador en http://localhost:8080 y ver el desarrollo
