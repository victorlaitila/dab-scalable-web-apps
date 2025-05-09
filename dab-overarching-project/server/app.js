import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import { Redis } from "ioredis";
import { cache } from "@hono/hono/cache";
import { auth } from "./auth.js";
import postgres from "postgres";

const app = new Hono();
const sql = postgres();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.use("/*", cors());
app.use("/*", logger());

const requireAuth = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user?.name) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", session.user.name);
  return next();
};

app.use("/api/exercises/:id/submissions", requireAuth);
app.use("/api/submissions/:id/status", requireAuth);

let redis;

if (Deno.env.get("REDIS_HOST")) {
  redis = new Redis(
    Number.parseInt(Deno.env.get("REDIS_PORT")),
    Deno.env.get("REDIS_HOST"),
  );
} else {
  redis = new Redis(6379, "redis");
}

const QUEUE_NAME = "submissions";

app.get(
  "/api/languages",
  cache({ cacheName: "lang-cache", wait: true }),
  async (c) => {
    const languages = await sql`SELECT * FROM languages`
    return c.json(languages);
  }
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
      WHERE languages.id = ${id}
    `;
    return c.json(exercises);
  }
);

app.get("/api/exercises/:id", 
  cache({ cacheName: "exercise-cache", wait: true }),
  async (c) => {
      const id = c.req.param("id");
    const exercise = await sql`
      SELECT exercises.id, exercises.title, exercises.description
      FROM exercises
      WHERE exercises.id = ${id}
    `;
    if (exercise.length === 0) {
      return c.text("", 404);
    }
    return c.json(exercise[0]);
  }
);

app.get("/api/submissions/:id/status", async (c) => {
  const id = c.req.param("id");
  const submission = await sql`
    SELECT exercise_submissions.grading_status, exercise_submissions.grade
    FROM exercise_submissions
    WHERE exercise_submissions.id = ${id}
  `;
  if (submission.length === 0) {
    return c.text("", 404);
  }
  return c.json(submission[0]);
});

app.post("/api/exercises/:id/submissions", async (c) => {
  const exerciseId = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const sourceCode = body.source_code;
  const submission = await sql`
    INSERT INTO exercise_submissions (exercise_id, source_code, grading_status)
    VALUES (${exerciseId}, ${sourceCode}, 'pending')
    RETURNING id
  `;
  const submissionId = submission[0].id;
  await redis.lpush(QUEUE_NAME, submissionId.toString());
  return c.json({ id: submissionId });
});

app.get("/api/lgtm-test", (c) => {
  console.log("Hello log collection :)");
  return c.json({ message: "Hello, world!" });
});

export default app;