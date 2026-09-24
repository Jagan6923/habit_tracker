import { useState } from 'react'
import Button from './Button'

export default function HabitForm({ addHabit, onOpenGoogleTasks }) {
    const [habitName, setHabitName] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        const trimmedName = habitName.trim()

        if (!trimmedName) {
            setHabitName('')
            return
        }

        addHabit(trimmedName)
        setHabitName('')
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSubmit} className="flex-1 flex gap-3">
                <input
                    type="text"
                    placeholder="New Habit..."
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                />
                <Button type="submit" variant="primary">
                    Add Habit
                </Button>
            </form>
            {onOpenGoogleTasks && (
                <Button
                    variant="secondary"
                    onClick={onOpenGoogleTasks}
                    className="flex items-center justify-center gap-1.5 whitespace-nowrap text-zinc-300 hover:text-white"
                >
                    <span>📋</span> Import Tasks
                </Button>
            )}
        </div>
    )
}
