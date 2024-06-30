import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { credentials } from './middlewares/credentials';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import refreshRoute from './routes/refreshRoute';
import { ApiError } from './models/apiError';
import mongoose from 'mongoose';
import * as authMiddleware from './middlewares/authorize';

dotenv.config();

const allowedOrigins = process.env.ALLOW_ORIGINS || ["http://localhost:3000"];
const env = process.env.ENV || 'dev';

const app = express();

//Set up to handle options credentials check - cookies
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(
  ({
    origin: (origin, callback) => {
      console.log(origin)
      if (env === 'dev') {
        callback(null, true)
      } else {
        if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
    ,
    optionsSuccessStatus: 200
  })
));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

//Route login to authRoute
app.use('/login', authRoute);
//Route refresh to refreshRoute
app.use('/refresh', refreshRoute);
//Route user to userRoute
app.use('/user', authMiddleware.isAuthorized, userRoute);
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