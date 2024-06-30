import { Router } from "express";
import * as userController from '../controllers/userController';

const userRoute: Router = Router();

//post request to post (create), get (get) and put (update) user
userRoute.route('/')
    .post(userController.signup)
    .get(userController.getUser);



export default userRoute;    