const API_URL = "http://localhost:3000/api/photos"

// Fetch and display photos
async function loadPhotos() {
  const response = await fetch(API_URL)
  const photos = await response.json()
  const gallery = document.getElementById("gallery")
  gallery.innerHTML = ""

  photos.forEach(photo => {
    const photoCard = document.createElement("div")
    photoCard.className = "photo-card"
    photoCard.innerHTML = `
      <img src="/uploads/${photo.filename}" alt="Photo" />
      <p id="description-${photo.id}">${photo.description}</p>
      <button onclick="showEditForm(${photo.id}, '${photo.description}')">Edit</button>
      <button onclick="deletePhoto(${photo.id})">Delete</button>
      <form id="edit-form-${photo.id}" class="edit-form" style="display:none" onsubmit="editPhoto(event, ${photo.id})">
        <input type="text" name="description" placeholder="New description" required />
        <button type="submit">Save</button>
        <button type="button" onclick="hideEditForm(${photo.id})">Cancel</button>
      </form>
    `
    gallery.appendChild(photoCard)
  })
}

// Show the edit form
function showEditForm(photoId, currentDescription) {
  const form = document.getElementById(`edit-form-${photoId}`)
  form.style.display = "block"
  form.querySelector('input[name="description"]').value = currentDescription
}

// Hide the edit form
function hideEditForm(photoId) {
  const form = document.getElementById(`edit-form-${photoId}`)
  form.style.display = "none"
}

// Edit photo description
async function editPhoto(event, photoId) {
  event.preventDefault()
  const form = event.target
  const newDescription = form.description.value

  const response = await fetch(`${API_URL}/${photoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: newDescription })
  })

  if (response.ok) {
    document.getElementById(`description-${photoId}`).textContent =
      newDescription
    hideEditForm(photoId)
    alert("Photo description updated!")
  } else {
    alert("Failed to update photo description.")
  }
}

// Delete photo
async function deletePhoto(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" })
  alert("Photo deleted!")
  loadPhotos()
}

// Load photos on page load
window.onload = loadPhotos
