import { CookieOptions } from 'express';

export const cookie: CookieOptions = {
    secure: true,
    maxAge: 10 * 60 * 1000 * 100000,
    sameSite: 'none',
    httpOnly: true
};
