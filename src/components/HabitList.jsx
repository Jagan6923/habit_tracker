import Button from './Button'
import { eachDayOfInterval, format, startOfWeek, endOfWeek, isAfter, startOfDay, subDays } from 'date-fns'
import { getGoogleCalendarEventUrl } from '../services/googleCalendar'

const HabitList = ({ habits, deleteHabit, toggleHabitCompletion, currentWeekDate = new Date() }) => {
    if (habits.length === 0) {
        return (
            <div className="flex flex-col gap-2 items-center text-zinc-400 py-8">
                <p className="font-medium">No habits added yet.</p>
                <p className="text-sm">Add some habits to get started!</p>
            </div>
        )
    }

    return (
        <ul className="flex flex-col gap-3">
            {habits.map((habit) => (
                <HabitItem
                    key={habit.id}
                    habit={habit}
                    deleteHabit={deleteHabit}
                    toggleHabitCompletion={toggleHabitCompletion}
                    currentWeekDate={currentWeekDate}
                />
            ))}
        </ul>
    )
}

export default HabitList

function HabitItem({ habit, deleteHabit, toggleHabitCompletion, currentWeekDate }) {
    const visibleDates = eachDayOfInterval({
        start: startOfWeek(currentWeekDate),
        end: endOfWeek(currentWeekDate),
    })

    const streak = getStreak(habit)
    const today = startOfDay(new Date())

    return (
        <li>
            <div className="rounded-xl bg-zinc-800 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-zinc-200">{habit.name}</span>
                        <span className="text-sm font-semibold text-amber-400">
                            {streak} {streak === 1 ? 'day' : 'days'} 🔥
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="text-xs flex items-center gap-1 text-zinc-300 hover:text-white"
                            onClick={() => {
                                const calendarUrl = getGoogleCalendarEventUrl(habit.name)
                                window.open(calendarUrl, '_blank')
                            }}
                            title="Add habit event to Google Calendar"
                        >
                            📅 Add to Calendar
                        </Button>
                        <Button variant="ghost-destructive" onClick={() => deleteHabit(habit.id)}>
                            Delete
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {visibleDates.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd')
                        const isFutureDate = isAfter(startOfDay(date), today)
                        const dayStreak = getDayStreak(habit, date)
                        const isCompleted = dayStreak > 0

                        let dynamicStyle = undefined
                        let extraClass = ''

                        if (isCompleted) {
                            // Continuously completing tasks produces progressively darker shades
                            const lightness = Math.max(22, 64 - (dayStreak - 1) * 7)
                            const saturation = Math.min(95, 65 + (dayStreak - 1) * 5)
                            dynamicStyle = {
                                backgroundColor: `hsl(263, ${saturation}%, ${lightness}%)`,
                                color: lightness > 55 ? '#09090b' : '#ffffff',
                            }
                            if (dayStreak >= 3) {
                                extraClass = 'ring-1 ring-violet-400/40 shadow-sm'
                            }
                        }

                        return (
                            <Button
                                key={dateStr}
                                disabled={isFutureDate}
                                style={dynamicStyle}
                                title={isCompleted ? `Day ${dayStreak} streak` : 'Not completed'}
                                className={`flex min-w-0 flex-col items-center gap-1 text-xs py-2 rounded-lg ${extraClass} outline-none`}
                                variant={isCompleted ? 'primary' : 'secondary'}
                                onClick={() => toggleHabitCompletion(habit.id, dateStr)}
                            >
                                <span className="font-medium">{format(date, 'EEE')}</span>
                                <span className="text-sm font-bold">{format(date, 'd')}</span>
                            </Button>
                        )
                    })}
                </div>
            </div>
        </li>
    )
}

function getDayStreak(habit, date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const completedDates = habit.completedDates ?? (habit.completed ? [format(new Date(), 'yyyy-MM-dd')] : [])

    if (!completedDates.includes(dateStr)) {
        return 0
    }

    const completedSet = new Set(completedDates)
    let streakCount = 1
    let checkDate = subDays(startOfDay(date), 1)

    while (completedSet.has(format(checkDate, 'yyyy-MM-dd'))) {
        streakCount++
        checkDate = subDays(checkDate, 1)
    }

    return streakCount
}

function getStreak(habit) {
    const today = startOfDay(new Date())
    const todayStr = format(today, 'yyyy-MM-dd')
    const completedDates = habit.completedDates ?? (habit.completed ? [todayStr] : [])

    if (!completedDates || completedDates.length === 0) {
        return 0
    }

    const completedSet = new Set(completedDates)
    let streak = 0
    let checkDate = today

    if (completedSet.has(todayStr)) {
        streak++
        checkDate = subDays(checkDate, 1)
        while (completedSet.has(format(checkDate, 'yyyy-MM-dd'))) {
            streak++
            checkDate = subDays(checkDate, 1)
        }
    } else {
        checkDate = subDays(checkDate, 1)
        while (completedSet.has(format(checkDate, 'yyyy-MM-dd'))) {
            streak++
            checkDate = subDays(checkDate, 1)
        }
    }

    return streak
}