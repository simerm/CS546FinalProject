const addBadgeBtn = document.getElementById('addBadge');
const formPopup = document.getElementById('formPopup');
const overlay = document.getElementById('overlay');

// Function to show the form popup
function openForm() {
    formPopup.style.display = 'block';
    overlay.style.display = 'block';
}

// Function to close the form popup
function closeForm() {
    formPopup.style.display = 'none';
    overlay.style.display = 'none';
}

// Add event listener to the button
addBadgeBtn.addEventListener('click', openForm);