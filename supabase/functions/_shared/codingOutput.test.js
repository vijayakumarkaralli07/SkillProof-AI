import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeCodingOutput } from './codingOutput.js'

test('decodes one JSON string layer and trims line endings', () => {
  assert.equal(normalizeCodingOutput('"a3b2c1"'), 'a3b2c1')
  assert.equal(normalizeCodingOutput('"x1y1z1"\r\n'), 'x1y1z1')
  assert.equal(normalizeCodingOutput(' a3b2c1 \r\n'), 'a3b2c1')
})

test('keeps incorrect plain-text outputs incorrect', () => {
  assert.notEqual(normalizeCodingOutput('"a3b2c2"'), normalizeCodingOutput('a3b2c1'))
})

test('keeps numeric and array representations comparable', () => {
  assert.equal(normalizeCodingOutput('42\r\n'), normalizeCodingOutput('42'))
  assert.equal(normalizeCodingOutput('[1, 2, 3]'), normalizeCodingOutput('[1,2,3]'))
})

test('canonicalizes object key order without recursively decoding strings', () => {
  assert.equal(normalizeCodingOutput('{"b":2,"a":1}'), normalizeCodingOutput('{"a":1,"b":2}'))
  assert.equal(normalizeCodingOutput('{"value":"\\"quoted\\""}'), '{"value":"\\"quoted\\""}')
})
