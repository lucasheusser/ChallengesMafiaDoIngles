import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import ChallengeClient from "./challenge-client"

export default async function ChallengePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: challenge } = await (supabase
    .from('challenges') as any)
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (!challenge) {
    notFound()
  }

  const { data: existingSubmission } = await (supabase
    .from('submissions') as any)
    .select('*')
    .eq('challenge_id', (challenge as any).id)
    .eq('user_id', (profile as any)?.id || '')
    .single()

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <ChallengeClient 
          challenge={challenge} 
          profile={profile}
          existingSubmission={existingSubmission}
        />
      </main>
    </div>
  )
}
