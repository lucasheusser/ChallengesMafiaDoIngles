"use client"

import { FillBlanksContent } from "@/lib/validations/challenge"
import { SubmissionAnswer } from "@/lib/validations/submission"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FillBlanksRendererProps {
  content: FillBlanksContent
  answers: SubmissionAnswer[]
  onAnswerChange: (itemId: string, value: string) => void
  readonly?: boolean
}

export function FillBlanksRenderer({ 
  content, 
  answers, 
  onAnswerChange,
  readonly = false 
}: FillBlanksRendererProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Fill in the Blanks</CardTitle>
        <CardDescription>{content.instructions}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {content.items.map((item, index) => {
          const currentAnswer = answers.find(a => a.item_id === item.id)?.selected_option || ''
          const answerType = (item as any).answer_type || 'multiple_choice'
          
          return (
            <div key={item.id} className="space-y-3 p-4 border border-border rounded-lg bg-muted">
              <p className="font-medium">
                {index + 1}. {item.text}
              </p>
              
              {answerType === 'text_input' ? (
                <Input
                  type="text"
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => onAnswerChange(item.id, e.target.value)}
                  disabled={readonly}
                  className="max-w-md"
                />
              ) : (
                <RadioGroup
                  value={currentAnswer}
                  onValueChange={(value) => onAnswerChange(item.id, value)}
                  disabled={readonly}
                >
                  {item.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${item.id}-${option}`} />
                      <Label 
                        htmlFor={`${item.id}-${option}`}
                        className="cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
