import { careerProjectExamples } from '../data/careerJourneyData.js'

export const careerProjectSetupChecks = [
  { id: 'milestones-reviewed', label: 'I reviewed the project milestones and acceptance criteria.' },
  { id: 'sample-mode-understood', label: 'I understand this is a sample project workspace, not a deployed application.' },
]
export const careerProjectReviewChecks = [
  { id: 'files-reviewed', label: 'I reviewed the project files I intend to submit.' },
  { id: 'preview-reviewed', label: 'I reviewed the browser preview where it applies.' },
  { id: 'review-boundaries', label: 'I understand that no automated tests or external review are connected.' },
]

const projectDetails = {
  'portfolio-site': {
    title: 'Personal Portfolio Website',
    category: 'Frontend',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Accessibility'],
    duration: '3–4 weeks',
    overview: 'Create a responsive portfolio that introduces you, presents selected work, and gives visitors a clear way to get in touch.',
    features: ['Responsive introduction and navigation', 'Project cards with useful summaries', 'Accessible contact section'],
    outcomes: ['Structure a semantic web page', 'Create a responsive layout', 'Add small, purposeful interactions'],
    prerequisites: ['Basic familiarity with a text editor is helpful; all steps include beginner-friendly guidance.'],
    milestones: [
      ['plan-content', 'Plan your portfolio', 'Choose the sections and information your portfolio needs.', 'Content hierarchy and page planning', ['A short introduction is drafted', 'At least two project summaries are planned']],
      ['build-structure', 'Build the page structure', 'Use semantic HTML to create the navigation, introduction, projects, and contact areas.', 'HTML landmarks and accessible names', ['The page has one main landmark', 'Navigation links point to existing page sections']],
      ['style-layout', 'Style a responsive layout', 'Use CSS to establish readable type, spacing, colors, and layouts for narrow and wide screens.', 'CSS layout, contrast, and responsive design', ['Content remains readable at narrow widths', 'Focus and hover states are visible']],
      ['add-interactions', 'Add and review interactions', 'Add a small JavaScript enhancement and review keyboard access and project links.', 'DOM events and accessibility review', ['The interaction has a clear purpose', 'Links and controls can be used with a keyboard']],
    ],
    files: {
      html: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My Portfolio</title>\n</head>\n<body>\n  <header><a href="#home">My Portfolio</a><nav aria-label="Main navigation"><a href="#projects">Projects</a><a href="#contact">Contact</a></nav></header>\n  <main id="home">\n    <section class="intro"><p class="eyebrow">Hello, I’m</p><h1>Aspiring Web Developer</h1><p>I enjoy turning ideas into useful, accessible experiences.</p><a class="button" href="#projects">Explore my work</a></section>\n    <section id="projects"><h2>Selected projects</h2><article class="project-card"><h3>Project One</h3><p>Describe a project, your contribution, and what you learned.</p></article></section>\n    <section id="contact"><h2>Let’s connect</h2><p>Add a contact link you are comfortable sharing.</p></section>\n  </main>\n  <footer><p>Made with care.</p></footer>\n</body>\n</html>',
      css: ':root { color-scheme: light; font-family: system-ui, sans-serif; color: #172b4d; background: #f7faf9; }\n* { box-sizing: border-box; }\nbody { max-width: 960px; margin: 0 auto; padding: 24px; }\nheader, nav { display: flex; align-items: center; justify-content: space-between; gap: 20px; }\na { color: #087b48; }\n.intro, .project-card { padding: clamp(24px, 6vw, 64px); border: 1px solid #dce8e1; border-radius: 18px; background: white; }\n.intro { margin: 52px 0; }\nh1 { max-width: 14ch; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.05; }\n.button { display: inline-block; padding: 12px 18px; border-radius: 10px; color: white; background: #07874a; text-decoration: none; }\n@media (max-width: 560px) { body { padding: 16px; } header, nav { align-items: flex-start; flex-direction: column; } }',
      js: "document.querySelector('.button')?.addEventListener('click', () => {\n  document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });\n});",
    },
  },
  'task-management-app': {
    title: 'Task Management Application',
    category: 'Productivity',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    duration: '4–6 weeks',
    overview: 'Build a small task board that helps a person add work, update its status, and find tasks using a simple filter.',
    features: ['Create and remove tasks', 'Mark tasks complete', 'Filter the visible list'],
    outcomes: ['Model a small collection of records', 'Handle form input and events', 'Organize state changes'],
    prerequisites: ['Basic HTML, CSS, and JavaScript are recommended.'],
    milestones: [
      ['plan-task-model', 'Plan the task model', 'Decide which fields each task needs and sketch the main screen.', 'Objects, required fields, and form planning', ['A task has a title and status', 'The page has an empty state']],
      ['create-tasks', 'Create and display tasks', 'Build a form that validates input and renders newly created tasks.', 'Forms, validation, and DOM updates', ['Blank task titles are rejected', 'New tasks appear in the list']],
      ['update-tasks', 'Update and remove tasks', 'Add controls to complete a task and remove it from the current list.', 'Event handling and state updates', ['Completion can be toggled', 'A task can be removed']],
      ['filter-tasks', 'Filter and review the app', 'Add a status filter and review the interface at a narrow viewport.', 'Filtering and responsive layout', ['Filters show the matching tasks', 'Controls have visible labels and focus states']],
    ],
    files: {
        html: '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Task Board</title></head>\n<body><main class="app"><p class="eyebrow">MY WORKSPACE</p><h1>Task Board</h1><p>Keep the next small step in view.</p><form id="task-form"><label for="task-title">New task</label><div class="form-row"><input id="task-title" name="title" required maxlength="100" placeholder="e.g. Review project notes"><button>Add task</button></div></form><div class="toolbar"><label for="task-filter">Show</label><select id="task-filter"><option value="all">All tasks</option><option value="open">To do</option><option value="done">Completed</option></select></div><ul id="task-list" aria-live="polite"></ul></main></body>\n</html>',
      css: ':root { font-family: system-ui, sans-serif; color: #172b4d; background: #f4f8f6; }\n* { box-sizing: border-box; }\nbody { margin: 0; padding: 32px 16px; }\n.app { max-width: 680px; margin: auto; padding: clamp(20px, 5vw, 44px); border: 1px solid #dce8e1; border-radius: 18px; background: white; }\n.eyebrow { color: #07874a; font-weight: 700; letter-spacing: .1em; }\n.form-row, .toolbar { display: flex; gap: 10px; align-items: center; margin: 12px 0 24px; }\ninput, select, button { padding: 10px 12px; border: 1px solid #ccd8d1; border-radius: 8px; font: inherit; }\ninput { flex: 1; min-width: 0; }\nbutton { color: white; background: #07874a; cursor: pointer; }\nli { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e6ece8; }\nli label { flex: 1; } li.done label { color: #78877e; text-decoration: line-through; }',
      js: "const form = document.querySelector('#task-form');\nconst input = document.querySelector('#task-title');\nconst list = document.querySelector('#task-list');\nconst filter = document.querySelector('#task-filter');\nconst tasks = [];\nfunction render() {\n  list.replaceChildren();\n  tasks.filter(task => filter.value === 'all' || (filter.value === 'done') === task.done).forEach(task => {\n    const item = document.createElement('li');\n    item.className = task.done ? 'done' : '';\n    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done;\n    check.addEventListener('change', () => { task.done = check.checked; render(); });\n    const label = document.createElement('label'); label.textContent = task.title;\n    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove';\n    remove.addEventListener('click', () => { tasks.splice(tasks.indexOf(task), 1); render(); });\n    item.append(check, label, remove); list.append(item);\n  });\n}\nform.addEventListener('submit', event => { event.preventDefault(); const title = input.value.trim(); if (!title) return; tasks.push({ title, done: false }); input.value = ''; render(); });\nfilter.addEventListener('change', render);",
    },
  },
  'weather-dashboard': {
    title: 'Weather Dashboard',
    category: 'Data Visualization',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    duration: '2–3 weeks',
    overview: 'Design a weather dashboard with a clear current-conditions summary and a readable multi-day forecast.',
    features: ['Current conditions summary', 'Forecast cards', 'Temperature unit control'],
    outcomes: ['Arrange information by importance', 'Render repeated data from an array', 'Design clear responsive cards'],
    prerequisites: ['Basic HTML and CSS; JavaScript arrays are helpful.'],
    milestones: [
      ['weather-layout', 'Plan the forecast view', 'Choose which current conditions and forecast details to surface first.', 'Information hierarchy and data fields', ['The current summary is easy to scan', 'Forecast fields are defined']],
      ['weather-cards', 'Build forecast cards', 'Render a consistent set of forecast cards using sample data.', 'Arrays and repeated UI', ['Each card shows a day and conditions', 'Sample data is clearly identified']],
      ['weather-style', 'Style the dashboard', 'Add readable contrast, spacing, and layouts that work on small screens.', 'Card layout and responsive CSS', ['Cards wrap on narrow screens', 'Text remains readable']],
      ['weather-review', 'Add a control and review', 'Add a temperature display toggle and verify labels and content.', 'Events and interface review', ['The control changes the displayed unit', 'The interface does not claim live weather data']],
    ],
    files: {
      html: '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Weather Dashboard</title></head>\n<body><main class="weather"><header><div><p class="eyebrow">SAMPLE FORECAST</p><h1>Weather Dashboard</h1><p>Sample conditions for learning — not live weather.</p></div><button id="unit-toggle" type="button">Show °F</button></header><section class="today"><p>Today · Sample City</p><strong id="temperature">22°C</strong><span>Partly cloudy</span></section><section><h2>Next few days</h2><div id="forecast" class="forecast"></div></section></main></body>\n</html>',
      css: ':root { font-family: system-ui, sans-serif; color: #172b4d; background: #f3f8fc; }\n* { box-sizing: border-box; }\nbody { margin: 0; padding: 24px; }\n.weather { max-width: 900px; margin: auto; }\nheader { display: flex; justify-content: space-between; align-items: center; gap: 16px; }\n.eyebrow { color: #07874a; font-weight: 700; letter-spacing: .1em; }\nbutton { padding: 10px 14px; border: 0; border-radius: 9px; color: white; background: #07874a; cursor: pointer; }\n.today, .forecast article { padding: 22px; border: 1px solid #deebf2; border-radius: 16px; background: white; }\n.today { display: grid; gap: 8px; margin: 24px 0; } .today strong { font-size: 3rem; }\n.forecast { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }\n.forecast article { display: grid; gap: 10px; }',
      js: "const forecast = [{ day: 'Mon', icon: '☀️', c: 22 }, { day: 'Tue', icon: '🌤️', c: 19 }, { day: 'Wed', icon: '🌧️', c: 17 }, { day: 'Thu', icon: '☀️', c: 23 }];\nconst container = document.querySelector('#forecast');\nconst button = document.querySelector('#unit-toggle');\nlet fahrenheit = false;\nfunction render() {\n  container.replaceChildren();\n  forecast.forEach(item => { const card = document.createElement('article'); const day = document.createElement('b'); day.textContent = item.day; const icon = document.createElement('span'); icon.textContent = item.icon; const temp = document.createElement('span'); temp.textContent = fahrenheit ? `${Math.round(item.c * 9 / 5 + 32)}°F` : `${item.c}°C`; card.append(day, icon, temp); container.append(card); });\n  document.querySelector('#temperature').textContent = fahrenheit ? '72°F' : '22°C';\n  button.textContent = fahrenheit ? 'Show °C' : 'Show °F';\n}\nbutton.addEventListener('click', () => { fahrenheit = !fahrenheit; render(); }); render();",
    },
  },
  'notes-application': {
    title: 'Notes Application',
    difficulty: 'Beginner',
    category: 'Productivity',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    duration: '2–3 weeks',
    overview: 'Create a lightweight notes interface where a learner can add notes, browse the list, and search by title or text.',
    features: ['Create and remove notes', 'Search note content', 'Responsive list and editor'],
    outcomes: ['Work with form values', 'Filter a collection', 'Keep interface states understandable'],
    prerequisites: ['Basic HTML, CSS, and JavaScript.'],
    milestones: [
      ['notes-layout', 'Plan the notes interface', 'Sketch the list, editor, and empty state.', 'Interface states and content structure', ['The list and editor areas are identified', 'An empty state is planned']],
      ['notes-create', 'Create and render notes', 'Add a title and body form and render saved notes in the current page session.', 'Forms and DOM rendering', ['A note requires a title', 'New notes appear in the list']],
      ['notes-search', 'Search and remove notes', 'Filter notes by matching title or text and provide a remove action.', 'String matching and events', ['Search checks title and body', 'A note can be removed']],
      ['notes-polish', 'Polish and review', 'Add readable empty states and responsive layout behavior.', 'Responsive CSS and usability review', ['Empty search results are explained', 'The layout fits a narrow screen']],
    ],
    files: {
      html: '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Notes</title></head>\n<body><main class="notes-app"><header><p class="eyebrow">PERSONAL SPACE</p><h1>Notes</h1><p>Capture an idea while it is fresh.</p></header><section class="layout"><form id="note-form"><label for="note-title">Title</label><input id="note-title" required maxlength="80"><label for="note-body">Note</label><textarea id="note-body" rows="5"></textarea><button>Add note</button></form><div><label for="note-search">Search notes</label><input id="note-search" type="search" placeholder="Search by title or text"><ul id="note-list" aria-live="polite"></ul></div></section></main></body>\n</html>',
      css: ':root { font-family: system-ui, sans-serif; color: #172b4d; background: #f6f8fb; }\n* { box-sizing: border-box; }\nbody { margin: 0; padding: 24px; } .notes-app { max-width: 980px; margin: auto; }\n.eyebrow { color: #07874a; font-weight: 700; letter-spacing: .1em; }\n.layout { display: grid; grid-template-columns: minmax(220px, .8fr) 1.2fr; gap: 22px; margin-top: 26px; }\nform, .layout > div { display: grid; align-content: start; gap: 10px; padding: 20px; border: 1px solid #e1e7ec; border-radius: 14px; background: white; }\ninput, textarea, button { width: 100%; padding: 10px; border: 1px solid #d2dce3; border-radius: 8px; font: inherit; }\nbutton { color: white; background: #07874a; cursor: pointer; } li { margin: 8px 0; padding: 14px; border: 1px solid #e8edf1; border-radius: 10px; list-style: none; }\n@media (max-width: 640px) { .layout { grid-template-columns: 1fr; } }',
      js: "const form = document.querySelector('#note-form'); const list = document.querySelector('#note-list'); const search = document.querySelector('#note-search'); const notes = [];\nfunction render() { list.replaceChildren(); const matches = notes.filter(note => `${note.title} ${note.body}`.toLowerCase().includes(search.value.toLowerCase())); if (!matches.length) { const empty = document.createElement('li'); empty.textContent = 'No matching notes yet.'; list.append(empty); } matches.forEach(note => { const item = document.createElement('li'); const title = document.createElement('b'); title.textContent = note.title; const body = document.createElement('p'); body.textContent = note.body; const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => { notes.splice(notes.indexOf(note), 1); render(); }); item.append(title, body, remove); list.append(item); }); }\nform.addEventListener('submit', event => { event.preventDefault(); const title = document.querySelector('#note-title').value.trim(); if (!title) return; notes.unshift({ title, body: document.querySelector('#note-body').value.trim() }); form.reset(); render(); }); search.addEventListener('input', render); render();",
    },
  },
  'blog-platform': {
    title: 'Blog Platform',
    difficulty: 'Intermediate',
    category: 'Content',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    duration: '4–6 weeks',
    overview: 'Design a small editorial experience with readable article cards, categories, and an article detail view.',
    features: ['Article listing and categories', 'Readable article layout', 'Search or category filter'],
    outcomes: ['Structure content consistently', 'Build a useful filter interaction', 'Consider readable long-form layout'],
    prerequisites: ['HTML and CSS fundamentals; JavaScript arrays are helpful.'],
    milestones: [
      ['blog-model', 'Plan the article model', 'Choose article fields and define the content categories.', 'Data shape and content planning', ['Articles include title and summary', 'Categories are defined']],
      ['blog-list', 'Build the article list', 'Render article cards with clear titles, summaries, and category labels.', 'Reusable content patterns', ['Each card has a clear title', 'Content has a logical reading order']],
      ['blog-filter', 'Add category filtering', 'Let readers filter the sample posts by category.', 'Array filtering and button states', ['The selected category is visible', 'An empty category state is handled']],
      ['blog-review', 'Polish the reading experience', 'Style a sample article view and review contrast, spacing, and small screens.', 'Typography and responsive design', ['Long text has comfortable line length', 'Navigation remains usable on mobile']],
    ],
    files: {
      html: '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Field Notes</title></head>\n<body><main class="blog"><header><p class="eyebrow">FIELD NOTES</p><h1>Ideas in progress</h1><p>Short essays about learning, making, and sharing.</p></header><nav id="categories" aria-label="Filter articles"></nav><section id="articles" class="articles"></section></main></body>\n</html>',
      css: ':root { font-family: Georgia, serif; color: #20304c; background: #fbfaf7; }\n* { box-sizing: border-box; } body { margin: 0; padding: 28px 18px; }\n.blog { max-width: 940px; margin: auto; } header { max-width: 600px; padding: 32px 0; }\n.eyebrow { color: #07874a; font: 700 .8rem system-ui; letter-spacing: .14em; }\nh1 { font-size: clamp(2.4rem, 7vw, 4rem); margin: 10px 0; } nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }\n      button { padding: 8px 12px; border: 1px solid #d7e0d9; border-radius: 20px; background: white; cursor: pointer; } button[aria-pressed="true"] { color: white; background: #07874a; }\n.articles { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }\narticle { padding: 20px; border: 1px solid #e5e5df; border-radius: 12px; background: white; } article small { color: #07874a; font-family: system-ui; }',
      js: "const posts = [{ title: 'A first small project', category: 'Making', summary: 'How a clear first milestone can make a new idea easier to begin.' }, { title: 'Notes from the learning loop', category: 'Learning', summary: 'A practical way to reflect on what worked and what needs another pass.' }, { title: 'Sharing work with care', category: 'Making', summary: 'A few ideas for explaining the decisions behind a portfolio project.' }];\nconst categories = ['All', ...new Set(posts.map(post => post.category))]; let active = 'All';\nconst nav = document.querySelector('#categories'); const list = document.querySelector('#articles');\nfunction render() { nav.replaceChildren(); categories.forEach(category => { const button = document.createElement('button'); button.textContent = category; button.setAttribute('aria-pressed', String(active === category)); button.addEventListener('click', () => { active = category; render(); }); nav.append(button); }); list.replaceChildren(); posts.filter(post => active === 'All' || post.category === active).forEach(post => { const article = document.createElement('article'); const tag = document.createElement('small'); tag.textContent = post.category; const title = document.createElement('h2'); title.textContent = post.title; const summary = document.createElement('p'); summary.textContent = post.summary; article.append(tag, title, summary); list.append(article); }); }\nrender();",
    },
  },
  'e-commerce-store': {
    title: 'E-commerce Store',
    difficulty: 'Intermediate',
    category: 'E-commerce',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    duration: '5–7 weeks',
    overview: 'Create a small storefront prototype with product cards, category filters, and a cart summary without processing payments.',
    features: ['Product cards and category filter', 'Add and remove cart items', 'Cart quantity and subtotal summary'],
    outcomes: ['Render product data', 'Manage cart state', 'Use honest boundaries around checkout'],
    prerequisites: ['HTML, CSS, and JavaScript fundamentals.'],
    milestones: [
      ['store-catalog', 'Plan a sample catalog', 'Define a small set of products and the information each card needs.', 'Data fields and product content', ['Products have name and price', 'Images or visual placeholders have text alternatives']],
      ['store-layout', 'Build the storefront', 'Create product cards with a clear category and accessible controls.', 'Responsive grids and labels', ['The catalog is readable on mobile', 'Buttons have descriptive labels']],
      ['store-cart', 'Build a local cart summary', 'Add and remove items and calculate a visible subtotal for sample products.', 'Arrays and derived totals', ['Cart quantity updates after changes', 'Subtotal reflects displayed sample data']],
      ['store-review', 'Review checkout boundaries', 'Review cart states and make clear that no order or payment is processed.', 'State review and safe UX', ['Empty and populated cart states are clear', 'No real payment or order is claimed']],
    ],
    files: {
      html: '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Small Goods</title></head>\n<body><main class="store"><header><div><p class="eyebrow">SAMPLE STORE · NO CHECKOUT</p><h1>Small Goods</h1><p>A learning storefront prototype. No orders or payments are processed.</p></div><aside id="cart" aria-live="polite">Cart: 0 items · $0.00</aside></header><section><h2>Featured products</h2><div id="products" class="products"></div></section></main></body>\n</html>',
      css: ':root { font-family: system-ui, sans-serif; color: #172b4d; background: #f8f7f4; }\n* { box-sizing: border-box; } body { margin: 0; padding: 24px; } .store { max-width: 1000px; margin: auto; }\nheader { display: flex; justify-content: space-between; align-items: center; gap: 20px; } .eyebrow { color: #07874a; font-weight: 700; letter-spacing: .1em; }\n#cart { padding: 12px; border-radius: 10px; background: #e7f5ed; } .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }\narticle { padding: 18px; border: 1px solid #e3e2dc; border-radius: 14px; background: white; } button { padding: 10px; border: 0; border-radius: 8px; color: white; background: #07874a; cursor: pointer; }\n@media (max-width: 600px) { header { align-items: flex-start; flex-direction: column; } }',
      js: "const products = [{ name: 'Notebook', price: 8 }, { name: 'Desk Plant', price: 14 }, { name: 'Pen Set', price: 6 }]; const cart = new Map(); const list = document.querySelector('#products');\nfunction render() { list.replaceChildren(); products.forEach(product => { const card = document.createElement('article'); const title = document.createElement('h3'); title.textContent = product.name; const price = document.createElement('p'); price.textContent = `$${product.price.toFixed(2)}`; const add = document.createElement('button'); add.type = 'button'; add.textContent = 'Add to sample cart'; add.addEventListener('click', () => { cart.set(product.name, (cart.get(product.name) || 0) + 1); updateCart(); }); card.append(title, price, add); list.append(card); }); }\nfunction updateCart() { const count = [...cart.values()].reduce((sum, amount) => sum + amount, 0); const total = products.reduce((sum, product) => sum + product.price * (cart.get(product.name) || 0), 0); document.querySelector('#cart').textContent = `Cart: ${count} items · $${total.toFixed(2)} · sample only`; }\nrender(); updateCart();",
    },
  },
}

