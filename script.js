// ---------- Map ----------
const map = L.map("map").setView([30.4, 69.4], 5);

// ---------- Basemaps ----------
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19, attribution: "Tiles &copy; Esri" });

// ---------- Cities: [name, province, type, lat, lon] ----------
const cities = [
  ["Islamabad", "Islamabad Capital Territory", "Capital", 33.6844, 73.0479],
  ["Karachi", "Sindh", "Provincial Capital", 24.8607, 67.0011],
  ["Lahore", "Punjab", "Provincial Capital", 31.5204, 74.3587],
  ["Peshawar", "Khyber Pakhtunkhwa", "Provincial Capital", 34.0151, 71.5249],
  ["Quetta", "Balochistan", "Provincial Capital", 30.1798, 66.9750],
  ["Faisalabad", "Punjab", "Industrial City", 31.4504, 73.1350],
  ["Multan", "Punjab", "Historic City", 30.1575, 71.5249],
  ["Rawalpindi", "Punjab", "Metropolitan City", 33.5651, 73.0169],
  ["Hyderabad", "Sindh", "Metropolitan City", 25.3960, 68.3578],
  ["Gujranwala", "Punjab", "Industrial City", 32.1877, 74.1945],
  ["Sialkot", "Punjab", "Industrial City", 32.4945, 74.5229],
  ["Sukkur", "Sindh", "Regional City", 27.7052, 68.8574],
  ["Abbottabad", "Khyber Pakhtunkhwa", "Hill Station", 34.1558, 73.2194],
  ["Gilgit", "Gilgit-Baltistan", "Regional Capital", 35.9208, 74.3080],
  ["Skardu", "Gilgit-Baltistan", "Tourist Town", 35.2971, 75.6333],
  ["Muzaffarabad", "Azad Jammu & Kashmir", "Regional Capital", 34.3700, 73.4711],
  ["Gwadar", "Balochistan", "Port City", 25.1216, 62.3254],
  ["Bahawalpur", "Punjab", "Historic City", 29.3956, 71.6836]
];

// ---------- AQI: [city, AQI, lat, lon] ----------
const aqiData = [
  ["Lahore", 185, 31.5204, 74.3587],
  ["Karachi", 120, 24.8607, 67.0011],
  ["Islamabad", 65, 33.6844, 73.0479],
  ["Peshawar", 155, 34.0151, 71.5249],
  ["Quetta", 72, 30.1798, 66.9750],
  ["Faisalabad", 170, 31.4504, 73.1350],
  ["Multan", 140, 30.1575, 71.5249],
  ["Rawalpindi", 90, 33.5651, 73.0169],
  ["Hyderabad", 105, 25.3960, 68.3578],
  ["Gujranwala", 160, 32.1877, 74.1945],
  ["Sialkot", 110, 32.4945, 74.5229],
  ["Sukkur", 85, 27.7052, 68.8574],
  ["Abbottabad", 40, 34.1558, 73.2194],
  ["Gilgit", 30, 35.9208, 74.3080],
  ["Skardu", 22, 35.2971, 75.6333],
  ["Muzaffarabad", 45, 34.3700, 73.4711],
  ["Gwadar", 55, 25.1216, 62.3254],
  ["Bahawalpur", 95, 29.3956, 71.6836]
];

// ---------- Marker symbols ----------
function cityIcon(type) {
  const color = type.includes("Capital") ? "#c0392b" : "#2980b9";
  const symbol = type.includes("Capital") ? "★" : "●";
  return L.divIcon({
    className: "", iconSize: [24, 24],
    html: `<div class="city-marker" style="background:${color}">${symbol}</div>`
  });
}

function stationIcon(temp) {
  const color = temp >= 35 ? "#c0392b" : temp >= 30 ? "#e67e22" :
                temp >= 25 ? "#d4ac0d" : temp >= 20 ? "#27ae60" : "#2980b9";
  return L.divIcon({
    className: "", iconSize: [24, 24],
    html: `<div class="station-marker" style="background:${color}">${Math.round(temp)}°</div>`
  });
}

function aqiStyle(aqi) {
  if (aqi < 50)   return { size: 14, color: "#27ae60", label: "Small (Good)" };
  if (aqi <= 100) return { size: 26, color: "#f1c40f", label: "Medium (Moderate)" };
  return { size: 40, color: "#c0392b", label: "Large (Unhealthy)" };
}

