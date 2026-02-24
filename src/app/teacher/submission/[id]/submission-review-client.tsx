"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FillBlanksRenderer } from "@/components/challenges/fill-blanks-renderer"
import { reviewSubmission } from "@/app/actions/submissions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SubmissionReviewClientProps {
  submission: any
  challenge: any
  student: any
}

export default function SubmissionReviewClient({ 
  submission, 
  challenge, 
  student 
}: SubmissionReviewClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved')
  const [feedback, setFeedback] = useState('')
  const [reviewedAnswers, setReviewedAnswers] = useState(
    (submission.answers_json || []).map((answer: any) => ({
      ...answer,
      is_correct: typeof answer.is_correct === 'boolean' ? answer.is_correct : null,
    }))
  )

  const setAnswerCorrectness = (itemId: string, isCorrect: boolean) => {
    setReviewedAnswers((prev: any[]) =>
      prev.map((answer) =>
        answer.item_id === itemId ? { ...answer, is_correct: isCorrect } : answer
      )
    )
  }

  const handleReview = (action: 'approved' | 'rejected') => {
    setReviewAction(action)
    setShowDialog(true)
  }

  const confirmReview = async () => {
    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide feedback",
      })
      return
    }

    setIsSubmitting(true)
    setShowDialog(false)

    const formData = new FormData()
    formData.set('status', reviewAction)
    formData.set('feedback_text', feedback)
    formData.set('answers_json', JSON.stringify(reviewedAnswers))

    try {
      const result = await reviewSubmission(submission.id, formData)
      
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        toast({
          title: "Success",
          description: `Submission ${reviewAction}`,
        })
        router.push('/teacher')
        router.refresh()
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to review submission",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{challenge.title}</CardTitle>
          <CardDescription>
            Student: {student.full_name} | Submitted: {new Date(submission.submitted_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p><strong>Rewards:</strong> 🪙 {challenge.coin_reward} coins | ⭐ {challenge.points_reward} points</p>
          </div>
        </CardContent>
      </Card>

      {challenge.type === 'fill_blanks_prepositions' && (
        <div className="space-y-4">
          <FillBlanksRenderer
            content={challenge.content_json}
            answers={submission.answers_json}
            onAnswerChange={() => {}}
            readonly={true}
          />

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Answer Validation</CardTitle>
              <CardDescription>Mark each answer as correct or incorrect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(challenge.content_json?.items || []).map((item: any, index: number) => {
                const answer = reviewedAnswers.find((a: any) => a.item_id === item.id)
                return (
                  <div key={item.id} className="border border-border rounded-lg p-4 bg-muted">
                    <p className="font-medium">
                      {index + 1}. {item.text}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Student answer: <strong>{answer?.selected_option || '-'}</strong>
                    </p>
                    <div className="flex gap-4 mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct_${item.id}`}
                          checked={answer?.is_correct === true}
                          onChange={() => setAnswerCorrectness(item.id, true)}
                        />
                        <span className="text-green-700">Correct</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct_${item.id}`}
                          checked={answer?.is_correct === false}
                          onChange={() => setAnswerCorrectness(item.id, false)}
                        />
                        <span className="text-red-700">Incorrect</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Review Feedback</CardTitle>
          <CardDescription>Provide feedback for the student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback* (visible to student)</Label>
            <Textarea
              id="feedback"
              placeholder="Great job! or Explain corrections needed..."
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview('rejected')}
              disabled={isSubmitting}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleReview('approved')}
              disabled={isSubmitting}
            >
              Approve & Credit Rewards
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction === 'approved' ? 'Approve Submission?' : 'Reject Submission?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewAction === 'approved' 
                ? `This will credit ${challenge.coin_reward} coins and ${challenge.points_reward} points to ${student.full_name}.`
                : `This will reject the submission. Student can resubmit if allowed.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReview}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
