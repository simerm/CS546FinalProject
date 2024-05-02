import { adminApplicants } from '../config/mongoCollections.js';

export const submitApplication = async (username, email, whyAdmin) => {
    if (!username || typeof username !== 'string' || !isNaN(username)) {
        throw "invalid user"
    }
    if (!email) {
        throw "must provide valid email"
    }
    else {
        if (typeof email !== "string" || !isNaN(email)) {
            throw "must provide valid email"
        }
        else {
            email = email.trim()
            if (email.length < 5) {
                throw "must provide valid email"
            }
            else {
                const emailSplit = email.split('@');
                if (!(emailSplit.length === 2 && emailSplit[1].includes('.'))) {
                    throw "must provide valid email"
                }
            }
        }
    }

    if (!whyAdmin) {
        throw "must provide valid statement"
    }
    else {
        if (typeof whyAdmin !== "string" || !isNaN(whyAdmin)) {
            throw "must provide valid statement"
        }
        else {
            whyAdmin = whyAdmin.trim()
            if (whyAdmin.length < 50) {
                throw "must provide valid statement"
            }
        }
    }

    const applicants = await adminApplicants();
    username = username.toLowerCase()
    const u = await applicants.findOne({ username: username });
    if (u) throw 'applicant already applied';

    const newApplicant = {
        username: username,
        email: email,
        whyAdmin: whyAdmin
    }

    const newInsertInformation = await applicants.insertOne(newApplicant);
    if (!newInsertInformation.insertedId) throw 'Insert failed!';
    return { signupCompleted: true }


}

export const appExists = async (username) => {
    if (!username || typeof username !== 'string' || !isNaN(username)) {
        throw "invalid user"
    }
    const applicants = await adminApplicants();
    username = username.toLowerCase()
    const u = await applicants.findOne({ username: username });
    if (!u) return false
    return true

}   
