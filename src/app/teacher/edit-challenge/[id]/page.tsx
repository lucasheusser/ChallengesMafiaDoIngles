import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import EditChallengeClient from "./edit-challenge-client"

export default async function EditChallengePage({ params }: { params: { id: string } }) {
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

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'underboss' && profile.role !== 'admin')) {
    redirect('/dashboard')
  }

  const { data: challenge } = await (supabase
    .from('challenges') as any)
    .select('*')
    .eq('id', params.id)
    .single()

  if (!challenge) {
    redirect('/teacher')
  }

  // Only allow editing own challenges (unless underboss or admin)
  if (profile.role !== 'underboss' && profile.role !== 'admin' && challenge.created_by !== profile.id) {
    redirect('/teacher')
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Edit Challenge</h1>
          <p className="text-muted-foreground">Update challenge details and content</p>
        </div>
        
        <EditChallengeClient challenge={challenge} />
      </main>
    </div>
  )
}
