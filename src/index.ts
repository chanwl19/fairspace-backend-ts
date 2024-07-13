import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import refreshRoute from './routes/refreshRoute';
import { ApiError } from './models/apiError';
import mongoose from 'mongoose';

import * as authMiddleware from './middlewares/authorize';

dotenv.config();

const allowedOrigins = process.env.ALLOW_ORIGINS || ["https://fairspace.netlify.app"];
const env = process.env.ENV || 'dev';

const app = express();

// Cross Origin Resource Sharing
app.use(cors(
  ({
    origin: (origin, callback) => {
      if (env === 'dev') {
        callback(null, true);
      } else {
        if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  })
));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded());
app.use(express.json());
// for form data
const directory = path.join(__dirname, "uploads/images");
app.use('/uploads/images',  express.static(directory));

//middleware for cookies
app.use(cookieParser());


//Route login to authRoute
app.use('/auth', authRoute);
//Route refresh to refreshRoute
app.use('/refresh', refreshRoute);
//Route user to userRoute
//app.use('/user', authMiddleware.isAuthorized, userRoute);
app.use('/user',  userRoute);
//Catch error
app.use((error: ApiError, req: Request, res: Response, next: NextFunction) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const port = parseInt(process.env.PORT || '3000');

mongoose
  .connect(
    process.env.MONGO_URI || ''
  )
  .then(result => {
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch(err => console.log(err));