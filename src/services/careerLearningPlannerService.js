export const weekGroups = [
  { label: 'Week 1', detail: 'HTML & CSS', start: 1, end: 1 },
  { label: 'Week 2', detail: 'JavaScript', start: 2, end: 2 },
  { label: 'Week 3', detail: 'React Basics', start: 3, end: 3 },
  { label: 'Week 4', detail: 'Mini Project', start: 4, end: 4 },
  { label: 'Weeks 5–8', detail: 'Build Projects', start: 5, end: 8 },
  { label: 'Weeks 9–12', detail: 'Interview Prep', start: 9, end: 12 },
]

const weekOneTasks = [
  ['lesson-1', 'Lesson 1: Introduction to HTML', 'What is HTML and why it matters?', 45, 'lesson', 'Mon'],
  ['lesson-2', 'Lesson 2: HTML Document Structure', 'Understanding the basic structure.', 45, 'lesson', 'Tue'],
  ['lesson-3', 'Lesson 3: Common HTML Elements', 'Headings, paragraphs, links, and images.', 45, 'lesson', 'Wed'],
  ['practice-1', 'Practice Set 1', 'Test your HTML knowledge.', 30, 'practice', 'Thu'],
  ['lesson-4', 'Lesson 4: Semantic HTML', 'Using the right elements for better structure.', 45, 'lesson', 'Fri'],
  ['practice-2', 'Practice Set 2', 'More questions on HTML concepts.', 30, 'practice', 'Sat'],
  ['project-1', 'Mini Project: Personal Webpage', 'Create a personal introduction webpage.', 60, 'project', 'Sun'],
]

const roleCurricula = {
  'data analyst': [
    ['Data Analytics Foundations', 'Working with data', 'SQL fundamentals', 'Spreadsheet data cleaning', 'SQL practice', 'Descriptive statistics', 'Data storytelling', 'Business dashboard project'],
    ['SQL & Relational Data', 'Tables and queries', 'Filtering and joins', 'Aggregation and grouping', 'SQL practice', 'Subqueries and CTEs', 'Data quality checks', 'Query analysis project'],
    ['Python for Analysis', 'Python foundations', 'Pandas dataframes', 'Cleaning datasets', 'Python practice', 'Exploratory analysis', 'Reusable analysis notebooks', 'Exploratory data project'],
    ['Statistics & Visualization', 'Summary statistics', 'Sampling and variation', 'Chart selection', 'Statistics practice', 'Comparisons and trends', 'Communicating uncertainty', 'Insight presentation'],
    ['Portfolio Project', 'Project scoping', 'Data preparation', 'Analysis and findings', 'Project practice', 'Dashboard design', 'Review and iteration', 'Portfolio case study'],
    ['Career Preparation', 'Business questions', 'SQL review', 'Analysis case studies', 'Interview practice', 'Explain findings', 'Resume and portfolio', 'Application readiness'],
  ],
  'backend developer': [
    ['Backend Foundations', 'Programming foundations', 'HTTP and request flow', 'Server-side concepts', 'Backend practice', 'Routing and validation', 'Error handling', 'Simple API project'],
    ['APIs & Services', 'REST API concepts', 'Build API endpoints', 'Input validation', 'API practice', 'Authentication concepts', 'API documentation', 'Service project'],
    ['Databases & SQL', 'Relational data basics', 'SQL queries', 'Data modeling', 'SQL practice', 'Transactions and indexes', 'Persistence patterns', 'Database-backed API'],
    ['Security & Testing', 'Secure coding basics', 'Unit testing', 'Integration testing', 'Testing practice', 'Authorization checks', 'Logging and debugging', 'Tested API project'],
    ['Deployment & Operations', 'Environment configuration', 'Build and deployment', 'Monitoring basics', 'Deployment practice', 'Cloud service concepts', 'Reliability checks', 'Deployed service'],
    ['Career Preparation', 'Backend interview concepts', 'SQL and API review', 'Problem-solving practice', 'Interview practice', 'Explain architecture', 'Resume and portfolio', 'Application readiness'],
  ],
  'mobile developer': [
    ['Mobile Development Foundations', 'Mobile app concepts', 'JavaScript foundations', 'App layout basics', 'Mobile practice', 'Navigation patterns', 'Device-aware design', 'Starter app project'],
    ['Components & Navigation', 'Reusable components', 'Screen navigation', 'Forms and input', 'Component practice', 'State management', 'Platform considerations', 'Multi-screen app'],
    ['Data & APIs', 'Network request basics', 'Working with APIs', 'Loading and error states', 'API practice', 'Local data patterns', 'App state and persistence', 'Data-driven app'],
    ['Quality & Accessibility', 'Mobile accessibility', 'Responsive layouts', 'Testing app behavior', 'Quality practice', 'Performance basics', 'Release preparation', 'Polished app project'],
    ['Portfolio App', 'Project planning', 'Core feature build', 'Data integration', 'Project practice', 'Usability refinement', 'Testing and release', 'Portfolio-ready app'],
    ['Career Preparation', 'Mobile interview foundations', 'Platform concepts', 'Project walkthrough', 'Interview practice', 'Explain design choices', 'Resume and portfolio', 'Application readiness'],
  ],
  'devops & cloud engineer': [
    ['Linux & Command Line', 'Shell foundations', 'Files and permissions', 'Processes and services', 'Linux practice', 'Shell scripting', 'Troubleshooting basics', 'Automation exercise'],
    ['Networking Foundations', 'Network concepts', 'IP and DNS', 'HTTP and TLS', 'Networking practice', 'Ports and routing', 'Network diagnostics', 'Network troubleshooting lab'],
    ['Git & Automation', 'Version control', 'Branching workflows', 'Automation scripts', 'Git practice', 'Build pipelines', 'Configuration basics', 'CI workflow project'],
    ['Cloud Foundations', 'Cloud service models', 'Compute and storage', 'Identity and access', 'Cloud practice', 'Infrastructure concepts', 'Observability basics', 'Cloud deployment exercise'],
    ['CI/CD & Reliability', 'Deployment pipelines', 'Container concepts', 'Monitoring and alerts', 'Operations practice', 'Secrets management', 'Reliability review', 'Automated deployment project'],
    ['Career Preparation', 'Cloud and Linux review', 'Incident scenarios', 'Automation walkthrough', 'Interview practice', 'Explain system decisions', 'Resume and portfolio', 'Application readiness'],
  ],
  'machine learning engineer': [
    ['Python & Data Foundations', 'Python programming', 'Data structures', 'Data preparation', 'Python practice', 'Pandas workflows', 'Notebook organization', 'Data exploration project'],
    ['Statistics & Preparation', 'Descriptive statistics', 'Probability concepts', 'Feature preparation', 'Statistics practice', 'Train and test data', 'Data quality review', 'Prepared dataset project'],
    ['Machine Learning Basics', 'Supervised learning', 'Model training', 'Evaluation metrics', 'ML practice', 'Overfitting and validation', 'Model comparison', 'Baseline model project'],
    ['Model Evaluation', 'Evaluation strategies', 'Error analysis', 'Feature improvement', 'Evaluation practice', 'Responsible ML concepts', 'Reproducible experiments', 'Model evaluation report'],
    ['Applied ML Project', 'Problem framing', 'Build a useful model', 'Evaluate outcomes', 'Project practice', 'Document limitations', 'Improve the solution', 'Applied ML portfolio project'],
    ['Career Preparation', 'ML foundations review', 'Statistics review', 'Project walkthrough', 'Interview practice', 'Discuss model tradeoffs', 'Resume and portfolio', 'Application readiness'],
  ],
  'cybersecurity analyst': [
    ['Security Foundations', 'Security principles', 'Threat and risk basics', 'System fundamentals', 'Security practice', 'Access control', 'Safe lab practices', 'Security review exercise'],
    ['Networking & Linux', 'Network fundamentals', 'Linux navigation', 'Logs and processes', 'Networking practice', 'Common protocols', 'System hardening basics', 'Network analysis lab'],
    ['Threat Analysis', 'Threat modeling', 'Indicators and events', 'Log analysis', 'Analysis practice', 'Incident response steps', 'Evidence handling', 'Threat analysis case study'],
    ['Scripting & Controls', 'Scripting foundations', 'Security controls', 'Vulnerability concepts', 'Security practice', 'Automation examples', 'Risk prioritization', 'Defensive automation exercise'],
    ['Security Operations Project', 'Define a safe scenario', 'Collect and review events', 'Document findings', 'Project practice', 'Recommend mitigations', 'Validate improvements', 'Security operations report'],
    ['Career Preparation', 'Security foundations review', 'Incident scenarios', 'Explain a case study', 'Interview practice', 'Discuss responsible practice', 'Resume and portfolio', 'Application readiness'],
  ],
}

