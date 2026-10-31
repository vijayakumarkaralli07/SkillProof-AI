export const careerRoles = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    interests: ['Web Development', 'Mobile Development'],
    explanation: 'Build accessible, responsive interfaces and turn product ideas into useful web experiences.',
    skills: ['HTML & CSS', 'JavaScript', 'React', 'Accessibility', 'Git'],
    learningOrder: ['HTML & CSS foundations', 'JavaScript fundamentals', 'React components and state', 'Accessibility and testing', 'Portfolio project'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    interests: ['Data Analytics', 'AI & Machine Learning'],
    explanation: 'Use data, SQL, and clear communication to help teams make informed decisions.',
    skills: ['SQL', 'Spreadsheets', 'Python', 'Statistics', 'Data Visualization'],
    learningOrder: ['SQL and relational data', 'Spreadsheets and data cleaning', 'Python for analysis', 'Statistics fundamentals', 'Dashboard project'],
  },
  {
    id: 'mobile-developer',
    title: 'Mobile Developer',
    interests: ['Mobile Development', 'Web Development'],
    explanation: 'Create polished applications for mobile devices and learn platform-aware product development.',
    skills: ['Programming Fundamentals', 'JavaScript', 'React Native', 'Mobile UI', 'APIs'],
    learningOrder: ['Programming fundamentals', 'JavaScript and components', 'Mobile layouts and navigation', 'APIs and app state', 'Mobile app project'],
  },
  {
    id: 'devops-engineer',
    title: 'DevOps & Cloud Engineer',
    interests: ['DevOps & Cloud', 'Cybersecurity'],
    explanation: 'Help teams deploy reliable services through automation, cloud infrastructure, and observability.',
    skills: ['Linux', 'Networking', 'Git', 'Cloud Fundamentals', 'CI/CD'],
    learningOrder: ['Linux and command line', 'Networking fundamentals', 'Git and automation', 'Cloud foundations', 'CI/CD deployment project'],
  },
  {
    id: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    interests: ['AI & Machine Learning', 'Data Analytics'],
    explanation: 'Apply programming, data, and evaluation methods to build useful machine-learning systems.',
    skills: ['Python', 'Statistics', 'Data Preparation', 'Machine Learning', 'Model Evaluation'],
    learningOrder: ['Python programming', 'Statistics and data preparation', 'Machine-learning foundations', 'Model evaluation', 'Applied ML project'],
  },
  {
    id: 'security-analyst',
    title: 'Cybersecurity Analyst',
    interests: ['Cybersecurity', 'DevOps & Cloud'],
    explanation: 'Protect systems by understanding networks, security fundamentals, and practical risk management.',
    skills: ['Networking', 'Linux', 'Security Fundamentals', 'Scripting', 'Cloud Security'],
    learningOrder: ['Networking foundations', 'Linux fundamentals', 'Security principles', 'Scripting for analysis', 'Security lab project'],
  },
]

export const careerInterests = [
  'Web Development',
  'Data Analytics',
  'Mobile Development',
  'DevOps & Cloud',
  'AI & Machine Learning',
  'Cybersecurity',
]

export const careerInterestTiles = [
  { interest: 'Web Development', label: 'Web Development', icon: 'web' },
  { interest: 'Data Analytics', label: 'Data & Analytics', icon: 'data' },
  { interest: 'Mobile Development', label: 'Mobile Development', icon: 'mobile' },
  { interest: 'DevOps & Cloud', label: 'DevOps & Cloud', icon: 'cloud' },
  { interest: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: 'ai' },
  { interest: 'Cybersecurity', label: 'Cyber Security', icon: 'security' },
]

export const careerModuleExamples = [
  { title: 'HTML & CSS', lessons: 20, practiceSets: 5, progress: 75, icon: 'web' },
  { title: 'JavaScript', lessons: 25, practiceSets: 8, progress: 40, icon: 'javascript' },
  { title: 'React', lessons: 18, practiceSets: 6, progress: 20, icon: 'react' },
  { title: 'Data Structures', lessons: 22, practiceSets: 10, progress: 10, icon: 'data' },
]

