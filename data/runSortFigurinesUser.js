import { sortFigurinesUser } from './genCollection.js';

// Define a test username
const username = 'jovera';

// Call the sortFigurinesUser function
sortFigurinesUser(username)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });
