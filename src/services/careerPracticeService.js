const practiceSessionKey = (userId) => `skillproof-career-practice-session:${userId || 'preview'}`

const questionGroups = {
  'HTML & CSS': [
    [
      {
        id: 'html-structure-landmark',
        topic: 'HTML structure',
        prompt: 'Which element should contain the main, unique content of a page?',
        choices: ['<main>', '<aside>', '<footer>', '<small>'],
        answer: 0,
        explanation: 'The main element identifies the primary content of the document.',
      },
      {
        id: 'html-semantic-heading',
        topic: 'Semantic HTML',
        prompt: 'Which heading level usually represents the primary page heading?',
        choices: ['<h1>', '<h4>', '<strong>', '<header>'],
        answer: 0,
        explanation: 'An h1 normally introduces the page’s main topic.',
      },
    ],
    [
      {
        id: 'html-image-alt',
        topic: 'Common HTML elements',
        prompt: 'What is the purpose of descriptive alt text on an informative image?',
        choices: ['Provide a text alternative', 'Change the image size', 'Load the image faster', 'Add a caption below it'],
        answer: 0,
        explanation: 'Alt text communicates an informative image’s content when it cannot be seen.',
      },
      {
        id: 'html-link-purpose',
        topic: 'Links and content',
        prompt: 'Which link text is the most useful?',
        choices: ['View the project case study', 'Click here', 'More', 'Link'],
        answer: 0,
        explanation: 'Descriptive link text makes the destination clearer, including out of context.',
      },
    ],
    [
      {
        id: 'css-box-model',
        topic: 'CSS foundations',
        prompt: 'Which CSS property adds space inside an element’s border?',
        choices: ['padding', 'margin', 'outline', 'gap'],
        answer: 0,
        explanation: 'Padding is the space between an element’s content and its border.',
      },
      {
        id: 'css-flex-align',
        topic: 'Responsive styling',
        prompt: 'In a flex container, which property aligns items along the main axis?',
        choices: ['justify-content', 'align-items', 'text-align', 'vertical-align'],
        answer: 0,
        explanation: 'justify-content distributes items along the flex container’s main axis.',
      },
    ],
    [
      {
        id: 'html-document-title',
        topic: 'Document structure',
        prompt: 'Where does the document title normally appear?',
        choices: ['Inside <head>', 'Inside <footer>', 'Inside <main>', 'After </html>'],
        answer: 0,
        explanation: 'The title element belongs in the document head.',
      },
      {
        id: 'html-list',
        topic: 'Common HTML elements',
        prompt: 'Which element represents an item in an ordered or unordered list?',
        choices: ['<li>', '<item>', '<list>', '<entry>'],
        answer: 0,
        explanation: 'List items are represented with the li element.',
      },
    ],
  ],
  JavaScript: [
    [
      {
        id: 'js-const-reassign',
        topic: 'Variables and values',
        prompt: 'What happens if code assigns a new value to a const binding?',
        choices: ['A TypeError is thrown', 'The binding becomes let', 'The assignment is ignored silently', 'The value is appended'],
        answer: 0,
        explanation: 'A const binding cannot be reassigned.',
      },
      {
        id: 'js-strict-equality',
        topic: 'JavaScript fundamentals',
        prompt: 'What does === compare in JavaScript?',
        choices: ['Value and type', 'Only the string representation', 'Only object identity', 'Whether both values are truthy'],
        answer: 0,
        explanation: 'Strict equality compares values without type coercion.',
      },
    ],
    [
      {
        id: 'js-array-map',
        topic: 'Functions and arrays',
        prompt: 'Which array method returns a new array by transforming each item?',
        choices: ['map()', 'push()', 'pop()', 'findIndex()'],
        answer: 0,
        explanation: 'map calls a callback for each item and returns the resulting array.',
      },
      {
        id: 'js-function-return',
        topic: 'Functions',
        prompt: 'What does a function return when it has no return statement?',
        choices: ['undefined', 'null', 'false', 'An empty string'],
        answer: 0,
        explanation: 'A function without an explicit return statement returns undefined.',
      },
    ],
    [
      {
        id: 'js-dom-query',
        topic: 'DOM essentials',
        prompt: 'Which method selects the first element matching a CSS selector?',
        choices: ['querySelector()', 'getElementsByTag()', 'selectAll()', 'findNode()'],
        answer: 0,
        explanation: 'document.querySelector returns the first matching element.',
      },
      {
        id: 'js-event-listener',
        topic: 'Events',
        prompt: 'Which method is commonly used to respond to a button click?',
        choices: ['addEventListener()', 'onChangeText()', 'watchClick()', 'listenOnce()'],
        answer: 0,
        explanation: 'addEventListener registers a handler for an event such as click.',
      },
    ],
    [
      {
        id: 'js-array-find',
        topic: 'Arrays and objects',
        prompt: 'Which array method returns the first item that passes a test?',
        choices: ['find()', 'filterOne()', 'mapFirst()', 'reduceTo()'],
        answer: 0,
        explanation: 'find returns the first matching item, or undefined when none matches.',
      },
      {
        id: 'js-template-string',
        topic: 'JavaScript syntax',
        prompt: 'Which delimiter allows interpolation in a JavaScript template literal?',
        choices: ['Backticks', 'Single quotes', 'Parentheses', 'Square brackets'],
        answer: 0,
        explanation: 'Template literals use backticks and ${expression} interpolation.',
      },
    ],
  ],
  React: [
    [
      {
        id: 'react-component',
        topic: 'Components',
        prompt: 'What does a React component commonly return?',
        choices: ['A description of UI', 'A database connection', 'A CSS file', 'A browser window'],
        answer: 0,
        explanation: 'A component returns React elements describing the UI to render.',
      },
      {
        id: 'react-props',
        topic: 'Props',
        prompt: 'How should a component generally treat its props?',
        choices: ['As read-only inputs', 'As global variables', 'As DOM nodes', 'As mutable state'],
        answer: 0,
        explanation: 'Props are inputs; components should not mutate them.',
      },
    ],
    [
      {
        id: 'react-state',
        topic: 'State',
        prompt: 'What should an event handler use to update state?',
        choices: ['The state setter', 'Direct assignment to props', 'document.querySelector', 'A CSS class'],
        answer: 0,
        explanation: 'Use the setter returned by a state hook to request a state update.',
      },
      {
        id: 'react-keys',
        topic: 'Rendering lists',
        prompt: 'Why should rendered list items have stable keys?',
        choices: ['To help React match items between renders', 'To sort the list', 'To style the item', 'To prevent event handlers'],
        answer: 0,
        explanation: 'Stable keys help React track list items when the collection changes.',
      },
    ],
    [
      {
        id: 'react-effect',
        topic: 'Effects',
        prompt: 'What is a common purpose of an effect hook?',
        choices: ['Synchronize with an external system', 'Replace all component state', 'Create a CSS selector', 'Sort props'],
        answer: 0,
        explanation: 'Effects are used to synchronize a component with systems outside React.',
      },
      {
        id: 'react-controlled-input',
        topic: 'Forms',
        prompt: 'What makes a text input controlled in React?',
        choices: ['Its value is driven by React state', 'It has a placeholder', 'It uses a CSS class', 'It is inside a form'],
        answer: 0,
        explanation: 'A controlled input receives its value from state and updates through a handler.',
      },
    ],
    [
      {
        id: 'react-fragment',
        topic: 'Components and UI',
        prompt: 'What does a React Fragment let you do?',
        choices: ['Group elements without an extra DOM wrapper', 'Fetch data', 'Create component state', 'Apply styles globally'],
        answer: 0,
        explanation: 'Fragments group adjacent elements without adding a DOM node.',
      },
      {
        id: 'react-conditional',
        topic: 'Rendering',
        prompt: 'Which is a common way to conditionally render a small element?',
        choices: ['Use a conditional expression in JSX', 'Mutate the DOM directly', 'Add a SQL query', 'Call setState during render'],
        answer: 0,
        explanation: 'Conditional expressions are a common declarative way to render optional UI.',
      },
    ],
  ],
  'Data Analytics': [
    [
      {
        id: 'data-question',
        topic: 'Working with data',
        prompt: 'Why should an analyst inspect a dataset before summarizing it?',
        choices: ['To understand its structure and quality', 'To guarantee a trend exists', 'To remove every unusual value', 'To avoid documenting assumptions'],
        answer: 0,
        explanation: 'Initial inspection can reveal types, missing values, and data-quality issues.',
      },
      {
        id: 'data-missing',
        topic: 'Data quality',
        prompt: 'What is a sensible first step when a column contains missing values?',
        choices: ['Understand why values are missing', 'Replace all with zero immediately', 'Delete the entire dataset', 'Assume missing means false'],
        answer: 0,
        explanation: 'The cause and meaning of missingness should inform the treatment.',
      },
    ],
    [
      {
        id: 'data-spreadsheet-filter',
        topic: 'Spreadsheets and cleaning',
        prompt: 'What does a spreadsheet filter typically do?',
        choices: ['Shows rows matching selected criteria', 'Permanently deletes non-matching rows', 'Changes formulas to values', 'Sorts every column alphabetically'],
        answer: 0,
        explanation: 'Filters control which rows are displayed without necessarily deleting data.',
      },
      {
        id: 'data-duplicate',
        topic: 'Data cleaning',
        prompt: 'Why check for duplicate records before counting customers?',
        choices: ['Duplicates may inflate the count', 'Duplicates always contain errors', 'They change the column type', 'They prevent sorting'],
        answer: 0,
        explanation: 'Duplicate records can lead to overcounting, depending on the data definition.',
      },
    ],
    [
      {
        id: 'data-sql-where',
        topic: 'SQL filtering',
        prompt: 'Which SQL clause filters rows before they are grouped?',
        choices: ['WHERE', 'ORDER BY', 'FROM', 'AS'],
        answer: 0,
        explanation: 'WHERE filters input rows before grouping and aggregation.',
      },
      {
        id: 'data-sql-count',
        topic: 'SQL aggregation',
        prompt: 'Which SQL function counts rows?',
        choices: ['COUNT(*)', 'SUM(ALL)', 'TOTAL ROWS', 'NUMBER()'],
        answer: 0,
        explanation: 'COUNT(*) counts rows in the result set or group.',
      },
    ],
    [
      {
        id: 'data-statistic-median',
        topic: 'Statistics',
        prompt: 'Which measure is often less affected by extreme values?',
        choices: ['Median', 'Mean', 'Range', 'Maximum'],
        answer: 0,
        explanation: 'The median depends on the middle rank and is generally less sensitive to extremes.',
      },
      {
        id: 'data-chart-time',
        topic: 'Data visualization',
        prompt: 'Which chart is commonly useful for showing a value over time?',
        choices: ['Line chart', 'Pie chart', 'Word cloud', 'Single-value card only'],
        answer: 0,
        explanation: 'A line chart can make trends across ordered time points easier to see.',
      },
    ],
  ],
  'Backend Development': [
    [
      {
        id: 'backend-http',
        topic: 'HTTP and request flow',
        prompt: 'Which HTTP method is commonly used to retrieve a resource?',
        choices: ['GET', 'PATCH', 'DELETE', 'CONNECT'],
        answer: 0,
        explanation: 'GET requests a representation of a resource.',
      },
      {
        id: 'backend-status',
        topic: 'HTTP responses',
        prompt: 'What does a 404 HTTP status generally indicate?',
        choices: ['The requested resource was not found', 'The request succeeded', 'The server is starting', 'The client is authenticated'],
        answer: 0,
        explanation: '404 indicates that the server could not find the requested resource.',
      },
    ],
    [
      {
        id: 'backend-api-validation',
        topic: 'API validation',
        prompt: 'Why validate user input on the server?',
        choices: ['Clients can send unexpected or invalid data', 'Browsers always validate all data', 'It removes the need for tests', 'It changes the HTTP method'],
        answer: 0,
        explanation: 'Server-side validation protects application assumptions regardless of the client.',
      },
      {
        id: 'backend-sql-param',
        topic: 'Databases',
        prompt: 'Why use parameterized database queries?',
        choices: ['To keep values separate from SQL syntax', 'To make every query public', 'To skip input validation', 'To format HTML'],
        answer: 0,
        explanation: 'Parameters treat user-provided values as data rather than executable SQL syntax.',
      },
    ],
    [
      {
        id: 'backend-test-unit',
        topic: 'Testing',
        prompt: 'What does a unit test usually focus on?',
        choices: ['A small unit of behavior in isolation', 'The entire production network', 'User interface colors only', 'Database backups'],
        answer: 0,
        explanation: 'Unit tests target a small function or unit of behavior.',
      },
      {
        id: 'backend-error',
        topic: 'Error handling',
        prompt: 'What should an API do when a request is invalid?',
        choices: ['Return a clear error response', 'Report success with empty data', 'Ignore the request silently', 'Restart the server'],
        answer: 0,
        explanation: 'A clear, appropriate error response lets clients handle invalid requests.',
      },
    ],
    [
      {
        id: 'backend-env',
        topic: 'Deployment',
        prompt: 'Where should environment-specific configuration usually come from?',
        choices: ['Runtime environment configuration', 'A value hardcoded into source', 'The page title', 'A CSS custom property'],
        answer: 0,
        explanation: 'Runtime configuration supports different environments without changing source code.',
      },
      {
        id: 'backend-logs',
        topic: 'Operations',
        prompt: 'What makes an application log useful for troubleshooting?',
        choices: ['Relevant context and a clear event description', 'Secrets and full passwords', 'Only a generic “failed” message', 'No timestamps'],
        answer: 0,
        explanation: 'Useful logs provide relevant diagnostic context without exposing sensitive data.',
      },
    ],
  ],
  'Mobile Development': [
    [
      {
        id: 'mobile-layout',
        topic: 'Mobile layouts',
        prompt: 'What is a useful principle for mobile interface layouts?',
        choices: ['Design for the available screen space', 'Assume every device has the same width', 'Hide all labels', 'Require hover to use controls'],
        answer: 0,
        explanation: 'Layouts should adapt to the available viewport and input methods.',
      },
      {
        id: 'mobile-touch',
        topic: 'Device-aware design',
        prompt: 'Why should mobile controls have comfortable touch targets?',
        choices: ['They are easier to activate accurately', 'They increase network speed', 'They remove the need for labels', 'They force landscape mode'],
        answer: 0,
        explanation: 'Adequate touch targets make controls easier to use on touch screens.',
      },
    ],
    [
      {
        id: 'mobile-navigation',
        topic: 'Navigation',
        prompt: 'What should a navigation control communicate?',
        choices: ['Where it will take the user', 'The internal component file path', 'The device battery level', 'A hidden database id'],
        answer: 0,
        explanation: 'Clear navigation labels help users understand the destination.',
      },
      {
        id: 'mobile-state',
        topic: 'App state',
        prompt: 'How should a mobile screen reflect a pending network request?',
        choices: ['Show an appropriate loading state', 'Display stale success unconditionally', 'Disable all navigation permanently', 'Clear the user’s preferences'],
        answer: 0,
        explanation: 'A loading state communicates that an operation is still in progress.',
      },
    ],
    [
      {
        id: 'mobile-api-error',
        topic: 'APIs',
        prompt: 'What should an app do if a request fails?',
        choices: ['Show a useful error and recovery option', 'Pretend the data was saved', 'Close without feedback', 'Repeat forever without limit'],
        answer: 0,
        explanation: 'Clear feedback and retry options help users recover from network errors.',
      },
      {
        id: 'mobile-accessibility',
        topic: 'Accessibility',
        prompt: 'What helps a screen reader identify an icon-only button?',
        choices: ['An accessible name', 'A larger shadow', 'A hidden placeholder', 'A decorative border'],
        answer: 0,
        explanation: 'An accessible name communicates the button’s purpose to assistive technology.',
      },
    ],
    [
      {
        id: 'mobile-test',
        topic: 'Testing',
        prompt: 'Why test an app at more than one screen size?',
        choices: ['To catch layout issues across devices', 'To increase the app version number', 'To remove semantic elements', 'To avoid state management'],
        answer: 0,
        explanation: 'Different viewports can reveal layout and interaction issues.',
      },
      {
        id: 'mobile-release',
        topic: 'Release preparation',
        prompt: 'What is a sensible check before releasing a mobile build?',
        choices: ['Verify core flows on target devices', 'Remove all error messages', 'Disable accessibility', 'Assume the simulator proves every device works'],
        answer: 0,
        explanation: 'Testing important flows on target devices can uncover platform-specific problems.',
      },
    ],
  ],
  'DevOps & Cloud': [
    [
      {
        id: 'devops-shell',
        topic: 'Linux and command line',
        prompt: 'Which command prints the current working directory in a Unix shell?',
        choices: ['pwd', 'cd', 'mv', 'touch'],
        answer: 0,
        explanation: 'pwd prints the current working directory.',
      },
      {
        id: 'devops-permissions',
        topic: 'Files and permissions',
        prompt: 'Why should a service run with only the permissions it needs?',
        choices: ['To reduce the impact of mistakes or compromise', 'To make logs longer', 'To prevent all updates', 'To remove the need for backups'],
        answer: 0,
        explanation: 'Least privilege limits unnecessary access and reduces potential impact.',
      },
    ],
    [
      {
        id: 'devops-dns',
        topic: 'Networking and DNS',
        prompt: 'What is a common purpose of DNS?',
        choices: ['Resolve domain names to network records', 'Encrypt every file automatically', 'Compile source code', 'Manage local user passwords'],
        answer: 0,
        explanation: 'DNS provides records that map names to service information such as IP addresses.',
      },
      {
        id: 'devops-http',
        topic: 'Networking and HTTP',
        prompt: 'What does HTTPS add to HTTP connections?',
        choices: ['TLS-protected transport', 'A larger HTML heading', 'Automatic database backups', 'A different DNS root'],
        answer: 0,
        explanation: 'HTTPS uses TLS to protect the connection and authenticate the server.',
      },
    ],
    [
      {
        id: 'devops-version-control',
        topic: 'Git and automation',
        prompt: 'What is the purpose of a version-control commit?',
        choices: ['Record a set of changes in project history', 'Start a cloud server', 'Replace all tests', 'Change file permissions remotely'],
        answer: 0,
        explanation: 'A commit records a snapshot of changes in version-control history.',
      },
      {
        id: 'devops-pipeline',
        topic: 'CI/CD',
        prompt: 'What is a common goal of a CI pipeline?',
        choices: ['Run repeatable checks on proposed changes', 'Hide test failures', 'Replace source control', 'Grant every user admin access'],
        answer: 0,
        explanation: 'Continuous integration automates checks to provide feedback on changes.',
      },
    ],
    [
      {
        id: 'devops-cloud-identity',
        topic: 'Cloud foundations',
        prompt: 'Why scope cloud permissions to specific actions and resources?',
        choices: ['To follow least privilege', 'To disable audit logs', 'To prevent all deployments', 'To share credentials publicly'],
        answer: 0,
        explanation: 'Narrow permissions reduce risk from accidental or unauthorized actions.',
      },
      {
        id: 'devops-monitoring',
        topic: 'Observability',
        prompt: 'What can a metric help an operations team understand?',
        choices: ['A measured system behavior over time', 'The meaning of every source-code line', 'A user’s private password', 'Whether a deployment is guaranteed perfect'],
        answer: 0,
        explanation: 'Metrics quantify system behavior and help identify trends or anomalies.',
      },
    ],
  ],
  'Machine Learning': [
    [
      {
        id: 'ml-python',
        topic: 'Python programming',
        prompt: 'Which Python type is commonly used for an ordered, mutable collection?',
        choices: ['list', 'tuple', 'str', 'bool'],
        answer: 0,
        explanation: 'A Python list is ordered and mutable.',
      },
      {
        id: 'ml-dataframe',
        topic: 'Data preparation',
        prompt: 'Why split data into training and evaluation sets?',
        choices: ['To evaluate on data not used for fitting', 'To guarantee a high score', 'To delete outliers automatically', 'To avoid choosing a metric'],
        answer: 0,
        explanation: 'Held-out evaluation data helps estimate how well a model generalizes.',
      },
    ],
    [
      {
        id: 'ml-statistics',
        topic: 'Statistics',
        prompt: 'What does a model evaluation metric summarize?',
        choices: ['A chosen aspect of model performance', 'The model’s source file size', 'The number of columns only', 'A guarantee of future accuracy'],
        answer: 0,
        explanation: 'A metric quantifies a defined performance criterion.',
      },
      {
        id: 'ml-leakage',
        topic: 'Model evaluation',
        prompt: 'What is data leakage?',
        choices: ['Information unavailable at prediction time influencing training/evaluation', 'A missing chart title', 'A slow network connection', 'A type of file compression'],
        answer: 0,
        explanation: 'Leakage gives a model information it would not legitimately have at prediction time.',
      },
    ],
    [
      {
        id: 'ml-supervised',
        topic: 'Machine-learning foundations',
        prompt: 'What does supervised learning use during training?',
        choices: ['Examples paired with target labels or values', 'Only unlabeled images', 'No input data', 'A manually written answer for every possible case'],
        answer: 0,
        explanation: 'Supervised learning uses labeled examples to learn a mapping from inputs to targets.',
      },
      {
        id: 'ml-overfit',
        topic: 'Model validation',
        prompt: 'What is a sign of overfitting?',
        choices: ['Strong training performance but weaker held-out performance', 'Identical data types', 'A short model name', 'A missing README'],
        answer: 0,
        explanation: 'A large train/evaluation gap can indicate that a model has fit training specifics.',
      },
    ],
    [
      {
        id: 'ml-baseline',
        topic: 'Model evaluation',
        prompt: 'Why compare a model against a simple baseline?',
        choices: ['To check whether added complexity improves results', 'To make evaluation unnecessary', 'To guarantee deployment success', 'To remove the need for representative data'],
        answer: 0,
        explanation: 'A baseline provides a simple reference for judging whether a model adds value.',
      },
      {
        id: 'ml-document',
        topic: 'Responsible ML',
        prompt: 'What should a useful model report include?',
        choices: ['Data and evaluation limitations', 'Only the best score', 'Private training secrets', 'A guarantee of correctness'],
        answer: 0,
        explanation: 'Documenting limitations supports appropriate interpretation and use.',
      },
    ],
  ],
  'Cybersecurity': [
    [
      {
        id: 'security-threat',
        topic: 'Security principles',
        prompt: 'What is a threat model used to do?',
        choices: ['Identify assets, threats, and mitigations', 'Guarantee no vulnerability exists', 'Replace all testing', 'Publish credentials'],
        answer: 0,
        explanation: 'Threat modeling helps reason about risks and potential mitigations.',
      },
      {
        id: 'security-mfa',
        topic: 'Access control',
        prompt: 'What is a benefit of multi-factor authentication?',
        choices: ['A password alone is not the only authentication factor', 'It removes all phishing risk', 'It encrypts every database field', 'It prevents every account lockout'],
        answer: 0,
        explanation: 'MFA requires additional evidence beyond a single password.',
      },
    ],
    [
      {
        id: 'security-logs',
        topic: 'Logs and analysis',
        prompt: 'Why correlate security events with timestamps?',
        choices: ['To understand event sequence and context', 'To delete old accounts', 'To disable alerts', 'To make each event trusted'],
        answer: 0,
        explanation: 'Timestamps help analysts reconstruct event order and investigate context.',
      },
      {
        id: 'security-incident',
        topic: 'Incident response',
        prompt: 'What is a sound first response to a suspected security incident?',
        choices: ['Follow the established response and evidence-handling process', 'Delete all logs immediately', 'Post sensitive details publicly', 'Assume the alert is harmless'],
        answer: 0,
        explanation: 'Established procedures help contain issues while preserving evidence.',
      },
    ],
    [
      {
        id: 'security-script',
        topic: 'Scripting and controls',
        prompt: 'What should a defensive automation script do with unexpected input?',
        choices: ['Validate it and fail safely', 'Execute it as a command', 'Silently report success', 'Disable monitoring'],
        answer: 0,
        explanation: 'Validation and safe failure reduce the risk of unintended behavior.',
      },
      {
        id: 'security-patch',
        topic: 'Risk management',
        prompt: 'How should a team prioritize a security issue?',
        choices: ['Consider likelihood, impact, and exposure', 'Use file name order', 'Ignore affected systems', 'Choose the newest issue only'],
        answer: 0,
        explanation: 'Risk-based prioritization considers both likelihood and potential impact.',
      },
    ],
    [
      {
        id: 'security-lab',
        topic: 'Security operations',
        prompt: 'Why keep a clear record of actions during an investigation?',
        choices: ['To support review and traceability', 'To reveal private keys', 'To make the incident invisible', 'To remove authorization requirements'],
        answer: 0,
        explanation: 'A record supports accountability and later analysis.',
      },
      {
        id: 'security-hardening',
        topic: 'System hardening',
        prompt: 'What does reducing the attack surface generally mean?',
        choices: ['Disabling unneeded services and access paths', 'Adding more public endpoints', 'Sharing admin accounts', 'Removing updates'],
        answer: 0,
        explanation: 'Fewer unnecessary services and entry points can reduce exposure.',
      },
    ],
  ],
}

