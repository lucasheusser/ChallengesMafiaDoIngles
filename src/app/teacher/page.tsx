import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const formatDateBR = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

export default async function TeacherDashboard() {
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

  const { data: myChallenges } = await (supabase
    .from('challenges') as any)
    .select('*')
    .eq('created_by', (profile as any).id)
    .order('created_at', { ascending: false })

  const { data: pendingSubmissions } = await (supabase
    .from('submissions') as any)
    .select('*, challenges:challenges!submissions_challenge_id_fkey(title, created_by), profiles:profiles!submissions_user_id_fkey(full_name)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  // Filter submissions for challenges created by this teacher (or show all if admin)
  const relevantSubmissions = (profile as any).role === 'admin' 
    ? pendingSubmissions
    : pendingSubmissions?.filter((s: any) => (s.challenges as any)?.created_by === (profile as any).id)

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage challenges and review submissions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">📝 {myChallenges?.length || 0}</CardTitle>
              <CardDescription>My Challenges</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">⏳ {relevantSubmissions?.length || 0}</CardTitle>
              <CardDescription>Pending Reviews</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-6">
          <Link href="/teacher/create-challenge">
            <Button size="lg">+ Create New Challenge</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">My Challenges</h2>
            <div className="space-y-4">
              {myChallenges && myChallenges.length > 0 ? (
                myChallenges.map((challenge: any) => (
                  <Card key={challenge.id} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription>
                            {formatDateBR(challenge.publish_date)}
                          </CardDescription>
                        </div>
                        <div>
                          {challenge.status === 'draft' && (
                            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                              Draft
                            </span>
                          )}
                          {challenge.status === 'published' && (
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium dark:bg-green-950/40 dark:text-green-300">
                              Published
                            </span>
                          )}
                          {challenge.status === 'archived' && (
                            <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium dark:bg-red-950/40 dark:text-red-300">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted px-2 py-0.5">🪙 {challenge.coin_reward}</span>
                          <span className="rounded-full bg-muted px-2 py-0.5">⭐ {challenge.points_reward}</span>
                        </div>
                        <Link href={`/teacher/edit-challenge/${challenge.id}`}>
                          <Button variant="outline" size="sm">
                            ✏️ Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No challenges created yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Pending Submissions</h2>
            <div className="space-y-4">
              {relevantSubmissions && relevantSubmissions.length > 0 ? (
                relevantSubmissions.map((submission: any) => (
                  <Card key={submission.id} className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {(submission.challenges as any)?.title || 'Challenge'}
                      </CardTitle>
                      <CardDescription>
                        By: {(submission.profiles as any)?.full_name || 'Student'}
                        <br />
                        Submitted: {new Date(submission.submitted_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/teacher/submission/${submission.id}`}>
                        <Button size="sm">Review Submission</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending submissions
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
