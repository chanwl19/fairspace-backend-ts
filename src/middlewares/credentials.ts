import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const allowedOrigins = process.env.ALLOW_ORIGINS || ["http://localhost:3000"];
const env = process.env.ENV || 'dev';

export function credentials(req: Request, res : Response, next : NextFunction):void {
    const origin = req.headers.origin;
    if (env === 'dev') {
        res.header('Access-Control-Allow-Credentials', 'true');
    } else {
        if (allowedOrigins.includes(origin || "")) {
            res.header('Access-Control-Allow-Credentials', 'true');
        }
    }
    next();
}

