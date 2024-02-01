// Simulated pins data
const pins = [];

// Function to initialize the map
function initMap() {
    // You can use your preferred map library (e.g., Leaflet, Google Maps, Mapbox)
    // Here's a simple example using Leaflet
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Event listener to handle dragging the map
    map.on('dragend', () => {
        // Update the map position in the database if needed
        console.log('Map dragged to:', map.getCenter());
    });

    // Event listener to handle clicking on the map
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const pinName = prompt('Enter pin name:');
        
        if (pinName) {
            // Simulate adding pin to the database
            const pin = { lat, lng, name: pinName };
            pins.push(pin);

            // You can save the pin data to the server here
            console.log('Pin added:', pin);
        }
    });

    // Simulate loading existing pins
    pins.forEach(pin => {
        L.marker([pin.lat, pin.lng]).addTo(map)
            .bindPopup(`${pin.name}<br>Added by: ${pin.user}`);
    });
}

// Function to place a pin on the map
function placePin() {
    // This function can be called when the user wants to place a pin
    // You can use the map object to add a pin marker or handle it as needed
    alert('Pin placed!');
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', initMap);