// ---------- Cities layer (loaded from GeoJSON) ----------
const cityLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) =>
    L.marker(latlng, { icon: cityIcon(feature.properties.type) }),
  onEachFeature: (feature, layer) => {
    const p = feature.properties;
    layer.bindPopup(`<div class="popup"><h3>${p.name}</h3>
      <b>Province:</b> ${p.province}<br><b>Type:</b> ${p.type}</div>`);
  }
});

fetch("data/cities.geojson")
  .then(response => response.json())
  .then(Data => cityLayer.addData(data))
  .catch(error => console.error("Could not load cities.geojson:", error));

// ---------- AQI layer ----------
const aqiLayer = L.layerGroup();
aqiData.forEach(([city, aqi, lat, lon]) => {
  const s = aqiStyle(aqi);
  const icon = L.divIcon({
    className: "",
    iconSize: [s.size, s.size],
    html: `<div class="aqi-marker" style="width:${s.size}px;height:${s.size}px;background:${s.color}"></div>`
  });
  L.marker([lat, lon], { icon: icon })
    .bindPopup(`<div class="popup"><h3>💨 ${city}</h3>
      <b>AQI:</b> ${aqi}<br><b>Level:</b> ${s.label}</div>`)
    .addTo(aqiLayer);
});

// ---------- Weather stations layer (loaded from GeoJSON) ----------
const stationLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) =>
    L.marker(latlng, { icon: stationIcon(feature.properties.temperature) }),
  onEachFeature: (feature, layer) => {
    const p = feature.properties;
    layer.bindPopup(`<div class="popup"><h3>🌦 ${p.name}</h3>
      <b>Temperature:</b> ${p.temperature} °C<br>
      <b>Humidity:</b> ${p.humidity} %<br>
      <b>Rainfall:</b> ${p.rainfall} mm</div>`);
  }
});

fetch("data/stations.geojson")
  .then(response => response.json())
  .then(Data => stationLayer.addData(data))
  .catch(error => console.error("Could not load GeoJSON:", error));

  // ---------- Provinces layer (polygons, loaded from GeoJSON) ----------
const provinceColors = {
  "Punjab": "#e67e22",
  "Sindh": "#2980b9",
  "Khyber Pakhtunkhwa": "#27ae60",
  "Balochistan": "#8e44ad",
  "Gilgit-Baltistan": "#c0392b",
  "Azad Jammu & Kashmir": "#d4ac0d",
  "Islamabad Capital Territory": "#16a085"
};

// ---------- Add layers to map ----------
cityLayer.addTo(map);
stationLayer.addTo(map);
aqiLayer.addTo(map);

// ---------- Layer control ----------
L.control.layers(
  { "OpenStreetMap": osm, "Satellite Imagery": satellite },
  { "Cities": cityLayer, "Weather Stations": stationLayer, "Air Quality (AQI)": aqiLayer },
  { collapsed: false }
).addTo(map);

// ---------- Legend ----------
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "legend");

  const item = (color, size, shape, text) =>
    `<div class="row"><span class="sym ${shape}" style="background:${color};width:${size}px;height:${size}px"></span>${text}</div>`;

  div.innerHTML =
    `<h4>Cities</h4>` +
    item("#c0392b", 14, "circle", "★ Capital / Provincial Capital") +
    item("#2980b9", 14, "circle", "● Other city") +

    `<h4>Weather Stations – Temperature</h4>` +
    item("#c0392b", 14, "square", "Very Hot (≥ 35°C)") +
    item("#e67e22", 14, "square", "Hot (30 – 34°C)") +
    item("#d4ac0d", 14, "square", "Warm (25 – 29°C)") +
    item("#27ae60", 14, "square", "Mild (20 – 24°C)") +
    item("#2980b9", 14, "square", "Cool (< 20°C)") +

    `<h4>Air Quality (AQI)</h4>` +
    item("#27ae60", 10, "circle", "Below 50 (small)") +
    item("#f1c40f", 16, "circle", "50 – 100 (medium)") +
    item("#c0392b", 22, "circle", "Above 100 (large)");

  return div;
};

legend.addTo(map);
