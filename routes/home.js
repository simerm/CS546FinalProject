import {Router} from 'express';
import { sortFigurines } from '../data/genCollection.js';
import { readFile } from 'fs/promises';
const router = Router();

router
  .route('/')
  .get(async (req, res) => {
    res.render('home')
  }),
  router
  .route('/profile')
  .get(async (req, res) => {
    res.render('userProfile')
  }),
  router
  .route('/collections')
  .get(async (req, res) => {
    try{
      const figurineInfo = await sortFigurines();
      res.render('generalCollection', {figurineInfo})
    }
    catch(e){
      res.status(500).json({error: 'Error while searching for the collection.'})
    }
    
  })

export default router;
