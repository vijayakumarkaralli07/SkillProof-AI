const storageKey = (userId) => `skillproof-career-learning-session:${userId || 'preview'}`
const discoveryStorageKey = (userId) => `skillproof-career-discovery:${userId || 'preview'}`

export function normalizeCareerLearningProgress(value, fallbackWeek = 1) {
  const currentWeek = Number(value?.currentWeek) || fallbackWeek
  return {
    completedTaskIds: [...new Set(Array.isArray(value?.completedTaskIds) ? value.completedTaskIds.filter((id) => typeof id === 'string' && id) : [])],
    startedTaskIds: [...new Set(Array.isArray(value?.startedTaskIds) ? value.startedTaskIds.filter((id) => typeof id === 'string' && id) : [])],
    currentWeek: Math.min(12, Math.max(1, currentWeek)),
    learningPlanId: typeof value?.learningPlanId === 'string' ? value.learningPlanId : '',
  }
}

export function loadCareerLearningSession(userId) {
  try {
    const value = window.sessionStorage.getItem(storageKey(userId))
    return { data: value ? normalizeCareerLearningProgress(JSON.parse(value)) : null, error: '' }
  } catch {
    return { data: null, error: 'Learning progress could not be read from this browser session.' }
  }
}

export function saveCareerLearningSession(userId, value) {
  try {
    window.sessionStorage.setItem(storageKey(userId), JSON.stringify(normalizeCareerLearningProgress(value)))
    return ''
  } catch {
    return 'Learning progress could not be saved for this browser session.'
  }
}

export function loadCareerDiscoverySession(userId) {
  try {
    const value = window.sessionStorage.getItem(discoveryStorageKey(userId))
    return { data: value ? JSON.parse(value) : null, error: '' }
  } catch {
    return { data: null, error: 'Career preferences could not be read from this browser session.' }
  }
}

export function saveCareerDiscoverySession(userId, value) {
  try {
    window.sessionStorage.setItem(discoveryStorageKey(userId), JSON.stringify(value))
    return ''
  } catch {
    return 'Career preferences could not be saved for this browser session.'
  }
}
