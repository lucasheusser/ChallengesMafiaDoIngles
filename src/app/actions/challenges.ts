"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createChallengeSchema } from "@/lib/validations/challenge"
import { Database } from "@/types/supabase"

type Profile = Database['public']['Tables']['profiles']['Row']

export async function createChallenge(formData: FormData) {
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
    console.error('Profile error:', profileError)
    return { error: "Profile not found" }
  }

  const typedProfile = profile as Profile

  if (typedProfile.role !== 'teacher' && typedProfile.role !== 'admin') {
    console.log('User role check failed:', typedProfile.role)
    return { error: "Only teachers can create challenges" }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const content_json = JSON.parse(formData.get('content_json') as string)
  const points_reward = parseInt(formData.get('points_reward') as string)
  const coin_reward = parseInt(formData.get('coin_reward') as string)
  const publish_date = formData.get('publish_date') as string
  const status = formData.get('status') as string || 'draft'

  console.log('Creating challenge:', { title, status, type, created_by: typedProfile.id })

  const validation = createChallengeSchema.safeParse({
    title,
    description,
    type,
    content_json,
    points_reward,
    coin_reward,
    publish_date,
  })

  if (!validation.success) {
    console.error('Validation error:', validation.error.errors)
    return { error: validation.error.errors[0].message }
  }

  const { error } = await (supabase
    .from('challenges') as any)
    .insert({
      title: validation.data.title,
      description: validation.data.description,
      type: validation.data.type,
      content_json: validation.data.content_json,
      points_reward: validation.data.points_reward,
      coin_reward: validation.data.coin_reward,
      publish_date: validation.data.publish_date,
      status: status as 'draft' | 'published',
      created_by: typedProfile.id,
    })

  if (error) {
    console.error('Database insert error:', error)
    return { error: error.message }
  }

  console.log('Challenge created successfully')
  revalidatePath('/teacher')
  redirect('/teacher')
}

export async function updateChallenge(formData: FormData) {
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
    return { error: "Only teachers can update challenges" }
  }

  const challenge_id = formData.get('challenge_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const content_json = JSON.parse(formData.get('content_json') as string)
  const points_reward = parseInt(formData.get('points_reward') as string)
  const coin_reward = parseInt(formData.get('coin_reward') as string)
  const publish_date = formData.get('publish_date') as string
  const status = formData.get('status') as string || 'draft'

  // Verify ownership
  const { data: existingChallenge } = await (supabase
    .from('challenges') as any)
    .select('created_by')
    .eq('id', challenge_id)
    .single()

  if (!existingChallenge) {
    return { error: "Challenge not found" }
  }

  if (typedProfile.role !== 'admin' && existingChallenge.created_by !== typedProfile.id) {
    return { error: "You can only edit your own challenges" }
  }

  const validation = createChallengeSchema.safeParse({
    title,
    description,
    type,
    content_json,
    points_reward,
    coin_reward,
    publish_date,
  })

  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { error } = await (supabase
    .from('challenges') as any)
    .update({
      title: validation.data.title,
      description: validation.data.description,
      type: validation.data.type,
      content_json: validation.data.content_json,
      points_reward: validation.data.points_reward,
      coin_reward: validation.data.coin_reward,
      publish_date: validation.data.publish_date,
      status: status as 'draft' | 'published',
    })
    .eq('id', challenge_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/teacher')
  redirect('/teacher')
}
