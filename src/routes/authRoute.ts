import { Router } from "express";
import * as authController from '../controllers/authController';

const authRoute: Router = Router();

//post request will be handled by authController.handleLogin
authRoute.route('/login').
    post(authController.login);

authRoute.route('/logout').
    post(authController.logout);

export default authRoute;    