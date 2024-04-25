// const addBadgeBtn = document.getElementById('addBadge');
// const formPopup = document.getElementById('formPopup');
const overlay = document.getElementById('overlay');

// function openForm() {
//     formPopup.style.display = 'block';
//     overlay.style.display = 'block';
//     document.getElementById('badgeName').value = ''
//     let error = document.getElementById('clientError')
//     error.innerHTML = ""

// }

// function closeForm() {
//     formPopup.style.display = 'none';
//     overlay.style.display = 'none';
// }

// addBadgeBtn.addEventListener('click', openForm);

const addWishBtn = document.getElementById('addWish');
const wishFormPopup = document.getElementById('wishformPopup');

function openWishForm() {
    wishFormPopup.style.display = 'block';
    overlay.style.display = 'block';
    document.getElementById('wishName').value = ''
    let error = document.getElementById('wishclientError')
    error.innerHTML = ""
}

function closeWishForm() {
    wishFormPopup.style.display = 'none';
    overlay.style.display = 'none';
}

addWishBtn.addEventListener('click', openWishForm);

document.getElementById('badgeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let value = true;
    let badge = document.getElementById("badgeName").value
    let error = document.getElementById('clientError')
    error.innerHTML = ""
    if (!badge || !isNaN(badge)){
        error.innerHTML = "Must provide a badge name"
        value = false
    }
    else{
        if (typeof badge !== "string"){
            error.innerHTML = "Must provide a string"
            value = false

        }
        else{
            badge = badge.trim()
            if (badge.length < 5){
                error.innerHTML = "Badge name can't be less than 5 characters"
                value = false
            }
        }
    }
    if (value){
        document.getElementById('badgeForm').submit()
    }

});

document.getElementById('wishForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let value = true;
    let wish = document.getElementById("wishName").value
    let error = document.getElementById('wishclientError')
    error.innerHTML = ""
    if (!wish || !isNaN(wish)){
        error.innerHTML = "Must provide a wish name"
        value = false
    }
    else{
        if (typeof wish !== "string"){
            error.innerHTML = "Must provide a string"
            value = false
        }
        else{
            wish = wish.trim()
            if (wish.length < 2){
                error.innerHTML = "Wish name can't be less than 2 characters"
                value = false
            }
        }
    }
    if (value){
        document.getElementById('wishForm').submit()
    }

});