import { Router } from "express";
import * as authController from '../controllers/authController';

const authRoute: Router = Router();

//post request will be handled by authController.handleLogin
authRoute.route('/').
    post(authController.login);

export default authRoute;    