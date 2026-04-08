//URL de la api
const API_BASE = "https://rickandmortyapi.com/api";

// Ref. elemtos html
const cardsList = document.getElementById("cardsList");
const statusText = document.getElementById("statusText");
const searchInput = document.getElementById("searchInput")



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
    card.innerHTML = `
      <h3>${character.name}</h3>
      <div><strong>Especie:</strong> ${character.species}</div>
      <div><strong>Género:</strong> ${character.gender}</div>
      <div><strong>Estado:</strong> ${character.status}</div>
    `;
    cardsList.appendChild(card);
  });
};

// pedimos los datos a la api
const loadCharacters = async (query = "") => {
  try {
    statusText.textContent = "Cargando datos...";
    //llamamos a la api y añadimo name para la busqueda
    const url = new URL(`${API_BASE}/character`);
    if (query) url.searchParams.set("name", query);
    const response = await fetch(url);
    if (!response.ok) throw new Error();
    const data = await response.json();
    // Si va bien pintamos en pantalla
    renderCharacters(data.results);
  } catch {
    statusText.textContent = "Error cargando datos.";
  }
};

// Buscador
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    loadCharacters(query);
})

// Arrancamos la pág
loadCharacters();