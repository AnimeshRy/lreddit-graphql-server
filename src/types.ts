import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express'
import { Redis } from 'ioredis';
import { Session } from "express-session";

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: Session };
    redis: Redis;
    res: Response;
};

