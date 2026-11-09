
let events = [];
let registrations = [];

const eventForm = document.getElementById("eventForm");
const registrationForm = document.getElementById("registrationForm");

const eventList = document.getElementById("eventList");
const eventSelect = document.getElementById("eventSelect");
const registrationTable = document.getElementById("registrationTable");

// Create a new event
eventForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const event = {
        id: Date.now(),
        name: document.getElementById("eventName").value.trim(),
        date: document.getElementById("eventDate").value,
        location: document.getElementById("eventLocation").value.trim(),
        capacity: Number(document.getElementById("eventCapacity").value)
    };

    if (event.capacity < 1) {
        alert("Please enter a valid seat capacity.");
        return;
    }

    events.push(event);

    eventForm.reset();
    updateDashboard();

    alert("Event created successfully!");
});

// Register a participant
registrationForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const eventId = Number(eventSelect.value);
    const selectedEvent = events.find(event => event.id === eventId);

    if (!selectedEvent) {
        alert("Please select a valid event.");
        return;
    }

    const participantName = document.getElementById("participantName").value.trim();
    const participantEmail = document.getElementById("participantEmail").value.trim();

    const alreadyRegistered = registrations.some(registration =>
        registration.eventId === eventId &&
        registration.email.toLowerCase() === participantEmail.toLowerCase()
    );

    if (alreadyRegistered) {
        alert("This email is already registered for this event.");
        return;
    }

    const registeredCount = registrations.filter(
        registration => registration.eventId === eventId
    ).length;

    if (registeredCount >= selectedEvent.capacity) {
        alert("Sorry! This event is full.");
        return;
    }

    registrations.push({
        id: Date.now(),
        name: participantName,
        email: participantEmail,
        eventId: eventId
    });

    registrationForm.reset();
    updateDashboard();

    alert("Participant registered successfully!");
});

// Update dashboard
function updateDashboard() {
    document.getElementById("totalEvents").textContent = events.length;

    document.getElementById("totalRegistrations").textContent =
        registrations.length;

    const totalAvailableSeats = events.reduce((total, event) => {
        const booked = registrations.filter(
            registration => registration.eventId === event.id
        ).length;

        return total + (event.capacity - booked);
    }, 0);

    document.getElementById("availableSeats").textContent =
        totalAvailableSeats;

    displayEvents();
    displayRegistrations();
    updateEventDropdown();
}

// Display events
function displayEvents() {
    if (events.length === 0) {
        eventList.innerHTML =
            '<p class="empty">No events created yet.</p>';
        return;
    }

    eventList.innerHTML = events.map(event => {
        const booked = registrations.filter(
            registration => registration.eventId === event.id
        ).length;

        return `
            <div class="event-card">
                <h3>${escapeHTML(event.name)}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Location:</strong> ${escapeHTML(event.location)}</p>
                <p><strong>Capacity:</strong> ${event.capacity}</p>
                <p><strong>Registered:</strong> ${booked}</p>
                <p><strong>Available:</strong> ${event.capacity - booked}</p>
                <button class="delete-btn" onclick="deleteEvent(${event.id})">
                    Delete Event
                </button>
            </div>
        `;
    }).join("");
}

// Display registrations
function displayRegistrations() {
    if (registrations.length === 0) {
        registrationTable.innerHTML =
            '<tr><td colspan="4" class="empty">No registrations yet.</td></tr>';
        return;
    }

    registrationTable.innerHTML = registrations.map(registration => {
        const event = events.find(item => item.id === registration.eventId);

        return `
            <tr>
                <td>${escapeHTML(registration.name)}</td>
                <td>${escapeHTML(registration.email)}</td>
                <td>${event ? escapeHTML(event.name) : "Unknown"}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteRegistration(${registration.id})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Update event dropdown
function updateEventDropdown() {
    const previousValue = eventSelect.value;

    eventSelect.innerHTML =
        '<option value="">Choose an event</option>';

    events.forEach(event => {
        const booked = registrations.filter(
            registration => registration.eventId === event.id
        ).length;

        if (booked < event.capacity) {
            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = event.name;
            eventSelect.appendChild(option);
        }
    });

    if ([...eventSelect.options].some(option => option.value === previousValue)) {
        eventSelect.value = previousValue;
    }
}

// Delete an event and its registrations
function deleteEvent(id) {
    if (!confirm("Are you sure you want to delete this event?")) {
        return;
    }

    events = events.filter(event => event.id !== id);

    registrations = registrations.filter(
        registration => registration.eventId !== id
    );

    updateDashboard();
}

// Remove a participant
function deleteRegistration(id) {
    if (!confirm("Remove this registration?")) {
        return;
    }

    registrations = registrations.filter(
        registration => registration.id !== id
    );

    updateDashboard();
}

// Escape user input before displaying it as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Prevent choosing a past event date
document.getElementById("eventDate").min =
    new Date().toISOString().split("T")[0];

// Initial dashboard
updateDashboard();
