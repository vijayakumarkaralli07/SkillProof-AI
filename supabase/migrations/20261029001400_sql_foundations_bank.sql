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
    "collection_slug": "sql-database-foundations",
    "slug": "weekly-refund-rate",
    "title": "Weekly Refund Rate by Order Week",
    "problem_statement": "Schema: orders(order_id PK, placed_on DATE, amount DECIMAL); refunds(refund_id PK, order_id FK, refunded_amount DECIMAL). For every ISO week containing an order, report Monday week_start, order_amount, refunded_amount, and refund_rate. Attribute each refund to its order's week; return zero refunded amount when none exist. Sort by week_start. Examples: Input: orders (1,2026-04-06,100),(2,2026-04-08,50); refunds (11,1,20). Output: 2026-04-06 | 150.00 | 20.00 | 0.1333. Input: orders (3,2026-04-13,80); refunds none. Output: 2026-04-13 | 80.00 | 0.00 | 0.0000.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Joins",
      "Aggregation",
      "Dates"
    ],
    "constraints": [
      "Each refund references one order.",
      "Aggregate orders and refunds independently to avoid multiplying amounts when an order has multiple refunds.",
      "Use Monday as the week start; round refund_rate to four decimal places.",
      "Every weekly order_amount is positive, so refund_rate has a defined denominator."
    ],
    "examples": [
      {
        "input": "orders: (1,2026-04-06,100),(2,2026-04-08,50); refunds: (11,1,20)",
        "output": "2026-04-06 | 150.00 | 20.00 | 0.1333"
      },
      {
        "input": "orders: (3,2026-04-13,80); refunds: (no rows)",
        "output": "2026-04-13 | 80.00 | 0.00 | 0.0000"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH order_totals AS (\n  SELECT DATE_TRUNC('week', placed_on)::date AS week_start, SUM(amount) AS order_amount\n  FROM orders GROUP BY DATE_TRUNC('week', placed_on)::date\n), refund_totals AS (\n  SELECT DATE_TRUNC('week', o.placed_on)::date AS week_start, SUM(r.refunded_amount) AS refunded_amount\n  FROM orders AS o JOIN refunds AS r ON r.order_id = o.order_id\n  GROUP BY DATE_TRUNC('week', o.placed_on)::date\n)\nSELECT o.week_start, o.order_amount, COALESCE(r.refunded_amount, 0) AS refunded_amount,\n       ROUND(COALESCE(r.refunded_amount, 0) / NULLIF(o.order_amount, 0), 4) AS refund_rate\nFROM order_totals AS o LEFT JOIN refund_totals AS r ON r.week_start = o.week_start\nORDER BY o.week_start;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "orders-above-customer-average",
    "title": "Orders Above Their Customer Average",
    "problem_statement": "Schema: orders(order_id PK, customer_id, ordered_at DATE, total DECIMAL). Return order_id and total for each order whose total is strictly greater than that customer's average total. Sort by order_id. Input: (1,4,2026-01-01,10),(2,4,2026-01-02,30),(3,4,2026-01-03,20). Output: 2 | 30.00. Input: (8,9,2026-02-01,5),(9,9,2026-02-02,5). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Subqueries",
      "Aggregation"
    ],
    "constraints": [
      "Calculate the comparison average separately for each customer.",
      "An order equal to its customer's average does not qualify.",
      "Return each qualifying order once."
    ],
    "examples": [
      {
        "input": "orders: (1,4,2026-01-01,10),(2,4,2026-01-02,30),(3,4,2026-01-03,20)",
        "output": "2 | 30.00"
      },
      {
        "input": "orders: (8,9,2026-02-01,5),(9,9,2026-02-02,5)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT order_id, total\nFROM orders AS o\nWHERE total > (SELECT AVG(i.total) FROM orders AS i WHERE i.customer_id = o.customer_id)\nORDER BY order_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "daily-active-subscribers",
    "title": "Daily Active Subscribers Including Zero Days",
    "problem_statement": "Schema: calendar_days(day DATE PK); subscriptions(subscription_id PK, customer_id, starts_on DATE, ends_on DATE NULL). For each calendar day, count distinct customers with starts_on <= day and (ends_on is NULL or ends_on >= day). Include days with zero active subscribers; sort by day. Input: days Jan 1,2,3 2026; subscriptions (1,5,Jan 1,Jan 2),(2,7,Jan 2,NULL). Output: Jan 1 | 1; Jan 2 | 2; Jan 3 | 1. Input: days Feb 1,2; no subscriptions. Output: Feb 1 | 0; Feb 2 | 0.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Date Ranges",
      "Outer Joins"
    ],
    "constraints": [
      "Subscription end dates are inclusive.",
      "The calendar_days table defines exactly which dates to return.",
      "Count a customer only once per day even if multiple subscriptions overlap."
    ],
    "examples": [
      {
        "input": "calendar_days: (2026-01-01),(2026-01-02),(2026-01-03); subscriptions: (1,5,2026-01-01,2026-01-02),(2,7,2026-01-02,NULL)",
        "output": "2026-01-01 | 1\n2026-01-02 | 2\n2026-01-03 | 1"
      },
      {
        "input": "calendar_days: (2026-02-01),(2026-02-02); subscriptions: (no rows)",
        "output": "2026-02-01 | 0\n2026-02-02 | 0"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT d.day, COUNT(DISTINCT s.customer_id) AS active_customers\nFROM calendar_days AS d\nLEFT JOIN subscriptions AS s\n  ON s.starts_on <= d.day AND (s.ends_on IS NULL OR s.ends_on >= d.day)\nGROUP BY d.day\nORDER BY d.day;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "latest-status-per-ticket",
    "title": "Latest Status for Every Ticket",
    "problem_statement": "Schema: ticket_events(event_id PK, ticket_id, changed_at TIMESTAMP, status). Return the latest status row per ticket. For tied changed_at, select the greatest event_id. Return ticket_id and status ordered by ticket_id. Input: (1,3,09:00,open),(2,3,10:00,waiting),(3,3,10:00,closed),(4,8,08:00,open) on Jan 1, 2026. Output: 3 | closed; 8 | open. Input: (10,1,12:00,open) on Feb 1. Output: 1 | open.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Ranking"
    ],
    "constraints": [
      "A ticket has at least one event.",
      "The tie-breaker is event_id descending after changed_at descending.",
      "Return exactly one row per ticket."
    ],
    "examples": [
      {
        "input": "ticket_events: (1,3,2026-01-01 09:00,open),(2,3,2026-01-01 10:00,waiting),(3,3,2026-01-01 10:00,closed),(4,8,2026-01-01 08:00,open)",
        "output": "3 | closed\n8 | open"
      },
      {
        "input": "ticket_events: (10,1,2026-02-01 12:00,open)",
        "output": "1 | open"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT ticket_id, status\nFROM (\n  SELECT ticket_id, status,\n         ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY changed_at DESC, event_id DESC) AS rn\n  FROM ticket_events\n) AS ranked\nWHERE rn = 1\nORDER BY ticket_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "inventory-below-reorder",
    "title": "Inventory Reorder Shortfalls",
    "problem_statement": "Schema: inventory(sku, warehouse_id, on_hand INT, reorder_at INT), primary key (sku, warehouse_id). Return sku, warehouse_id and shortage = reorder_at - on_hand only where on_hand < reorder_at. Sort by sku and warehouse_id. Input: (A1,1,2,5),(A1,2,8,5),(B2,1,0,1). Output: A1 | 1 | 3; B2 | 1 | 1. Input: (C3,4,3,3). Output: no rows.",
    "difficulty": "Easy",
    "topic_tags": [
      "SQL",
      "Filtering",
      "Expressions"
    ],
    "constraints": [
      "Both quantity columns are nonnegative integers.",
      "Equality to reorder_at is not a shortfall.",
      "Return one row per qualifying warehouse SKU."
    ],
    "examples": [
      {
        "input": "inventory: (A1,1,2,5),(A1,2,8,5),(B2,1,0,1)",
        "output": "A1 | 1 | 3\nB2 | 1 | 1"
      },
      {
        "input": "inventory: (C3,4,3,3)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT sku, warehouse_id, reorder_at - on_hand AS shortage\nFROM inventory\nWHERE on_hand < reorder_at\nORDER BY sku, warehouse_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "employees-with-no-direct-reports",
    "title": "Employees Without Direct Reports",
    "problem_statement": "Schema: employees(employee_id PK, full_name, manager_id NULL FK to employees). Return employee_id and full_name for employees never referenced as another employee's manager_id. Sort by employee_id. Input: (1,Ana,NULL),(2,Bo,1),(3,Cy,1),(4,De,2). Output: 3 | Cy; 4 | De. Input: (8,Eli,NULL). Output: 8 | Eli.",
    "difficulty": "Easy",
    "topic_tags": [
      "SQL",
      "Self Joins",
      "Anti Joins"
    ],
    "constraints": [
      "The manager_id may be NULL for top-level employees.",
      "An employee with one or more direct reports is excluded regardless of their own manager.",
      "Do not exclude employees merely because manager_id is NULL."
    ],
    "examples": [
      {
        "input": "employees: (1,Ana,NULL),(2,Bo,1),(3,Cy,1),(4,De,2)",
        "output": "3 | Cy\n4 | De"
      },
      {
        "input": "employees: (8,Eli,NULL)",
        "output": "8 | Eli"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT e.employee_id, e.full_name\nFROM employees AS e\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees AS report\n  WHERE report.manager_id = e.employee_id\n)\nORDER BY e.employee_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "running-account-balance",
    "title": "Running Ledger Balance per Account",
    "problem_statement": "Schema: ledger(entry_id PK, account_id, posted_at TIMESTAMP, amount DECIMAL). Return entry_id, account_id, and balance_after, summing amounts from the beginning of each account's ledger through that row. Within an account order by posted_at then entry_id; sort final output by account_id and the same sequence. Input: (1,2,Jan 1 10:00,10),(2,2,Jan 2 10:00,-3),(3,5,Jan 1 09:00,7). Output: 1 | 2 | 10.00; 2 | 2 | 7.00; 3 | 5 | 7.00. Input: (4,1,Feb 1,-2),(5,1,Feb 1,9), both at midnight. Output: 4 | 1 | -2.00; 5 | 1 | 7.00.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Running Totals"
    ],
    "constraints": [
      "Each amount is signed and every account has at least one ledger row.",
      "entry_id uniquely breaks timestamp ties.",
      "Use a row-based cumulative sum ordered by posted_at and entry_id."
    ],
    "examples": [
      {
        "input": "ledger: (1,2,2026-01-01 10:00,10),(2,2,2026-01-02 10:00,-3),(3,5,2026-01-01 09:00,7)",
        "output": "1 | 2 | 10.00\n2 | 2 | 7.00\n3 | 5 | 7.00"
      },
      {
        "input": "ledger: (4,1,2026-02-01 00:00,-2),(5,1,2026-02-01 00:00,9)",
        "output": "4 | 1 | -2.00\n5 | 1 | 7.00"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT entry_id, account_id,\n       SUM(amount) OVER (PARTITION BY account_id ORDER BY posted_at, entry_id ROWS UNBOUNDED PRECEDING) AS balance_after\nFROM ledger\nORDER BY account_id, posted_at, entry_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "top-two-products-per-store",
    "title": "Top Two Products per Store",
    "problem_statement": "Schema: sales(store_id, product_id, units INT); multiple rows may exist per store/product. Aggregate units by store/product, then return up to two products per store ranked by total units descending and product_id ascending. Return store_id, product_id, units. Input: (1,8,4),(1,3,7),(1,2,7),(2,5,3). Output: 1 | 2 | 7; 1 | 3 | 7; 2 | 5 | 3. Input: (4,9,1),(4,9,2),(4,7,2). Output: 4 | 7 | 2; 4 | 9 | 3.",
    "difficulty": "Hard",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Top N"
    ],
    "constraints": [
      "Aggregate duplicate store/product sales before ranking.",
      "Return at most two products per store.",
      "Ties in total units are broken by product_id ascending."
    ],
    "examples": [
      {
        "input": "sales: (1,8,4),(1,3,7),(1,2,7),(2,5,3)",
        "output": "1 | 2 | 7\n1 | 3 | 7\n2 | 5 | 3"
      },
      {
        "input": "sales: (4,9,1),(4,9,2),(4,7,2)",
        "output": "4 | 7 | 2\n4 | 9 | 3"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH product_totals AS (\n  SELECT store_id, product_id, SUM(units) AS units\n  FROM sales\n  GROUP BY store_id, product_id\n), ranked AS (\n  SELECT product_totals.*,\n         ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY units DESC, product_id) AS rn\n  FROM product_totals\n)\nSELECT store_id, product_id, units FROM ranked WHERE rn <= 2;"
    },
    "points": 200
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "orders-containing-required-skus",
    "title": "Orders Containing Every Required SKU",
    "problem_statement": "Schema: order_lines(order_id, sku); required_skus(sku). Return order_id values whose order contains every SKU in required_skus. If required_skus is empty, every order_id appearing in order_lines qualifies. Sort ascending. Input: lines (1,A),(1,B),(2,A),(3,A),(3,B),(3,C); required (A),(B). Output: 1; 3. Input: lines (4,X),(5,Y); required (Z). Output: no rows.",
    "difficulty": "Hard",
    "topic_tags": [
      "SQL",
      "Relational Division",
      "Subqueries"
    ],
    "constraints": [
      "Duplicate order_lines do not change whether an order qualifies.",
      "Orders are drawn from order_lines; there is no separate orders table.",
      "An order with no line cannot be returned."
    ],
    "examples": [
      {
        "input": "order_lines: (1,A),(1,B),(2,A),(3,A),(3,B),(3,C); required_skus: (A),(B)",
        "output": "1\n3"
      },
      {
        "input": "order_lines: (4,X),(5,Y); required_skus: (Z)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT DISTINCT candidate.order_id\nFROM order_lines AS candidate\nWHERE NOT EXISTS (\n  SELECT 1 FROM required_skus AS required\n  WHERE NOT EXISTS (\n    SELECT 1 FROM order_lines AS matching\n    WHERE matching.order_id = candidate.order_id AND matching.sku = required.sku\n  )\n)\nORDER BY candidate.order_id;"
    },
    "points": 200
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "overlapping-price-effective-dates",
    "title": "Detect Overlapping Product Price Periods",
    "problem_statement": "Schema: price_history(price_id PK, product_id, valid_from DATE, valid_to DATE), where both interval endpoints are inclusive. Return each pair of price_id values for the same product whose date ranges overlap; emit smaller id first. Sort by product_id and ids. Input: (1,7,Jan 1,Jan 10),(2,7,Jan 10,Jan 20),(3,7,Jan 21,Jan 30). Output: 7 | 1 | 2. Input: (4,2,Feb 1,Feb 5),(5,2,Feb 6,Feb 9). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Self Joins",
      "Date Ranges"
    ],
    "constraints": [
      "valid_to is not earlier than valid_from.",
      "Touching at an inclusive endpoint counts as overlap.",
      "A row must not pair with itself; each pair is emitted once."
    ],
    "examples": [
      {
        "input": "price_history: (1,7,2026-01-01,2026-01-10),(2,7,2026-01-10,2026-01-20),(3,7,2026-01-21,2026-01-30)",
        "output": "7 | 1 | 2"
      },
      {
        "input": "price_history: (4,2,2026-02-01,2026-02-05),(5,2,2026-02-06,2026-02-09)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT a.product_id, a.price_id AS first_price_id, b.price_id AS second_price_id\nFROM price_history AS a\nJOIN price_history AS b\n  ON b.product_id = a.product_id AND a.price_id < b.price_id\n AND a.valid_from <= b.valid_to AND b.valid_from <= a.valid_to\nORDER BY a.product_id, first_price_id, second_price_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "deduplicated-event-stream",
    "title": "Choose the Canonical Event per External Key",
    "problem_statement": "Schema: events(event_id PK, external_key, received_at TIMESTAMP, payload). For each external_key return payload from the row with greatest received_at; break ties by greatest event_id. Sort by external_key. Input: (1,x,Jan 1 10:00,old),(2,x,Jan 1 11:00,new),(3,y,Jan 1 09:00,only). Output: x | new; y | only. Input: (8,z,Feb 1 00:00,a),(9,z,Feb 1 00:00,b). Output: z | b.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Deduplication"
    ],
    "constraints": [
      "external_key and received_at are non-NULL.",
      "There may be any number of duplicate keys.",
      "Select one deterministic source row, not an aggregate payload."
    ],
    "examples": [
      {
        "input": "events: (1,x,2026-01-01 10:00,old),(2,x,2026-01-01 11:00,new),(3,y,2026-01-01 09:00,only)",
        "output": "x | new\ny | only"
      },
      {
        "input": "events: (8,z,2026-02-01 00:00,a),(9,z,2026-02-01 00:00,b)",
        "output": "z | b"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT external_key, payload\nFROM (\n  SELECT external_key, payload,\n         ROW_NUMBER() OVER (PARTITION BY external_key ORDER BY received_at DESC, event_id DESC) AS rn\n  FROM events\n) AS ranked\nWHERE rn = 1\nORDER BY external_key;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "department-payroll-share",
    "title": "Department Share of Total Payroll",
    "problem_statement": "Schema: employees(employee_id PK, department_id, salary DECIMAL). Return department_id, payroll, and percent_of_payroll for each department, with percentage rounded to two decimals. Sort by department_id. Input: employees (1,10,100),(2,10,300),(3,20,100). Output: 10 | 400.00 | 80.00; 20 | 100.00 | 20.00. Input: (4,7,25). Output: 7 | 25.00 | 100.00.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Aggregation",
      "Window Functions"
    ],
    "constraints": [
      "Salary is nonnegative and total payroll is greater than zero.",
      "Departments are those represented by at least one employee.",
      "Avoid integer division when computing percentages."
    ],
    "examples": [
      {
        "input": "employees: (1,10,100),(2,10,300),(3,20,100)",
        "output": "10 | 400.00 | 80.00\n20 | 100.00 | 20.00"
      },
      {
        "input": "employees: (4,7,25)",
        "output": "7 | 25.00 | 100.00"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH department_payroll AS (\n  SELECT department_id, SUM(salary) AS payroll\n  FROM employees GROUP BY department_id\n)\nSELECT department_id, payroll,\n       100.0 * payroll / SUM(payroll) OVER () AS percent_of_payroll\nFROM department_payroll\nORDER BY department_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "monthly-customer-spend-streak",
    "title": "Longest Consecutive Positive-Spend Month Streak",
    "problem_statement": "Schema: monthly_spend(customer_id, month_start DATE, amount DECIMAL), with one row per customer/month. Return each customer and their longest run of consecutive calendar months with amount > 0. A missing month or zero amount breaks the streak. Sort by customer_id. Input: (1,Jan 2026,2),(1,Feb,4),(1,Apr,1),(2,Jan,0),(2,Feb,8). Output: 1 | 2; 2 | 1. Input: (9,Jan,1),(9,Mar,1). Output: 9 | 1.",
    "difficulty": "Hard",
    "topic_tags": [
      "SQL",
      "Gaps and Islands",
      "Dates"
    ],
    "constraints": [
      "month_start is always the first day of its month.",
      "Each customer/month occurs at most once.",
      "Customers with only zero-spend rows still have a longest streak of zero."
    ],
    "examples": [
      {
        "input": "monthly_spend: (1,2026-01-01,2),(1,2026-02-01,4),(1,2026-04-01,1),(2,2026-01-01,0),(2,2026-02-01,8)",
        "output": "1 | 2\n2 | 1"
      },
      {
        "input": "monthly_spend: (9,2026-01-01,0),(9,2026-02-01,0),(10,2026-01-01,1)",
        "output": "9 | 0\n10 | 1"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH positive_months AS (\n  SELECT customer_id, month_start,\n         EXTRACT(YEAR FROM month_start) * 12 + EXTRACT(MONTH FROM month_start)\n           - ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY month_start) AS island\n  FROM monthly_spend WHERE amount > 0\n), streaks AS (\n  SELECT customer_id, island, COUNT(*) AS run_length\n  FROM positive_months GROUP BY customer_id, island\n)\nSELECT all_customers.customer_id, COALESCE(MAX(streaks.run_length), 0) AS longest_streak\nFROM (SELECT DISTINCT customer_id FROM monthly_spend) AS all_customers\nLEFT JOIN streaks ON streaks.customer_id = all_customers.customer_id\nGROUP BY all_customers.customer_id\nORDER BY all_customers.customer_id;"
    },
    "points": 200
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "unpaid-invoice-balances",
    "title": "Invoices With Outstanding Balances",
    "problem_statement": "Schema: invoices(invoice_id PK, customer_id, invoice_total DECIMAL); payments(payment_id PK, invoice_id FK, amount DECIMAL). Return invoice_id, customer_id, and positive outstanding balance after summing payments. Include invoices with no payments; omit fully paid or overpaid invoices. Sort by invoice_id. Input: invoices (1,3,100),(2,3,40); payments (1,1,60),(2,2,40). Output: 1 | 3 | 40.00. Input: invoice (8,2,25); no payments. Output: 8 | 2 | 25.00.",
    "difficulty": "Easy",
    "topic_tags": [
      "SQL",
      "Left Joins",
      "Aggregation"
    ],
    "constraints": [
      "Payment amounts are nonnegative.",
      "Every payment references one invoice.",
      "Do not turn the outer join into an inner join when filtering outstanding balances."
    ],
    "examples": [
      {
        "input": "invoices: (1,3,100),(2,3,40); payments: (1,1,60),(2,2,40)",
        "output": "1 | 3 | 40.00"
      },
      {
        "input": "invoices: (8,2,25); payments: (no rows)",
        "output": "8 | 2 | 25.00"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT i.invoice_id, i.customer_id,\n       i.invoice_total - COALESCE(SUM(p.amount), 0) AS balance\nFROM invoices AS i\nLEFT JOIN payments AS p ON p.invoice_id = i.invoice_id\nGROUP BY i.invoice_id, i.customer_id, i.invoice_total\nHAVING i.invoice_total > COALESCE(SUM(p.amount), 0)\nORDER BY i.invoice_id;"
    },
    "points": 100
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "three-month-moving-sales-average",
    "title": "Calendar-Aware Three-Month Sales Average",
    "problem_statement": "Schema: monthly_sales(month_start DATE PK, revenue DECIMAL), sparse by month. For every stored month, return the average revenue for that month and the preceding two calendar months, treating absent months as zero. Round to two decimals; sort chronologically. Input: Jan 2026 revenue 30, Mar revenue 60. Output: Jan 1 | 10.00; Mar 1 | 30.00. Input: Apr 90, May 30, Jun 60. Output: Apr 1 | 30.00; May 1 | 40.00; Jun 1 | 60.00.",
    "difficulty": "Hard",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Date Series"
    ],
    "constraints": [
      "The average always divides by three calendar months, including absent months.",
      "Return only months present in monthly_sales.",
      "All month_start values are first-of-month dates."
    ],
    "examples": [
      {
        "input": "monthly_sales: (2026-01-01,30),(2026-03-01,60)",
        "output": "2026-01-01 | 10.00\n2026-03-01 | 30.00"
      },
      {
        "input": "monthly_sales: (2026-04-01,90),(2026-05-01,30),(2026-06-01,60)",
        "output": "2026-04-01 | 30.00\n2026-05-01 | 40.00\n2026-06-01 | 60.00"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT current.month_start,\n       ROUND(COALESCE((\n         SELECT SUM(prior.revenue) FROM monthly_sales AS prior\n         WHERE prior.month_start >= current.month_start - INTERVAL '2 months'\n           AND prior.month_start <= current.month_start\n       ), 0) / 3.0, 2) AS moving_average\nFROM monthly_sales AS current\nORDER BY current.month_start;"
    },
    "points": 200
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "customer-two-category-purchases",
    "title": "Customers Purchasing Across Multiple Categories",
    "problem_statement": "Schema: orders(order_id PK, customer_id); order_lines(order_id, product_id); products(product_id PK, category). Return customer_id and count of distinct categories purchased for customers who bought from at least two categories. Sort by customer_id. Input: orders (1,7),(2,7),(3,8); lines (1,1),(2,2),(3,3); products (1,A),(2,B),(3,A). Output: 7 | 2. Input: order (4,9); line (4,5); product (5,C). Output: no rows.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Joins",
      "Distinct Counts"
    ],
    "constraints": [
      "Repeated purchases in the same category count once per customer.",
      "Join through order_lines and products; do not infer category from an order.",
      "Only customers with at least two distinct categories are returned."
    ],
    "examples": [
      {
        "input": "orders: (1,7),(2,7),(3,8); order_lines: (1,1),(2,2),(3,3); products: (1,A),(2,B),(3,A)",
        "output": "7 | 2"
      },
      {
        "input": "orders: (4,9); order_lines: (4,5); products: (5,C)",
        "output": "(no rows)"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT o.customer_id, COUNT(DISTINCT p.category) AS category_count\nFROM orders AS o\nJOIN order_lines AS l ON l.order_id = o.order_id\nJOIN products AS p ON p.product_id = l.product_id\nGROUP BY o.customer_id\nHAVING COUNT(DISTINCT p.category) >= 2\nORDER BY o.customer_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "product-pairs-co-purchased",
    "title": "Product Pairs Bought Together Repeatedly",
    "problem_statement": "Schema: order_lines(order_id, product_id). Return each unordered pair of distinct products appearing together in at least two different orders, plus shared_order_count. Order product ids ascending within pairs, then sort by ids. Input: (1,A),(1,B),(2,A),(2,B),(3,A),(3,C). Output: A | B | 2. Input: (8,X),(8,Y),(9,X),(9,Y). Output: X | Y | 2.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Self Joins",
      "Distinct Counts"
    ],
    "constraints": [
      "An order containing duplicate lines for a product still counts once for a pair.",
      "A product is never paired with itself.",
      "Count distinct order_id values, not line combinations."
    ],
    "examples": [
      {
        "input": "order_lines: (1,A),(1,B),(2,A),(2,B),(3,A),(3,C)",
        "output": "A | B | 2"
      },
      {
        "input": "order_lines: (8,X),(8,Y),(9,X),(9,Y)",
        "output": "X | Y | 2"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT a.product_id AS product_a, b.product_id AS product_b,\n       COUNT(DISTINCT a.order_id) AS shared_order_count\nFROM order_lines AS a\nJOIN order_lines AS b ON b.order_id = a.order_id AND a.product_id < b.product_id\nGROUP BY a.product_id, b.product_id\nHAVING COUNT(DISTINCT a.order_id) >= 2\nORDER BY product_a, product_b;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "category-best-selling-day",
    "title": "Best-Selling Day per Category, Including Ties",
    "problem_statement": "Schema: daily_category_sales(category, sold_on DATE, units INT), one row per category/day. Return the date(s) with maximum units for every category, preserving ties. Sort by category then sold_on. Input: (A,Jan 1,5),(A,Jan 2,8),(A,Jan 3,8),(B,Jan 1,2). Output: A | Jan 2; A | Jan 3; B | Jan 1. Input: (C,Feb 1,0),(C,Feb 2,0). Output: C | Feb 1; C | Feb 2.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Ties"
    ],
    "constraints": [
      "Categories may have tied maximum values.",
      "Zero is a valid maximum.",
      "Return only category and sold_on."
    ],
    "examples": [
      {
        "input": "daily_category_sales: (A,2026-01-01,5),(A,2026-01-02,8),(A,2026-01-03,8),(B,2026-01-01,2)",
        "output": "A | 2026-01-02\nA | 2026-01-03\nB | 2026-01-01"
      },
      {
        "input": "daily_category_sales: (C,2026-02-01,0),(C,2026-02-02,0)",
        "output": "C | 2026-02-01\nC | 2026-02-02"
      }
    ],
    "starter_code_by_language": {
      "SQL": "SELECT category, sold_on\nFROM (\n  SELECT category, sold_on,\n         RANK() OVER (PARTITION BY category ORDER BY units DESC) AS sales_rank\n  FROM daily_category_sales\n) AS ranked\nWHERE sales_rank = 1\nORDER BY category, sold_on;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "orders-after-long-customer-gap",
    "title": "Orders Following a 30-Day Customer Gap",
    "problem_statement": "Schema: orders(order_id PK, customer_id, ordered_at DATE). Return order_id when the gap from that customer's immediately previous order is at least 30 days. Exclude each customer's first order. Sort by order_id. Input: (1,1,Jan 1),(2,1,Jan 20),(3,1,Feb 1),(4,2,Jan 1),(5,2,Feb 15) 2026. Output: 5. Input: (6,3,Mar 1),(7,3,Mar 31) 2026. Output: 7.",
    "difficulty": "Medium",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Date Arithmetic"
    ],
    "constraints": [
      "The immediately preceding order is determined by ordered_at then order_id.",
      "The day difference is calendar-date subtraction.",
      "A gap of exactly 30 days qualifies."
    ],
    "examples": [
      {
        "input": "orders: (1,1,2026-01-01),(2,1,2026-01-20),(3,1,2026-02-01),(4,2,2026-01-01),(5,2,2026-02-15)",
        "output": "5"
      },
      {
        "input": "orders: (6,3,2026-03-01),(7,3,2026-03-31)",
        "output": "7"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH ordered AS (\n  SELECT order_id, customer_id, ordered_at,\n         LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at, order_id) AS prior_date\n  FROM orders\n)\nSELECT order_id FROM ordered\nWHERE ordered_at - prior_date >= 30\nORDER BY order_id;"
    },
    "points": 150
  },
  {
    "collection_slug": "sql-database-foundations",
    "slug": "quarterly-revenue-growth",
    "title": "Quarter-over-Quarter Revenue Growth",
    "problem_statement": "Schema: orders(order_id PK, ordered_on DATE, amount DECIMAL). Aggregate revenue by calendar quarter, then return quarter_start, revenue, and growth versus the previous represented quarter. For the first represented quarter, growth is NULL; if prior revenue is zero, growth is also NULL. Round to four decimals and sort by quarter. Input: Jan 1 100, Apr 2 150, Jul 1 0 in 2026. Output: Jan 1 | 100.00 | NULL; Apr 1 | 150.00 | 0.5000; Jul 1 | 0.00 | -1.0000. Input: Oct 2026 0, Jan 2027 10. Output: Oct 1 | 0.00 | NULL; Jan 1 | 10.00 | NULL.",
    "difficulty": "Hard",
    "topic_tags": [
      "SQL",
      "Window Functions",
      "Growth Rates"
    ],
    "constraints": [
      "Compare to the previous quarter present in the aggregate, not a generated missing quarter.",
      "Use fractional growth (current - previous) / previous.",
      "Zero prior revenue must not cause division by zero."
    ],
    "examples": [
      {
        "input": "orders: (1,2026-01-01,100),(2,2026-04-02,150),(3,2026-07-01,0)",
        "output": "2026-01-01 | 100.00 | NULL\n2026-04-01 | 150.00 | 0.5000\n2026-07-01 | 0.00 | -1.0000"
      },
      {
        "input": "orders: (8,2026-10-01,0),(9,2027-01-01,10)",
        "output": "2026-10-01 | 0.00 | NULL\n2027-01-01 | 10.00 | NULL"
      }
    ],
    "starter_code_by_language": {
      "SQL": "WITH quarterly AS (\n  SELECT DATE_TRUNC('quarter', ordered_on)::date AS quarter_start, SUM(amount) AS revenue\n  FROM orders GROUP BY DATE_TRUNC('quarter', ordered_on)::date\n), compared AS (\n  SELECT quarterly.*, LAG(revenue) OVER (ORDER BY quarter_start) AS prior_revenue\n  FROM quarterly\n)\nSELECT quarter_start, revenue,\n       ROUND((revenue - prior_revenue) / NULLIF(prior_revenue, 0), 4) AS growth\nFROM compared ORDER BY quarter_start;"
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
    raise exception 'Expected exactly 20 distinct SQL foundations questions';
  end if;
  if exists (
    select 1 from coding_question_seed
    where collection_slug <> 'sql-database-foundations'
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
    raise exception 'SQL foundations seed failed completeness, SQL-only, or example quality checks';
  end if;
  if not exists (select 1 from public.coding_test_sets where slug = 'sql-database-foundations') then
    raise exception 'Missing SQL foundations collection';
  end if;
end;
$$;

with collection_map as (
  select id from public.coding_test_sets where slug = 'sql-database-foundations'
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
