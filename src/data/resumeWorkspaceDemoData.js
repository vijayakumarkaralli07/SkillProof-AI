export const resumeBuilderDemoRows = [
  { id: 'demo-resume-1', name: 'Software Developer Resume', updated: 'Sample date · Jan 20, 2025', version: 'v1.2' },
  { id: 'demo-resume-2', name: 'Data Analyst Resume', updated: 'Sample date · Jan 15, 2025', version: 'v1.0' },
]

export const resumeBuilderDemoResumes = {
  'demo-resume-1': {
    name: 'Software Developer Resume (Sample)',
    updated: 'Sample date · Jan 20, 2025',
    version: 'v1.2',
    resume: {
      fullName: 'Sample Candidate',
      title: 'Software Developer',
      email: 'sample.candidate@example.com',
      phone: '',
      location: 'Sample City',
      summary: 'Illustrative early-career software developer profile. Replace this example with your own accurate experience.',
      experiences: [{
        id: 'sample-exp-software',
        title: 'Software Development Intern (Sample)',
        company: 'Example Studio',
        location: 'Sample City',
        startDate: '2024-06',
        endDate: '2024-08',
        current: false,
        description: 'Contributed to a sample web application and reusable interface components.',
        achievements: 'Example achievement only; replace with a result you can verify.',
      }],
      skills: ['JavaScript', 'React', 'CSS', 'Git'],
      projects: [{
        id: 'sample-project-software',
        name: 'Sample Dashboard',
        description: 'An illustrative dashboard project for demonstrating the resume preview.',
        technologies: 'React, CSS',
        url: '',
      }],
      education: [{
        id: 'sample-education-software',
        institution: 'Example University',
        degree: 'B.S.',
        field: 'Computer Science',
        startYear: '2022',
        endYear: '2026',
        grade: '',
        details: 'Sample education record.',
      }],
    },
  },
  'demo-resume-2': {
    name: 'Data Analyst Resume (Sample)',
    updated: 'Sample date · Jan 15, 2025',
    version: 'v1.0',
    resume: {
      fullName: 'Example Analyst',
      title: 'Data Analyst',
      email: 'example.analyst@example.com',
      phone: '',
      location: 'Sample City',
      summary: 'Illustrative data analyst profile. Replace this example with your own accurate experience.',
      experiences: [{
        id: 'sample-exp-analyst',
        title: 'Data Analyst Intern (Sample)',
        company: 'Example Research Group',
        location: 'Sample City',
        startDate: '2024-01',
        endDate: '2024-05',
        current: false,
        description: 'Prepared sample data summaries and supported recurring reporting tasks.',
        achievements: 'Example achievement only; replace with a result you can verify.',
      }],
      skills: ['SQL', 'Python', 'Excel'],
      projects: [{
        id: 'sample-project-analyst',
        name: 'Sample Data Report',
        description: 'An illustrative report summarizing patterns in a sample dataset.',
        technologies: 'SQL, Python',
        url: '',
      }],
      education: [{
        id: 'sample-education-analyst',
        institution: 'Example Institute',
        degree: 'B.S.',
        field: 'Information Systems',
        startYear: '2021',
        endYear: '2025',
        grade: '',
        details: 'Sample education record.',
      }],
    },
  },
}

