import { sampleMockInterviewQuestions } from '../data/sampleMockInterviewQuestions.js'

export function getMockInterviewQuestions(settings) {
  const selectedTopics = settings.focusTopics?.length ? settings.focusTopics : ['React', 'JavaScript', 'Problem Solving']
  const questionsByTopic = selectedTopics.map((topic) =>
    sampleMockInterviewQuestions
      .filter((question) => question.topic === topic)
      .sort((left, right) => {
        const typeScore = (question) => {
          if (settings.interviewType === 'Mixed') return question.interviewType === 'Mixed' ? 2 : 1
          return question.interviewType === settings.interviewType ? 2 : 0
        }
        const difficultyScore = (question) => question.difficulty === settings.difficulty ? 1 : 0
        return typeScore(right) + difficultyScore(right) - typeScore(left) - difficultyScore(left)
      })
      .map((question) => ({
        ...question,
        prompt: `For a ${settings.role || 'professional'} role: ${question.prompt}`,
      })),
  )
  const selected = []
  while (selected.length < 10 && questionsByTopic.some((questions) => questions.length)) {
    for (const questions of questionsByTopic) {
      if (questions.length && selected.length < 10) selected.push(questions.shift())
    }
  }
  let seed = Number(settings.sessionId) || Date.now()
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  for (let index = selected.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const question = selected[index]
    selected[index] = selected[swapIndex]
    selected[swapIndex] = question
  }
  return selected
}
