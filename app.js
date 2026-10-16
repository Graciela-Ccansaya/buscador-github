const API = 'https://api.github.com';
const POR_PAGINA = 5;

const form   = document.querySelector('#form-buscar');
const input  = document.querySelector('#input-usuario');
const boton  = document.querySelector('#btn-buscar');
const estado = document.querySelector('#estado');
const perfil = document.querySelector('#perfil');
const titulo = document.querySelector('#titulo-repos');
const repos  = document.querySelector('#repos');
const select     = document.querySelector('#select-orden');
const tituloLeng = document.querySelector('#titulo-lenguajes');
const lenguajes  = document.querySelector('#lenguajes');
const btnMas     = document.querySelector('#btn-mas');
const pie        = document.querySelector('#pie');

// usuario cuyo perfil se está mostrando (sirve para volver a pedir sus repositorios)
let usuarioActual = '';
let paginaActual = 1;

// 1. Petición genérica con traducción de errores HTTP
async function obtenerJSON(url) {
    const res = await fetch(url);

    // cabecera con las peticiones que quedan en la hora
    const restantes = res.headers.get('x-ratelimit-remaining');
    if (restantes !== null) {
        pie.textContent = `Peticiones disponibles: ${restantes}`;
    }

    if (res.status === 404) throw new Error('Usuario no encontrado');
    if (res.status === 403) {
        throw new Error('Límite de peticiones alcanzado');
    }
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
}

// 2. Pintar el perfil
function mostrarPerfil(u) {
    const img = document.createElement('img');
    img.src = u.avatar_url;
    img.alt = `Avatar de ${u.login}`;

    const nombre = document.createElement('h2');
    // si el usuario no registró un nombre, se muestra su login
    nombre.textContent = u.name ?? u.login;

    const datos = document.createElement('p');
    datos.textContent =
        `${u.public_repos} repositorios · ${u.followers} seguidores`;

    const enlace = document.createElement('a');
    enlace.href = u.html_url;
    enlace.target = '_blank';
    enlace.textContent = 'Ver en GitHub';

    const info = document.createElement('div');
    info.append(nombre, datos, enlace);
    perfil.replaceChildren(img, info);
    perfil.classList.remove('oculto');
}

// 3. Pintar la lista de repositorios
function mostrarRepos(lista, agregar = false) {
    // al cargar más, los repositorios anteriores se conservan
    if (!agregar) repos.innerHTML = '';
    lista.forEach(r => {
        const a = document.createElement('a');
        a.href = r.html_url;
        a.target = '_blank';
        a.textContent = r.name;

        const li = document.createElement('li');
        const lenguaje = r.language ?? 'sin lenguaje';
        li.append(a, ` - ${lenguaje} - ★ ${r.stargazers_count}`);
        repos.append(li);
    });
    titulo.classList.remove('oculto');
}

// 4. Pedir una página de repositorios del usuario con el orden elegido
function pedirRepos(usuario, pagina = 1) {
    const params = new URLSearchParams({
        sort: select.value,
        per_page: POR_PAGINA,
        page: pagina
    });
    return obtenerJSON(`${API}/users/${usuario}/repos?${params}`);
}

// 5. Contar cuántos repositorios hay de cada lenguaje y mostrar los más usados
function mostrarLenguajes(lista) {
    const conteo = {};
    lista.forEach(r => {
        if (r.language) {
            conteo[r.language] = (conteo[r.language] ?? 0) + 1;
        }
    });

    const ordenados = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    lenguajes.innerHTML = '';
    if (ordenados.length === 0) {
        const vacio = document.createElement('li');
        vacio.textContent = 'Este usuario no tiene lenguajes registrados';
        lenguajes.append(vacio);
    } else {
        ordenados.forEach(([nombre, cantidad]) => {
            const li = document.createElement('li');
            const palabra = cantidad === 1 ? 'repositorio' : 'repositorios';
            li.textContent = `${nombre}: ${cantidad} ${palabra}`;
            lenguajes.append(li);
        });
    }
    tituloLeng.classList.remove('oculto');
}

// 6. El botón solo se muestra si la última página llegó completa
function actualizarBotonMas(cantidad) {
    btnMas.classList.toggle('oculto', cantidad < POR_PAGINA);
}

// 7. Evento submit: tres peticiones en paralelo
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = encodeURIComponent(input.value.trim());
    if (!usuario) return;

    // para el resumen de lenguajes se piden hasta 100 repositorios
    const paramsTodos = new URLSearchParams({ per_page: 100 });
    boton.disabled = true;
    estado.className = '';
    estado.textContent = 'Buscando...';

    try {
        const [datosUsuario, datosRepos, todosRepos] = await Promise.all([
            obtenerJSON(`${API}/users/${usuario}`),
            pedirRepos(usuario),
            obtenerJSON(`${API}/users/${usuario}/repos?${paramsTodos}`)
        ]);
        mostrarPerfil(datosUsuario);
        mostrarRepos(datosRepos);
        mostrarLenguajes(todosRepos);
        usuarioActual = usuario;
        paginaActual = 1;
        actualizarBotonMas(datosRepos.length);
        estado.textContent = '';
    } catch (error) {
        usuarioActual = '';
        perfil.classList.add('oculto');
        titulo.classList.add('oculto');
        tituloLeng.classList.add('oculto');
        repos.innerHTML = '';
        lenguajes.innerHTML = '';
        btnMas.classList.add('oculto');
        estado.className = 'error';
        estado.textContent = error.message;
    } finally {
        boton.disabled = false;
    }
});

// Al cambiar el orden solo se vuelven a pedir los repositorios
select.addEventListener('change', async () => {
    if (!usuarioActual) return;
    estado.className = '';
    estado.textContent = 'Ordenando...';

    try {
        const datos = await pedirRepos(usuarioActual);
        paginaActual = 1;
        mostrarRepos(datos);
        actualizarBotonMas(datos.length);
        estado.textContent = '';
    } catch (error) {
        estado.className = 'error';
        estado.textContent = error.message;
    }
});

// Cargar más: se pide la siguiente página y se añade a la lista
btnMas.addEventListener('click', async () => {
    btnMas.disabled = true;
    estado.className = '';
    estado.textContent = 'Cargando más repositorios...';

    try {
        const datos = await pedirRepos(usuarioActual, paginaActual + 1);
        paginaActual++;
        mostrarRepos(datos, true);
        actualizarBotonMas(datos.length);
        estado.textContent = '';
    } catch (error) {
        estado.className = 'error';
        estado.textContent = error.message;
    } finally {
        btnMas.disabled = false;
    }
});
