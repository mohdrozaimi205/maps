let coords = { origin: null, destination: null };
let debounceTimer;

document.getElementById("origin").addEventListener("input", () => debounceSearch("origin"));
document.getElementById("destination").addEventListener("input", () => debounceSearch("destination"));

function debounceSearch(type) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => searchPlace(type), 300);
}

async function searchPlace(type) {
  const query = document.getElementById(type).value;
  if (query.length < 3) return;

  const container = document.getElementById(type === 'origin' ? 'suggestOrigin' : 'suggestDestination');
  container.innerHTML = "<div style='padding:10px'>Sedang cari...</div>";

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    container.innerHTML = "";
    if (data.length === 0) {
      container.innerHTML = "<div style='padding:10px'>Tiada hasil.</div>";
      return;
    }

    data.forEach(place => {
      const div = document.createElement("div");
      div.className = "option";
      div.textContent = place.display_name;
      div.onclick = () => {
        coords[type] = `${place.lon},${place.lat}`;
        document.getElementById(type).value = place.display_name;
        container.innerHTML = "";
      };
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "<div style='padding:10px;color:red'>Ralat: " + err + "</div>";
    console.error(err);
  }
}

document.addEventListener("click", function(event) {
  const originBox = document.getElementById("origin");
  const destBox = document.getElementById("destination");
  const originSuggest = document.getElementById("suggestOrigin");
  const destSuggest = document.getElementById("suggestDestination");

  if (!originBox.contains(event.target) && !originSuggest.contains(event.target)) {
    originSuggest.innerHTML = "";
  }
  if (!destBox.contains(event.target) && !destSuggest.contains(event.target)) {
    destSuggest.innerHTML = "";
  }
});

async function getRoute() {
  if (!coords.origin || !coords.destination) {
    document.getElementById("route").innerHTML = "⚠ Sila pilih asal & destinasi dahulu.";
    return;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${coords.origin};${coords.destination}?overview=false&steps=true`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    document.getElementById("route").innerHTML = "Tiada laluan ditemui.";
    return;
  }

  const route = data.routes[0];
  const distanceKm = (route.distance / 1000).toFixed(2);
  const marhalah = (distanceKm / 81).toFixed(2);
  const distance = `${distanceKm} km (${marhalah} marhalah)`;

  let marhalahMsg = "";
  if (distanceKm < 81) {
    marhalahMsg = "Kurang 1 marhalah";
  } else if (distanceKm >= 162) {
    marhalahMsg = "Sesuai untuk buat solat jama'";
  }

  const totalMinutes = Math.round(route.duration / 60);
  let durationText;
  if (totalMinutes < 60) {
    durationText = `${totalMinutes} minit`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    durationText = minutes === 0 ? `${hours} jam` : `${hours} jam ${minutes} minit`;
  }

  const now = new Date();
  const eta = new Date(now.getTime() + route.duration * 1000);
  const etaString = eta.toLocaleTimeString('ms-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  document.getElementById("route").innerHTML =
    `<div class="result-main">
       <div><b>Jarak:</b> ${distance}</div>
       <div><b>Masa:</b> ${durationText}</div>
       <div><b>ETA:</b> ${etaString}</div>
       ${marhalahMsg ? `<div style="margin-top:2vh;color:#ffd700">${marhalahMsg}</div>` : ""}
     </div>`;
}

function reverseRoute() {
  const originVal = document.getElementById("origin").value;
  const destVal = document.getElementById("destination").value;
  const originCoord = coords.origin;
  const destCoord = coords.destination;

  document.getElementById("origin").value = destVal;
  document.getElementById("destination").value = originVal;
  coords.origin = destCoord;
  coords.destination = originCoord;
}

function resetOrigin() {
  document.getElementById("origin").value = "";
  document.getElementById("suggestOrigin").innerHTML = "";
  coords.origin = null;
}

function resetDestination() {
  document.getElementById("destination").value = "";
  document.getElementById("suggestDestination").innerHTML = "";
  coords.destination = null;
}

function resetForm() {
  resetOrigin();
  resetDestination();
  document.getElementById("route").innerHTML = "";
}