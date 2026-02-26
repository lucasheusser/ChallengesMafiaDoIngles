import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import SubmissionReviewClient from "./submission-review-client"

export default async function SubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  if ((profile as any)?.role !== 'teacher' && (profile as any)?.role !== 'underboss' && (profile as any)?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: submission } = await (supabase
    .from('submissions') as any)
    .select('*, challenges:challenges!submissions_challenge_id_fkey(*), profiles:profiles!submissions_user_id_fkey(*)')
    .eq('id', id)
    .single()

  if (!submission) {
    notFound()
  }

  const challenge = submission.challenges as any
  const student = submission.profiles as any

  // Check authorization
  if ((profile as any).role !== 'underboss' && (profile as any).role !== 'admin' && (challenge as any).created_by !== (profile as any).id) {
    redirect('/teacher')
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Review Submission</h1>
        <SubmissionReviewClient 
          submission={submission}
          challenge={challenge}
          student={student}
        />
      </main>
    </div>
  )
}
