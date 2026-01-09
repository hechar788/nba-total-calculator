import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateExpectedTotal } from '@/lib/calculator'

export function Calculator() {
  const [minutesElapsed, setMinutesElapsed] = useState<string>('')
  const [currentPoints, setCurrentPoints] = useState<string>('')

  const result = useMemo(() => {
    const minutes = parseFloat(minutesElapsed)
    const points = parseFloat(currentPoints)

    if (isNaN(minutes) || isNaN(points)) {
      return null
    }

    return calculateExpectedTotal(minutes, points)
  }, [minutesElapsed, currentPoints])

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 48)) {
      setMinutesElapsed(value)
    }
  }

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || parseFloat(value) >= 0) {
      setCurrentPoints(value)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Input</CardTitle>
          <CardDescription>
            Enter the current game time and combined score (both teams)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minutes">Minutes Played</Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="48"
              step="0.1"
              placeholder="e.g., 24"
              value={minutesElapsed}
              onChange={handleMinutesChange}
            />
            <p className="text-xs text-muted-foreground">0-48 minutes (full game = 48)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Current Combined Score</Label>
            <Input
              id="points"
              type="number"
              min="0"
              step="1"
              placeholder="e.g., 110"
              value={currentPoints}
              onChange={handlePointsChange}
            />
            <p className="text-xs text-muted-foreground">Total points scored by both teams</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projected Final Total</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <div className="text-6xl font-bold text-primary">
                  {result.expectedTotal}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Projected combined final score
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Current Pace</span>
                  <span className="font-medium">{result.pace} pts/min</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Time Remaining</span>
                  <span className="font-medium">{result.remainingMinutes.toFixed(1)} min</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Calculation</span>
                  <span className="font-mono text-xs">
                    {currentPoints} ÷ {minutesElapsed} × 48
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {minutesElapsed === '' || currentPoints === '' ? (
                'Enter game time and score to see projection'
              ) : parseFloat(minutesElapsed) <= 0 ? (
                'Minutes must be greater than 0'
              ) : parseFloat(minutesElapsed) > 48 ? (
                'Minutes cannot exceed 48'
              ) : (
                'Enter valid numbers to calculate'
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
