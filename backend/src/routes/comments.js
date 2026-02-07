import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches.js"
import { createCommentSchema, listCommentsQuerySchema } from "../validation/comments.js";
import { db } from "../db.js";
import { comment } from "../schema.js";
import { sql } from "drizzle-orm";



export const commentRouter = Router({ mergeParams: true });

commentRouter.get('/', async (req, res) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if (!paramsResult.success) {
        res.status(400).json({ error: 'invalid match ID ', details: paramsResult.error.issues })
    }

    const queryResults = listCommentsQuerySchema.safeParse(req.query);
    if (!queryResults.success) {
        res.status(400).json({ error: "IInvalid query parametrs ", details: queryResults.error.issues })
    }

    const matchId = req.params.id;
    const limit = queryResults.data.limit ?? 50;

    try {

        const data = await db.select()
  .from(comment)
  .where(sql`"match_id" = ${Number(matchId)}`)
  .orderBy(comment.createdAt, "desc")
  .limit(limit);

        res.status(200).json({ data })
    } catch (error) {
        console.error('Failed to fetch comments', error);
        res.status(500).json({ error: 'Failed to fetch comments ' });
    }

})

commentRouter.post('/', async (req, res) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);

    console.log('URL: ', req.originalUrl);
    console.log('paramms: ', req.params)

    if (!paramsResult.success) {
        return res.status(400).json({ error: 'Invalid match ID ', details: paramsResult.error.issues })
    }

    const bodyResult = createCommentSchema.safeParse(req.body)

    if (!bodyResult.success) {
        return res.status(400).json({ error: 'invalid comment params ', details: bodyResult.error.issues })
    }

    try {
        const { minutes, ...rest } = bodyResult.data;
        const [result] = await db.insert(comment).values({
            matchId: paramsResult.data.id,
            minutes: minutes,
            ...rest
        }).returning();

        req.app.locals.ws.broadcastCommentCreated(result);

        res.status(201).json({ data: result })
    } catch (error) {
        console.error('Failed to create comment', error)
        res.status(500).json({ error: "Failed to create comment" })
    }
})