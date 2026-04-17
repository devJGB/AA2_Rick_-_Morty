//URL de la api
const API_BASE = "https://rickandmortyapi.com/api";

// Ref. elemtos html
const cardsList = document.getElementById("cardsList");
const statusText = document.getElementById("statusText");
const searchInput = document.getElementById("searchInput")
const favoriteForm = document.getElementById("favoriteForm");
const favNameInput = document.getElementById("favName");
const favNoteInput = document.getElementById("favNote");
const favoritesList = document.getElementById("favoritesList");

const prevPageButton = document.getElementById('prevPage');
const netxPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let currentPage = 1;
let totalPages = 1;
let currentQuery= '';

// Guardamos el localStorage
const FAVORITES_KEY = "aa2_favorites";
let editingId = null;

// leemos favoritos guardados
const getFavorites = () => {
  const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
};

// Guardar favoritos
const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

// Pintamos favoritos
const renderFavorites = () => {
  const favorites = getFavorites();
  favoritesList.innerHTML = "";

  if(favorites.length == 0) {
    favoritesList.innerHTML = "<li>No hay favoritos. Añade uno a tu lista.</li>";
    return;
  }

  favorites.forEach((fav) => {
    const item = document.createElement("li");
    item.className = "favorite-item";
    item.innerHTML = `
    <div>
      <strong>${fav.name}</strong>
      ${fav.note ? `<div>${fav.note}</div>` : ""}
    </div>
     <button class="btn-edit" data-id="${fav.id}">Editar</button>
      <button class="btn-delete" data-id="${fav.id}">Eliminar</button>
      `;
      favoritesList.appendChild(item);
  });
};

// Paginación
const updatePaginationControls = () => {
  prevPageButton.disabled = currentPage <= 1;
  netxPageButton.disabled = currentPage >= totalPages;
  pageInfo.textContent = `Página ${currentPage} / ${totalPages}`;
};

// Crear o editar favorito
favoriteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = favNameInput.value.trim();
  const note = favNoteInput.value.trim();
  if (!name) return;

  const favorites = getFavorites();

  if (editingId) {
    // Editar existente
    const index = favorites.findIndex((fav) => fav.id === editingId);
    if (index !== -1) {
      favorites[index] = { id: editingId, name, note };
    }
  } else {
    // Crear nuevo
    const newFavorite = {
      id: crypto.randomUUID(),
      name,
      note,
    };
    favorites.push(newFavorite);
  }

  saveFavorites(favorites);
  renderFavorites();
  favoriteForm.reset();
  editingId = null;
});

// Botones editar / eliminar
favoritesList.addEventListener("click", (e) => {
  const button = e.target;
  const id = button.getAttribute("data-id");
  if (!id) return;

  const favorites = getFavorites();

  if (button.classList.contains("btn-edit")) {
    const favorite = favorites.find((fav) => fav.id === id);
    if (!favorite) return;
    favNameInput.value = favorite.name;
    favNoteInput.value = favorite.note;
    editingId = favorite.id;
  }

  if (button.classList.contains("btn-delete")) {
    const updated = favorites.filter((fav) => fav.id !== id);
    saveFavorites(updated);
    renderFavorites();
  }
});

// llamamos a renderfavorites, arrancamos el crud
renderFavorites();


// Pintamos las cards
const renderCharacters = (list) => {
  cardsList.innerHTML = ""; // limpiamos

  if (list.length === 0) {
    statusText.textContent = "No hay resultados.";
    return;
  }

  // Cuantos peronajes hay
  statusText.textContent = `Mostrando ${list.length} personajes`;
  // card por cada personaje
  list.forEach((character) => {
    const card = document.createElement("article");
    card.className = "card";
    // El nombre del personaje lo creamos como enlace al detalle
    card.innerHTML = `
      <h3><a href="detail.html?id=${character.id}">${character.name}</a></h3>
      <div><strong>Especie:</strong> ${character.species}</div>
      <div><strong>Género:</strong> ${character.gender}</div>
      <div><strong>Estado:</strong> ${character.status}</div>
    `;
    cardsList.appendChild(card);
  });
};

// pedimos los datos a la api
// Carga personajes desde la API, con búsqueda y paginación
const loadCharacters = async (query = "", page = 1) => {
  try {
    // Mensaje mientras se cargan los datos
    statusText.textContent = "Cargando datos...";

    // Construimos la URL base y añadimos parámetros
    const url = new URL(`${API_BASE}/character`);
    url.searchParams.set("page", page);      // página actual
    if (query) url.searchParams.set("name", query); // filtro por nombre

    // Llamada a la API
    const response = await fetch(url);

    // Si la API responde 404, no hay resultados
    if (response.status === 404) {
      renderCharacters([]);
      currentPage = 1;
      totalPages = 1;
      updatePaginationControls();
      return;
    }

    // Si hay otro error, lanzamos excepción
    if (!response.ok) throw new Error();

    // Convertimos la respuesta a JSON
    const data = await response.json();

    // Pintamos personajes en pantalla
    renderCharacters(data.results);

    // Actualizamos el estado de paginación
    currentPage = page;
    totalPages = data.info.pages;
    currentQuery = query;

    // Refrescamos botones y texto de paginación
    updatePaginationControls();
  } catch {
    // Mensaje de error si falla la API
    statusText.textContent = "Error cargando datos.";
  }
};

// Escuchamos los botone
prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    loadCharacters(currentQuery, currentPage - 1);
  }
});

netxPageButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    loadCharacters(currentQuery, currentPage + 1);
  }
});

// Buscador
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    loadCharacters(query, 1);
})

// Arrancamos la pág
loadCharacters();