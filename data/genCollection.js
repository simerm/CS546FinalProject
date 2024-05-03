/*This is where I'm pulling all of my data to then assemble and display it on the general collection page*/
//const figurines = require('./figurines.js'); //import the figurines.json file 
//const series = require('./series.js'); //import the series.json file
import { figurines } from './figurines.js';
import { series } from './series.js';
import { users } from '../config/mongoCollections.js';
import { store } from '../config/mongoCollections.js';

//Do this for both smitskis and sonny angels 

export const getFigurineNames = async () => { //grab each of the figurine names (for the dropdown menu)
    let figNamesList = [];

    figurines.forEach(fig => {
        figNamesList.push(fig.figurineName);
    });

    return figNamesList;
};

export const sortFigurines = async () => { //sorts through the data on what type of figurine it is - gives us then something to work with
    try {
        let sorted = {};
        let figNamesList = await getFigurineNames(); //call getFigurineNames to grab all the names 
        //console.log(figNamesList);
        //console.log("hinn");
        figNamesList.forEach(name => { //push each of the these figNames into an object
            sorted[name] = null; //causing an error
        });
        //now go thru each element in series.json and sort them out 
        Object.keys(sorted).forEach(figName => {
            sorted[figName] = []; // For each figName, create an array
            series.forEach(element => {
                if (element.figurineName == figName) {
                    sorted[figName].push(element); // Push matching elements into the array
                }
            });
        }); //at the end you'll get this structure (from outter-most to inner-most) of: object -> array -> object
        //console.log(sorted);
        return sorted;
    } catch (e) {
      throw 'Error fetching general collection data!'; 
    }
};

export const sortFigurinesUser = async (username) => {
    try {
        let sorted = {};
        let figNamesList = await getFigurineNames();
        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });
        if (!user) throw 'User not found';
        let userCollectionData = {};
        if (user.figurineCollection) {
            userCollectionData = user.figurineCollection;
        }
        const generalCollection = await sortFigurines(); // Assuming you have a function to get the general collection
        console.log('collection: ' + JSON.stringify(userCollectionData));
        console.log('figNamesList: ' + JSON.stringify(figNamesList));
        figNamesList.forEach(name => {
            sorted[name] = []; // Initialize an array for each figurine name
            console.log('name: ' + JSON.stringify(userCollectionData[name])) // THIS IS PRINTING UNDERFINED FOR SOME REASON
            if (userCollectionData[name]) {
                generalCollection[name].forEach(series => {
                    console.log(userCollectionData[name][series.seriesName])
                    const seriesData = {
                        figurineName: series.figurineName,
                        seriesId: series.seriesId,
                        seriesName: series.seriesName,
                        figurineTypes: series.figurineTypes.map(figurine => {
                            const owned = userCollectionData[name][series.seriesName]?.includes(figurine.modelName) || false; // Check if modelName exists in user's collection
                            return {
                                ...figurine,
                                owned: owned,
                                seriesName: series.seriesName
                            }
                        })
                    };
                    sorted[name].push(seriesData);
                });
            } else {
                generalCollection[name].forEach(series => {
                    const seriesData = {
                        figurineName: series.figurineName,
                        seriesId: series.seriesId,
                        seriesName: series.seriesName,
                        figurineTypes: series.figurineTypes.map(figurine => ({
                            ...figurine,
                            owned: false, // Set owned to false if user's collection for this figurine name does not exist
                            seriesName: series.seriesName
                        }))
                    };
                    sorted[name].push(seriesData);
                });
            }
        });
        console.log('sorted:')
        console.log(sorted)
        return sorted;
    } catch (e) {
        console.error(e);
        throw e;
    }
};