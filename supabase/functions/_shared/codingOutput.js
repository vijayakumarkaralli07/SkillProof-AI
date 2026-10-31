function normalizeText(value) {
  return value.replace(/\r\n?/g, '\n').trim()
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableJson(value[key])]),
    )
  }
  return value
}

export function normalizeCodingOutput(value) {
  const normalized = normalizeText(value)
  if (!normalized) return ''

  try {
    const parsed = JSON.parse(normalized)
    if (typeof parsed === 'string') return normalizeText(parsed)
    return JSON.stringify(stableJson(parsed))
  } catch {
    const jsonObject = normalized.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')
    try {
      return JSON.stringify(stableJson(JSON.parse(jsonObject)))
    } catch {
      return normalized
    }
  }
}
