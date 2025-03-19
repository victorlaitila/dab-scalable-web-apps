import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import { cache } from "@hono/hono/cache";
import postgres from "postgres";

const app = new Hono();
const sql = postgres();

app.use("/*", cors());
app.use("/*", logger());

app.get(
  "/api/languages",
  cache({ cacheName: "lang-cache", wait: true }),
  async (c) => {
    const languages = await sql`SELECT * FROM languages`
    return c.json(languages);
  }
);

app.get(
  "/api/languages/*/exercises",
  cache({
    cacheName: "lang-exercise-cache",
    wait: true,
  }),
);

app.get(
  "/api/languages/:id/exercises",
  cache({ cacheName: "lang-exercise-cache", wait: true }),
  async (c) => {
    const id = c.req.param("id");
    const exercises = await sql`
      SELECT exercises.id, exercises.title, exercises.description
      FROM exercises 
      JOIN languages ON exercises.language_id = languages.id
      WHERE languages.name = ${id}
    `;
    return c.json(exercises);
  }
);

export default app;