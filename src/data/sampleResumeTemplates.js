const samplePreview = {
  name: 'Alex Johnson',
  title: 'Full Stack Developer',
  email: 'alex@example.com',
  phone: '+1 555 010 0123',
  location: 'Bengaluru, India',
  linkedin: 'linkedin.com/in/alex',
  github: 'github.com/alex',
  website: 'alex.dev',
  summary: 'Full Stack Developer with 3 years of experience building scalable web applications using React, Node.js, and modern technologies. Passionate about creating user-centric solutions and solving real-world problems.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'REST APIs'],
  experience: [{
    title: 'Software Development Intern',
    company: 'XYZ Tech (Sample)',
    location: 'Bengaluru, India',
    dates: 'Jun 2024 – Aug 2024',
    description: 'Worked on frontend features using React; collaborated with the team to improve performance and code quality.',
  }],
  education: [{
    degree: 'B.E. Computer Science',
    institution: 'XYZ University',
    dates: '2022 – 2026',
  }],
  project: {
    name: 'College Event Management System',
    description: 'Built a full-stack web application using React and Node.js.',
  },
}

export const sampleResumeTemplates = [
  { id: 'modern', name: 'Modern', description: 'Green accents, clean sections, and a contemporary layout.', accent: '#00994f', layout: 'modern', preview: samplePreview },
  { id: 'professional', name: 'Professional', description: 'Formal layout suitable for general corporate roles.', accent: '#2563eb', layout: 'professional', preview: samplePreview },
  { id: 'minimal', name: 'Minimal', description: 'Simple typography, clean whitespace, and restrained styling.', accent: '#64748b', layout: 'minimal', preview: samplePreview },
  { id: 'creative', name: 'Creative', description: 'Distinctive accent colors and a more expressive layout.', accent: '#8b5cf6', layout: 'creative', preview: samplePreview },
  { id: 'executive', name: 'Executive', description: 'Structured layout with clear hierarchy for experienced professionals.', accent: '#164e63', layout: 'executive', preview: samplePreview },
  { id: 'academic', name: 'Academic', description: 'Education, research, projects, and achievements emphasized.', accent: '#b45373', layout: 'academic', preview: samplePreview },
]
