"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateChallenge } from "@/app/actions/challenges"
import { toast } from "@/components/ui/use-toast"
import { Database } from "@/types/supabase"

type Challenge = Database['public']['Tables']['challenges']['Row']

type ChallengeItem = {
  id: string
  text: string
  options: string[]
  answer_type: 'multiple_choice' | 'text_input'
}

export default function EditChallengeClient({ challenge }: { challenge: Challenge }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const contentJson = challenge.content_json as any
  const [items, setItems] = useState<ChallengeItem[]>(
    (contentJson.items || []).map((item: any) => ({
      ...item,
      answer_type: item.answer_type || 'multiple_choice'
    }))
  )

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), text: '', options: ['', '', ''], answer_type: 'multiple_choice' as 'multiple_choice' | 'text_input' }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item: ChallengeItem) => item.id !== id))
  }

  const updateItem = (id: string, text: string) => {
    setItems(items.map((item: ChallengeItem) => item.id === id ? { ...item, text } : item))
  }

  const updateAnswerType = (id: string, answerType: 'multiple_choice' | 'text_input') => {
    setItems(items.map((item: ChallengeItem) => item.id === id ? { ...item, answer_type: answerType } : item))
  }

  const updateOption = (itemId: string, optionIndex: number, value: string) => {
    setItems(items.map((item: ChallengeItem) => {
      if (item.id === itemId) {
        const newOptions = [...item.options]
        newOptions[optionIndex] = value
        return { ...item, options: newOptions }
      }
      return item
    }))
  }

  const handleSubmit = async (statusValue: string) => {
    if (!formRef.current) return
    
    setIsSubmitting(true)

    const formData = new FormData(formRef.current)
    
    const content_json = {
      instructions: formData.get('instructions'),
      items: items.map((item: ChallengeItem) => ({
        id: item.id,
        text: item.text,
        options: item.options,
        answer_type: item.answer_type,
      }))
    }

    formData.set('content_json', JSON.stringify(content_json))
    formData.set('status', statusValue)
    formData.set('challenge_id', challenge.id)

    try {
      const result = await updateChallenge(formData)
      
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update challenge",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>Basic information about the challenge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Prepositions Challenge #1"
              defaultValue={challenge.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description* (Markdown supported)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the challenge objectives..."
              rows={4}
              defaultValue={challenge.description}
              required
            />
          </div>

          <input type="hidden" name="type" value={challenge.type} />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coin_reward">Coin Reward*</Label>
              <Input
                id="coin_reward"
                name="coin_reward"
                type="number"
                min="1"
                defaultValue={challenge.coin_reward}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points_reward">Points Reward*</Label>
              <Input
                id="points_reward"
                name="points_reward"
                type="number"
                min="1"
                defaultValue={challenge.points_reward}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publish_date">Publish Date*</Label>
              <Input
                id="publish_date"
                name="publish_date"
                type="date"
                defaultValue={formatDate(challenge.publish_date)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Fill in the Blanks Items</CardTitle>
          <CardDescription>Add sentences with preposition blanks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions*</Label>
            <Input
              id="instructions"
              name="instructions"
              placeholder="e.g., Complete with at/on/in"
              defaultValue={contentJson.instructions || "Complete with at/on/in"}
              required
            />
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <Card key={item.id} className="p-4 border-border bg-muted">
                <div className="space-y-3">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Label>Sentence {index + 1}*</Label>
                      <Input
                        placeholder="e.g., We usually travel (  ) the summer."
                        value={item.text}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="mt-6"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Answer Type*</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`answer_type_${item.id}`}
                          value="multiple_choice"
                          checked={item.answer_type === 'multiple_choice'}
                          onChange={(e) => updateAnswerType(item.id, 'multiple_choice')}
                        />
                        <span>Multiple Choice</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`answer_type_${item.id}`}
                          value="text_input"
                          checked={item.answer_type === 'text_input'}
                          onChange={(e) => updateAnswerType(item.id, 'text_input')}
                        />
                        <span>Text Input (Student writes)</span>
                      </label>
                    </div>
                  </div>
                  
                  {item.answer_type === 'multiple_choice' && (
                    <div>
                      <Label>Options (3 choices)*</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {(item.options || ['', '', '']).map((option: string, optIndex: number) => (
                          <Input
                            key={optIndex}
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(item.id, optIndex, e.target.value)}
                            required={item.answer_type === 'multiple_choice'}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {item.answer_type === 'text_input' && (
                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                      ℹ️ Students will type their own answer for this question
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addItem}>
            + Add Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => handleSubmit('draft')}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmit('published')}
        >
          {isSubmitting ? "Updating..." : "Publish Challenge"}
        </Button>
      </div>
    </form>
  )
}
