"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { reviewSubmissionSchema } from "@/lib/validations/submission"
import { Database } from "@/types/supabase"

type Profile = Database['public']['Tables']['profiles']['Row']

export async function reviewSubmission(submissionId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: "Profile not found" }
  }

  const typedProfile = profile as Profile

  if (typedProfile.role !== 'teacher' && typedProfile.role !== 'admin') {
    return { error: "Only teachers can review submissions" }
  }

  const status = formData.get('status') as string
  const feedback_text = formData.get('feedback_text') as string
  const answers_json_raw = formData.get('answers_json') as string | null

  const validation = reviewSubmissionSchema.safeParse({ status, feedback_text })
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Get submission details
  const { data: submission } = await (supabase
    .from('submissions') as any)
    .select('*, challenges(*)')
    .eq('id', submissionId)
    .single()

  if (!submission) {
    return { error: "Submission not found" }
  }

  // Update submission
  const { error: updateError } = await (supabase
    .from('submissions') as any)
    .update({
      status: validation.data.status,
      feedback_text: validation.data.feedback_text,
      reviewed_by: typedProfile.id,
      reviewed_at: new Date().toISOString(),
      ...(answers_json_raw ? { answers_json: JSON.parse(answers_json_raw) } : {}),
    })
    .eq('id', submissionId)

  if (updateError) {
    return { error: updateError.message }
  }

  // If approved, credit coins and points
  if (validation.data.status === 'approved') {
    const challenge = submission.challenges as any
    
    // Create transaction
    const { error: transactionError } = await (supabase
      .from('transactions') as any)
      .insert({
        user_id: submission.user_id,
        type: 'challenge_reward',
        amount_coins: challenge.coin_reward,
        amount_points: challenge.points_reward,
        ref_submission_id: submissionId,
      })

    if (transactionError) {
      return { error: transactionError.message }
    }

    // Update profile totals
    const { data: userProfile } = await (supabase
      .from('profiles') as any)
      .select('coins_total, points_total')
      .eq('id', submission.user_id)
      .single()

    const { error: profileUpdateError } = await (supabase
      .from('profiles') as any)
      .update({
        coins_total: (userProfile?.coins_total || 0) + challenge.coin_reward,
        points_total: (userProfile?.points_total || 0) + challenge.points_reward,
      })
      .eq('id', submission.user_id)

    if (profileUpdateError) {
      return { error: profileUpdateError.message }
    }
  }

  revalidatePath('/teacher')
  revalidatePath('/dashboard')
  
  return { success: true }
}
