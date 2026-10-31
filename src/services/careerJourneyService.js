const demoJourneysByUser = new Map()

export async function loadCareerJourney(userId) {
  if (!userId) {
    return { status: 'unavailable', message: 'Sign in to load career-journey data.' }
  }
  if (demoJourneysByUser.has(userId)) {
    return {
      status: 'demo',
      message: 'Demo session only — career data storage is not connected, so changes are not saved to your account.',
      data: demoJourneysByUser.get(userId),
    }
  }
  return {
    status: 'demo',
    message: 'Career-journey storage is not configured. Changes in this demo session are not saved to your account.',
    data: null,
  }
}

export async function saveCareerJourney(userId, journey) {
  if (!userId || !journey) {
    return { status: 'unavailable', message: 'Career-journey data cannot be saved without an authenticated user and valid journey data.' }
  }
  demoJourneysByUser.set(userId, journey)
  return {
    status: 'demo',
    message: 'Career-journey storage is not configured. This change remains only in the current page session.',
  }
}
