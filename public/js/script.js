import parsePhoneNumberFromString from "libphonenumber-js";
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
    if (!badge || !isNaN(badge)) {
        error.innerHTML = "Must provide a badge name"
        value = false
    }
    else {
        if (typeof badge !== "string") {
            error.innerHTML = "Must provide a string"
            value = false

        }
        else {
            badge = badge.trim()
            if (badge.length < 5) {
                error.innerHTML = "Badge name can't be less than 5 characters"
                value = false
            }
        }
    }
    if (value) {
        document.getElementById('badgeForm').submit()
    }

});

document.getElementById('wishForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let value = true;
    let wish = document.getElementById("wishName").value
    let error = document.getElementById('wishclientError')
    error.innerHTML = ""
    if (!wish || !isNaN(wish)) {
        error.innerHTML = "Must provide a wish name"
        value = false
    }
    else {
        if (typeof wish !== "string") {
            error.innerHTML = "Must provide a string"
            value = false
        }
        else {
            wish = wish.trim()
            if (wish.length < 2) {
                error.innerHTML = "Wish name can't be less than 2 characters"
                value = false
            }
        }
    }
    if (value) {
        document.getElementById('wishForm').submit()
    }

});


//REGISTER AND LOGIN HANDLING


document.getElementById('signin-form').addEventListener('submit', function (event) {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let valid = true
    let error = document.getElementById('clientError')
    error.innerHTML = ""
    let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

    if (!username) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have username'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof username !== "string" || !isNaN(username)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for username'
            error.appendChild(e)
            valid = false
        }
        else {
            username = username.trim()
            if (username.length < 5 || username.length > 10) {
                let e = document.createElement("p");
                e.innerHTML = 'username should be more than 5 characters and less than 10'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of username) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'username not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!password) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have password'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof password !== "string" || !isNaN(password)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for password'
            error.appendChild(e)
            valid = false
        }
        else {
            password = password.trim()
            if (password.length < 8) {
                let e = document.createElement("p");
                e.innerHTML = 'password should be more than 5 characters and less than 10'
                error.appendChild(e)
                valid = false
            }
            else {
                let upper = false
                let num = false
                let special = false
                let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
                for (let x of password) {
                    if (x === " ") {
                        let e = document.createElement("p");
                        e.innerHTML = 'password not allowed spaces'
                        error.appendChild(e)
                        valid = false
                    }
                    else if (x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
                        upper = true
                    }
                    else if (x.charCodeAt(0) >= 48 && x.charCodeAt(0) <= 57) {
                        num = true
                    }
                    else if (sc.includes(x)) {
                        special = true
                    }
                }
                if (!upper || !num || !special) {
                    let e = document.createElement("p");
                    e.innerHTML = 'password needs a number, uppercase letter, and special character. You are missing at least one'
                    error.appendChild(e)
                    valid = false
                }
            }
        }
    }


    if (valid) {
        document.getElementById('signin-form').submit()
    }

})

