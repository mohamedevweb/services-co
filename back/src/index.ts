import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import dotenv from 'dotenv'
import {drizzle} from 'drizzle-orm/neon-http';
import { drizzle as drizzleDb} from 'drizzle-orm/node-postgres';
import prestataireRoute from './routes/prestataire.routes.js';

dotenv.config();


const app = new Hono()
export const db = drizzle(process.env.DATABASE_URL!);
export const dbPg = drizzleDb(process.env.DATABASE_URL!);

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.route('/prestataire', prestataireRoute);

serve({
    fetch: app.fetch,
    port: 3001
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
