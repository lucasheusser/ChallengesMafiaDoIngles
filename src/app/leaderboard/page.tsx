import { createClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LeaderboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await (supabase
      .from('profiles') as any)
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  }

  const { data: leaderboard } = await (supabase
    .from('profiles') as any)
    .select('*')
    .order('coins_total', { ascending: false })
    .order('points_total', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-8">🏆 Leaderboard</h1>
        
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Top 50 Students</CardTitle>
            <CardDescription>Ranked by coins (with points as tiebreaker)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((player: any, index: number) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      player.id === profile?.id ? 'bg-muted border-border' : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-slate-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {player.full_name || 'Anonymous'}
                          {player.id === profile?.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                        {player.role === 'teacher' && (
                          <span className="text-xs text-purple-600">Teacher</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-right">
                      <div>
                        <div className="font-semibold text-lg text-foreground">🪙 {player.coins_total}</div>
                        <div className="text-xs text-muted-foreground">coins</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-foreground">⭐ {player.points_total}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
