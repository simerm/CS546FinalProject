import { addCollection, removeCollection } from './user.js';

const username = 'jovera';
const figurineName = 'Stink';
const seriesName = 'Test';
const modelName = 'Crescent';

removeCollection(username, figurineName, seriesName, modelName)
    .then(result => {
        console.log(result)
    })
    .catch(error => {
        console.error(error)
    });