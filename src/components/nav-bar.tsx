"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavBarProps {
  user: any
  profile: any
}

export function NavBar({ user, profile }: NavBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldUseDark = stored ? stored === "dark" : prefersDark
    setIsDark(shouldUseDark)
    document.documentElement.classList.toggle("dark", shouldUseDark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return (
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
              <h1 className="text-xl font-semibold text-foreground">Mafia Challenges</h1>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDark ? "Light" : "Dark"}
            </Button>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin'

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Link href={isTeacher ? "/teacher" : "/dashboard"}>
            <h1 className="text-xl font-semibold text-foreground">Mafia Challenges</h1>
          </Link>
          
          <div className="flex flex-wrap items-center gap-6">
            {isTeacher ? (
              <>
                <Link 
                  href="/teacher" 
                  className={
                    pathname === '/teacher'
                      ? 'text-sm font-semibold text-foreground'
                      : 'text-sm font-medium text-muted-foreground hover:text-foreground transition'
                  }
                >
                  Dashboard
                </Link>
                <Link 
                  href="/leaderboard"
                  className={
                    pathname === '/leaderboard'
                      ? 'text-sm font-semibold text-foreground'
                      : 'text-sm font-medium text-muted-foreground hover:text-foreground transition'
                  }
                >
                  Leaderboard
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className={
                    pathname === '/dashboard'
                      ? 'text-sm font-semibold text-foreground'
                      : 'text-sm font-medium text-muted-foreground hover:text-foreground transition'
                  }
                >
                  Dashboard
                </Link>
                <Link 
                  href="/leaderboard"
                  className={
                    pathname === '/leaderboard'
                      ? 'text-sm font-semibold text-foreground'
                      : 'text-sm font-medium text-muted-foreground hover:text-foreground transition'
                  }
                >
                  Leaderboard
                </Link>
              </>
            )}
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? "Light" : "Dark"}
              </Button>
              <div className="text-sm text-right">
                <div className="font-semibold text-foreground">{profile?.full_name || user.email}</div>
                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">🪙 {profile?.coins_total || 0}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">⭐ {profile?.points_total || 0}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
