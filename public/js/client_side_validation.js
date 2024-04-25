if (document.getElementById('registration-form')) {
    const registrationForm = document.getElementById('registration-form');
    registrationForm.addEventListener('submit', (event) => {
        // error checking
        try {
            let firstName = document.getElementById("firstName").value;
            console.log(firstName);
            firstName= firstName.trim();
            if (typeof firstName === undefined) {
                throw "Error: firstName undefined"
            }
            if (typeof firstName !== 'string') {
                throw "Error: firstName must be a string"
            }
            if (!firstName.match(/^[a-zA-Z]{2,25}$/)){
                throw { code: 400, error: "Invalid first name." };
              }
            console.log(firstName);
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
        try {
            let lastName = document.getElementById("lastName").value;
            console.log(lastName);
            lastName= lastName.trim();
            if (typeof lastName === undefined) {
                throw "Error: lastName undefined"
            }
            if (typeof lastName !== 'string') {
                throw "Error: lastName must be a string"
            }
            if (!lastName.match(/^[a-zA-Z]{2,25}$/)){
                throw { code: 400, error: "Invalid last name." };
              }
              console.log(lastName);
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
        try {
            let username = document.getElementById("username").value;
            console.log(username);
            username=username.trim();
            username=username.toLowerCase();
            if (typeof username === undefined) {
                throw "Error: username undefined"
            }
            if (typeof username !== 'string') {
                throw "Error: username must be a string"
            }
            if(!username.match(/^[a-zA-Z0-9._]{4,}$/)){
                throw { code: 400, error: "Username has to be at least 4 characters" };
              }
              console.log(username);
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
        try {
            let password = document.getElementById("password").value;
            console.log(password);
            password= password.trim();
            if (typeof password === undefined) {
                throw "Error: username undefined"
            }
            if (typeof password !== 'string') {
                throw "Error: username must be a string"
            }
            if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[^\s]{10,}$/)){
                throw { code: 400, error: "Invalid password." };
            }
            console.log(password);
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
        try {
            let password = document.getElementById("confirmPassword").value;
            console.log(password);
            password= password.trim();
            if (typeof password === undefined) {
                throw "Error: username undefined"
            }
            if (typeof password !== 'string') {
                throw "Error: username must be a string"
            }
            if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[^\s]{10,}$/)){
                throw { code: 400, error: "Invalid password." };
            }
            if (document.getElementById("password").value !== password) {
                errors.push("Passwords do not match")
            }
            console.log(password);
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
        try {
            let role = document.getElementById("role").value;
            console.log(role);
            role= role.trim().toLowerCase();
            if (typeof role === undefined) {
                throw "Error: role undefined"
            }
            if (typeof role !== 'string') {
                throw "Error: role must be a string"
            }
            if (role === '') {
                throw "Error: role is empty"
            }
            if (role !== 'business' && role !== 'user') {
                throw "Error: invalid role"
            }
            console.log(role);

        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
    });
}

if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {
        try {
            let username = document.getElementById("username").value;
            username = username.trim().toLowerCase();
            if (typeof username === undefined) {
                throw "Error: username undefined"
            }
            else if (typeof username !== 'string') {
                throw "Error: username must be a string"
            }
            if(!username.match(/^[a-zA-Z0-9._]{4,}$/)){
                throw { code: 400, error: "Username has to be at least 4 characters" };
              }
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
        try {
            let password = document.getElementById("password").value;
            if (typeof password === undefined) {
                throw "Error: password undefined"
            }
            else if (typeof password !== 'string') {
                throw "Error: password must be a string"
            }
            password = password.trim();
            const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[^\s]{8,}$/;
            if (passwordValid.test(password) === false) {
                throw { code: 400, error: "Invalid password" };
            }
        } catch (e) {
            if (e.code) {
                return res.status(e.code).render('register', { errors: true, error: e.error })
            }
            return res.status(400).render('error');
        }
    });
}