export const careerLearningPlanPreview = [
  {
    period: 'Week 1–4',
    goal: 'Complete 3 lessons and 2 practice sets this week.',
    topics: [
      { week: 'Week 1', title: 'HTML & CSS Fundamentals', lessons: 5, practiceSets: 3 },
      { week: 'Week 2', title: 'JavaScript Basics', lessons: 6, practiceSets: 4 },
      { week: 'Week 3', title: 'Advanced JavaScript', lessons: 5, practiceSets: 4 },
    ],
  },
  {
    period: 'Week 5–8',
    goal: 'Build confidence with guided practice and review.',
    topics: [
      { week: 'Week 5', title: 'Components & State', lessons: 5, practiceSets: 3 },
      { week: 'Week 6', title: 'Working with APIs', lessons: 4, practiceSets: 3 },
      { week: 'Week 7', title: 'Accessible Interfaces', lessons: 4, practiceSets: 2 },
    ],
  },
  {
    period: 'Week 9–12',
    goal: 'Apply your skills in a small portfolio project.',
    topics: [
      { week: 'Week 9', title: 'Project Planning', lessons: 3, practiceSets: 2 },
      { week: 'Week 10', title: 'Build & Iterate', lessons: 5, practiceSets: 3 },
      { week: 'Week 11', title: 'Testing & Polish', lessons: 4, practiceSets: 2 },
    ],
  },
]

export const careerGoalTiles = [
  { title: 'Track Milestones', description: 'Monitor your learning journey.', icon: 'milestones' },
  { title: 'Earn Certificates', description: 'Showcase your achievements.', icon: 'certificates' },
  { title: 'Build Your Portfolio', description: 'Make your work visible.', icon: 'portfolio' },
  { title: 'Get Hired', description: 'Turn your skills into a career.', icon: 'career' },
]

export const careerProjectExamples = [
  {
    id: 'portfolio-site',
    title: 'Personal Portfolio Website',
    description: 'Create an accessible portfolio that presents your projects, skills, and contact information.',
    difficulty: 'Beginner',
    skills: ['HTML & CSS', 'JavaScript', 'Accessibility'],
    thumbnail: 'portfolio',
    milestones: ['Outline pages and content', 'Build responsive layout', 'Add project details', 'Publish and verify links'],
    roles: ['frontend-developer', 'mobile-developer'],
  },
  {
    id: 'task-management-app',
    title: 'Task Management Application',
    description: 'Plan a small task tracker with clear data validation, useful filters, and a thoughtful interface.',
    difficulty: 'Intermediate',
    skills: ['JavaScript', 'React', 'APIs'],
    thumbnail: 'tasks',
    milestones: ['Define task data model', 'Build create and edit flows', 'Add filters and validation', 'Document and test the app'],
    roles: ['frontend-developer', 'mobile-developer', 'devops-engineer'],
  },
  {
    id: 'weather-dashboard',
    title: 'Weather App',
    description: 'Build a responsive weather dashboard with a clear forecast and friendly visual summaries.',
    difficulty: 'Beginner',
    skills: ['React', 'APIs', 'Data Visualization'],
    thumbnail: 'weather',
    milestones: ['Choose a data source', 'Clean and summarize data', 'Create clear visualizations', 'Explain key observations'],
    roles: ['frontend-developer', 'data-analyst', 'machine-learning-engineer'],
  },
  {
    id: 'cloud-deployment-lab',
    title: 'Cloud Deployment Lab',
    description: 'Document a reproducible deployment pipeline for a small demonstration service.',
    difficulty: 'Intermediate',
    skills: ['Linux', 'Cloud Fundamentals', 'CI/CD'],
    thumbnail: 'cloud',
    milestones: ['Define the service and environment', 'Automate a build step', 'Add deployment checks', 'Document rollback and access rules'],
    roles: ['devops-engineer', 'security-analyst'],
  },
  {
    id: 'security-review-lab',
    title: 'Application Security Review',
    description: 'Create a defensive security checklist and report for a small sample application.',
    difficulty: 'Intermediate',
    skills: ['Networking', 'Security Fundamentals', 'Scripting'],
    thumbnail: 'security',
    milestones: ['Map the sample application', 'Identify defensive controls', 'Write a risk-based checklist', 'Present remediation guidance'],
    roles: ['security-analyst', 'devops-engineer'],
  },
  {
    id: 'model-evaluation-notebook',
    title: 'Model Evaluation Notebook',
    description: 'Compare baseline models on a public learning dataset and document limitations carefully.',
    difficulty: 'Intermediate',
    skills: ['Python', 'Statistics', 'Model Evaluation'],
    thumbnail: 'data',
    milestones: ['Select a learning dataset', 'Prepare a reproducible baseline', 'Compare evaluation metrics', 'Document limitations and results'],
    roles: ['machine-learning-engineer', 'data-analyst'],
  },
]

export const careerStageOrder = [
  'Explore Career Paths',
  'Get a Personalized Learning Plan',
  'Practice & Build Skills',
  'Build Real Projects',
]
