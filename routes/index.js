import homeRoute from './home.js';
import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {
  app.use('/', homeRoute);
  app.use('*', (req, res) => {
        // res.status(404).json({ error: 'Not found' });
        res.redirect('/')
    });
};

export default constructorMethod;