function toMilestones(project) {
  return project.milestones.map((milestone, index) => {
    const [id, title, objective, instructions, concepts, acceptanceCriteria] = milestone.length >= 6
      ? milestone
      : [
        ...milestone.slice(0, 4),
        (project.technologies || project.skills || []).join(', '),
        milestone[4],
      ]
    return {
      id,
      title,
      objective,
      instructions: [
        instructions || objective,
        index === 0 ? 'Use the Project Guide tab to plan before changing files.' : 'Build on the files you have already saved.',
        'Use the Preview tab to review the current result when it is a front-end project.',
      ],
      concepts: concepts || 'Apply the project technologies and review the result against the acceptance criteria.',
      acceptanceCriteria: Array.isArray(acceptanceCriteria) ? acceptanceCriteria : [],
    }
  })
}

const featuredProjectIds = [
  'portfolio-site',
  'task-management-app',
  'weather-dashboard',
  'notes-application',
  'blog-platform',
  'e-commerce-store',
]

export const careerProjects = featuredProjectIds.map((id) => {
  const detail = projectDetails[id]
  const example = careerProjectExamples.find((item) => item.id === id)
  const fallback = {
    id,
    title: detail.title,
    description: detail.overview,
    difficulty: detail.difficulty,
    skills: detail.technologies,
    thumbnail: id === 'weather-dashboard' ? 'weather' : 'tasks',
    milestones: detail.milestones.map((milestone) => milestone[1]),
    roles: [],
  }
  const source = example || fallback
  return {
    ...source,
    ...detail,
    id,
    technologies: detail.technologies || source.skills,
    source: 'Sample project catalogue',
    files: detail.files,
    milestones: toMilestones(detail),
  }
})

