import { pgTable, serial, timestamp, pgEnum, jsonb, integer, text } from 'drizzle-orm/pg-core';
import pg from 'pg';

export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished'])

export const matches = pgTable('matches', {
    id: serial('id').primaryKey(),
    sport: text('sport').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    status: matchStatusEnum('status').notNull().default('scheduled'),
    endTime: timestamp('end_time'),
    homeScore: integer('home_score').notNull().default(0),
    awayScore: integer('away_score').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow()
})

export const comment = pgTable('comments', {
    id: serial('id').primaryKey(),
    matchId: integer('match_id').notNull().references(() => matches.id),
    minute: integer('minute'), 
    sequence: integer('sequence'),
    period: text('period'),
    eventType: text('event_type'), 
    actor: text('actor'),
    team: text('team'),
    message: text('message'),
    metdata: jsonb('metadata'),
    tags: text('tags'),
    createdAt: timestamp('created_at').notNull().defaultNow()
})

