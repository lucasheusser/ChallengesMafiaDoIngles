import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">English Daily Challenges</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Master English, one challenge at a time
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Practice daily, get feedback from teachers, and climb the leaderboard.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-base px-8 py-6">
              Start Learning Today
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>📝 Daily Challenges</CardTitle>
              <CardDescription>
                New challenges every day covering grammar, vocabulary, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete exercises on prepositions, tenses, phrasal verbs, and other key topics
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>👨‍🏫 Teacher Feedback</CardTitle>
              <CardDescription>
                Get personalized feedback on your submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Teachers review your work and provide detailed corrections and explanations
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>🏆 Earn Rewards</CardTitle>
              <CardDescription>
                Collect coins and climb the leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn coins for approved submissions and compete with other learners
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Sign Up</h4>
              <p className="text-sm text-muted-foreground">Create your free account</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Complete Challenge</h4>
              <p className="text-sm text-muted-foreground">Answer daily exercises</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Get Reviewed</h4>
              <p className="text-sm text-muted-foreground">Teacher checks your work</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Earn Rewards</h4>
              <p className="text-sm text-muted-foreground">Collect coins and points</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2026 English Daily Challenges. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
