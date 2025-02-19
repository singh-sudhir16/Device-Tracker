const socket = io();
console.log("Client connected");

if (navigator.geolocation) {
    navigator.geolocation.watchPosition( (position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            console.log("Sending location:", { lat, lng });
            socket.emit("send-location", { lat, lng });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([21, 79], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("recieve-location", (data) => {
    const { id, lat, lng } = data;
    console.log("Received location from:", id, lat, lng);

    if (!markers[id]) {
        // Create a new marker if it doesn't exist
        markers[id] = L.marker([lat, lng]).addTo(map).bindPopup(`User: ${id}`);
    } else {
        // Update marker position
        markers[id].setLatLng([lat, lng]);
    }

    map.setView([lat, lng], 10);
});

// Handle user disconnection by removing their marker
socket.on("user-disconnected", (id) => {
    console.log("User disconnected:", id);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
