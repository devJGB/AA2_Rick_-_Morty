// Ref. elementos HTML
const favoriteForm = document.getElementById("favoriteForm");
const favNameInput = document.getElementById("favName");
const favNoteInput = document.getElementById("favNote");
const favoritesList = document.getElementById("favoritesList");
const favoritesStatus = document.getElementById("favoritesStatus");

// Guardamos en localStorage
const FAVORITES_KEY = "aa2_favorites";
let editingId = null;

// Leemos favoritos guardados
const getFavorites = () => {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
};

// Guardar favoritos
const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const setStatus = (message) => {
  if (favoritesStatus) {
    favoritesStatus.textContent = message;
  }
};

const resolveCharacterIdByName = async (name) => {
  try {
    const url = new URL("https://rickandmortyapi.com/api/character");
    url.searchParams.set("name", name);
    const response = await fetch(url);
    if (!response.ok) return "";
    const data = await response.json();
    const match = data.results?.[0];
    return match?.id ? String(match.id) : "";
  } catch {
    return "";
  }
};

// Pintamos favoritos
const renderFavorites = () => {
  const favorites = getFavorites();
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<li>No hay favoritos. Añade uno a tu lista.</li>";
    return;
  }

  favorites.forEach((fav) => {
    const item = document.createElement("li");
    item.className = "favorite-item";

    const nameMarkup = fav.characterId
      ? `<a href="detail.html?id=${fav.characterId}">${fav.name}</a>`
      : `<a href="#" class="fav-link" data-id="${fav.id}" data-name="${fav.name}">${fav.name}</a>`;

    item.innerHTML = `
      <div>
        <strong>${nameMarkup}</strong>
        ${fav.note ? `<div>${fav.note}</div>` : ""}
      </div>
      <button class="btn-edit" data-id="${fav.id}">Editar</button>
      <button class="btn-delete" data-id="${fav.id}">Eliminar</button>
    `;
    favoritesList.appendChild(item);
  });
};

// Crear o editar favorito
favoriteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = favNameInput.value.trim();
  const note = favNoteInput.value.trim();
  if (!name) return;

  const favorites = getFavorites();

  let resolvedId = "";
  if (editingId) {
    const index = favorites.findIndex((fav) => fav.id === editingId);
    if (index !== -1) {
      const current = favorites[index];
      if (!current.characterId) {
        resolvedId = await resolveCharacterIdByName(name);
      }
      favorites[index] = {
        id: editingId,
        name,
        note,
        characterId: current.characterId || resolvedId,
      };
    }
  } else {
    resolvedId = await resolveCharacterIdByName(name);
    const newFavorite = {
      id: crypto.randomUUID(),
      name,
      note,
      characterId: resolvedId,
    };
    favorites.push(newFavorite);
  }

  const wasEditing = Boolean(editingId);
  saveFavorites(favorites);
  renderFavorites();
  favoriteForm.reset();
  editingId = null;
  if (wasEditing) {
    setStatus(resolvedId ? "Favorito actualizado con enlace." : "Favorito actualizado.");
  } else {
    setStatus(resolvedId ? "Favorito guardado con enlace." : "Favorito guardado (sin enlace).");
  }
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
    setStatus("Editando favorito...");
  }

  if (button.classList.contains("btn-delete")) {
    const updated = favorites.filter((fav) => fav.id !== id);
    saveFavorites(updated);
    renderFavorites();
    setStatus("Favorito eliminado.");
  }

  if (button.classList.contains("fav-link")) {
    e.preventDefault();
    const name = button.getAttribute("data-name");
    const favId = button.getAttribute("data-id");
    if (!name || !favId) return;

    const favorites = getFavorites();
    const index = favorites.findIndex((fav) => fav.id === favId);
    if (index === -1) return;

    resolveCharacterIdByName(name).then((resolvedId) => {
      if (!resolvedId) {
        setStatus("No se encontró el personaje en la API.");
        return;
      }
      favorites[index].characterId = resolvedId;
      saveFavorites(favorites);
      renderFavorites();
      window.location.href = `detail.html?id=${resolvedId}`;
    });
  }
});

// Arranque
renderFavorites();
