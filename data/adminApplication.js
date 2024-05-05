import { adminApplicants, reported, users } from '../config/mongoCollections.js';

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

export const reportUser = async (currUser, otherUser) => {
    if (!currUser || !otherUser) {
        throw "must include all params"
    }
    if (currUser === otherUser) {
        throw "can't be same user"
    }

    const userCollection = await users();
    const user = await userCollection.findOne({ username: otherUser });
    if (!user) throw 'User not found';

    let reportedUser = {
        username: otherUser
    }

    const reportedCollection = await reported();

    const newInsertInformation = await reportedCollection.insertOne(reportedUser);
    if (!newInsertInformation.insertedId) throw 'Insert failed!';
    return { success: true }


}

export const isReported = async (username) => {
    const reportedCollection = await reported();
    const user = await reportedCollection.findOne({ username: username });
    if (!user) return true;
    return false
}

export const getAllReported = async () => {
    const reportedCollection = await reported();
    let users = await reportedCollection.find({}).project({ _id: 0, username: 1 }).toArray();
    if (!users) {
      return []
    }
    const usernames = users.map(user => user.username);
    return usernames;
}
