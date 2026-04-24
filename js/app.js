//URL de la api
const API_BASE = "https://rickandmortyapi.com/api";

// Ref. elemtos html
const cardsList = document.getElementById("cardsList");
const statusText = document.getElementById("statusText");
const searchInput = document.getElementById("searchInput")

const prevPageButton = document.getElementById('prevPage');
const netxPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let currentPage = 1;
let totalPages = 1;
let currentQuery= '';
const FAVORITES_KEY = "aa2_favorites";

const getFavorites = () => {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};


// Paginación
const updatePaginationControls = () => {
  prevPageButton.disabled = currentPage <= 1;
  netxPageButton.disabled = currentPage >= totalPages;
  pageInfo.textContent = `Página ${currentPage} / ${totalPages}`;
};


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
  const favorites = getFavorites();
  list.forEach((character) => {
    const card = document.createElement("article");
    card.className = "card";
    const isFav = favorites.some((fav) => fav.characterId === String(character.id));
    // El nombre del personaje lo creamos como enlace al detalle
    card.innerHTML = `
      <h3><a href="detail.html?id=${character.id}">${character.name}</a></h3>
      <div><strong>Especie:</strong> ${character.species}</div>
      <div><strong>Género:</strong> ${character.gender}</div>
      <div><strong>Estado:</strong> ${character.status}</div>
      <button class="btn-fav${isFav ? " is-fav" : ""}" data-id="${character.id}" data-name="${character.name}" aria-label="Añadir a favoritos" ${isFav ? "disabled" : ""}>
        ♥
      </button>
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

// Arrancamos la pág (si viene búsqueda en URL, la aplicamos)
const params = new URLSearchParams(window.location.search);
const initialSearch = params.get("search");
if (initialSearch) {
  searchInput.value = initialSearch;
  loadCharacters(initialSearch, 1);
} else {
  loadCharacters();
}
// Añadir a favoritos desde el listado
cardsList.addEventListener("click", (e) => {
  const button = e.target;
  if (!button.classList.contains("btn-fav")) return;

  const characterId = button.getAttribute("data-id");
  const name = button.getAttribute("data-name");

  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.characterId === characterId);
  if (exists) return;

  favorites.push({
    id: crypto.randomUUID(),
    name,
    note: "",
    characterId,
  });

  saveFavorites(favorites);
  button.classList.add("is-fav");
  button.disabled = true;
});