const profileCurricula = {
  frontend: {
    weeks: {
      1: { subject: 'HTML & CSS', topics: ['HTML structure', 'Common HTML elements', 'Semantic HTML', 'Document structure'] },
      2: { subject: 'JavaScript', topics: ['JavaScript fundamentals', 'Functions and arrays', 'DOM essentials', 'Arrays and objects'] },
      3: { subject: 'React', topics: ['Components', 'Props', 'State', 'Rendering lists'] },
      4: { subject: 'HTML & CSS', topics: ['Responsive styling', 'CSS foundations', 'Accessibility', 'Testing'] },
    },
  },
  data: {
    weeks: {
      1: { subject: 'Data Analytics', topics: ['Working with data', 'Data quality', 'Spreadsheets and cleaning', 'Data storytelling'] },
      2: { subject: 'Data Analytics', topics: ['SQL filtering', 'SQL aggregation', 'Relational data', 'Query analysis'] },
      3: { subject: 'Data Analytics', topics: ['Python programming', 'Data preparation', 'Exploratory analysis', 'Reusable notebooks'] },
      4: { subject: 'Data Analytics', topics: ['Statistics', 'Data visualization', 'Communicating uncertainty', 'Insight presentation'] },
    },
  },
  backend: {
    weeks: {
      1: { subject: 'Backend Development', topics: ['HTTP and request flow', 'HTTP responses', 'Routing', 'Error handling'] },
      2: { subject: 'Backend Development', topics: ['API validation', 'REST APIs', 'Authentication concepts', 'API documentation'] },
      3: { subject: 'Backend Development', topics: ['Databases', 'SQL queries', 'Data modeling', 'Transactions'] },
      4: { subject: 'Backend Development', topics: ['Testing', 'Error handling', 'Logging', 'Deployment'] },
    },
  },
  mobile: {
    weeks: {
      1: { subject: 'Mobile Development', topics: ['Mobile layouts', 'Device-aware design', 'Mobile UI', 'Touch targets'] },
      2: { subject: 'Mobile Development', topics: ['Navigation', 'App state', 'Forms', 'Components'] },
      3: { subject: 'Mobile Development', topics: ['APIs', 'Network requests', 'Loading states', 'Data persistence'] },
      4: { subject: 'Mobile Development', topics: ['Accessibility', 'Testing', 'Performance', 'Release preparation'] },
    },
  },
  devops: {
    weeks: {
      1: { subject: 'DevOps & Cloud', topics: ['Linux and command line', 'Files and permissions', 'Shell scripting', 'Troubleshooting'] },
      2: { subject: 'DevOps & Cloud', topics: ['Networking and DNS', 'Networking and HTTP', 'Ports and routing', 'Network diagnostics'] },
      3: { subject: 'DevOps & Cloud', topics: ['Git and automation', 'CI/CD', 'Build pipelines', 'Configuration'] },
      4: { subject: 'DevOps & Cloud', topics: ['Cloud foundations', 'Cloud identity', 'Observability', 'Monitoring'] },
    },
  },
  machineLearning: {
    weeks: {
      1: { subject: 'Machine Learning', topics: ['Python programming', 'Data preparation', 'Data structures', 'Pandas workflows'] },
      2: { subject: 'Machine Learning', topics: ['Statistics', 'Feature preparation', 'Probability', 'Train and test data'] },
      3: { subject: 'Machine Learning', topics: ['Machine-learning foundations', 'Supervised learning', 'Model training', 'Model validation'] },
      4: { subject: 'Machine Learning', topics: ['Model evaluation', 'Evaluation metrics', 'Error analysis', 'Responsible ML'] },
    },
  },
  cybersecurity: {
    weeks: {
      1: { subject: 'Cybersecurity', topics: ['Security principles', 'Access control', 'Threat modeling', 'Safe lab practices'] },
      2: { subject: 'Cybersecurity', topics: ['Logs and analysis', 'Incident response', 'Linux fundamentals', 'Networking'] },
      3: { subject: 'Cybersecurity', topics: ['Scripting and controls', 'Risk management', 'Automation', 'Vulnerability concepts'] },
      4: { subject: 'Cybersecurity', topics: ['Security operations', 'System hardening', 'Evidence handling', 'Mitigations'] },
    },
  },
}

