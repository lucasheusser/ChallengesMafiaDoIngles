import { z } from 'zod'

export const fillBlanksItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.string()),
})

export const fillBlanksContentSchema = z.object({
  instructions: z.string(),
  items: z.array(fillBlanksItemSchema),
})

export const challengeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['fill_blanks_prepositions']),
  content_json: z.any(), // Will validate based on type
  points_reward: z.number().min(1).max(1000),
  coin_reward: z.number().min(1).max(1000),
  publish_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

export const createChallengeSchema = challengeSchema.omit({ status: true })

export const updateChallengeSchema = challengeSchema.partial()

export type ChallengeInput = z.infer<typeof challengeSchema>
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>
export type FillBlanksContent = z.infer<typeof fillBlanksContentSchema>
