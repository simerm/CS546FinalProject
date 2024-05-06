import { addCollection, removeCollection, addWishlist } from './user.js';

const username = 'jovera';
const figurineName = 'Smiski';
const seriesName = 'Bed';
const modelName = 'Crescent';

addCollection(username, figurineName, seriesName, modelName)
    .then(result => {
        console.log(result)
    })
    .catch(error => {
        console.error(error)
    });