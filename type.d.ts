import * as sqlite3 from "sqlite3";
import { Request } from 'express'

declare global {
    namespace Express {
        export interface Request {
            db?: sqlite3.Database;
        }
    }
}

