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
  const distance = (route.distance / 1000).toFixed(2) + " km";

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

  document.getElementById("route").innerHTML =
    `<div class="result-main">
       <div><b>Jarak:</b> ${distance}</div>
       <div><b>Masa:</b> ${durationText}</div>
       <div><b>ETA:</b> ${eta.toLocaleTimeString()}</div>
     </div>`;
}
