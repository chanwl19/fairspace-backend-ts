import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { ApiError } from '../models/apiError';
import { Role } from '../models/role';

dotenv.config();

interface TokenInterface {
    userId: string;
    roles: InstanceType<typeof Role>[];
    iat: number; 
    exp: number;
}

export async function isAuthorized(req: Request, res : Response, next : NextFunction):Promise<void> {
    try {
        // const header = req.headers?.authorization;
        // if (!header) {
        //     return next(new ApiError("Unauthoized", 401, []));
        // }
        // const accessToken = header.split(' ')[1];
        const accessToken = req.body.token;
        const decoded = verify(
            accessToken,
            process.env.ACCESS_KEY || 'MY_SECRET_ACCESS_KEY'
        );
        
        const userId = (decoded as TokenInterface).userId;
        const roles = (decoded as TokenInterface).roles;
        if (!roles) {
            throw new ApiError("Forbidden", 403, []);
        }
        const isAllowAccess = checkAllowAccess(roles, req.originalUrl, req.method);
        if (!isAllowAccess) {
            throw new ApiError("Forbidden", 403, []);
        } else {
            req.headers.userId = userId;
            next();
        }
    } catch {
        return next(new ApiError("Forbidden", 403, []));
    };
}

function checkAllowAccess(roles: InstanceType<typeof Role>[], endPoint: string, method: string){
    if (roles.length === 0) {
        return false;
    }
    const allowAccess = roles.filter(role => role.endPoints.includes(endPoint+','+method.toUpperCase()));
    if (allowAccess && allowAccess.length > 0) {
        
        return true;
    }
    return false;
}