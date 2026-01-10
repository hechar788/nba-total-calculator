import { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateExpectedTotal } from '@/lib/calculator'

const QUARTER_MINUTES = 12

export function Calculator() {
  const [quarter, setQuarter] = useState<number>(1)
  const [minutes, setMinutes] = useState<string>('')
  const [seconds, setSeconds] = useState<string>('')
  const [team1Score, setTeam1Score] = useState<string>('')
  const [team2Score, setTeam2Score] = useState<string>('')

  const minutesRef = useRef<HTMLInputElement>(null)
  const secondsRef = useRef<HTMLInputElement>(null)
  const team1Ref = useRef<HTMLInputElement>(null)
  const team2Ref = useRef<HTMLInputElement>(null)

  const minutesElapsed = useMemo(() => {
    const mins = parseInt(minutes, 10)
    const secs = parseInt(seconds || '0', 10)

    if (isNaN(mins)) return null
    if (mins < 0 || mins > 12 || secs < 0 || secs > 59) return null

    const timeRemaining = mins + secs / 60
    if (timeRemaining > 12) return null

    // Calculate elapsed time: completed quarters + time played in current quarter
    const completedQuarterMinutes = (quarter - 1) * QUARTER_MINUTES
    const currentQuarterElapsed = QUARTER_MINUTES - timeRemaining
    const total = completedQuarterMinutes + currentQuarterElapsed

    if (total <= 0 || total > 48) return null

    return total
  }, [quarter, minutes, seconds])

  const currentPoints = useMemo(() => {
    const t1 = parseInt(team1Score, 10)
    const t2 = parseInt(team2Score, 10)
    if (isNaN(t1) || isNaN(t2)) return null
    return t1 + t2
  }, [team1Score, team2Score])

  const result = useMemo(() => {
    if (minutesElapsed === null || currentPoints === null) {
      return null
    }

    return calculateExpectedTotal(minutesElapsed, currentPoints)
  }, [minutesElapsed, currentPoints])

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) <= 12)) {
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
      team1Ref.current?.focus()
    } else if (e.key === 'Backspace' && seconds === '') {
      e.preventDefault()
      minutesRef.current?.focus()
    }
  }

  const handleScoreChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d+$/.test(value)) {
      setter(value)
    }
  }

  const handleTeam1KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      team2Ref.current?.focus()
    } else if (e.key === 'Backspace' && team1Score === '') {
      e.preventDefault()
      secondsRef.current?.focus()
    }
  }

  const handleTeam2KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      team2Ref.current?.blur()
    } else if (e.key === 'Backspace' && team2Score === '') {
      e.preventDefault()
      team1Ref.current?.focus()
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
            <Label>Current Quarter</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuarter(q)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                    quarter === q
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-input'
                  }`}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time Remaining</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={minutesRef}
                id="minutes"
                type="text"
                inputMode="numeric"
                placeholder="12"
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
            <p className="text-xs text-muted-foreground">Minutes : Seconds remaining in quarter</p>
          </div>
          <div className="space-y-2">
            <Label>Current Score</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={team1Ref}
                id="team1"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={team1Score}
                onChange={handleScoreChange(setTeam1Score)}
                onKeyDown={handleTeam1KeyDown}
                className="text-center"
              />
              <span className="text-xl font-medium">-</span>
              <Input
                ref={team2Ref}
                id="team2"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={team2Score}
                onChange={handleScoreChange(setTeam2Score)}
                onKeyDown={handleTeam2KeyDown}
                className="text-center"
              />
            </div>
            <p className="text-xs text-muted-foreground">Team 1 - Team 2</p>
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
                  <span className="text-muted-foreground">Time Elapsed</span>
                  <span className="font-medium">{minutesElapsed?.toFixed(1)} min</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {minutes === '' || team1Score === '' || team2Score === '' ? (
                'Enter time remaining and scores to see projection'
              ) : minutesElapsed === null ? (
                'Invalid time entered'
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
