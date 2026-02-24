import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type FilterType = 'all' | 'week' | 'month' | 'year'

const toDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateRange = (filter: FilterType) => {
  if (filter === 'all') return null

  const now = new Date()
  let startDate: Date
  let endDate: Date

  if (filter === 'week') {
    const dayOfWeek = now.getDay()
    startDate = new Date(now)
    startDate.setDate(now.getDate() - dayOfWeek)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
  } else if (filter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else {
    startDate = new Date(now.getFullYear(), 0, 1)
    endDate = new Date(now.getFullYear(), 11, 31)
  }

  return {
    start: toDateString(startDate),
    end: toDateString(endDate),
  }
}

const formatDateBR = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

const getTodayBrazil = () => {
  const now = new Date()
  const brazilDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const year = brazilDate.getFullYear()
  const month = String(brazilDate.getMonth() + 1).padStart(2, '0')
  const day = String(brazilDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { filter?: string }
}) {
  const supabase = await createClient()
  const filter = (searchParams?.filter as FilterType) || 'all'
  const range = getDateRange(filter)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('*')
    .eq('user_id', user.id)
    .single()

  let challengesQuery = (supabase
    .from('challenges') as any)
    .select('*')
    .eq('status', 'published')
    .lte('publish_date', getTodayBrazil())
    .order('publish_date', { ascending: false })

  if (range) {
    challengesQuery = challengesQuery
      .gte('publish_date', range.start)
      .lte('publish_date', range.end)
  }

  const { data: challenges } = await challengesQuery

  let submissionsQuery = (supabase
    .from('submissions') as any)
    .select('*, challenges(title, content_json)')
    .eq('user_id', (profile as any)?.id || '')
    .order('submitted_at', { ascending: false })

  if (range) {
    submissionsQuery = submissionsQuery
      .gte('submitted_at', `${range.start}T00:00:00.000Z`)
      .lte('submitted_at', `${range.end}T23:59:59.999Z`)
  }

  const { data: submissions } = await submissionsQuery

  const { data: transactions } = await (supabase
    .from('transactions') as any)
    .select('*')
    .eq('user_id', (profile as any)?.id || '')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Welcome back, {profile?.full_name || 'Student'}!</h1>
          <p className="text-muted-foreground">Complete challenges and earn rewards</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">🪙 {profile?.coins_total || 0}</CardTitle>
              <CardDescription>Total Coins</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">⭐ {profile?.points_total || 0}</CardTitle>
              <CardDescription>Total Points</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">📝 {submissions?.length || 0}</CardTitle>
              <CardDescription>Submissions</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Your Challenges & Submissions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard">
              <Button size="sm" variant={filter === 'all' ? 'secondary' : 'outline'}>
                All
              </Button>
            </Link>
            <Link href="/dashboard?filter=week">
              <Button size="sm" variant={filter === 'week' ? 'secondary' : 'outline'}>
                This Week
              </Button>
            </Link>
            <Link href="/dashboard?filter=month">
              <Button size="sm" variant={filter === 'month' ? 'secondary' : 'outline'}>
                This Month
              </Button>
            </Link>
            <Link href="/dashboard?filter=year">
              <Button size="sm" variant={filter === 'year' ? 'secondary' : 'outline'}>
                This Year
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Available Challenges</h2>
            <div className="space-y-4">
              {challenges && challenges.length > 0 ? (
                challenges.map((challenge: any) => {
                  const hasSubmitted = submissions?.some((s: any) => s.challenge_id === challenge.id)
                  
                  return (
                    <Card key={challenge.id} className="border-border bg-card hover:shadow-sm transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle>{challenge.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {challenge.description.substring(0, 100)}...
                            </CardDescription>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div className="rounded-full bg-muted px-2 py-0.5">🪙 {challenge.coin_reward}</div>
                            <div className="rounded-full bg-muted px-2 py-0.5 mt-1">⭐ {challenge.points_reward}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {formatDateBR(challenge.publish_date)}
                          </span>
                          {hasSubmitted ? (
                            <span className="text-xs text-green-700 font-medium rounded-full bg-green-50 px-2 py-1 dark:bg-green-950/40 dark:text-green-300">Submitted</span>
                          ) : (
                            <Link href={`/challenge/${challenge.id}`}>
                              <Button size="sm">Start Challenge</Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No challenges available yet. Check back soon!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">My Submissions</h2>
            <div className="space-y-4">
              {submissions && submissions.length > 0 ? (
                submissions.map((submission: any) => {
                  const challengeContent = (submission.challenges as any)?.content_json as any
                  const items = challengeContent?.items || []
                  const answers = (submission.answers_json as any) || []

                  return (
                  <Card key={submission.id} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {(submission.challenges as any)?.title || 'Challenge'}
                          </CardTitle>
                          <CardDescription>
                            {formatDateBR(submission.submitted_at)}
                          </CardDescription>
                        </div>
                        <div>
                          {submission.status === 'pending' && (
                            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium dark:bg-yellow-950/40 dark:text-yellow-300">
                              Pending
                            </span>
                          )}
                          {submission.status === 'approved' && (
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium dark:bg-green-950/40 dark:text-green-300">
                              Approved ✓
                            </span>
                          )}
                          {submission.status === 'rejected' && (
                            <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium dark:bg-red-950/40 dark:text-red-300">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {answers.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Your Answers:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {answers.map((answer: any, index: number) => {
                              const item = items.find((i: any) => i.id === answer.item_id)
                              const isCorrect = typeof answer.is_correct === 'boolean' ? answer.is_correct : null
                              return (
                                <li key={answer.item_id || index} className="flex flex-col">
                                  <span className="text-muted-foreground">
                                    {index + 1}. {item?.text || 'Question'}
                                  </span>
                                  <span>
                                    <strong>Answer:</strong> {answer.selected_option || '-'}
                                    {isCorrect !== null && (
                                      <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                                        {isCorrect ? " (Correct)" : " (Incorrect)"}
                                      </span>
                                    )}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ) : null}

                      {submission.feedback_text && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Feedback:</strong> {submission.feedback_text}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No submissions yet. Start a challenge!
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
