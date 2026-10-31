const iconByCategory = {
  'Data Structures & Algorithms': 'brackets',
  'JavaScript Challenges': 'javascript',
  'Web Development': 'web',
  'Backend Development': 'backend',
  'SQL & Database': 'database',
  'DBMS & Database Design': 'database',
  'Web & Backend': 'backend',
  'Programming Languages': 'javascript',
  'Trees & Graphs': 'tree',
  'Arrays and Hashing': 'brackets',
  'Arrays & Hashing Foundations': 'brackets',
}

const accentByCategory = {
  'Data Structures & Algorithms': 'green',
  'JavaScript Challenges': 'blue',
  'Web Development': 'blue',
  'Backend Development': 'purple',
  'SQL & Database': 'purple',
  'DBMS & Database Design': 'purple',
  'Web & Backend': 'purple',
  'Programming Languages': 'green',
  'Trees & Graphs': 'green',
  'Arrays and Hashing': 'amber',
  'Arrays & Hashing Foundations': 'amber',
}

export function normalizeCodingQuestion(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    topic: Array.isArray(row.topic_tags) ? row.topic_tags[0] || '' : '',
    topics: Array.isArray(row.topic_tags) ? row.topic_tags : [],
    difficulty: row.difficulty,
    description: row.problem_statement,
    constraints: Array.isArray(row.constraints) ? row.constraints : [],
    examples: Array.isArray(row.examples) ? row.examples : [],
    starterCodeByLanguage: row.starter_code_by_language && typeof row.starter_code_by_language === 'object'
      ? row.starter_code_by_language
      : {},
    points: Number.isInteger(row.points) ? row.points : 0,
  }
}

export function normalizeCodingCollections(collectionRows, questionRows, availabilityRows = []) {
  const questionsByCollection = new Map()
  const availabilityByCollection = new Map(
    availabilityRows.map((row) => [row.collection_id, row])
  )
  for (const row of questionRows) {
    const questions = questionsByCollection.get(row.collection_id) || []
    questions.push(normalizeCodingQuestion(row))
    questionsByCollection.set(row.collection_id, questions)
  }

  return collectionRows.map((row) => {
    const questions = questionsByCollection.get(row.id) || []
    const availability = availabilityByCollection.get(row.id)
    const topics = [...new Set(questions.flatMap((question) => question.topics))]
    return {
      id: row.slug,
      slug: row.slug,
      collectionId: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      topics,
      difficulty: row.difficulty,
      durationMinutes: row.duration_minutes,
      collection: row.title,
      languages: Array.isArray(row.supported_languages) ? row.supported_languages : [],
      icon: iconByCategory[row.category] || 'brackets',
      accent: accentByCategory[row.category] || 'green',
      questions,
      questionCount: questions.length,
      publishedQuestionCount: availability?.published_count ?? questions.length,
      eligibleQuestionCount: availability?.eligible_count ?? questions.length,
    }
  })
}

export function filterCodingCollections(collections, filters) {
  const query = String(filters.search || '').trim().toLocaleLowerCase()
  return collections.filter((collection) => {
    const searchable = [
      collection.title,
      collection.category,
      collection.description,
      ...collection.topics,
      ...collection.languages,
      ...collection.questions.flatMap((question) => [question.title, question.description, ...question.topics]),
    ].join(' ').toLocaleLowerCase()
    const durationMatch = filters.duration === 'Any duration'
      || filters.duration === '30 minutes or less' && collection.durationMinutes <= 30
      || filters.duration === '31–45 minutes' && collection.durationMinutes >= 31 && collection.durationMinutes <= 45
      || filters.duration === 'Over 45 minutes' && collection.durationMinutes > 45
    return (filters.category === 'All Categories' || collection.category === filters.category)
      && (filters.difficulty === 'All Difficulties' || collection.difficulty === filters.difficulty)
      && durationMatch
      && (filters.collection === 'All collections' || collection.title === filters.collection)
      && searchable.includes(query)
  })
}

export function getStarterCode(question, language) {
  const starterCode = question?.starterCodeByLanguage?.[language]
  return typeof starterCode === 'string' ? starterCode : ''
}

export function getAttemptDifficulty(difficulty) {
  if (difficulty === 'Hard') return 'Hard'
  if (difficulty === 'Medium') return 'Intermediate'
  return 'Beginner'
}

export function getUtcDateKey(value = new Date()) {
  return value.toISOString().slice(0, 10)
}
