"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FillBlanksRenderer } from "@/components/challenges/fill-blanks-renderer"
import { SubmissionAnswer } from "@/lib/validations/submission"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from "react-markdown"

interface ChallengeClientProps {
  challenge: any
  profile: any
  existingSubmission: any
}

export default function ChallengeClient({ challenge, profile, existingSubmission }: ChallengeClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [answers, setAnswers] = useState<SubmissionAnswer[]>(
    existingSubmission?.answers_json || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswerChange = (itemId: string, value: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.item_id === itemId)
      if (existing) {
        return prev.map(a => a.item_id === itemId ? { ...a, selected_option: value } : a)
      }
      return [...prev, { item_id: itemId, selected_option: value }]
    })
  }

  const handleSubmit = async () => {
    if (answers.length !== challenge.content_json.items.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please answer all questions before submitting",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await (supabase
        .from('submissions') as any)
        .insert({
          challenge_id: challenge.id,
          user_id: profile.id,
          answers_json: answers,
          status: 'pending',
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your submission has been received and is awaiting review",
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReadOnly = !!existingSubmission

  const formatDateBR = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight mb-2">{challenge.title}</CardTitle>
              <CardDescription className="text-sm">
                Published: {formatDateBR(challenge.publish_date)}
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="rounded-full bg-muted px-3 py-1">🪙 {challenge.coin_reward} coins</div>
              <div className="rounded-full bg-muted px-3 py-1 mt-2">⭐ {challenge.points_reward} points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-foreground">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {challenge.type === 'fill_blanks_prepositions' && (
        <FillBlanksRenderer
          content={challenge.content_json}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          readonly={isReadOnly}
        />
      )}

      {existingSubmission ? (
        <Card className="border-border bg-card">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                You have already submitted this challenge
              </p>
              <p className="text-muted-foreground">
                Status: <span className="font-semibold capitalize">{existingSubmission.status}</span>
              </p>
              {existingSubmission.feedback_text && (
                <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                  <p className="font-semibold mb-2">Teacher Feedback:</p>
                  <p>{existingSubmission.feedback_text}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            {isSubmitting ? "Submitting..." : "Submit Challenge"}
          </Button>
        </div>
      )}
    </div>
  )
}
