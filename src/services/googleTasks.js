/**
 * Fetches user's Google Tasks using an OAuth 2.0 access token.
 * Uses Vite proxy to bypass browser CORS preflight restrictions.
 */
export async function fetchGoogleTasks(accessToken) {
  if (!accessToken) {
    throw new Error('OAuth access token is required to fetch Google Tasks.')
  }

  const cleanToken = accessToken.trim()
  const proxyUrl = `/google-tasks-api/tasks/v1/lists/@default/tasks`
  const directUrl = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks`

  let response
  try {
    response = await fetch(proxyUrl, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/json',
      },
    })
  } catch (proxyErr) {
    console.warn('Proxy fetch failed, attempting direct fetch:', proxyErr)
    response = await fetch(directUrl, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/json',
      },
    })
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `Failed to fetch Google Tasks (${response.status})`)
  }

  const data = await response.json()
  return data.items || []
}

/**
 * Formats a Google Task object into a Habit Tracker habit object.
 */
export function formatGoogleTaskToHabit(task) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: task.title || 'Untitled Task',
    completedDates: task.status === 'completed' && task.completed
      ? [task.completed.substring(0, 10)]
      : [],
    googleTaskId: task.id,
  }
}
