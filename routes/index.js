import homeRoute from './home.js';
import userRoutes from './users.js';
import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {
  app.use('/', homeRoute);
  
};

export default constructorMethod;
