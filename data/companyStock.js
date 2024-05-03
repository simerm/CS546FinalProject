/*
This is where all of the company stock is being handled data wise. 
*/
import { figurines } from './figurines.js';

export const grabList = async () => { //grab the list of figurine seriesId names 
    try{
        const figList = figurines.flatMap(figurine => figurine.seriesId); //list of all the figurines 
        const final = figList.map(text => text.replace(/([A-Z0-9])/g, ' $1').trim());
        if(figList.length === 0) throw 'No figurines available';
        
        return final;
    }catch(e){
        throw 'Error fetching the list of figurines';
    }
}