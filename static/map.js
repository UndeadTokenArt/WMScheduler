let tabCount = 1;
  // List of markers made in the session
var selectedMarkers = [];

// Prompt for API key on page load and store it
let apiKey = sessionStorage.getItem("apiKey");
if (!apiKey) {
  apiKey = prompt("Please enter your OpenCage API key:");
  if (apiKey) {
    sessionStorage.setItem("apiKey", apiKey);
  } else {
    alert("API key is required to use the map features.");
  }
}

// Event listener to initialize the map when the tab is clicked
document.querySelector(".tab-link").addEventListener("click", () => {
  if (!map) {
    initMap();
  }
});

// Function to initialize the map
let map;

function initMap() {
  // Set view to Portland, OR
  map = L.map("map").setView([45.5231, -122.5], 12);

  // Define the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);



  // Initialize a local cache for reference of locations to avoid multiple API calls
  const geocodeCache = {};

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

// Drag-and-drop functionality for sortable list
const sortable = document.getElementById("sortable-list");
let draggedItem = null;

// Drag start
sortable.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  e.target.classList.add("dragging"); // Optional for styling
});

// Drag end
sortable.addEventListener("dragend", (e) => {
  e.target.classList.remove("dragging"); // Optional for styling
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

function addMarkers() {
  const addressInput = document.getElementById("address-input").value;
  const addresses = addressInput.split("\n");
  addresses.forEach((address) => {
    geocode(address.trim(), (coords) => {
      if (coords) {
        var marker = L.marker(coords).addTo(map);
        marker.address = address;
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
      }
    });
  });
}

function copySelectedMarkersToClipboard() {
    // Create a temporary list to avoid modifying the original
    const markersToCopy = selectedMarkers.map((marker) => ({
      lat: marker.getLatLng().lat,
      lng: marker.getLatLng().lng,
      address: marker.address,
    }));
  
    // Convert the list to a JSON string
    const markersJson = JSON.stringify(markersToCopy);
  
    // Temporarily create a hidden input field
    const tempInput = document.createElement("input");
    tempInput.value = markersJson;
    document.body.appendChild(tempInput);
  
    // Select and copy the input field's value
    tempInput.select();
    document.execCommand("copy");
  
    // Remove the temporary input field
    document.body.removeChild(tempInput);
  
    // Optional: Provide feedback to the user
    alert("Selected markers copied to clipboard!");
  }

function addPolygonFromAddresses() {
  const addressInput = document.getElementById("address-input").value;
  const addresses = addressInput
    .split("\n")
    .map((addr) => addr.trim())
    .filter((addr) => addr);

  if (addresses.length === 0) {
    alert("No valid addresses found in the input.");
    return;
  }

  const tolerance =
    parseFloat(document.getElementById("tolerance-slider").value) || 0.01;
  const points = [];

  let processedCount = 0;

  addresses.forEach((address) => {
    geocode(address, (coords) => {
      processedCount++;
      if (coords) {
        points.push({ lat: coords[0], lng: coords[1] });
      }

      if (processedCount === addresses.length) {
        if (points.length < 3) {
          alert("Not enough valid points to create a polygon.");
        } else {
          addPolygon(map, points, tolerance);
        }
      }
    });
  });
} // Function to geocode address using OpenCage API
function geocode(address, callback) {
  if (geocodeCache[address]) {
    // Use cached coordinates
    console.log(`Cache hit for address: ${address}`);
    callback(geocodeCache[address]);
    return;
  }

  // Fetch coordinates from OpenCage if not in cache
  console.log(`Cache miss for address: ${address}. Fetching from OpenCage...`);
  fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data && data.results && data.results[0]) {
        const coords = [
          data.results[0].geometry.lat,
          data.results[0].geometry.lng,
        ];
        geocodeCache[address] = coords; // Store in cache
        callback(coords);
      } else {
        console.error(`Geocoding failed for address: ${address}`);
        callback(null);
      }
    })
    .catch((error) => {
      console.error(`Error fetching geocode for ${address}:`, error);
      callback(null);
    });
}

function addPolygon(map, points, tolerance = 0.01) {
  // Remove duplicate points within the tolerance range
  const dedupedPoints = [];
  points.forEach((point) => {
    if (
      !dedupedPoints.some(
        (p) =>
          Math.abs(p.lat - point.lat) <= tolerance &&
          Math.abs(p.lng - point.lng) <= tolerance
      )
    ) {
      dedupedPoints.push(point);
    }
  });

  // Compute the centroid
  const centroid = computeCentroid(dedupedPoints);

  // Sort points by angle around the centroid
  const sortedPoints = dedupedPoints
    .map((point) => ({ ...point, angle: calculateAngle(centroid, point) }))
    .sort((a, b) => a.angle - b.angle);

  // Construct the polygon using sorted points
  const polygon = L.polygon(
    sortedPoints.map((p) => [p.lat, p.lng]),
    {
      color: "blue",
    }
  );

  // Add to the map
  polygon.addTo(map);
}
function computeCentroid(points) {
  let latSum = 0,
    lngSum = 0;
  points.forEach((point) => {
    latSum += point.lat;
    lngSum += point.lng;
  });
  return { lat: latSum / points.length, lng: lngSum / points.length };
}
function calculateAngle(center, point) {
  return Math.atan2(point.lat - center.lat, point.lng - center.lng);
}
// Function to display selected addresses
function displaySelectedAddresses() {
  const addressesDiv = document.getElementById("sortable-list");
  addressesDiv.innerHTML = "Address List"; // Clear previous addresses

  selectedMarkers.forEach((marker) => {
    const addressElement = document.createElement("li");
    addressElement.setAttribute("draggable", "true");
    addressElement.textContent = marker.address; // Display actual address or coordinates
    addressesDiv.appendChild(addressElement);
  });
}
function updateToleranceLabel(map, points) {
  const slider = document.getElementById("tolerance-slider");
  const toleranceValue = document.getElementById("tolerance-value");

  // Update the tolerance label and re-draw the polygon
  slider.addEventListener("input", (e) => {
    const tolerance = parseFloat(e.target.value);
    toleranceValue.textContent = tolerance.toFixed(3);

    // Clear existing polygons from the map
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Re-draw the polygon with the updated tolerance
    addPolygon(map, points, tolerance);
  });
}
function refinePoints(points, tolerance) {
  // Calculate the geometric center of the points
  const center = points
    .reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    .map((sum) => sum / points.length);

  // Filter points based on their distance from the center
  return points.filter((point) => {
    const distance = Math.sqrt(
      (point[0] - center[0]) ** 2 + (point[1] - center[1]) ** 2
    );
    return distance >= tolerance; // Keep points farther than the tolerance
  });
}
// Function to find the closest element to the drop point
function getInsertionPoint(clientY) {
  // Get all sortable children except the dragged item
  const items = [...sortable.children].filter((item) => item !== draggedItem);

  return items.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = clientY - box.top - box.height / 2; // Distance from the middle of the item
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Function to reverse geocode coordinates using OpenCage API
function reverseGeocode(lat, lng, callback) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.length > 0) {
        const address = data.results[0].formatted;
        callback(address);
      } else {
        callback(null);
      }
    })
    .catch((error) => {
      console.error("Reverse geocoding error:", error);
      callback(null);
    });
}
