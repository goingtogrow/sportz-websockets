import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { matches } from '../schema.js';
import { db } from "../db.js"
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query)

    if(!parsed.success) {
        return res.status(400).json({ error: "invalid ", details: JSON.stringify(parsed.error)})
    }    

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

    try {
        const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit)

        res.status(200).json({ data })
    } catch (e) {
        res.status(500).json({ error: "Failed to list matches" })
    }
})

matchRouter.post('/', async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid payload',
      details: parsed.error.format(),
    });
  }

  const {
    startTime,
    endTime,
    homeScore,
    awayScore,
    ...rest
  } = parsed.data;

  const start = new Date(startTime);
  const end = new Date(endTime);

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...rest,
        startTime: start,
        endTime: end,
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(start, end),
      })
      .returning();

    res.status(201).json({ data: event });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: 'Failed to create match',
      details: e.message,
    });
  }
});
