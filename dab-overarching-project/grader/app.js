import { Hono } from "@hono/hono";
import { Redis } from "ioredis";
import postgres from "postgres";

const app = new Hono();
const sql = postgres();

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

let consume_enabled = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gradeBySubmissionId = async (id) => {
  await sql`
    UPDATE exercise_submissions
    SET grading_status = 'processing'
    WHERE id = ${id}
  `;
  const sleepTime = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
  await sleep(sleepTime);
  const randomGrade = Math.floor(Math.random() * 101);
  await sql`
    UPDATE exercise_submissions
    SET grading_status = 'graded', grade = ${randomGrade}
    WHERE id = ${id}
  `;
}

const consume = async () => {
  while (consume_enabled) {
    const len = await redis.llen(QUEUE_NAME);
    if (len > 0) {
      const id = await redis.rpop(QUEUE_NAME);
      await gradeBySubmissionId(id);
    } else {
      await sleep(250);
    }
  }
};

app.get("/api/status", async (c) => {
  const len = await redis.llen(QUEUE_NAME);
  return c.json({ "queue_size": len, "consume_enabled": consume_enabled });
});

app.post("/api/consume/enable", async (c) => {
  consume_enabled = true;
  consume();
  return c.json({ "consume_enabled": consume_enabled });
});

app.post("/api/consume/disable", async (c) => {
  consume_enabled = false;
  return c.json({ "consume_enabled": consume_enabled });
});

export default app;