export function getCareerProject(projectId) {
  return careerProjects.find((project) => project.id === projectId) || null
}

function emptySession() {
  return { savedProjectIds: [], attempts: [] }
}

function normalizeAttempt(attempt) {
  const project = getCareerProject(attempt.projectId)
  if (!project || typeof attempt.id !== 'string') return null
  const checkedCriteria = {}
  if (attempt.checkedCriteria && typeof attempt.checkedCriteria === 'object') {
    for (const milestone of project.milestones) {
      const checked = attempt.checkedCriteria[milestone.id]
      if (Array.isArray(checked)) {
        checkedCriteria[milestone.id] = [...new Set(checked.filter(
          (index) => Number.isInteger(index) && index >= 0 && index < milestone.acceptanceCriteria.length,
        ))]
      }
    }
  }
  const files = {}
  for (const [name, content] of Object.entries(attempt.files || {})) {
    if (typeof content === 'string') files[name] = content
  }
  return {
    id: attempt.id,
    projectId: project.id,
    status: ['in-progress', 'submitted', 'completed'].includes(attempt.status) ? attempt.status : 'in-progress',
    milestoneIds: Array.isArray(attempt.milestoneIds)
      ? [...new Set(attempt.milestoneIds.filter((id) => project.milestones.some((milestone) => milestone.id === id)))]
      : [],
    checkedCriteria,
    setupChecks: Array.isArray(attempt.setupChecks)
      ? [...new Set(attempt.setupChecks.filter((value) => careerProjectSetupChecks.some((item) => item.id === value)))]
      : [],
    reviewChecks: Array.isArray(attempt.reviewChecks)
      ? [...new Set(attempt.reviewChecks.filter((value) => careerProjectReviewChecks.some((item) => item.id === value)))]
      : [],
    files: Object.keys(files).length ? files : { ...project.files },
    activeFile: typeof attempt.activeFile === 'string' && Object.hasOwn(files, attempt.activeFile) ? attempt.activeFile : 'html',
    environment: ['browser-demo', 'local-vscode'].includes(attempt.environment) ? attempt.environment : 'browser-demo',
    createdAt: typeof attempt.createdAt === 'string' ? attempt.createdAt : new Date().toISOString(),
    updatedAt: typeof attempt.updatedAt === 'string' ? attempt.updatedAt : new Date().toISOString(),
    submittedAt: typeof attempt.submittedAt === 'string' ? attempt.submittedAt : null,
  }
}

