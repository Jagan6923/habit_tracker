import Button from './Button'
import { format, startOfWeek, endOfWeek, isSameWeek } from 'date-fns'

export default function Header({ habits = [], currentWeekDate = new Date(), onPrevWeek, onNextWeek }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const completedTodayCount = habits.filter((h) => {
    const dates = h.completedDates ?? (h.completed ? [todayStr] : [])
    return dates.includes(todayStr)
  }).length

  const weekStart = startOfWeek(currentWeekDate)
  const weekEnd = endOfWeek(currentWeekDate)
  const isCurrentWeek = isSameWeek(currentWeekDate, new Date())

  return (
    <header className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Habit Tracker</h1>
          <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1" title="Google Calendar API Key configured">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Calendar Sync
          </span>
        </div>
        <span className="text-zinc-400 text-sm">
          {completedTodayCount}/{habits.length} done today
        </span>
      </div>

      <div className="flex flex-col gap-1 items-end">
        <span className="text-zinc-400 text-sm font-medium">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onPrevWeek}>Prev</Button>
          <Button variant="secondary" onClick={onNextWeek} disabled={isCurrentWeek}>Next</Button>
        </div>
      </div>
    </header>
  )
}