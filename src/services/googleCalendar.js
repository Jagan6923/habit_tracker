// Google Calendar API integration service for Habit Tracker

export const GOOGLE_CALENDAR_API_KEY = 'AIzaSyCsnV-rwRc7QDccJg1woY6EKHK-9pGX1EE'

/**
 * Generates a Google Calendar event creation web URL for a habit.
 * This opens Google Calendar directly in a new tab with prefilled event details.
 */
export function getGoogleCalendarEventUrl(habitName, date = new Date()) {
  const startTime = new Date(date)
  startTime.setHours(9, 0, 0, 0) // Default reminder at 9:00 AM
  const endTime = new Date(startTime)
  endTime.setMinutes(30) // 30 min duration

  const formatIsoForGCal = (d) => d.toISOString().replace(/-|:|\.\d+/g, '')

  const title = encodeURIComponent(`Habit Task: ${habitName}`)
  const details = encodeURIComponent(`Reminder to complete your habit: "${habitName}" in Habit Tracker.`)
  const dates = `${formatIsoForGCal(startTime)}/${formatIsoForGCal(endTime)}`

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`
}

/**
 * Fetches public calendar details from Google Calendar API v3 using the configured API Key.
 */
export async function getPublicCalendar(calendarId = 'primary') {
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}?key=${GOOGLE_CALENDAR_API_KEY}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google Calendar API response error: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Google Calendar API Error:', error)
    throw error
  }
}
