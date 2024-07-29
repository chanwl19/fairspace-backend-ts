import { Router } from "express";
import * as roleController from '../controllers/roleController';

const roleRoute: Router = Router();

//post request to handle get roles
roleRoute.route('/').
    get(roleController.getRoles);

export default roleRoute;    