export async function fetchGoogleTasks(accessToken) {
  if (!accessToken) {
    throw new Error('OAuth access token is required to fetch Google Tasks.')
  }

  const cleanToken = accessToken.trim()
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  const directUrl = 'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks'
  const proxyUrl = '/google-tasks-api/tasks/v1/lists/@default/tasks'

  const primaryUrl = isLocalhost ? proxyUrl : directUrl

  let response = await fetch(primaryUrl, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/json',
    },
  })

  // If local proxy fails or returns 404, fallback to direct Google API URL
  if (!response.ok && primaryUrl !== directUrl) {
    console.warn('Proxy request failed, falling back to direct Google API URL...')
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
