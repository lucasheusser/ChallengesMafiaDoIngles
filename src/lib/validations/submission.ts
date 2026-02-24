import { z } from 'zod'

export const submissionAnswerSchema = z.object({
  item_id: z.string(),
  selected_option: z.string(),
})

export const submissionSchema = z.object({
  challenge_id: z.string().uuid(),
  answers_json: z.array(submissionAnswerSchema),
})

export const reviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback_text: z.string().min(1, 'Feedback is required'),
})

export type SubmissionInput = z.infer<typeof submissionSchema>
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>
export type SubmissionAnswer = z.infer<typeof submissionAnswerSchema>
