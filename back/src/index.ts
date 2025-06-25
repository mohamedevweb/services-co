import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import dotenv from 'dotenv'
import {drizzle} from 'drizzle-orm/neon-http';
import authRoutes from './routes/auth.routes.js';
import protectedRoutes from './routes/protected.routes.js';
import {drizzle as drizzleDb} from 'drizzle-orm/node-postgres';
import prestataireRoute from './routes/prestataire.routes.js';
import {schema} from "./db/schema.js";
import aiRoutes from './routes/ai.routes.js';
import messageRoute from "./routes/message.route.js";


dotenv.config();

const app = new Hono()
export const db = drizzle(process.env.DATABASE_URL!, {schema: schema});
export const dbPg = drizzleDb(process.env.DATABASE_URL!);

// Mount auth routes
app.route('/auth', authRoutes);

// Mount protected routes
app.route('/api', protectedRoutes);

// Mount AI routes
app.route('/ai', aiRoutes);

app.route('/message', messageRoute)

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