document.getElementById('signup-form').addEventListener('submit', function (event) {
    event.preventDefault();
    let firstName = document.getElementById('firstName').value;
    let lastName = document.getElementById('lastName').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;


    let error = document.getElementById('clientError');
    error.innerHTML = '';

    let valid = true;
    let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    if (!firstName) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have first name'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof firstName !== "string" || !isNaN(firstName)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for first name'
            error.appendChild(e)
            valid = false
        }
        else {
            firstName = firstName.trim()
            if (firstName.length < 2 || firstName.length > 25) {
                let e = document.createElement("p");
                e.innerHTML = 'first name should be more than 2 characters and less than 25'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of firstName) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'first name not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!lastName) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have last name'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof lastName !== "string" || !isNaN(lastName)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for lastName'
            error.appendChild(e)
            valid = false
        }
        else {
            lastName = lastName.trim()
            if (lastName.length < 2 || lastName.length > 25) {
                let e = document.createElement("p");
                e.innerHTML = 'last Name should be more than 2 characters and less than 25'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of lastName) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'lastName not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!username) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have username'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof username !== "string" || !isNaN(username)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for username'
            error.appendChild(e)
            valid = false
        }
        else {
            username = username.trim()
            if (username.length < 5 || username.length > 10) {
                let e = document.createElement("p");
                e.innerHTML = 'username should be more than 5 characters and less than 10'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of username) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'username not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!password) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have password'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof password !== "string" || !isNaN(password)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for password'
            error.appendChild(e)
            valid = false
        }
        else {
            password = password.trim()
            if (password.length < 8) {
                let e = document.createElement("p");
                e.innerHTML = 'password should be more than 5 characters and less than 10'
                error.appendChild(e)
                valid = false
            }
            else {
                let upper = false
                let num = false
                let special = false
                let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
                for (let x of password) {
                    if (x === " ") {
                        let e = document.createElement("p");
                        e.innerHTML = 'password not allowed spaces'
                        error.appendChild(e)
                        valid = false
                    }
                    else if (x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
                        upper = true
                    }
                    else if (x.charCodeAt(0) >= 48 && x.charCodeAt(0) <= 57) {
                        num = true
                    }
                    else if (sc.includes(x)) {
                        special = true
                    }
                }
                if (!upper || !num || !special) {
                    let e = document.createElement("p");
                    e.innerHTML = 'password needs a number, uppercase letter, and special character. You are missing at least one'
                    error.appendChild(e)
                    valid = false
                }
            }
        }
    }
    if (!confirmPassword) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have confirm password'
        error.appendChild(e)
        valid = false
    }
    else {
        if (confirmPassword !== password) {
            let e = document.createElement("p");
            e.innerHTML = 'passwords must match'
            error.appendChild(e)
            valid = false
        }
    }





    if (valid) {
        document.getElementById('signup-form').submit()
    }




})



