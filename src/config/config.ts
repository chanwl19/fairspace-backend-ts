import { CookieOptions } from 'express';

export const cookie: CookieOptions = {
    secure: false,
    maxAge: 10 * 60 * 1000 * 100000,
    sameSite: 'none',
    httpOnly: true
};
