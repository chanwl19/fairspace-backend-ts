import { Router } from "express";
import * as refreshController from '../controllers/refreshController';

const refreshRoute: Router = Router();

//post request to handle signup
refreshRoute.route('/').
    get(refreshController.refreshToken);

export default refreshRoute;    