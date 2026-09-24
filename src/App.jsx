import { useState } from 'react'
import { addWeeks, subWeeks } from 'date-fns'
import useLocalStorage from './hooks/useLocalStorage'
import Header from './components/Header'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import GoogleTasksModal from './components/GoogleTasksModal'

const App = () => {
  const [habits, setHabits] = useLocalStorage('habit-tracker-habits', [])
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())
  const [isGoogleTasksModalOpen, setIsGoogleTasksModalOpen] = useState(false)

  const addHabit = (name) => {
    const trimmedName = name.trim()

    if (!trimmedName) return

    const newHabit = { id: Date.now(), name: trimmedName, completedDates: [] }
    setHabits((prevHabits) => [...prevHabits, newHabit])
  }

  const handleImportHabits = (newHabits) => {
    setHabits((prevHabits) => {
      const existingNames = new Set(prevHabits.map((h) => h.name.toLowerCase()))
      const uniqueNew = newHabits.filter((h) => !existingNames.has(h.name.toLowerCase()))
      return [...prevHabits, ...uniqueNew]
    })
  }

  const deleteHabit = (id) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id))
  }

  const toggleHabitCompletion = (id, dateStr) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit

        const currentDates = habit.completedDates ?? []
        const exists = currentDates.includes(dateStr)
        const updatedDates = exists
          ? currentDates.filter((d) => d !== dateStr)
          : [...currentDates, dateStr]

        return {
          ...habit,
          completedDates: updatedDates,
        }
      })
    )
  }

  const handlePrevWeek = () => {
    setCurrentWeekDate((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekDate((prev) => addWeeks(prev, 1))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
      <Header
        habits={habits}
        currentWeekDate={currentWeekDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
      <HabitForm
        addHabit={addHabit}
        onOpenGoogleTasks={() => setIsGoogleTasksModalOpen(true)}
      />
      <HabitList
        habits={habits}
        deleteHabit={deleteHabit}
        toggleHabitCompletion={toggleHabitCompletion}
        currentWeekDate={currentWeekDate}
      />
      <GoogleTasksModal
        isOpen={isGoogleTasksModalOpen}
        onClose={() => setIsGoogleTasksModalOpen(false)}
        onImportHabits={handleImportHabits}
      />
    </div>
  )
}

export default App