function normalizeSession(value) {
  const data = value && typeof value === 'object' ? value : {}
  return {
    savedProjectIds: Array.isArray(data.savedProjectIds)
      ? [...new Set(data.savedProjectIds.filter((id) => getCareerProject(id)))]
      : [],
    attempts: Array.isArray(data.attempts) ? data.attempts.map(normalizeAttempt).filter(Boolean) : [],
  }
}

function storageKey(userId) {
  return `skillproof-career-projects:v1:${userId}`
}

export function loadCareerProjectSession(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    return { data: emptySession(), error: 'Project tracking requires a signed-in account. No project data was loaded.' }
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey(userId))
    return { data: normalizeSession(raw ? JSON.parse(raw) : null), error: '' }
  } catch {
    return { data: emptySession(), error: 'Project data could not be read from this browser session.' }
  }
}

export function saveCareerProjectSession(userId, value) {
  if (typeof userId !== 'string' || !userId.trim()) return 'Project progress requires a signed-in account and was not saved.'
  try {
    const normalized = normalizeSession(value)
    if (normalized.attempts.some((attempt) => Object.values(attempt.files).some((content) => content.length > 100_000))) {
      return 'A project file exceeds the 100 KB browser-session limit. Reduce the file size before saving again.'
    }
    window.sessionStorage.setItem(storageKey(userId), JSON.stringify(normalized))
    return ''
  } catch {
    return 'Project progress could not be saved in this browser session.'
  }
}

