import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import CreateChallengeClient from "./create-challenge-client"

export default async function CreateChallengePage() {
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

  if ((profile as any)?.role !== 'teacher' && (profile as any)?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Create New Challenge</h1>
          <p className="text-muted-foreground">Add a new challenge for your students</p>
        </div>
        <CreateChallengeClient />
      </main>
    </div>
  )
}
