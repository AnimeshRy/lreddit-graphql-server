import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { Session, SessionData } from 'express-session';

interface MySessionData extends SessionData {
  userId?: number;
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Session & Partial<MySessionData> };
  redis: Redis;
  res: Response;
};
