import { Router } from "express";
import * as facilityController from '../controllers/facilityController';

const facilityRoute: Router = Router();

//post request to post (create), get (get) and put (update) facility
facilityRoute.route('/')
    .get(facilityController.getFacility)
    .post(facilityController.createFacility)
    .patch(facilityController.updateFacility)
    .delete(facilityController.deleteFacility);

export default facilityRoute;    