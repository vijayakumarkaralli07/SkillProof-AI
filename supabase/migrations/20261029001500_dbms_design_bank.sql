begin;

create temporary table coding_question_seed (
  collection_slug text not null,
  slug text not null,
  title text not null,
  problem_statement text not null,
  difficulty text not null,
  topic_tags text[] not null,
  constraints jsonb not null,
  examples jsonb not null,
  starter_code_by_language jsonb not null,
  points integer not null
) on commit drop;

insert into coding_question_seed
select collection_slug, slug, title, problem_statement, difficulty, topic_tags,
       constraints, examples, starter_code_by_language, points
from jsonb_to_recordset($seed$
[
  {
    "collection_slug": "dbms-database-design",
    "slug": "normalized-course-enrollment-count",
    "title": "Enrollment Counts in a Normalized Course Catalog",
    "problem_statement": "Schema: students(student_id PK, full_name); courses(course_id PK, title); enrollments(student_id FK, course_id FK, enrolled_on DATE), composite primary key (student_id,course_id). Return every course with its enrollment count, including courses with none; order by course_id. Input: courses (10,SQL),(20,Design); enrollments (1,10),(2,10). Output: 10 | SQL | 2; 20 | Design | 0. Input: course (30,Keys), no enrollments. Output: 30 | Keys | 0.",
    "difficulty": "Easy",
    "topic_tags": [
      "Database Design",
      "Normalization",
      "Joins"
    ],
    "constraints": [
      "The enrollment bridge represents a many-to-many student/course relationship.",
      "A composite key prevents duplicate enrollment pairs.",
      "Return courses even when no bridge row exists."
    ],
    "examples": [
      {
        "input": "courses: (10,SQL),(20,Design); enrollments: (1,10,2026-01-01),(2,10,2026-01-02)",
        "output": "10 | SQL | 2\n20 | Design | 0"
      },
      {
        "input": "courses: (30,Keys); enrollments: (no rows)",
        "output": "30 | Keys | 0"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT c.course_id, c.title, COUNT(e.student_id) AS enrolled_student_count\nFROM courses AS c\nLEFT JOIN enrollments AS e ON e.course_id = c.course_id\nGROUP BY c.course_id, c.title\nORDER BY c.course_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "conflicting-customer-natural-keys",
    "title": "Audit a Proposed Case-Insensitive Email Key",
    "problem_statement": "Schema: customers(customer_id PK, email, display_name). Email is intended to identify one person after trimming and case-folding. Return normalized_email and count of rows when one normalized email is associated with more than one distinct display_name; order by email. Input: (1,' a@x.test ','Ava'),(2,'A@x.test','Ava'),(3,'b@x.test','Ben'),(4,'B@x.test','Bea'). Output: b@x.test | 2. Input: (5,'c@x.test','Cy'),(6,' C@x.test ','Cy'). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Candidate Keys",
      "Data Quality"
    ],
    "constraints": [
      "Ignore outer whitespace and compare emails case-insensitively.",
      "Repeated records with the same normalized name are not a conflicting determinant.",
      "Return only conflicting email groups."
    ],
    "examples": [
      {
        "input": "customers: (1,' a@x.test ','Ava'),(2,'A@x.test','Ava'),(3,'b@x.test','Ben'),(4,'B@x.test','Bea')",
        "output": "b@x.test | 2"
      },
      {
        "input": "customers: (5,'c@x.test','Cy'),(6,' C@x.test ','Cy')",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS row_count\nFROM customers\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(DISTINCT display_name) > 1\nORDER BY normalized_email;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "orphan-foreign-key-import",
    "title": "Find Orphaned Department References",
    "problem_statement": "Schema: departments(department_id PK); employees(employee_id PK, department_id NULL). A bulk import may have bypassed the foreign key. Return employees with a non-NULL department_id absent from departments, with both ids ordered by employee_id. Input: departments (1),(2); employees (4,1),(5,9),(6,NULL). Output: 5 | 9. Input: no departments; employee (8,3). Output: 8 | 3.",
    "difficulty": "Easy",
    "topic_tags": [
      "Database Design",
      "Foreign Keys",
      "Integrity"
    ],
    "constraints": [
      "NULL department_id is permitted and is not an orphan.",
      "An employee referencing an existing department is excluded.",
      "Return one row per invalid employee reference."
    ],
    "examples": [
      {
        "input": "departments: (1),(2); employees: (4,1),(5,9),(6,NULL)",
        "output": "5 | 9"
      },
      {
        "input": "departments: (no rows); employees: (8,3)",
        "output": "8 | 3"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT e.employee_id, e.department_id\nFROM employees AS e\nWHERE e.department_id IS NOT NULL\n  AND NOT EXISTS (SELECT 1 FROM departments AS d WHERE d.department_id = e.department_id)\nORDER BY e.employee_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "duplicate-composite-key-audit",
    "title": "Audit a Proposed Composite Primary Key",
    "problem_statement": "Schema: seat_assignments(event_id, attendee_id, seat_label, assigned_at TIMESTAMP). The proposed primary key is (event_id, attendee_id). Return duplicate key values and row_count where the key occurs more than once, ordered by key. Input: (1,5,A1,09:00),(1,5,A2,09:01),(1,6,A3,09:02). Output: 1 | 5 | 2. Input: (2,7,B1,08:00). Output: no rows.",
    "difficulty": "Easy",
    "topic_tags": [
      "Database Design",
      "Composite Keys",
      "Constraints"
    ],
    "constraints": [
      "The key under review is exactly (event_id, attendee_id).",
      "Different seat labels do not make a duplicate key valid.",
      "Do not include groups containing one row."
    ],
    "examples": [
      {
        "input": "seat_assignments: (1,5,A1,2026-01-01 09:00),(1,5,A2,2026-01-01 09:01),(1,6,A3,2026-01-01 09:02)",
        "output": "1 | 5 | 2"
      },
      {
        "input": "seat_assignments: (2,7,B1,2026-02-01 08:00)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT event_id, attendee_id, COUNT(*) AS row_count\nFROM seat_assignments\nGROUP BY event_id, attendee_id\nHAVING COUNT(*) > 1\nORDER BY event_id, attendee_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "department-address-update-anomaly",
    "title": "Find Conflicting Department Attributes",
    "problem_statement": "Schema: staff(employee_id PK, department_id, department_name, office_address). The functional dependency department_id -> (department_name, office_address) is intended. Return department_id groups where either dependent attribute has multiple distinct values; include the number of staff rows. Sort by department_id. Input: (1,7,Research,Room A),(2,7,Research,Room B),(3,8,Sales,Room C). Output: 7 | 2. Input: (4,9,Support,Room D),(5,9,Support,Room D). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Functional Dependencies",
      "Normalization"
    ],
    "constraints": [
      "Repeated rows consistent with a dependency are not violations.",
      "Either a name conflict or address conflict makes a department invalid.",
      "Count all staff rows in each violating department."
    ],
    "examples": [
      {
        "input": "staff: (1,7,Research,Room A),(2,7,Research,Room B),(3,8,Sales,Room C)",
        "output": "7 | 2"
      },
      {
        "input": "staff: (4,9,Support,Room D),(5,9,Support,Room D)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT department_id, COUNT(*) AS staff_rows\nFROM staff\nGROUP BY department_id\nHAVING COUNT(DISTINCT department_name) > 1\n    OR COUNT(DISTINCT office_address) > 1\nORDER BY department_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "unbalanced-double-entry-transactions",
    "title": "Locate Unbalanced Journal Transactions",
    "problem_statement": "Schema: journal_lines(transaction_id, account_id, debit DECIMAL, credit DECIMAL). A transaction is valid only when sum(debit) equals sum(credit). Return transaction_id, debit_total, credit_total for violations, ordered by transaction_id. Input: (1,10,20,0),(1,20,0,20),(2,10,5,0),(2,30,0,4). Output: 2 | 5.00 | 4.00. Input: (8,1,100,0),(8,2,0,100). Output: no rows.",
    "difficulty": "Easy",
    "topic_tags": [
      "Database Design",
      "Transactions",
      "Check Invariants"
    ],
    "constraints": [
      "Each transaction has at least two journal lines.",
      "Debit and credit values are nonnegative.",
      "A balanced transaction may use several debit and credit rows."
    ],
    "examples": [
      {
        "input": "journal_lines: (1,10,20,0),(1,20,0,20),(2,10,5,0),(2,30,0,4)",
        "output": "2 | 5.00 | 4.00"
      },
      {
        "input": "journal_lines: (8,1,100,0),(8,2,0,100)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT transaction_id, SUM(debit) AS debit_total, SUM(credit) AS credit_total\nFROM journal_lines\nGROUP BY transaction_id\nHAVING SUM(debit) <> SUM(credit)\nORDER BY transaction_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "duplicate-active-username-audit",
    "title": "Audit Active Usernames for a Partial Unique Index",
    "problem_statement": "Schema: users(user_id PK, username, deleted_at TIMESTAMP NULL). The design requires LOWER(username) to be unique only for active rows (deleted_at IS NULL). Return duplicate normalized active usernames with row_count, sorted by normalized username. Input: (1,Ada,NULL),(2,ADA,NULL),(3,ada,2026-01-01),(4,Bo,NULL). Output: ada | 2. Input: (8,Lin,NULL),(9,LIN,2026-02-01). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Partial Indexes",
      "Uniqueness"
    ],
    "constraints": [
      "Rows with deleted_at non-NULL do not participate in uniqueness.",
      "Comparison is case-insensitive.",
      "The query reports only violations; it does not modify user data."
    ],
    "examples": [
      {
        "input": "users: (1,Ada,NULL),(2,ADA,NULL),(3,ada,2026-01-01 00:00),(4,Bo,NULL)",
        "output": "ada | 2"
      },
      {
        "input": "users: (8,Lin,NULL),(9,LIN,2026-02-01 00:00)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT LOWER(username) AS normalized_username, COUNT(*) AS row_count\nFROM users\nWHERE deleted_at IS NULL\nGROUP BY LOWER(username)\nHAVING COUNT(*) > 1\nORDER BY normalized_username;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "invalid-reservation-intervals",
    "title": "Audit Reservation CHECK Constraint Violations",
    "problem_statement": "Schema: reservations(reservation_id PK, starts_at TIMESTAMP, ends_at TIMESTAMP). The intended CHECK constraint is ends_at > starts_at. Return invalid reservation_id values ascending. Input: (1,Jan 1 10:00,Jan 1 11:00),(2,Jan 2 12:00,Jan 2 12:00),(3,Jan 3 09:00,Jan 3 08:00) 2026. Output: 2; 3. Input: (8,Feb 1 00:00,Feb 2 00:00). Output: no rows.",
    "difficulty": "Easy",
    "topic_tags": [
      "Database Design",
      "Check Constraints",
      "Validation"
    ],
    "constraints": [
      "Both interval endpoints are non-NULL.",
      "An interval with equal start and end is invalid.",
      "Return only reservation_id."
    ],
    "examples": [
      {
        "input": "reservations: (1,2026-01-01 10:00,2026-01-01 11:00),(2,2026-01-02 12:00,2026-01-02 12:00),(3,2026-01-03 09:00,2026-01-03 08:00)",
        "output": "2\n3"
      },
      {
        "input": "reservations: (8,2026-02-01 00:00,2026-02-02 00:00)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT reservation_id\nFROM reservations\nWHERE ends_at <= starts_at\nORDER BY reservation_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "conflicting-ternary-relationship-facts",
    "title": "Find Conflicting Supplier-Part-Project Quotes",
    "problem_statement": "Schema: quotes(supplier_id, part_id, project_id, quoted_price DECIMAL). The ternary key (supplier_id,part_id,project_id) should determine one quoted price. Return key triples with multiple distinct prices and distinct_price_count, sorted by all key columns. Input: (1,4,9,10),(1,4,9,12),(1,5,9,8). Output: 1 | 4 | 9 | 2. Input: (2,7,3,5),(2,7,3,5). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Ternary Relationships",
      "Candidate Keys"
    ],
    "constraints": [
      "The key is the full three-attribute combination.",
      "Repeated identical quotes are not price conflicts.",
      "Compare distinct numeric prices, not row counts."
    ],
    "examples": [
      {
        "input": "quotes: (1,4,9,10),(1,4,9,12),(1,5,9,8)",
        "output": "1 | 4 | 9 | 2"
      },
      {
        "input": "quotes: (2,7,3,5),(2,7,3,5)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT supplier_id, part_id, project_id,\n       COUNT(DISTINCT quoted_price) AS distinct_price_count\nFROM quotes\nGROUP BY supplier_id, part_id, project_id\nHAVING COUNT(DISTINCT quoted_price) > 1\nORDER BY supplier_id, part_id, project_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "missing-employee-subtype-record",
    "title": "Find People Missing a Required Subtype Row",
    "problem_statement": "Schema: people(person_id PK, person_type); employees(person_id PK/FK, employee_no); contractors(person_id PK/FK, contract_end DATE). Every person of type employee requires one employees row and every contractor requires one contractors row. Return missing person_id and type. Input: people (1,employee),(2,contractor),(3,employee); employees (1,E1); contractors (2,2026-12-31). Output: 3 | employee. Input: people (8,contractor); no subtype rows. Output: 8 | contractor.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Subtype Modeling",
      "Integrity"
    ],
    "constraints": [
      "person_type is either employee or contractor.",
      "Subtype keys are also foreign keys to people.",
      "A row in the other subtype does not satisfy the required subtype."
    ],
    "examples": [
      {
        "input": "people: (1,employee),(2,contractor),(3,employee); employees: (1,E1); contractors: (2,2026-12-31)",
        "output": "3 | employee"
      },
      {
        "input": "people: (8,contractor); employees: (no rows); contractors: (no rows)",
        "output": "8 | contractor"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT p.person_id, p.person_type\nFROM people AS p\nWHERE (p.person_type = 'employee' AND NOT EXISTS (\n         SELECT 1 FROM employees AS e WHERE e.person_id = p.person_id))\n   OR (p.person_type = 'contractor' AND NOT EXISTS (\n         SELECT 1 FROM contractors AS c WHERE c.person_id = p.person_id))\nORDER BY p.person_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "employee-skill-project-coverage",
    "title": "Validate Project Assignments Against Required Skills",
    "problem_statement": "Schema: employee_skills(employee_id, skill); project_requirements(project_id, skill); employee_projects(employee_id, project_id). Return each assignment for which the employee lacks at least one skill required by that project. Return each employee/project pair once ordered by both ids. Input: skills (1,SQL),(1,Design),(2,SQL); requirements (8,SQL),(8,Design); assignments (1,8),(2,8). Output: 2 | 8. Input: skills (3,SQL); requirement (9,SQL); assignment (3,9). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Relational Division",
      "Integrity"
    ],
    "constraints": [
      "Skills and requirements are exact case-sensitive text matches.",
      "An assignment to a project with no requirements is valid.",
      "Multiple missing skills still produce one result row for an assignment."
    ],
    "examples": [
      {
        "input": "employee_skills: (1,SQL),(1,Design),(2,SQL); project_requirements: (8,SQL),(8,Design); employee_projects: (1,8),(2,8)",
        "output": "2 | 8"
      },
      {
        "input": "employee_skills: (3,SQL); project_requirements: (9,SQL); employee_projects: (3,9)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT ep.employee_id, ep.project_id\nFROM employee_projects AS ep\nWHERE EXISTS (\n  SELECT 1 FROM project_requirements AS r\n  WHERE r.project_id = ep.project_id\n    AND NOT EXISTS (\n      SELECT 1 FROM employee_skills AS s\n      WHERE s.employee_id = ep.employee_id AND s.skill = r.skill\n    )\n)\nORDER BY ep.employee_id, ep.project_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "composite-index-prefix-counts",
    "title": "Compare Composite Index Prefix Workloads",
    "problem_statement": "Schema: events(event_id PK, tenant_id, event_type, occurred_at TIMESTAMP). A composite index is proposed on (tenant_id,event_type,occurred_at). For every tenant return event_count and login_count (event_type = login), to compare the tenant-only prefix with the narrower predicate. Sort by tenant_id. Input: (1,1,login),(2,1,purchase),(3,1,login),(4,2,login). Output: 1 | 3 | 2; 2 | 1 | 1. Input: (5,8,logout). Output: 8 | 1 | 0.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Composite Indexes",
      "Workload Analysis"
    ],
    "constraints": [
      "Count event rows; event_id is unique.",
      "Include tenants even if they have no login event, but only tenants with events are represented.",
      "The event_type predicate is exact."
    ],
    "examples": [
      {
        "input": "events: (1,1,login,2026-01-01 00:00),(2,1,purchase,2026-01-02 00:00),(3,1,login,2026-01-03 00:00),(4,2,login,2026-01-04 00:00)",
        "output": "1 | 3 | 2\n2 | 1 | 1"
      },
      {
        "input": "events: (5,8,logout,2026-02-01 00:00)",
        "output": "8 | 1 | 0"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT tenant_id, COUNT(*) AS event_count,\n       SUM(CASE WHEN event_type = 'login' THEN 1 ELSE 0 END) AS login_count\nFROM events\nGROUP BY tenant_id\nORDER BY tenant_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "foreign-key-child-index-workload",
    "title": "Rank Authors by Referencing Book Rows",
    "problem_statement": "Schema: authors(author_id PK, name); books(book_id PK, author_id FK). Return every author and book_count including authors with none. Sort by count descending, then author_id. The result models a parent-delete/join workload for deciding whether to index books.author_id. Input: authors (1,A),(2,B),(3,C); books (1,1),(2,1),(3,1),(4,2). Output: 1 | A | 3; 2 | B | 1; 3 | C | 0. Input: author (8,D), no books. Output: 8 | D | 0.",
    "difficulty": "Easy",
    "topic_tags": [
      "Database Design",
      "Foreign Key Indexes",
      "Joins"
    ],
    "constraints": [
      "Every book has one author_id; authors may have zero books.",
      "Preserve authors with no referencing book.",
      "Tie-break equal counts with author_id ascending."
    ],
    "examples": [
      {
        "input": "authors: (1,A),(2,B),(3,C); books: (1,1),(2,1),(3,1),(4,2)",
        "output": "1 | A | 3\n2 | B | 1\n3 | C | 0"
      },
      {
        "input": "authors: (8,D); books: (no rows)",
        "output": "8 | D | 0"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT a.author_id, a.name, COUNT(b.book_id) AS book_count\nFROM authors AS a\nLEFT JOIN books AS b ON b.author_id = a.author_id\nGROUP BY a.author_id, a.name\nORDER BY book_count DESC, a.author_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "unbalanced-transaction-batches",
    "title": "Detect Partially Failed Transfer Batches",
    "problem_statement": "Schema: transfers(transfer_id PK, batch_id, status, amount DECIMAL). A batch is atomic only if it cannot contain both committed and failed transfers. Return batch_id, committed_count, and failed_count for mixed batches, sorted by batch_id. Input: (1,4,committed,10),(2,4,failed,5),(3,5,committed,8). Output: 4 | 1 | 1. Input: (8,9,committed,2),(9,9,committed,3). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Transactions",
      "Atomicity"
    ],
    "constraints": [
      "Other statuses such as pending do not constitute a committed/failed conflict.",
      "Count transfer rows, not amounts.",
      "Each batch_id has one or more transfer rows."
    ],
    "examples": [
      {
        "input": "transfers: (1,4,committed,10),(2,4,failed,5),(3,5,committed,8)",
        "output": "4 | 1 | 1"
      },
      {
        "input": "transfers: (8,9,committed,2),(9,9,committed,3)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT batch_id,\n       SUM(CASE WHEN status = 'committed' THEN 1 ELSE 0 END) AS committed_count,\n       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count\nFROM transfers\nGROUP BY batch_id\nHAVING SUM(CASE WHEN status = 'committed' THEN 1 ELSE 0 END) > 0\n   AND SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) > 0\nORDER BY batch_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "nonnegative-account-balance-invariant",
    "title": "Find Accounts Violating the Balance Invariant",
    "problem_statement": "Schema: accounts(account_id PK, opening_balance DECIMAL); entries(entry_id PK, account_id FK, amount DECIMAL). The invariant requires opening_balance plus all posted entries to be nonnegative at the end of the ledger. Return account_id and computed balance for negative balances, including accounts with no entries. Sort by account_id. Input: accounts (1,10),(2,3); entries (1,1,-4),(2,2,-5). Output: 2 | -2.00. Input: account (8,0), no entries. Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Transactions",
      "Consistency Constraints"
    ],
    "constraints": [
      "Amounts may be positive, negative, or zero; only the ending balance is checked.",
      "Every entry belongs to an account.",
      "Do not drop an account because it has no ledger entries."
    ],
    "examples": [
      {
        "input": "accounts: (1,10),(2,3); entries: (1,1,-4),(2,2,-5)",
        "output": "2 | -2.00"
      },
      {
        "input": "accounts: (8,0); entries: (no rows)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT a.account_id,\n       a.opening_balance + COALESCE(SUM(e.amount), 0) AS balance\nFROM accounts AS a\nLEFT JOIN entries AS e ON e.account_id = a.account_id\nGROUP BY a.account_id, a.opening_balance\nHAVING a.opening_balance + COALESCE(SUM(e.amount), 0) < 0\nORDER BY a.account_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "two-transaction-deadlock-cycle",
    "title": "Find Two-Transaction Deadlock Cycles",
    "problem_statement": "Schema: waits(waiting_tx, blocking_tx), directed edges meaning one transaction is waiting for another. Return each unordered pair where both transactions wait on each other, with smaller transaction id first. Ignore self-waits and sort by ids. Input: (1,2),(2,1),(3,4). Output: 1 | 2. Input: (8,9),(9,10). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Transactions",
      "Deadlocks"
    ],
    "constraints": [
      "The input may contain repeated wait edges.",
      "A mutual pair is reported once, not once per direction.",
      "A self-edge does not form the requested two-transaction cycle."
    ],
    "examples": [
      {
        "input": "waits: (1,2),(2,1),(3,4)",
        "output": "1 | 2"
      },
      {
        "input": "waits: (8,9),(9,10)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT DISTINCT w1.waiting_tx AS tx_low, w1.blocking_tx AS tx_high\nFROM waits AS w1\nJOIN waits AS w2\n  ON w2.waiting_tx = w1.blocking_tx\n AND w2.blocking_tx = w1.waiting_tx\nWHERE w1.waiting_tx < w1.blocking_tx\nORDER BY tx_low, tx_high;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "temporal-price-overlap-audit",
    "title": "Audit Overlapping Product Version Periods",
    "problem_statement": "Schema: product_versions(product_id, version_no, valid_from DATE, valid_to DATE NULL), where intervals are half-open [valid_from, valid_to); NULL valid_to means infinity. Return overlapping version pairs for the same product once, with product_id and ordered version numbers. Input: (1,1,Jan 1,Feb 1),(1,2,Jan 15,Mar 1),(1,3,Mar 1,NULL). Output: 1 | 1 | 2. Input: (8,1,Jan 1,Feb 1),(8,2,Feb 1,NULL). Output: no rows.",
    "difficulty": "Hard",
    "topic_tags": [
      "Database Design",
      "Temporal Data",
      "Integrity"
    ],
    "constraints": [
      "A NULL valid_to endpoint is unbounded above.",
      "Intervals that only touch at an endpoint do not overlap.",
      "Do not pair a version with itself."
    ],
    "examples": [
      {
        "input": "product_versions: (1,1,2026-01-01,2026-02-01),(1,2,2026-01-15,2026-03-01),(1,3,2026-03-01,NULL)",
        "output": "1 | 1 | 2"
      },
      {
        "input": "product_versions: (8,1,2026-01-01,2026-02-01),(8,2,2026-02-01,NULL)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT a.product_id, a.version_no AS version_a, b.version_no AS version_b\nFROM product_versions AS a\nJOIN product_versions AS b\n  ON b.product_id = a.product_id AND a.version_no < b.version_no\n AND (b.valid_to IS NULL OR a.valid_from < b.valid_to)\n AND (a.valid_to IS NULL OR b.valid_from < a.valid_to)\nORDER BY a.product_id, version_a, version_b;"
    },
    "points": 200
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "hierarchical-category-path",
    "title": "Construct Root-to-Node Category Paths",
    "problem_statement": "Schema: categories(category_id PK, parent_id NULL FK, name); hierarchy is a forest without cycles. For every category, return category_id and slash-separated root-to-node name path, ordered by category_id. Input: (1,NULL,Home),(2,1,Tools),(3,2,Hand),(4,NULL,Books). Output: 1 | Home; 2 | Home/Tools; 3 | Home/Tools/Hand; 4 | Books. Input: (8,NULL,Root),(9,8,Leaf). Output: 8 | Root; 9 | Root/Leaf.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Recursive CTEs",
      "Hierarchies"
    ],
    "constraints": [
      "Each node has at most one parent.",
      "Names contain no slash characters.",
      "The hierarchy is acyclic and every parent exists."
    ],
    "examples": [
      {
        "input": "categories: (1,NULL,Home),(2,1,Tools),(3,2,Hand),(4,NULL,Books)",
        "output": "1 | Home\n2 | Home/Tools\n3 | Home/Tools/Hand\n4 | Books"
      },
      {
        "input": "categories: (8,NULL,Root),(9,8,Leaf)",
        "output": "8 | Root\n9 | Root/Leaf"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH RECURSIVE paths AS (\n  SELECT category_id, parent_id, name, name AS full_path\n  FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.category_id, c.parent_id, c.name, p.full_path || '/' || c.name\n  FROM categories AS c JOIN paths AS p ON c.parent_id = p.category_id\n)\nSELECT category_id, full_path FROM paths ORDER BY category_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "duplicate-natural-product-key",
    "title": "Audit Vendor Product Natural Keys",
    "problem_statement": "Schema: products(product_id PK, vendor_id, vendor_sku, description). The natural key is (vendor_id,vendor_sku). Return duplicate key groups, row_count, and distinct_description_count, sorted by natural key. Input: (1,2,X1,Widget),(2,2,X1,Widget),(3,2,X2,Gadget). Output: 2 | X1 | 2 | 1. Input: (4,8,Z9,Part),(5,8,Z9,Alternate Part). Output: 8 | Z9 | 2 | 2.",
    "difficulty": "Medium",
    "topic_tags": [
      "Database Design",
      "Natural Keys",
      "Data Quality"
    ],
    "constraints": [
      "Surrogate product_id values do not determine natural-key uniqueness.",
      "Descriptions may conflict within a duplicate natural key.",
      "Count distinct descriptions separately from duplicate rows."
    ],
    "examples": [
      {
        "input": "products: (1,2,X1,Widget),(2,2,X1,Widget),(3,2,X2,Gadget)",
        "output": "2 | X1 | 2 | 1"
      },
      {
        "input": "products: (4,8,Z9,Part),(5,8,Z9,Alternate Part)",
        "output": "8 | Z9 | 2 | 2"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT vendor_id, vendor_sku, COUNT(*) AS row_count,\n       COUNT(DISTINCT description) AS description_count\nFROM products\nGROUP BY vendor_id, vendor_sku\nHAVING COUNT(*) > 1\nORDER BY vendor_id, vendor_sku;"
    },
    "points": 150
  },
  {
    "collection_slug": "dbms-database-design",
    "slug": "audit-history-sequence-gaps",
    "title": "Find Missing Audit Sequence Numbers",
    "problem_statement": "Schema: audit_log(entity_id, sequence_no INT, changed_at TIMESTAMP). Sequence numbers should be contiguous within each entity. Return missing sequence_no strictly between each entity's stored minimum and maximum, ordered by entity and sequence. Input: (1,1),(1,2),(1,5),(2,7),(2,9). Output: 1 | 3; 1 | 4; 2 | 8. Input: (8,3),(8,4). Output: no rows.",
    "difficulty": "Hard",
    "topic_tags": [
      "Database Design",
      "Audit Logs",
      "Recursive CTEs"
    ],
    "constraints": [
      "sequence_no is positive and unique within entity_id.",
      "Do not report values below the minimum or above the maximum.",
      "An entity with consecutive values contributes no rows."
    ],
    "examples": [
      {
        "input": "audit_log: (1,1,2026-01-01),(1,2,2026-01-02),(1,5,2026-01-05),(2,7,2026-01-01),(2,9,2026-01-03)",
        "output": "1 | 3\n1 | 4\n2 | 8"
      },
      {
        "input": "audit_log: (8,3,2026-02-01),(8,4,2026-02-02)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH RECURSIVE bounds AS (\n  SELECT entity_id, MIN(sequence_no) AS min_no, MAX(sequence_no) AS max_no\n  FROM audit_log GROUP BY entity_id\n), sequence(entity_id, sequence_no, max_no) AS (\n  SELECT entity_id, min_no + 1, max_no FROM bounds WHERE min_no < max_no\n  UNION ALL\n  SELECT entity_id, sequence_no + 1, max_no FROM sequence WHERE sequence_no + 1 < max_no\n)\nSELECT s.entity_id, s.sequence_no\nFROM sequence AS s\nWHERE NOT EXISTS (\n  SELECT 1 FROM audit_log AS a\n  WHERE a.entity_id = s.entity_id AND a.sequence_no = s.sequence_no\n)\nORDER BY s.entity_id, s.sequence_no;"
    },
    "points": 200
  }
]
$seed$::jsonb) as seed(
  collection_slug text, slug text, title text, problem_statement text, difficulty text,
  topic_tags text[], constraints jsonb, examples jsonb, starter_code_by_language jsonb, points integer
);

do $$
begin
  if (select count(*) from coding_question_seed) <> 20
     or (select count(distinct slug) from coding_question_seed) <> 20
     or (select count(distinct title) from coding_question_seed) <> 20 then
    raise exception 'Expected exactly 20 distinct DBMS design questions';
  end if;
  if exists (
    select 1 from coding_question_seed
    where collection_slug <> 'dbms-database-design'
       or btrim(slug) = '' or btrim(title) = '' or length(problem_statement) < 150
       or problem_statement not like 'Schema:%'
       or difficulty not in ('Easy','Medium','Hard') or cardinality(topic_tags) < 2
       or jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) < 2
       or jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2
       or jsonb_typeof(starter_code_by_language) <> 'object'
       or starter_code_by_language <> jsonb_build_object('SQL', starter_code_by_language ->> 'SQL')
       or length(starter_code_by_language ->> 'SQL') < 35
       or points not in (100,150,200)
       or (examples -> 0 ->> 'input') = (examples -> 1 ->> 'input')
       or (examples -> 0 ->> 'output') = (examples -> 1 ->> 'output')
       or problem_statement ilike '%placeholder%'
       or starter_code_by_language ->> 'SQL' ilike '%TODO%'
       or starter_code_by_language ->> 'SQL' ilike '%placeholder%'
       or exists (
         select 1
         from jsonb_array_elements(examples) as example(value)
         where btrim(example.value ->> 'input') = ''
            or btrim(example.value ->> 'output') = ''
            or lower(btrim(example.value ->> 'output')) in ('[]','null','[null]')
       )
  ) then
    raise exception 'DBMS design seed failed completeness, SQL-only, or example quality checks';
  end if;
  if not exists (select 1 from public.coding_test_sets where slug = 'dbms-database-design') then
    raise exception 'Missing DBMS design collection';
  end if;
end;
$$;

with collection_map as (
  select id from public.coding_test_sets where slug = 'dbms-database-design'
), question_rows as (
  select seed.*, collection_map.id as collection_id,
         coalesce((select max(q.question_order) from public.coding_questions q
                   where q.collection_id = collection_map.id), 0)
           + row_number() over (order by seed.slug)::integer as question_order
  from coding_question_seed seed cross join collection_map
)
insert into public.coding_questions (
  collection_id, slug, title, problem_statement, difficulty, topic_tags, constraints,
  examples, starter_code_by_language, points, publication_status, question_order
)
select collection_id, slug, title, problem_statement, difficulty, topic_tags, constraints,
       examples, starter_code_by_language, points, 'published', question_order
from question_rows
on conflict (collection_id, slug) do nothing;

insert into public.coding_test_cases (question_id, case_order, test_input, expected_output, visibility)
select question.id, example.ordinality::integer, example.value ->> 'input',
       example.value ->> 'output', 'visible'
from coding_question_seed seed
join public.coding_test_sets collection on collection.slug = seed.collection_slug
join public.coding_questions question
  on question.collection_id = collection.id and question.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples)
  with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

commit;
