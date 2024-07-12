import { Router } from "express";
import * as userController from '../controllers/userController';
import fileUpload from "../middlewares/fileUpload";


const userRoute: Router = Router();

//post request to post (create), get (get) and put (update) user
userRoute.route('/')
    .post(userController.signup)
    .get(userController.getUser)
    .patch(fileUpload.single('image'), userController.updateUser);



export default userRoute;    