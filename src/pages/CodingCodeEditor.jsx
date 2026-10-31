import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'

const languageLoaders = {
  HTML: () => import('@codemirror/lang-html').then(({ html }) => html()),
  CSS: () => import('@codemirror/lang-css').then(({ css }) => css()),
  JavaScript: () => import('@codemirror/lang-javascript').then(({ javascript }) => javascript()),
  TypeScript: () => import('@codemirror/lang-javascript').then(({ javascript }) => javascript({ typescript: true })),
  Python: () => import('@codemirror/lang-python').then(({ python }) => python()),
  Java: () => import('@codemirror/lang-java').then(({ java }) => java()),
  C: () => import('@codemirror/lang-cpp').then(({ cpp }) => cpp()),
  'C++': () => import('@codemirror/lang-cpp').then(({ cpp }) => cpp()),
  SQL: () => import('@codemirror/lang-sql').then(({ sql }) => sql()),
}

export default function CodingCodeEditor({ language, value, onChange, height = 'min(48vh, 460px)', editable = true }) {
  const [loadedLanguage, setLoadedLanguage] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let active = true
    const loadLanguage = languageLoaders[language]
    Promise.resolve().then(() => {
      return loadLanguage ? loadLanguage() : []
    }).then((extension) => {
      if (active) setLoadedLanguage({ language, extension })
    }).catch(() => {
      if (active) setLoadError({ language, message: `Could not load ${language} syntax highlighting.` })
    })
    return () => {
      active = false
    }
  }, [language])

  if (loadError?.language === language) return <div className="ct-editor-loading" role="alert">{loadError.message}</div>
  if (loadedLanguage?.language !== language) return <div className="ct-editor-loading" role="status">Loading {language} syntax support…</div>

  return <CodeMirror
    value={value}
    height={height}
    minHeight="280px"
    theme="dark"
    extensions={[loadedLanguage.extension]}
    onChange={onChange}
    editable={editable}
    basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true }}
    aria-label={`${language} source code`}
  />
}
