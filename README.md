# Buscador de perfiles GitHub

Aplicación web hecha con HTML y JavaScript puro para la Guía de Laboratorio #03-D del curso Desarrollo de Software I (UNSAAC). Consulta la API pública de GitHub y muestra el perfil de un usuario junto con sus repositorios.

## Qué hace

- Busca un usuario de GitHub y muestra su avatar, nombre, cantidad de repositorios y seguidores.
- Lista sus repositorios de cinco en cinco, con el lenguaje y el número de estrellas.
- Permite ordenar los repositorios por última actualización, fecha de creación o nombre.
- Muestra un resumen con los lenguajes más usados y cuántos repositorios hay de cada uno.
- Tiene un botón **Cargar más** que añade los siguientes cinco repositorios sin borrar los anteriores. El botón se oculta cuando ya no quedan más.
- Muestra al pie de la página cuántas peticiones quedan disponibles en la hora.
- Muestra mensajes claros cuando el usuario no existe (404) o cuando se alcanza el límite de peticiones (403).

## Cómo usarlo

1. Abrir el sitio publicado con GitHub Pages o abrir `index.html` con Live Server.
2. Escribir un nombre de usuario de GitHub y pulsar **Buscar**.
3. Cambiar el orden con la lista desplegable o pulsar **Cargar más** para ver más repositorios.

## Archivos

- `index.html`: estructura y estilos de la página.
- `app.js`: consumo de la API con `fetch`, `async/await`, `Promise.all` y `URLSearchParams`.
- `.gitignore`: archivos que Git no debe subir.

## Nota sobre la API

La API de GitHub permite 60 peticiones por hora sin autenticación. Cada búsqueda usa tres peticiones (perfil, repositorios y resumen de lenguajes). En este proyecto **no se usa ningún token**, porque todo el código de una página web es visible para cualquiera.

   ## Enlaces

   - Repositorio: https://github.com/Graciela-Ccansaya/buscador-github
   - Sitio publicado: https://graciela-ccansaya.github.io/buscador-github/
