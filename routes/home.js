import {Router} from 'express';
const router = Router();
import fs from 'fs';
import path from 'path';

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
  router.get('/collections', async (req, res) => {
    fs.readFile('./data/figurines.json', 'utf8', (err, figurines) => {
      if (err) {
        console.error(err)
        return
      }
      fs.readFile('./data/series.json', 'utf8', (err, series) => {
        if (err) {
          console.error(err)
          return
        }
        res.render('collections', {figurines: JSON.parse(figurines), series: JSON.parse(series)})
      })
    })
  });

export default router;
