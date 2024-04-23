const addBadgeBtn = document.getElementById('addBadge');
const formPopup = document.getElementById('formPopup');
const overlay = document.getElementById('overlay');

function openForm() {
    formPopup.style.display = 'block';
    overlay.style.display = 'block';
}

function closeForm() {
    formPopup.style.display = 'none';
    overlay.style.display = 'none';
}

addBadgeBtn.addEventListener('click', openForm);

const addWishBtn = document.getElementById('addWish');
const wishFormPopup = document.getElementById('wishformPopup');
// const overlay = document.getElementById('overlay');

function openWishForm() {
    wishFormPopup.style.display = 'block';
    overlay.style.display = 'block';
}

function closeWishForm() {
    wishFormPopup.style.display = 'none';
    overlay.style.display = 'none';
}

addWishBtn.addEventListener('click', openWishForm);