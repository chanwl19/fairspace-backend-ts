import { Router } from "express";
import * as reservationController from '../controllers/reservationController';

const reservationRouter: Router = Router();

//post request to post (create), get (get) and put (update) reservation
reservationRouter.route('/')
    .post(reservationController.createReservation)
    .patch(reservationController.updateReservation);

export default reservationRouter;