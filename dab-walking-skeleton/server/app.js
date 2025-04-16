import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { Redis } from "ioredis";
import { logger } from "@hono/hono/logger";
import postgres from "postgres";

const app = new Hono();
const sql = postgres();

const redisProducer = new Redis(6379, "redis");

const QUEUE_NAME = "users";

app.use("/*", cors());
app.use("/*", logger());

app.get("/api", (c) => {
  console.log("mroororooror")
  return c.text("Hello new path!");
});

/*app.post("/users", async (c) => {
  const { name } = await c.req.json();
  await redisProducer.lpush(QUEUE_NAME, JSON.stringify({ name }));
  c.status(202);
  return c.body("Accepted");
});

app.get("/", (c) => c.json({ message: "Hello world!" }));

app.post("/users", async (c) => {
  const { name } = await c.req.json();
  const user = await sql`INSERT INTO users (name) VALUES (${name})`;
  c.status(202);
  return c.body("Accepted");
});*/

/*app.get("/todos", async (c) => {
  const todos = await sql`SELECT * FROM todos`;
  return c.json(todos);
});

app.get("/redis-test", async (c) => {
  let count = await redis.get("test");
  if (!count) {
    count = 0;
  } else {
    count = Number(count);
  }

  count++;

  await redis.set("test", count);
  return c.json({ count });
});*/

export default app;