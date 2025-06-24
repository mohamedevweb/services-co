import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import dotenv from 'dotenv'
import {drizzle} from 'drizzle-orm/neon-http';

dotenv.config();


const app = new Hono()
export const db = drizzle(process.env.DATABASE_URL!);

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

serve({
    fetch: app.fetch,
    port: 3001
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