function curriculumForRole(careerDiscovery) {
  const role = (careerDiscovery?.confirmedPath || careerDiscovery?.selectedRole || careerDiscovery?.targetRole || '').toLowerCase()
  if (role.includes('data') || role.includes('analyst')) return profileCurricula.data
  if (role.includes('backend')) return profileCurricula.backend
  if (role.includes('mobile')) return profileCurricula.mobile
  if (role.includes('devops') || role.includes('cloud')) return profileCurricula.devops
  if (role.includes('machine') || role.includes('ai')) return profileCurricula.machineLearning
  if (role.includes('security') || role.includes('cyber')) return profileCurricula.cybersecurity
  return profileCurricula.frontend
}

export function getEligiblePracticeTracks(careerDiscovery, learningProgress) {
  const completedIds = Array.isArray(learningProgress?.completedTaskIds) ? learningProgress.completedTaskIds : []
  const curriculum = curriculumForRole(careerDiscovery)
  const tracksBySubject = new Map()
  Object.entries(curriculum.weeks).forEach(([week, lesson]) => {
    const lessonIds = [1, 2, 3, 4].map((index) => `week-${week}-lesson-${index}`)
    const completedLessonIndexes = lessonIds.flatMap((id, index) => completedIds.includes(id) ? [index] : [])
    if (!completedLessonIndexes.length) return
    const pool = questionGroups[lesson.subject] || []
    const questions = completedLessonIndexes.flatMap((index) => pool[index] || [])
    if (!questions.length) return
    const existing = tracksBySubject.get(lesson.subject) || {
      id: lesson.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subject: lesson.subject,
      topics: [],
      questions: [],
      difficulty: 'Beginner',
      source: 'Sample question bank',
    }
    existing.topics.push(...questions.map((question) => question.topic))
    existing.questions.push(...questions)
    tracksBySubject.set(lesson.subject, existing)
  })
  return [...tracksBySubject.values()].map((track) => ({
    ...track,
    topics: [...new Set(track.topics)],
    questions: [...new Map(track.questions.map((question) => [question.id, question])).values()],
  }))
}

export function loadCareerPracticeSession(userId) {
  try {
    const raw = window.sessionStorage.getItem(practiceSessionKey(userId))
    const data = raw ? JSON.parse(raw) : null
    return {
      data: {
        completedQuestionIds: Array.isArray(data?.completedQuestionIds) ? data.completedQuestionIds.filter((id) => typeof id === 'string') : [],
        attempts: Array.isArray(data?.attempts) ? data.attempts.filter((attempt) => attempt && typeof attempt === 'object') : [],
        inProgressTestIds: Array.isArray(data?.inProgressTestIds) ? data.inProgressTestIds.filter((id) => typeof id === 'string') : [],
        inProgressTests: Array.isArray(data?.inProgressTests) ? data.inProgressTests.filter((test) => test && typeof test === 'object') : [],
      },
      error: '',
    }
  } catch {
    return { data: { completedQuestionIds: [], attempts: [], inProgressTestIds: [], inProgressTests: [] }, error: 'Practice history could not be read from this browser session.' }
  }
}

export function saveCareerPracticeSession(userId, value) {
  try {
    window.sessionStorage.setItem(practiceSessionKey(userId), JSON.stringify(value))
    return ''
  } catch {
    return 'Practice progress could not be saved for this browser session.'
  }
}
