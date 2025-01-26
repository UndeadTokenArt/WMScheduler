let tabCount = 1;
var selectedMarkers = [];
const geocodeCache = {};

var greenIcon = L.icon({
    iconUrl: 'static/greendot.svg',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [1, -34]
});

// Prompt for API key on page load and store it
let apiKey = sessionStorage.getItem("apiKey");
if (!apiKey) {
    apiKey = prompt("Please enter your OpenCage API key:");
    if (apiKey && apiKey.match(/^[a-zA-Z0-9]{32}$/)) {
        sessionStorage.setItem("apiKey", apiKey);
    } else {
        alert("Invalid or missing API key. Geolocation features will not work.");
    }
}

// Initialize the map when the tab is clicked
document.querySelector(".tab-link").addEventListener("click", () => {
    if (!map) {
        initMap();
    }
});

// Map initialization
let map;

function initMap() {
    map = L.map("map").setView([45.5231, -122.5], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

  // Event listener to add a marker by clicking on the map
  map.on("click", function (e) {
    var coords = [e.latlng.lat, e.latlng.lng];
    var marker = L.marker(coords).addTo(map);
    reverseGeocode(e.latlng.lat, e.latlng.lng, (address) => {
      marker.address = address
        ? address
        : `Lat: ${coords[0]}, Lng: ${coords[1]}`;
      marker.on("click", function () {
        if (!selectedMarkers.includes(marker)) {
          selectedMarkers.push(marker);
          marker.getElement().classList.add("selected");
        } else {
          selectedMarkers = selectedMarkers.filter((m) => m !== marker);
          marker.getElement().classList.remove("selected");
        }
        displaySelectedAddresses();
      });
      selectedMarkers.push(marker);
      displaySelectedAddresses();
    });
  });
}

// Drag-and-drop functionality for the sortable list
let draggedItem = null;

document.getElementById("sortable-list").addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    e.dataTransfer.setData("text/plain", "");
});

document.getElementById("sortable-list").addEventListener("dragover", (e) => {
    e.preventDefault();
});

document.getElementById("sortable-list").addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedItem) {
        e.target.appendChild(draggedItem);
        updateSelectedMarkersFromList();
    }
    draggedItem = null;
});

// Drag over
sortable.addEventListener("dragover", (e) => {
  e.preventDefault();

  // Get the element after which the dragged item should be placed
  const afterElement = getInsertionPoint(e.clientY);
  if (afterElement == null) {
    // If no element is found (e.g., dragged below the last item), append to the end
    sortable.appendChild(draggedItem);
  } else {
    // Otherwise, insert before the found element
    sortable.insertBefore(draggedItem, afterElement);
  }
});

var greenIcon = L.icon({
    iconUrl: 'static/greendot.svg',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [1, -34]
});

function addMarkers() {
    const addressInput = document.getElementById("address-input").value;
    const addresses = addressInput.split("\n").map((addr) => addr.trim()).filter((addr) => addr);

    addresses.forEach((address) => {
        if (selectedMarkers.some((marker) => marker.address === address)) return;

        geocode(address, (coords) => {
            if (coords) {
                const marker = L.marker(coords, { icon: greenIcon }).addTo(map);
                marker.address = address;
                marker.on("click", () => toggleMarkerSelection(marker));
                selectedMarkers.push(marker);

                const addressElement = document.createElement("li");
                addressElement.setAttribute("draggable", "true");
                addressElement.textContent = address;
                document.getElementById("sortable-list").appendChild(addressElement);
            }
        });
    });
}

// Display selected addresses in the sortable list
function displaySelectedAddresses() {
    const sortableList = document.getElementById("sortable-list");
    sortableList.innerHTML = ""; // Clear the list

    selectedMarkers.forEach((marker) => {
        const addressElement = document.createElement("li");
        addressElement.setAttribute("draggable", "true");
        addressElement.textContent = marker.address;
        sortableList.appendChild(addressElement);
    });
}

// Copy selected marker addresses to clipboard
function copySelectedMarkersToClipboard() {
    const addressesString = selectedMarkers.map((marker) => marker.address).join("\n");

    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = addressesString;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextarea);

    alert("Selected marker addresses copied to clipboard!");
}

// Reverse geocode coordinates
function reverseGeocode(lat, lng, callback) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            if (data.results.length > 0) {
                callback(data.results[0].formatted);
            } else {
                callback(null);
            }
        })
        .catch((error) => {
            console.error("Reverse geocoding error:", error);
            callback(null);
        });
}

// Geocode address
function geocode(address, callback) {
    if (geocodeCache[address]) {
        callback(geocodeCache[address]);
        return;
    }

    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`)
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            if (data.results && data.results[0]) {
                const coords = [data.results[0].geometry.lat, data.results[0].geometry.lng];
                geocodeCache[address] = coords;
                callback(coords);
            } else {
                callback(null);
            }
        })
        .catch((error) => {
            console.error("Geocoding error:", error);
            callback(null);
        });
}
