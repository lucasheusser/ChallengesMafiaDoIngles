"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ReviewedSubmission {
  id: string
  status: string
  feedback_text: string | null
  reviewed_at: string
  challenges: any
  profiles: any
}

interface ReviewHistoryClientProps {
  submissions: ReviewedSubmission[]
}

export default function ReviewHistoryClient({ submissions }: ReviewHistoryClientProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  // Get unique students from submissions
  const students = useMemo(() => {
    const uniqueStudents = new Map<string, string>()
    submissions.forEach((submission) => {
      const profile = submission.profiles
      if (profile && typeof profile === 'object') {
        const profileId = String(profile.id || '')
        const fullName = String(profile.full_name || 'Unknown Student')
        if (profileId && !uniqueStudents.has(profileId)) {
          uniqueStudents.set(profileId, fullName)
        }
      }
    })
    return Array.from(uniqueStudents.entries()).map(([id, name]) => ({
      id,
      name,
    }))
  }, [submissions])

  // Filter submissions based on selected student
  const filteredSubmissions = useMemo(() => {
    if (!selectedStudent) return submissions
    return submissions.filter((s) => {
      const profile = s.profiles
      if (profile && typeof profile === 'object') {
        return String(profile.id || '') === selectedStudent
      }
      return false
    })
  }, [submissions, selectedStudent])

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Filter by Student</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStudent === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStudent(null)}
          >
            All Students ({submissions.length})
          </Button>
          {students.map((student) => {
            const count = submissions.filter((s) => {
              const profile = s.profiles
              if (profile && typeof profile === 'object') {
                return String(profile.id || '') === student.id
              }
              return false
            }).length
            return (
              <Button
                key={student.id}
                variant={selectedStudent === student.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStudent(student.id)}
              >
                {student.name} ({count})
              </Button>
            )
          })}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions && filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission) => {
            const challenge = submission.challenges && typeof submission.challenges === 'object' 
              ? submission.challenges.title || "Challenge"
              : "Challenge"
            const profile = submission.profiles && typeof submission.profiles === 'object'
              ? submission.profiles.full_name || "Student"
              : "Student"
            
            return (
              <Card key={submission.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{challenge}</CardTitle>
                      <CardDescription>
                        Student: {profile}
                        <br />
                        Reviewed:{" "}
                        {new Date(submission.reviewed_at).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </CardDescription>
                    </div>
                    <div>
                      {submission.status === "approved" && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium dark:bg-green-950/40 dark:text-green-300">
                          ✅ Approved
                        </span>
                      )}
                      {submission.status === "rejected" && (
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium dark:bg-red-950/40 dark:text-red-300">
                          ❌ Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {submission.feedback_text && (
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Feedback:</strong> {submission.feedback_text}
                    </p>
                  )}
                  <Link href={`/teacher/submission/${submission.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {selectedStudent
                ? "No reviews found for this student"
                : "No review history yet"}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