export const resumeScannerDemo = {
  score: 78,
  metrics: [
    { label: 'Keyword Match', value: 80, color: 'green' },
    { label: 'Formatting', value: 72, color: 'blue' },
    { label: 'Experience Impact', value: 76, color: 'purple' },
    { label: 'Skills Relevance', value: 68, color: 'yellow' },
  ],
  keywords: ['React', 'TypeScript', 'Next.js', 'REST APIs', 'System Design', 'Agile', 'CI/CD', 'Docker'],
  improvements: [
    { title: 'Add measurable achievements', detail: 'Where you have evidence, describe outcomes using a real baseline and result. Do not add unsupported numbers.' },
    { title: 'Include relevant keywords', detail: 'Compare the wording in your resume with the requirements of the roles you are applying for.' },
    { title: 'Use clear section headings', detail: 'Standard headings can make resume content easier for people and parsing tools to navigate.' },
    { title: 'Add a professional summary', detail: 'A concise summary can help readers quickly understand your relevant experience.' },
    { title: 'Include relevant certifications', detail: 'Add certifications only when you have earned them and they are relevant to the role.' },
  ],
  sections: [
    { label: 'Contact Information', value: 90, color: 'green' },
    { label: 'Professional Summary', value: 70, color: 'blue' },
    { label: 'Work Experience', value: 75, color: 'green' },
    { label: 'Skills', value: 65, color: 'yellow' },
    { label: 'Education', value: 88, color: 'purple' },
    { label: 'Projects', value: 60, color: 'green' },
    { label: 'Certifications', value: 50, color: 'blue' },
  ],
}

export const resumeScannerDemoHistory = [
  { id: 'sample-scan-1', fileName: 'Software_Developer_Resume.pdf', scannedOn: 'Sample · Jan 20, 2025 · 10:30 AM', score: 78, status: 'Good' },
  { id: 'sample-scan-2', fileName: 'Data_Analyst_Resume.docx', scannedOn: 'Sample · Jan 15, 2025 · 02:15 PM', score: 62, status: 'Needs Improvement' },
  { id: 'sample-scan-3', fileName: 'Frontend_Developer_Resume.pdf', scannedOn: 'Sample · Jan 10, 2025 · 11:20 AM', score: 85, status: 'Excellent' },
  { id: 'sample-scan-4', fileName: 'Product_Manager_Resume.docx', scannedOn: 'Sample · Jan 5, 2025 · 09:45 AM', score: 54, status: 'Needs Work' },
]

const softwareResumeSuggestions = [
  { id: 'software-impact-1', category: 'Impact & Achievements', section: 'Work Experience', original: 'Worked on frontend features and helped improve website performance.', improved: 'Built reusable React components and optimized page rendering to improve website performance.', explanation: 'Uses clearer action verbs and specific examples from this sample. Add measured outcomes only if you can verify them.' },
  { id: 'software-impact-2', category: 'Impact & Achievements', section: 'Work Experience', original: 'Collaborated with team to fix bugs and improve user experience.', improved: 'Collaborated with a cross-functional team to resolve bugs and improve user experience.', explanation: 'Clarifies collaboration and action without introducing unverified outcomes or metrics.' },
  { id: 'software-impact-3', category: 'Impact & Achievements', section: 'Projects', original: 'Developed a web application for college event management.', improved: 'Built a web application for college event management, including event registration and schedules.', explanation: 'Adds example feature detail. Keep only features that reflect the actual project.' },
  { id: 'software-impact-4', category: 'Impact & Achievements', section: 'Skills', original: 'Good knowledge of JavaScript and React.', improved: 'JavaScript and React experience building interactive web applications.', explanation: 'Reframes the skills statement around practical experience; verify that it is accurate.' },
  { id: 'software-clarity-1', category: 'Clarity', section: 'Work Experience', original: 'Worked on frontend features and helped improve website performance.', improved: 'Built frontend features and contributed to website performance improvements.', explanation: 'Removes vague phrasing while keeping the claim at the same level of certainty.' },
  { id: 'software-clarity-2', category: 'Clarity', section: 'Projects', original: 'Developed a web application for college event management.', improved: 'Developed a college event management web application.', explanation: 'Moves the core subject earlier to make the sentence easier to scan.' },
  { id: 'software-grammar-1', category: 'Grammar', section: 'Professional Summary', original: 'Experienced in building web applications and collaborate with product teams.', improved: 'Experienced in building web applications and collaborating with product teams.', explanation: 'Aligns verb forms for grammatical consistency.' },
  { id: 'software-grammar-2', category: 'Grammar', section: 'Skills', original: 'Good knowledge of JavaScript and React.', improved: 'Knowledge of JavaScript and React.', explanation: 'Removes an unnecessary modifier for a cleaner, more direct phrase.' },
  { id: 'software-action-1', category: 'Action Verbs', section: 'Work Experience', original: 'Responsible for maintaining reusable UI components.', improved: 'Maintained reusable UI components.', explanation: 'Replaces a passive phrase with a concise action verb without changing the stated responsibility.' },
  { id: 'software-action-2', category: 'Action Verbs', section: 'Projects', original: 'Worked on a dashboard interface using reusable components.', improved: 'Created a dashboard interface using reusable components.', explanation: 'Uses a more precise verb. Confirm it accurately describes the contribution.' },
]

