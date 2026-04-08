const API_BASE = "https://rickandmortyapi.com/api";

const cardsGrid = document.getElementById("cardsGrid");
const statusText = document.getElementById("statusText");

const renderCharacters = (list) => {
  cardsGrid.innerHTML = "";

  if (list.length === 0) {
    statusText.textContent = "No hay resultados.";
    return;
  }

  statusText.textContent = `Mostrando ${list.length} personajes`;

  list.forEach((character) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${character.name}</h3>
      <div><strong>Especie:</strong> ${character.species}</div>
      <div><strong>Género:</strong> ${character.gender}</div>
      <div><strong>Estado:</strong> ${character.status}</div>
    `;
    cardsGrid.appendChild(card);
  });
};

const loadCharacters = async () => {
  try {
    statusText.textContent = "Cargando datos...";
    const response = await fetch(`${API_BASE}/character`);
    if (!response.ok) throw new Error();
    const data = await response.json();
    renderCharacters(data.results);
  } catch {
    statusText.textContent = "Error cargando datos.";
  }
};

loadCharacters();