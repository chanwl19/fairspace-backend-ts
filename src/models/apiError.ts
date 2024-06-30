import { ValidationError } from 'express-validator';

export class ApiError extends Error {
    statusCode: number;
    data: ValidationError[] | null;

    constructor(message: string, statusCode: number, data: ValidationError[]) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.data = data?data:[];
    }

}