export function createCareerProjectAttempt(project, environment = 'browser-demo') {
  const now = new Date().toISOString()
  return {
    id: globalThis.crypto?.randomUUID?.() || `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    projectId: project.id,
    status: 'in-progress',
    milestoneIds: [],
    checkedCriteria: {},
    setupChecks: [],
    reviewChecks: [],
    files: { ...project.files },
    activeFile: 'html',
    environment,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
  }
}

export function updateCareerProjectAttempt(attempt, patch) {
  const updatedAt = new Date().toISOString()
  return {
    ...attempt,
    ...patch,
    updatedAt,
    ...(patch.status === 'submitted' ? { submittedAt: updatedAt } : {}),
  }
}

export function getCareerProjectProgress(project, attempt) {
  return project?.milestones.length
    ? Math.round(((attempt?.milestoneIds.length || 0) / project.milestones.length) * 100)
    : 0
}

export function createCareerProjectPreview(files) {
  const html = files.html || '<!doctype html><html lang="en"><body><main><h1>Your project preview</h1></main></body></html>'
  const css = files.css || ''
  const javascript = files.js || ''
  const headAssets = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; img-src data:; font-src data:; media-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'"><style>${css}</style>`
  let styled
  if (/<head(?:\s[^>]*)?>/i.test(html)) {
    styled = html.replace(/<head(?:\s[^>]*)?>/i, (openingTag) => `${openingTag}${headAssets}`)
  } else if (/<\/head>/i.test(html)) {
    styled = html.replace(/<\/head>/i, `${headAssets}</head>`)
  } else if (/<html(?:\s[^>]*)?>/i.test(html)) {
    styled = html.replace(/<html(?:\s[^>]*)?>/i, (openingTag) => `${openingTag}<head>${headAssets}</head>`)
  } else {
    styled = `<!doctype html><html lang="en"><head>${headAssets}</head><body>${html}</body></html>`
  }
  if (!javascript.trim()) return styled
  const serializedScript = JSON.stringify(javascript).replace(/<\/script/gi, (match) => `<\\/${match.slice(2)}`)
  const isolatedScript = `<script>const userSource=${serializedScript};const userScript=document.createElement('script');userScript.textContent=userSource;document.body.append(userScript);</script>`
  return /<\/body>/i.test(styled)
    ? styled.replace(/<\/body>/i, `${isolatedScript}</body>`)
    : `${styled}${isolatedScript}`
}

export function addCareerProjectToPortfolio() {
  return { ok: false, error: 'My Portfolio is not connected to a project publishing service. Nothing was published.' }
}