const analystResumeSuggestions = [
  { id: 'analyst-impact-1', category: 'Impact & Achievements', section: 'Work Experience', original: 'Prepared data summaries and supported recurring reporting tasks.', improved: 'Prepared data summaries and supported recurring reporting for project stakeholders.', explanation: 'Adds audience context from this sample. Include only details that describe your real work.' },
  { id: 'analyst-impact-2', category: 'Impact & Achievements', section: 'Projects', original: 'Created a report to summarize data patterns.', improved: 'Created a data report highlighting patterns for review.', explanation: 'Clarifies the output without inventing a measured business result.' },
  { id: 'analyst-clarity-1', category: 'Clarity', section: 'Work Experience', original: 'Helped with data and reports for the team.', improved: 'Supported the team by preparing data summaries and reports.', explanation: 'Replaces vague phrasing with clearer responsibilities from the sample.' },
  { id: 'analyst-grammar-1', category: 'Grammar', section: 'Professional Summary', original: 'Experienced in preparing reports and communicate findings.', improved: 'Experienced in preparing reports and communicating findings.', explanation: 'Aligns the verb forms for grammatical consistency.' },
  { id: 'analyst-action-1', category: 'Action Verbs', section: 'Projects', original: 'Responsible for organizing sample datasets.', improved: 'Organized sample datasets for analysis.', explanation: 'Replaces a passive phrase with a concise action verb; verify the wording matches your contribution.' },
]

export const resumeImproverDemoResumes = {
  'sample-software': {
    name: 'Software Developer Resume (Sample)',
    updated: 'Sample · Jan 20, 2025',
    version: 'v1.2 · Sample',
    suggestions: softwareResumeSuggestions,
  },
  'sample-analyst': {
    name: 'Data Analyst Resume (Sample)',
    updated: 'Sample · Jan 15, 2025',
    version: 'v1.0 · Sample',
    suggestions: analystResumeSuggestions,
  },
}

export const resumeImproverDemoHistory = [
  { id: 'sample-improvement-1', date: 'Sample · Jan 20, 2025', section: 'Work Experience', change: 'Improved wording; verify outcomes before use', status: 'Draft' },
  { id: 'sample-improvement-2', date: 'Sample · Jan 18, 2025', section: 'Skills', change: 'Updated skills wording', status: 'Draft' },
  { id: 'sample-improvement-3', date: 'Sample · Jan 15, 2025', section: 'Professional Summary', change: 'Improved clarity', status: 'Applied' },
]

export const tailoringDemoResumes = {
  software: {
    name: 'Software Developer Resume (Sample)',
    version: 'v1.2 sample',
    summary: 'Software developer experienced in building web applications, collaborating with product teams, and maintaining reusable interface components.',
    experience: 'Contributed to frontend features and reusable UI components for web applications.',
    skills: ['JavaScript', 'React', 'CSS', 'Git'],
    project: 'Created a dashboard interface using reusable components.',
  },
  analyst: {
    name: 'Data Analyst Resume (Sample)',
    version: 'v1.0 sample',
    summary: 'Data analyst with sample experience organizing datasets, preparing reports, and communicating findings to project stakeholders.',
    experience: 'Prepared data summaries and supported recurring reporting tasks for a sample project team.',
    skills: ['SQL', 'Python', 'Excel'],
    project: 'Created a sample report to summarize data patterns for review.',
  },
}

