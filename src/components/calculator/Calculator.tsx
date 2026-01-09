import { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateExpectedTotal } from '@/lib/calculator'

export function Calculator() {
  const [minutes, setMinutes] = useState<string>('')
  const [seconds, setSeconds] = useState<string>('')
  const [currentPoints, setCurrentPoints] = useState<string>('')

  const secondsRef = useRef<HTMLInputElement>(null)

  const minutesElapsed = useMemo(() => {
    const mins = parseInt(minutes, 10)
    const secs = parseInt(seconds || '0', 10)

    if (isNaN(mins)) return null
    if (mins < 0 || secs < 0 || secs > 59) return null

    const total = mins + secs / 60
    if (total > 48) return null

    return total
  }, [minutes, seconds])

  const result = useMemo(() => {
    const points = parseFloat(currentPoints)

    if (minutesElapsed === null || isNaN(points)) {
      return null
    }

    return calculateExpectedTotal(minutesElapsed, points)
  }, [minutesElapsed, currentPoints])

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) <= 48)) {
      setMinutes(value)
    }
  }

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (/^\d{0,2}$/.test(value) && parseInt(value, 10) <= 59)) {
      setSeconds(value)
    }
  }

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      secondsRef.current?.focus()
    }
  }

  const handleSecondsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      secondsRef.current?.blur()
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
            <Label>Time Elapsed</Label>
            <div className="flex items-center gap-2">
              <Input
                id="minutes"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={minutes}
                onChange={handleMinutesChange}
                onKeyDown={handleMinutesKeyDown}
                className="text-center"
              />
              <span className="text-xl font-medium">:</span>
              <Input
                ref={secondsRef}
                id="seconds"
                type="text"
                inputMode="numeric"
                placeholder="00"
                value={seconds}
                onChange={handleSecondsChange}
                onKeyDown={handleSecondsKeyDown}
                className="text-center"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minutes : Seconds (max 48:00)</p>
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
                    {currentPoints} ÷ {minutes}:{seconds || '00'} × 48
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {minutes === '' || currentPoints === '' ? (
                'Enter game time and score to see projection'
              ) : minutesElapsed === null ? (
                'Invalid time entered'
              ) : minutesElapsed <= 0 ? (
                'Time must be greater than 0:00'
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