document.getElementById('business-signup-form').addEventListener('submit', function (event) {
    event.preventDefault();
    let name = document.getElementById('name').value;
    let phoneNumber = document.getElementById('phoneNumber').value;
    let id = document.getElementById('id').value;
    let street = document.getElementById('streetAddress').value;
    let city = document.getElementById('city').value;
    let state = document.getElementById('state').value;
    let zipcode = document.getElementById('zipcode').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;


    let error = document.getElementById('clientError');
    error.innerHTML = '';

    let valid = true;
    let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    if (!id) {
        let e = document.createElement("p");
        e.innerHTML = 'Must provide an ID'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof id !== "string" || !isNaN(id)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for ID'
            error.appendChild(e)
            valid = false
        }
        else {
            if (id.length !== 10 || id[2] !== "-") {
                let e = document.createElement("p");
                e.innerHTML = 'Invalid business ID'
                error.appendChild(e)
                valid = false
            }
            else{
                for (let i = 0; i < id.length; i++) {
                    if (i != 2 && isNaN(parseInt(id[i]))) {
                        let e = document.createElement("p");
                        e.innerHTML = 'Invalid business ID'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!name) {
        let e = document.createElement("p");
        e.innerHTML = 'Must provide a name'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof name !== "string" || !isNaN(name)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for name'
            error.appendChild(e)
            valid = false
        }
        else {
            name = name.trim()
            if (name.length < 5 || name.length > 25) {
                let e = document.createElement("p");
                e.innerHTML = 'Name should be more than 5 characters and less than 25'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of name) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'Name not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!street) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have street name'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof street !== "string" || !isNaN(street)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for street'
            error.appendChild(e)
            valid = false
        }
        else {
            street = street.trim()
            if (street.length < 5 || street.length > 25) {
                let e = document.createElement("p");
                e.innerHTML = 'street name should be more than 5 characters and less than 25'
                error.appendChild(e)
                valid = false
            }

        }
    }
    if (!city) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have city name'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof city !== "string" || !isNaN(city)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for city'
            error.appendChild(e)
            valid = false
        }
        else {
            city = city.trim()
            if (city.length < 3 || city.length > 25) {
                let e = document.createElement("p");
                e.innerHTML = 'city name should be more than 3 characters and less than 25'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of city) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'city name not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    const stateAbbreviations = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    if (!state || typeof state !== "string") {
        let e = document.createElement("p");
        e.innerHTML = 'Must have valid state'
        error.appendChild(e)
        valid = false
    }
    else {
        state = state.trim()
        state = state.toUpperCase()

        if (!stateAbbreviations.includes(state)) {
            let e = document.createElement("p");
            e.innerHTML = 'Business must be in the USA'
            error.appendChild(e)
            valid = false
        }
    }
    if (!zipcode || typeof zipcode !== "string") {
        let e = document.createElement("p");
        e.innerHTML = 'Must have valid zipcode'
        error.appendChild(e)
        valid = false
    }
    else {
        if ((zipcode.length === 5 || zipcode.length === 9)) {
            for (let i = 0; i < zipcode.length; i++) {
                if (isNaN(parseInt(zipcode[i]))) {
                    let e = document.createElement("p");
                    e.innerHTML = 'Must provide valid zipcode'
                    error.appendChild(e)
                    valid = false
                    break;
                }
            }
        }
    }
    if (!phoneNumber || typeof phoneNumber !== "string") {
        let e = document.createElement("p");
        e.innerHTML = 'Must have phone number'
        error.appendChild(e)
        valid = false
    }
    else {
        let number = parsePhoneNumberFromString(phoneNumber);
        if (!number || !number.isValid()) {
            let e = document.createElement("p");
            e.innerHTML = 'Must have a valid phone number'
            error.appendChild(e)
            valid = false
        }
    }
    if (!username) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have username'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof username !== "string" || !isNaN(username)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for username'
            error.appendChild(e)
            valid = false
        }
        else {
            username = username.trim()
            if (username.length < 5 || username.length > 10) {
                let e = document.createElement("p");
                e.innerHTML = 'username should be more than 5 characters and less than 10'
                error.appendChild(e)
                valid = false
            }
            else {
                for (let x of username) {
                    if (n.includes(x)) {
                        let e = document.createElement("p");
                        e.innerHTML = 'username not allowed numbers'
                        error.appendChild(e)
                        valid = false
                        break;
                    }
                }
            }
        }
    }
    if (!password) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have password'
        error.appendChild(e)
        valid = false
    }
    else {
        if (typeof password !== "string" || !isNaN(password)) {
            let e = document.createElement("p");
            e.innerHTML = 'Invalid type for password'
            error.appendChild(e)
            valid = false
        }
        else {
            password = password.trim()
            if (password.length < 8) {
                let e = document.createElement("p");
                e.innerHTML = 'password should be more than 5 characters and less than 10'
                error.appendChild(e)
                valid = false
            }
            else {
                let upper = false
                let num = false
                let special = false
                let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
                for (let x of password) {
                    if (x === " ") {
                        let e = document.createElement("p");
                        e.innerHTML = 'password not allowed spaces'
                        error.appendChild(e)
                        valid = false
                    }
                    else if (x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
                        upper = true
                    }
                    else if (x.charCodeAt(0) >= 48 && x.charCodeAt(0) <= 57) {
                        num = true
                    }
                    else if (sc.includes(x)) {
                        special = true
                    }
                }
                if (!upper || !num || !special) {
                    let e = document.createElement("p");
                    e.innerHTML = 'password needs a number, uppercase letter, and special character. You are missing at least one'
                    error.appendChild(e)
                    valid = false
                }
            }
        }
    }
    if (!confirmPassword) {
        let e = document.createElement("p");
        e.innerHTML = 'Must have confirm password'
        error.appendChild(e)
        valid = false
    }
    else {
        if (confirmPassword !== password) {
            let e = document.createElement("p");
            e.innerHTML = 'passwords must match'
            error.appendChild(e)
            valid = false
        }
    }





    if (valid) {
        document.getElementById('business-signup-form').submit()
    }




})
