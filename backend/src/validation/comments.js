import { z } from 'zod'

export const listCommentsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(50).optional(),
})


export const createCommentSchema = z.object({
    minutes: z.coerce.number().int().nonnegative().optional(),
    sequence: z.coerce.number().int().nonnegative().optional(),
    period: z.string().min(1).optional(),
    eventType: z.string().min(1).optional(),
    actor: z.string().min(1).optional(),
    team: z.string().min(1).optional(),
    message: z.string().min(1),
    metadata: z.record(z.unknown()).optional(),
    tags: z.string().optional(),
})