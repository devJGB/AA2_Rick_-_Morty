//Url de la pai
const API_BASE = "https://rickandmortyapi.com/api";

// Ref. al html
const detailPanel = document.querySelector(".detail-panel");
// Info extra
const locationInfo = document.getElementById("locationInfo");
const episodeInfo = document.getElementById("episodeInfo");

// Leemos el id de url
const params = new URLSearchParams(window.location.search);
const characterId = params.get("id");

// Función para construir detalle en HTML
const createDetailMarkup = (character) => ` 
<div class="detail-header">
    <img src="${character.image}" alt="Imagen de ${character.name}" />
    <div>
      <h2>${character.name}</h2>
      <p><strong>Estado:</strong> ${character.status}</p>
      <p><strong>Especie:</strong> ${character.species}</p>
      <p><strong>Género:</strong> ${character.gender}</p>
    </div>
  </div>
  
  <div class="detail-data">
    <div><strong>Origen:</strong> ${character.origin?.name ?? "-"}</div>
    <div><strong>Ubicación:</strong> ${character.location?.name ?? "-"}</div>
    <div><strong>Tipo:</strong> ${character.type || "No especificado"}</div>
    <div><strong>Episodios:</strong> ${character.episode?.length ?? 0}</div>
  </div>
  `;

// Cargamos info extra otros endpoints
const loadExtraInfo = async (character) => {
  // endpoint ubicación
  if (character.location?.url) {
    try {
      const response = await fetch(character.location.url);
      if (response.ok) {
        const location = await response.json();
        locationInfo.textContent = `${location.name} * ${location.type} * ${location.dimension}`;
      } else {
        locationInfo.textContent = "No disponible.";
      }
    } catch {
      locationInfo.textContent = "No disponible.";
    }
  } else {
    locationInfo.textContent = "No disponible.";
  }

  // Endpoint episodio
  if (character.episode && character.episode.length > 0) {
    try {
      const response = await fetch(character.episode[0]);
      if (response.ok) {
        const episode = await response.json();
        episodeInfo.textContent = `${episode.episode} * ${episode.name} * ${episode.air_date}`;
      } else {
        episodeInfo.textContent = "No disponible.";
      }
    } catch {
      episodeInfo.textContent = "Error cargando episodio.";
    }
  } else {
    episodeInfo.textContent = "No disponible.";
  }
};

  

// Carga detalle desde la api
const loadDetail = async () => {
  if (!characterId) {
    detailPanel.innerHTML = "<p class='status-text'>No hay ID en la URL.</p>";
    return;
  }

  try {
    detailPanel.innerHTML = "<p class='status-text'>Cargando detalle...</p>";

    const response = await fetch(`${API_BASE}/character/${characterId}`);
    if (!response.ok) throw new Error();

    const character = await response.json();
    detailPanel.innerHTML = createDetailMarkup(character);
    
    // Llamadas extra a otros endpoints
    await loadExtraInfo(character);
  } catch {
    detailPanel.innerHTML = "<p class='status-text'>Error cargando detalle.</p>";
  }
};

// Arranque
loadDetail();
