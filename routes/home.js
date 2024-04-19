import {Router} from 'express';
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
    
  })

export default router;
