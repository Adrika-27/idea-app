import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    error: true,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
};
