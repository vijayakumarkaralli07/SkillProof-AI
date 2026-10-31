import assert from 'node:assert/strict'
import test from 'node:test'
import {
  filterCodingCollections,
  getUtcDateKey,
  getStarterCode,
  normalizeCodingCollections,
} from './codingTestData.js'

const rows = [
  {
    id: 'collection-1',
    slug: 'arrays-hashing',
    title: 'Arrays & Hashing',
    description: 'Practice arrays',
    category: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    duration_minutes: 30,
    supported_languages: ['JavaScript', 'Python'],
  },
  {
    id: 'collection-2',
    slug: 'sql-foundations',
    title: 'SQL Foundations',
    description: 'Practice database queries',
    category: 'SQL & Database',
    difficulty: 'Medium',
    duration_minutes: 45,
    supported_languages: ['SQL'],
  },
]

const questionRows = [
  {
    id: 'question-1',
    collection_id: 'collection-1',
    slug: 'two-sum',
    title: 'Find a Pair',
    problem_statement: 'Use a hash map to find two values.',
    difficulty: 'Easy',
    topic_tags: ['Arrays', 'Hashing'],
    constraints: ['Exactly one answer'],
    examples: [{ input: '[1, 2]', output: '[0, 1]' }],
    starter_code_by_language: { JavaScript: 'function solve() {}' },
    points: 100,
    question_order: 1,
  },
  {
    id: 'question-2',
    collection_id: 'collection-2',
    slug: 'group-orders',
    title: 'Group Orders',
    problem_statement: 'Aggregate order totals by date.',
    difficulty: 'Medium',
    topic_tags: ['SQL', 'Aggregation'],
    constraints: [],
    examples: [],
    starter_code_by_language: { SQL: 'SELECT 1;' },
    points: 100,
    question_order: 1,
  },
]

test('collection question counts come from published question rows', () => {
  const collections = normalizeCodingCollections(rows, questionRows)

  assert.equal(collections.length, 2)
  assert.equal(collections[0].questionCount, 1)
  assert.equal(collections[1].questionCount, 1)
  assert.equal(collections[0].questions[0].title, 'Find a Pair')
})

test('published collections with no published questions report an actual zero count', () => {
  const collections = normalizeCodingCollections([...rows, {
    ...rows[0],
    id: 'empty-collection',
    slug: 'empty-collection',
    title: 'Empty Collection',
  }], questionRows)

  assert.equal(collections.find((collection) => collection.id === 'empty-collection').questionCount, 0)
})

test('per-user eligible question counts are kept separate from published totals', () => {
  const collections = normalizeCodingCollections(rows, questionRows, [
    { collection_id: 'collection-1', published_count: 12, eligible_count: 4 },
  ])

  assert.equal(collections[0].questionCount, 1)
  assert.equal(collections[0].publishedQuestionCount, 12)
  assert.equal(collections[0].eligibleQuestionCount, 4)
  assert.equal(collections[1].eligibleQuestionCount, 1)
})

test('category, difficulty, duration, collection, and question metadata search filter real collections', () => {
  const collections = normalizeCodingCollections(rows, questionRows)
  const filtered = filterCodingCollections(collections, {
    category: 'SQL & Database',
    difficulty: 'Medium',
    duration: '31–45 minutes',
    collection: 'SQL Foundations',
    search: 'aggregation',
  })

  assert.deepEqual(filtered.map((collection) => collection.slug), ['sql-foundations'])
  assert.deepEqual(filterCodingCollections(collections, {
    category: 'All Categories',
    difficulty: 'All Difficulties',
    duration: 'Any duration',
    collection: 'All collections',
    search: 'not present',
  }), [])
})

test('starter code is read from the question for the selected supported language', () => {
  const collections = normalizeCodingCollections(rows, questionRows)

  assert.equal(getStarterCode(collections[0].questions[0], 'JavaScript'), 'function solve() {}')
  assert.equal(getStarterCode(collections[0].questions[0], 'Python'), '')
})

test('daily session date uses a stable UTC date boundary', () => {
  assert.equal(getUtcDateKey(new Date('2026-10-29T00:15:00+05:30')), '2026-10-28')
})