export const tailoringDemoJobs = [
  {
    id: 'sample-google-frontend-developer',
    title: 'Frontend Developer',
    company: 'Google (Sample)',
    location: 'Bengaluru, India',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    description: 'We are looking for a Frontend Developer to build modern, scalable web applications using React. You will work with cross-functional teams to create excellent user experiences.',
    responsibilities: [
      'Develop and maintain web applications using React.',
      'Collaborate with design and backend teams.',
      'Ensure responsive and accessible UI/UX.',
      'Optimize application performance.',
      'Participate in code reviews and best practices.',
    ],
    skills: ['React', 'TypeScript', 'REST APIs', 'SQL', 'Testing', 'System Design', 'JavaScript', 'Responsive UI', 'Performance', 'Accessibility', 'Web Applications'],
    missingSkills: ['Next.js', 'CI/CD', 'Testing'],
    suggestions: [
      { id: 'summary', title: 'Emphasize frontend experience already in the resume', reason: 'Reorders relevant details from the selected sample resume; verify the wording before use.' },
      { id: 'skills', title: 'Prioritize skills already listed', reason: 'Moves matching listed skills earlier. It does not add new qualifications.' },
      { id: 'experience', title: 'Keep experience wording factual', reason: 'Retains the source experience without introducing claims or metrics.' },
      { id: 'project', title: 'Review the project description', reason: 'The sample project can be clarified. Include only features that reflect your real project.' },
    ],
  },
  {
    id: 'sample-microsoft-full-stack',
    title: 'Full Stack Developer',
    company: 'Microsoft (Sample)',
    location: 'Bengaluru, India',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    description: 'Work on scalable web applications using modern technologies. Collaborate with product and design teams to build user-centric solutions.',
    responsibilities: [
      'Build and maintain scalable web application features.',
      'Collaborate with product and design teams.',
      'Review application requirements and implementation details.',
      'Support user-centered product experiences.',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'REST APIs', 'GraphQL', 'Docker'],
    missingSkills: ['Node.js', 'GraphQL', 'Docker'],
    suggestions: [
      { id: 'summary', title: 'Emphasize full-stack skills already listed', reason: 'Reorders relevant details already present in this sample resume.' },
      { id: 'skills', title: 'Prioritize skills already listed', reason: 'Moves matching listed skills earlier. It does not add new qualifications.' },
      { id: 'experience', title: 'Keep experience wording factual', reason: 'Retains the source experience without introducing claims or metrics.' },
      { id: 'project', title: 'Review the project description', reason: 'Keep only details that describe the actual sample project accurately.' },
    ],
  },
  {
    id: 'sample-amazon-software-engineer',
    title: 'Software Development Engineer',
    company: 'Amazon (Sample)',
    location: 'Remote (India)',
    workArrangement: 'Remote',
    employmentType: 'Full-time',
    description: 'Design and develop scalable services and systems. Work on innovative products with a focus on reliable software.',
    responsibilities: [
      'Design and develop software services.',
      'Contribute to scalable system implementations.',
      'Collaborate with engineering partners.',
      'Support reliable software delivery.',
    ],
    skills: ['Python', 'Java', 'AWS', 'System Design', 'Linux', 'Microservices', 'SQL'],
    missingSkills: ['Python', 'Java', 'AWS'],
    suggestions: [
      { id: 'summary', title: 'Emphasize systems experience already in the resume', reason: 'Reorders relevant details already present in this sample resume.' },
      { id: 'skills', title: 'Prioritize skills already listed', reason: 'Moves matching listed skills earlier. It does not add new qualifications.' },
      { id: 'experience', title: 'Keep experience wording factual', reason: 'Retains the source experience without introducing claims or metrics.' },
      { id: 'project', title: 'Review the project description', reason: 'Use a project example only if it accurately reflects your work.' },
    ],
  },
]
