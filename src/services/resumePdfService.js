import { sampleResumeTemplates } from '../data/sampleResumeTemplates.js'

const page = { width: 210, height: 297, margin: 18, bottom: 279 }
const dark = [31, 41, 55]
const muted = [91, 103, 120]
const winAnsiExtras = new Set([338, 339, 352, 353, 376, 381, 382, 402, 710, 732, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8224, 8225, 8226, 8230, 8240, 8249, 8250, 8364, 8482])

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function list(value) {
  return Array.isArray(value) ? value : []
}

function validatePdfCharacters(value) {
  const unsupported = new Set()
  function inspect(item) {
    if (typeof item === 'string') {
      for (const character of item) {
        const code = character.codePointAt(0)
        if (!(code === 9 || code === 10 || code === 13 || code >= 32 && code <= 126
          || code >= 160 && code <= 255 || winAnsiExtras.has(code))) {
          unsupported.add(`U+${code.toString(16).toUpperCase().padStart(4, '0')}`)
        }
      }
    } else if (Array.isArray(item)) {
      item.forEach(inspect)
    } else if (isRecord(item)) {
      Object.values(item).forEach(inspect)
    }
  }
  inspect(value)
  if (unsupported.size) {
    throw new Error(`The built-in PDF font cannot render ${[...unsupported].slice(0, 3).join(', ')}. Replace or transliterate those characters and try again.`)
  }
}

function safeFilename(value) {
  const sanitized = text(value)
    .replace(/\.pdf$/i, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100)
  return `${sanitized || 'SkillProof_Resume'}.pdf`
}

function getResumeDetails(resume) {
  if (!isRecord(resume)) throw new Error('This saved resume has invalid content and cannot be exported.')

  const details = {
    fullName: text(resume.fullName),
    title: text(resume.title),
    contact: [resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.website].map(text).filter(Boolean),
    summary: text(resume.summary),
    experiences: list(resume.experiences).filter(isRecord).filter((entry) => (
      [entry.title, entry.company, entry.location, entry.startDate, entry.endDate, entry.dates, entry.description, entry.responsibilities, entry.achievements]
        .some((value) => text(value))
    )),
    skills: list(resume.skills).map((skill) => typeof skill === 'string' ? text(skill) : '').filter(Boolean),
    education: list(resume.education).filter(isRecord).filter((entry) => (
      [entry.degree, entry.field, entry.institution, entry.school, entry.startYear, entry.endYear, entry.dates]
        .some((value) => text(value))
    )),
    projects: list(resume.projects).filter(isRecord).filter((entry) => (
      [entry.name, entry.description, entry.technologies, entry.url]
        .some((value) => text(value) || Array.isArray(value) && value.length)
    )),
    certifications: list(resume.certifications).filter((item) => (
      typeof item === 'string' ? text(item) : isRecord(item) && [item.name, item.issuer, item.date, item.url].some((value) => text(value))
    )),
  }

  if (!details.fullName && !details.title && !details.contact.length && !details.summary
    && !details.experiences.length && !details.skills.length && !details.education.length
    && !details.projects.length && !details.certifications.length) {
    throw new Error('This resume has no saved content to export.')
  }
  return details
}

function templateTheme(templateId) {
  const template = sampleResumeTemplates.find((item) => item.id === templateId)
  if (!template) throw new Error('The saved resume template is unavailable. Reopen and save the resume with a supported template.')
  const hex = template.accent.replace('#', '')
  const accent = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16))
  return { ...template, accent, navy: template.id === 'executive' }
}

