import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';
import { NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = uuidv4();
    }
    next();
  }
}
