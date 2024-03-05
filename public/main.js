document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Function to load pins from the server
    function loadPins() {
        fetch('/pins')
            .then((response) => response.json())
            .then((pins) => {
                pins.forEach((pin) => {
                    L.marker([pin.lat, pin.lng])
                        .addTo(map)
                        .bindPopup(`${pin.name}<br>Added by: ${pin.user}`);
                });
            })
            .catch((error) => console.error('Error loading pins:', error));
    }

    // Event listener to handle clicking on the map
    map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        const pinName = prompt('Enter pin name:');
        // Automatically use the currently logged-in user's name, or default to 'anon'
        const userName = await getLoggedInUserName() || 'anon';
        if (pinName) {

            // Add pin to the server
            fetch('/pins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lat,
                    lng,
                    name: pinName,
                    user: userName,
                }),
            })
                .then((response) => response.json())
                .then((newPin) => {
                    // Add the new pin to the map
                    L.marker([newPin.lat, newPin.lng])
                        .addTo(map)
                        .bindPopup(`${newPin.name}<br>Added by: ${newPin.user}`);
                })
                .catch((error) => console.error('Error adding pin:', error));
        }
    });

    // Load existing pins when the page loads
    loadPins();
    async function getLoggedInUserName() {
        try {
            const response = await fetch('/user/status');
            const data = await response.json();
            return data.username; // Adjust based on the actual response structure
        } catch (error) {
            console.error('Error getting username:', error);
            return null;
        }
    }
});

function changeUsername() {
    const newUsername = prompt('Enter new username:');
    if (newUsername) {
        // You can make an API call to the server to update the username
        // For simplicity, update the DOM directly
        document.getElementById('username').innerText = newUsername;
    }
}

function toggleProfile() {
    // You can make an API call to check if the user is authenticated
    // For simplicity, redirect to the login or profile page directly
    window.location.href = '/profile';
}

function register() {
    const regUsername = document.getElementById('regUsername').value;
    const regPassword = document.getElementById('regPassword').value;

    // You can add validation logic here before sending the registration request

    // Make a POST request to the registration endpoint
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: regUsername,
            password: regPassword,
        }),
    })
    .then(response => {
        if (response.ok) {
            alert('Registration successful. Please log in.');
        } else {
            alert('Registration failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Fetch user status when the page loads
    fetch('/user/status')
        .then(response => response.json())
        .then(data => {
            // Update the user status display
            updateUserStatus(data.username);
        })
        .catch(error => console.error('Error fetching user status:', error));

    function updateUserStatus(username) {
        const userStatusElement = document.getElementById('userStatus');

        if (username) {
            // If a user is logged in, display their username
            userStatusElement.textContent = `Logged in as: ${username}`;
        } else {
            // If no user is logged in, display "Not logged in"
            userStatusElement.textContent = 'Not logged in';
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch user status when the page loads
    fetch('/user/status')
        .then(response => response.json())
        .then(data => {
            // Update the user status display
            updateUserStatus(data.username);
        })
        .catch(error => console.error('Error fetching user status:', error));

    // Add event listener for logout button
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
        // Send a request to the server to log the user out
        fetch('/user/logout', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                // Update the user status display after logout
                updateUserStatus(data.username);
            })
            .catch(error => console.error('Error logging out:', error));
    });

    function updateUserStatus(username) {
        const userStatusElement = document.getElementById('userStatus');

        if (username) {
            // If a user is logged in, display their actual username
            userStatusElement.textContent = `Logged in as: ${username}`;
        } else {
            // If no user is logged in, display "Not logged in"
            userStatusElement.textContent = 'Not logged in';
        }
    }
});
// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', initMap);