const webCurriculum = [
  ['HTML & CSS', 'HTML foundations', 'Document structure', 'Common elements', 'HTML practice', 'Semantic HTML', 'HTML review', 'Personal webpage project'],
  ['JavaScript', 'JavaScript foundations', 'Values and variables', 'Functions and events', 'JavaScript practice', 'DOM essentials', 'Arrays and objects', 'Interactive page project'],
  ['React Basics', 'React foundations', 'Components and props', 'State and events', 'React practice', 'Rendering lists', 'Reusable interfaces', 'React component project'],
  ['Mini Project', 'Project planning', 'Page structure', 'Responsive styles', 'Project practice', 'Accessibility review', 'Polish and testing', 'Portfolio-ready mini project'],
  ['Build Projects', 'Project scoping', 'Interface implementation', 'Reusable components', 'Project practice', 'Working with data', 'Testing and refinement', 'Project milestone'],
  ['Interview Prep', 'Interview foundations', 'HTML and CSS review', 'JavaScript review', 'Practice interview set', 'Explain a project', 'Resume preparation', 'Application readiness'],
]

export function getCareerCurriculum(careerDiscovery) {
  const role = (careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole || '').toLowerCase()
  const curriculum = Object.entries(roleCurricula).find(([name]) => role.includes(name))
  if (curriculum) return curriculum[1]
  if (role.includes('backend')) return roleCurricula['backend developer']
  if (role.includes('data')) return roleCurricula['data analyst']
  if (role.includes('mobile')) return roleCurricula['mobile developer']
  if (role.includes('devops') || role.includes('cloud')) return roleCurricula['devops & cloud engineer']
  if (role.includes('machine') || role.includes('ai')) return roleCurricula['machine learning engineer']
  if (role.includes('security') || role.includes('cyber')) return roleCurricula['cybersecurity analyst']
  return webCurriculum
}

export function getCareerWeekGroups(careerDiscovery) {
  const curriculum = getCareerCurriculum(careerDiscovery)
  return weekGroups.map((group, index) => ({ ...group, detail: curriculum[index]?.[0] || curriculum[0][0] }))
}

const dayDescriptions = [
  'Review the core concepts and connect them to the week’s learning goal.',
  'Build understanding with a focused example and short activity.',
  'Practice a key skill and check your work against the lesson objectives.',
  'Apply what you have learned in a guided exercise.',
  'Strengthen your understanding with a practical example.',
  'Review and reinforce this week’s important ideas.',
  'Create a small artifact that demonstrates your learning.',
]

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function getWeekTasks(week, careerDiscovery) {
  const career = (careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole || '').toLowerCase()
  const curriculum = getCareerCurriculum(careerDiscovery)
  const isWebCurriculum = !career
    || /frontend|full.?stack|web developer/.test(career)
  if (week === 1 && isWebCurriculum) {
    return weekOneTasks.map(([id, title, description, minutes, type, day], index) => ({
      id: `week-1-${id}`,
      title,
      description,
      minutes,
      type,
      day,
      index,
    }))
  }
  const group = weekGroups.findIndex(({ start, end }) => week >= start && week <= end)
  const seeds = curriculum[group] || curriculum[0]
  const topic = seeds[0]
  return [
    ['lesson-1', `Sample lesson: ${seeds[1]}`, dayDescriptions[0], 35, 'lesson'],
    ['lesson-2', `Sample lesson: ${seeds[2]}`, dayDescriptions[1], 35, 'lesson'],
    ['lesson-3', `Sample lesson: ${seeds[3]}`, dayDescriptions[2], 40, 'lesson'],
    ['practice-1', `Practice Set 1: ${topic}`, dayDescriptions[3], 30, 'practice'],
    ['lesson-4', `Sample lesson: ${seeds[4]}`, dayDescriptions[4], 35, 'lesson'],
    ['practice-2', `Practice Set 2: ${topic}`, dayDescriptions[5], 30, 'practice'],
    ['project-1', `Sample Project: ${seeds[7]}`, dayDescriptions[6], 60, 'project'],
  ].map(([id, title, description, minutes, type], index) => ({
    id: `week-${week}-${id}`,
    title,
    description,
    minutes,
    type,
    day: dayNames[index],
    index,
  }))
}

export function getCompletedCareerLearningTopics(careerDiscovery, learningProgress) {
  const completedIds = new Set(Array.isArray(learningProgress?.completedTaskIds) ? learningProgress.completedTaskIds : [])
  const topics = []
  for (let week = 1; week <= 12; week += 1) {
    for (const task of getWeekTasks(week, careerDiscovery)) {
      if (task.type !== 'lesson' || !completedIds.has(task.id)) continue
      topics.push(task.title.replace(/^(Lesson \d+: |Sample lesson: )/, ''))
    }
  }
  return [...new Set(topics)]
}