export async function createResumePdf(resume, templateId) {
  const details = getResumeDetails(resume)
  const theme = templateTheme(templateId)
  validatePdfCharacters(details)
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const contentWidth = page.width - page.margin * 2
  let y = page.margin

  function drawContinuationHeader() {
    doc.setDrawColor(...theme.accent)
    doc.setLineWidth(1.2)
    doc.line(page.margin, 12, page.width - page.margin, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(details.fullName || details.title || 'Resume', page.margin, 18)
    y = 25
  }

  function addPage() {
    doc.addPage()
    drawContinuationHeader()
  }

  function ensureSpace(height) {
    if (y + height > page.bottom) addPage()
  }

  function writeText(value, { size = 10, style = 'normal', color = dark, indent = 0, gap = 1.4 } = {}) {
    const valueText = text(value)
    if (!valueText) return
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(valueText, contentWidth - indent)
    const lineHeight = size * 0.42
    for (const line of lines) {
      ensureSpace(lineHeight + gap)
      doc.text(line, page.margin + indent, y)
      y += lineHeight + gap
    }
  }

  function sectionHeading(label) {
    if (!label) return
    ensureSpace(12)
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...theme.accent)
    doc.text(label.toUpperCase(), page.margin, y)
    y += 2
    doc.setDrawColor(...theme.accent)
    doc.setLineWidth(0.35)
    doc.line(page.margin, y, page.width - page.margin, y)
    y += 5
  }

  function entry(title, meta, paragraphs = []) {
    const heading = text(title)
    if (heading) writeText(heading, { size: 10, style: 'bold' })
    if (meta) writeText(meta, { size: 8, color: muted, gap: 1.2 })
    paragraphs.map(text).filter(Boolean).forEach((paragraph) => writeText(paragraph, { size: 9, indent: 2 }))
    y += 3
  }

  const banner = ['modern', 'creative', 'executive'].includes(theme.id)
  if (banner) {
    const bannerColor = theme.navy ? [24, 54, 75] : theme.accent
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(23)
    const nameLines = doc.splitTextToSize(details.fullName || details.title || 'Resume', contentWidth)
    const titleLines = details.title && details.fullName
      ? (() => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        return doc.splitTextToSize(details.title, contentWidth)
      })()
      : []
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const contactLines = details.contact.length
      ? doc.splitTextToSize(details.contact.join('  ·  '), contentWidth)
      : []
    const titleStart = 17 + nameLines.length * 9
    const contactStart = titleStart + (titleLines.length ? titleLines.length * 5 + 2 : 0)
    const bannerHeight = Math.max(47, contactLines.length ? contactStart + contactLines.length * 4 + 5 : contactStart + 5)
    doc.setFillColor(...bannerColor)
    doc.rect(0, 0, page.width, bannerHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(23)
    doc.text(nameLines, page.margin, 17)
    if (titleLines.length) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.text(titleLines, page.margin, titleStart + 1)
    }
    if (contactLines.length) {
      doc.setFontSize(8)
      doc.text(contactLines, page.margin, contactStart + 2)
    }
    y = bannerHeight + 10
  } else {
    doc.setDrawColor(...theme.accent)
    doc.setLineWidth(theme.id === 'minimal' ? 0.5 : 1.4)
    doc.line(page.margin, page.margin - 5, page.width - page.margin, page.margin - 5)
    doc.setFont('helvetica', theme.id === 'academic' ? 'bold' : 'bold')
    doc.setFontSize(theme.id === 'minimal' ? 22 : 24)
    doc.setTextColor(...dark)
    const nameLines = doc.splitTextToSize(details.fullName || details.title || 'Resume', contentWidth)
    doc.text(nameLines, page.margin, y)
    y += nameLines.length * 9 + 1
    if (details.title && details.fullName) {
      writeText(details.title, { size: 12, color: theme.accent, gap: 2 })
    }
    if (details.contact.length) writeText(details.contact.join('  ·  '), { size: 8, color: muted, gap: 2 })
    y += 3
  }

  const sectionWriters = {
    summary() {
      if (!details.summary) return
      sectionHeading('Professional Summary')
      writeText(details.summary, { size: 9.5 })
      y += 2
    },
    experience() {
      if (!details.experiences.length) return
      sectionHeading('Work Experience')
      details.experiences.forEach((item) => {
        const period = [text(item.location), item.dates ? text(item.dates) : [text(item.startDate), item.current ? 'Present' : text(item.endDate)].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')
        entry([text(item.title), text(item.company)].filter(Boolean).join(' · '), period, [item.description || item.responsibilities, item.achievements])
      })
    },
    skills() {
      if (!details.skills.length) return
      sectionHeading('Skills')
      writeText(details.skills.join('  ·  '), { size: 9 })
      y += 2
    },
    education() {
      if (!details.education.length) return
      sectionHeading('Education')
      details.education.forEach((item) => {
        const qualification = [text(item.degree), text(item.field)].filter(Boolean).join(' · ')
        const school = text(item.institution || item.school)
        const years = text(item.dates) || [text(item.startYear), text(item.endYear)].filter(Boolean).join(' – ')
        entry(qualification || school, [school !== qualification ? school : '', years].filter(Boolean).join(' · '))
      })
    },
    projects() {
      if (!details.projects.length) return
      sectionHeading('Projects')
      details.projects.forEach((item) => {
        const technologies = Array.isArray(item.technologies) ? item.technologies.join(', ') : text(item.technologies)
        entry(text(item.name), [technologies, text(item.url)].filter(Boolean).join(' · '), [item.description])
      })
    },
    certifications() {
      if (!details.certifications.length) return
      sectionHeading('Certifications')
      details.certifications.forEach((item) => {
        if (typeof item === 'string') {
          writeText(item, { size: 9 })
          y += 2
          return
        }
        entry(text(item.name), [text(item.issuer), text(item.date), text(item.url)].filter(Boolean).join(' · '))
      })
    },
  }
  const sectionOrder = theme.id === 'academic'
    ? ['education', 'summary', 'experience', 'projects', 'skills', 'certifications']
    : ['skills', 'education', 'summary', 'experience', 'projects', 'certifications']
  sectionOrder.forEach((section) => sectionWriters[section]())

  const pageCount = doc.getNumberOfPages()
  for (let index = 1; index <= pageCount; index += 1) {
    doc.setPage(index)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(`${index} / ${pageCount}`, page.width - page.margin, page.height - 9, { align: 'right' })
  }
  return doc.output('blob')
}

export async function downloadResumePdf(resume, templateId, filename) {
  const blob = await createResumePdf(resume, templateId)
  if (!(blob instanceof Blob) || !blob.size || blob.type !== 'application/pdf') {
    throw new Error('PDF generation did not produce a valid document. Please try again.')
  }
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = safeFilename(filename || resume.fullName || resume.title)
  anchor.style.display = 'none'
  try {
    document.body.append(anchor)
    anchor.click()
    return anchor.download
  } catch (error) {
    throw new Error(`Could not start the PDF download: ${error.message}`)
  } finally {
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
