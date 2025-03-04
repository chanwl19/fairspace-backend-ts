import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import refreshRoute from './routes/refreshRoute';
import roleRoute from './routes/roleRoute'
import facilityRoute from './routes/facilityRoute';
import reservationRoute from './routes/reservationRoute';
import { ApiError } from './models/apiError';
import mongoose from 'mongoose';
import helmet from 'helmet';
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
        if (allowedOrigins.indexOf(origin || "notAllowed") !== -1) {
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

//middleware for cookies
app.use(cookieParser());

//Use helmet
app.use(helmet());

//Route login to authRoute
app.use('/auth', authRoute);
//Route refresh to refreshRoute
app.use('/refresh', refreshRoute);
//Route user to userRoute
//app.use('/user', authMiddleware.isAuthorized, userRoute);
app.use('/user',  authMiddleware.isAuthorized, userRoute);
//Route role to roleRoute
app.use('/role',  authMiddleware.isAuthorized, roleRoute);
//Route role to facilityRoute
app.use('/facility',  authMiddleware.isAuthorized, facilityRoute);
//Route role to reservationRoute
app.use('/reservation',  authMiddleware.isAuthorized, reservationRoute);

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
