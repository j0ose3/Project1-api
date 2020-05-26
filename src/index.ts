import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import { UserRouter } from './routers/user-router';
import { ReimbursementRouter } from './routers/reimbursement-router';
import { AuthRouter } from './routers/auth-router';
import { sessionMiddleware } from './middleware/session-middleware';
import { corsFilter } from './middleware/cors-filter';
import {Pool} from 'pg';

// environment configuration
dotenv.config();

// database configuration 
export const connectionPool: Pool = new Pool ({
    host: process.env['DB_HOST'],
    port: +process.env['DB_PORT'],
    database: process.env['DB_NAME'],
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    max: 5
});

// Web configuration
const app = express();
app.use(sessionMiddleware);
app.use(corsFilter);
app.use('/', express.json());
app.use('/users', UserRouter);
app.use('/reimbursements', ReimbursementRouter);
app.use('/auth', AuthRouter);

app.listen(8080, () => {
    console.log('Project1 running and listening at http://localhost:8080');
});

