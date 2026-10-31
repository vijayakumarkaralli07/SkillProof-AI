begin;

create table public.coding_test_sets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 2000),
  category text not null check (char_length(btrim(category)) between 1 and 100),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  duration_minutes integer not null check (duration_minutes between 1 and 240),
  supported_languages jsonb not null check (
    jsonb_typeof(supported_languages) = 'array'
    and jsonb_array_length(supported_languages) between 1 and 8
  ),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coding_questions (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.coding_test_sets(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  problem_statement text not null check (char_length(btrim(problem_statement)) between 1 and 12000),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic_tags text[] not null default '{}',
  constraints jsonb not null default '[]'::jsonb check (jsonb_typeof(constraints) = 'array'),
  examples jsonb not null default '[]'::jsonb check (jsonb_typeof(examples) = 'array'),
  starter_code_by_language jsonb not null check (jsonb_typeof(starter_code_by_language) = 'object'),
  points integer not null default 0 check (points between 0 and 1000),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  question_order integer not null check (question_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, slug),
  unique (collection_id, question_order)
);

create index coding_questions_published_collection_order_idx
  on public.coding_questions (collection_id, question_order)
  where publication_status = 'published';

create table public.coding_test_cases (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.coding_questions(id) on delete cascade,
  case_order integer not null check (case_order > 0),
  test_input text not null,
  expected_output text not null,
  visibility text not null default 'hidden' check (visibility in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  unique (question_id, case_order)
);

create index coding_test_cases_question_order_idx
  on public.coding_test_cases (question_id, case_order);

alter table public.coding_test_sets enable row level security;
alter table public.coding_questions enable row level security;
alter table public.coding_test_cases enable row level security;

revoke all on public.coding_test_sets, public.coding_questions,
  public.coding_test_cases from public, anon, authenticated;

grant select on public.coding_test_sets, public.coding_questions,
  public.coding_test_cases to authenticated;
grant select on public.coding_test_cases to service_role;

create policy "Authenticated users can read published coding collections"
  on public.coding_test_sets for select to authenticated
  using (publication_status = 'published');

create policy "Authenticated users can read published coding questions"
  on public.coding_questions for select to authenticated
  using (
    publication_status = 'published'
    and exists (
      select 1 from public.coding_test_sets collection
      where collection.id = collection_id and collection.publication_status = 'published'
    )
  );

create policy "Authenticated users can read visible test cases for published questions"
  on public.coding_test_cases for select to authenticated
  using (
    visibility = 'visible'
    and exists (
      select 1
      from public.coding_questions question
      join public.coding_test_sets test_set on test_set.id = question.collection_id
      where question.id = question_id
        and question.publication_status = 'published'
        and test_set.publication_status = 'published'
    )
  );

insert into public.coding_test_sets (
  slug, title, description, category, difficulty, duration_minutes, supported_languages, publication_status
) values
  ('arrays-hashing', 'Arrays & Hashing Foundations', 'Practice array traversal, frequency maps, and efficient lookup patterns.', 'Data Structures & Algorithms', 'Easy', 30, '["JavaScript","Python"]'::jsonb, 'published'),
  ('javascript-core-challenges', 'JavaScript Core Challenges', 'Solve practical problems with strings, arrays, maps, and asynchronous fundamentals.', 'JavaScript Challenges', 'Easy', 30, '["JavaScript","Python"]'::jsonb, 'published'),
  ('web-development-fundamentals', 'Web Development Fundamentals', 'Work through data handling and interface logic used in web applications.', 'Web Development', 'Medium', 35, '["JavaScript","Python"]'::jsonb, 'published'),
  ('backend-api-problem-solving', 'Backend & API Problem Solving', 'Practice validation, pagination, and reliable request processing.', 'Backend Development', 'Medium', 40, '["JavaScript","Python"]'::jsonb, 'published'),
  ('sql-database-foundations', 'SQL & Database Foundations', 'Write queries for grouping, filtering, and combining relational data.', 'SQL & Database', 'Easy', 30, '["SQL"]'::jsonb, 'published'),
  ('trees-graphs-practice', 'Trees & Graphs Practice', 'Explore tree traversal and graph search with clear constraints.', 'Trees & Graphs', 'Hard', 50, '["JavaScript","Python"]'::jsonb, 'published'),
  ('arrays-strings-interview-set', 'Arrays & Strings Interview Set', 'Build confidence with sliding-window and two-pointer techniques.', 'Arrays and Hashing', 'Medium', 35, '["JavaScript","Python"]'::jsonb, 'published')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  duration_minutes = excluded.duration_minutes,
  supported_languages = excluded.supported_languages,
  publication_status = excluded.publication_status,
  updated_at = now();

with question_seed(collection_slug, slug, title, problem_statement, difficulty, topic_tags, constraints, examples, starter_code_by_language, points, question_order) as (
  values
  ('arrays-hashing','two-sum','Find a Pair for a Target','Implement twoSum(numbers, target). Return the two distinct zero-based indices whose values add to target. Exactly one answer exists. Return the smaller index first.','Easy',array['Arrays','Hashing'],'["2 <= numbers.length <= 100000","Values and target are signed 32-bit integers","Do not use the same array element twice"]'::jsonb,'[{"input":"numbers = [2,7,11,15], target = 9","output":"[0,1]"},{"input":"numbers = [-3,4,3,90], target = 0","output":"[0,2]"}]'::jsonb,'{"JavaScript":"function twoSum(numbers, target) {\n  // Return the two matching indices\n}","Python":"def two_sum(numbers, target):\n    # Return the two matching indices\n    pass"}'::jsonb,100,1),
  ('arrays-hashing','count-frequencies','Count Value Frequencies','Implement countFrequencies(numbers) and return a map-like object from each integer value to its occurrence count. Include every distinct value exactly once.','Easy',array['Arrays','Hashing'],'["0 <= numbers.length <= 100000","Values are integers","Output keys may be listed in any order"]'::jsonb,'[{"input":"[4, 2, 4, 1, 2, 4]","output":"{1: 1, 2: 2, 4: 3}"},{"input":"[]","output":"{}"}]'::jsonb,'{"JavaScript":"function countFrequencies(numbers) {\n  // Return an object containing each value and its count\n}","Python":"def count_frequencies(numbers):\n    # Return a dictionary containing each value and its count\n    pass"}'::jsonb,100,2),
  ('arrays-hashing','longest-consecutive-run','Longest Consecutive Run','Implement longestConsecutive(numbers). Return the length of the longest sequence of consecutive integer values present in the input. The values do not need to be adjacent in the array.','Medium',array['Arrays','Hashing'],'["0 <= numbers.length <= 100000","Values are integers","Duplicate values do not extend a sequence"]'::jsonb,'[{"input":"[100, 4, 200, 1, 3, 2]","output":"4"},{"input":"[7, 7, 8]","output":"2"}]'::jsonb,'{"JavaScript":"function longestConsecutive(numbers) {\n  // Return the longest consecutive sequence length\n}","Python":"def longest_consecutive(numbers):\n    # Return the longest consecutive sequence length\n    pass"}'::jsonb,150,3),

  ('javascript-core-challenges','first-unique-character','First Unique Character','Implement firstUniqueCharacter(text). Return the index of the first character that occurs exactly once, or -1 if no such character exists. Matching is case-sensitive.','Easy',array['Strings','Maps'],'["0 <= text.length <= 100000","The input contains printable ASCII characters"]'::jsonb,'[{"input":"\"swiss\"","output":"1"},{"input":"\"aabb\"","output":"-1"}]'::jsonb,'{"JavaScript":"function firstUniqueCharacter(text) {\n  // Return the first unique character index\n}","Python":"def first_unique_character(text):\n    # Return the first unique character index\n    pass"}'::jsonb,100,1),
  ('javascript-core-challenges','chunk-array','Split an Array into Chunks','Implement chunkArray(items, size). Return a new array containing consecutive groups of at most size items. The input array must not be modified.','Easy',array['Arrays','JavaScript'],'["0 <= items.length <= 100000","size is a positive integer"]'::jsonb,'[{"input":"items = [1,2,3,4,5], size = 2","output":"[[1,2],[3,4],[5]]"},{"input":"items = [], size = 3","output":"[]"}]'::jsonb,'{"JavaScript":"function chunkArray(items, size) {\n  // Return consecutive chunks without changing items\n}","Python":"def chunk_array(items, size):\n    # Return consecutive chunks without changing items\n    pass"}'::jsonb,100,2),
  ('javascript-core-challenges','stable-deduplicate','Stable Deduplication','Implement stableUnique(items). Return the items with duplicates removed, retaining the first occurrence and original order. Values are compared using strict equality.','Easy',array['Arrays','Sets'],'["0 <= items.length <= 100000","Input values are strings or integers"]'::jsonb,'[{"input":"[\"a\", \"b\", \"a\", 2, \"b\"]","output":"[\"a\", \"b\", 2]"},{"input":"[1, 1, 1]","output":"[1]"}]'::jsonb,'{"JavaScript":"function stableUnique(items) {\n  // Return first occurrences in their original order\n}","Python":"def stable_unique(items):\n    # Return first occurrences in their original order\n    pass"}'::jsonb,100,3),

  ('web-development-fundamentals','paginate-items','Paginate a Collection','Implement paginateItems(items, page, pageSize) using one-based page numbers. Return the requested slice, or an empty array when the page begins beyond the collection.','Easy',array['Arrays','Pagination'],'["page >= 1","pageSize >= 1","Do not modify items"]'::jsonb,'[{"input":"items = [\"a\",\"b\",\"c\",\"d\",\"e\"], page = 2, pageSize = 2","output":"[\"c\",\"d\"]"},{"input":"items = [1,2], page = 3, pageSize = 2","output":"[]"}]'::jsonb,'{"JavaScript":"function paginateItems(items, page, pageSize) {\n  // Return the requested page slice\n}","Python":"def paginate_items(items, page, page_size):\n    # Return the requested page slice\n    pass"}'::jsonb,100,1),
  ('web-development-fundamentals','validate-hex-color','Validate a Hex Color','Implement isHexColor(value). Return true only for a six-digit hexadecimal CSS color beginning with #. Accept uppercase or lowercase hexadecimal digits.','Easy',array['Strings','Validation'],'["Input is a string","The leading # is required","Three-digit shorthand is not accepted"]'::jsonb,'[{"input":"\"#12aBcF\"","output":"true"},{"input":"\"#abc\"","output":"false"}]'::jsonb,'{"JavaScript":"function isHexColor(value) {\n  // Return whether value is a six-digit hex color\n}","Python":"def is_hex_color(value):\n    # Return whether value is a six-digit hex color\n    pass"}'::jsonb,100,2),
  ('web-development-fundamentals','merge-query-parameters','Merge Query Parameters','Implement mergeQueryParameters(base, updates). Parse the base query string, apply updates by key, and return a query string with keys sorted lexicographically. Null update values remove a key.','Medium',array['Strings','Web APIs'],'["Inputs omit the leading ?","Keys and values are URL-encoded strings","Each update replaces the existing value for its key"]'::jsonb,'[{"input":"base = \"b=2&a=1\", updates = {\"a\":\"3\",\"c\":\"4\"}","output":"a=3&b=2&c=4"},{"input":"base = \"x=1&y=2\", updates = {\"x\":null}","output":"y=2"}]'::jsonb,'{"JavaScript":"function mergeQueryParameters(base, updates) {\n  // Return the normalized query string\n}","Python":"def merge_query_parameters(base, updates):\n    # Return the normalized query string\n    pass"}'::jsonb,150,3),

  ('backend-api-problem-solving','normalize-page-parameters','Normalize Page Parameters','Implement normalizePageParameters(pageValue, limitValue). Parse positive integer strings, default invalid page to 1, and clamp the limit to the inclusive range 1 through 100 (default 20). Return {page, limit}.','Easy',array['APIs','Validation'],'["Only base-10 positive integer strings are valid","Page has no maximum","Limit is clamped to at most 100"]'::jsonb,'[{"input":"pageValue = \"3\", limitValue = \"250\"","output":"{page: 3, limit: 100}"},{"input":"pageValue = \"0\", limitValue = \"bad\"","output":"{page: 1, limit: 20}"}]'::jsonb,'{"JavaScript":"function normalizePageParameters(pageValue, limitValue) {\n  // Return validated page and limit values\n}","Python":"def normalize_page_parameters(page_value, limit_value):\n    # Return validated page and limit values\n    pass"}'::jsonb,100,1),
  ('backend-api-problem-solving','unique-request-keys','Find Duplicate Request Keys','Implement duplicateRequestKeys(keys). Return each repeated non-empty request key once, ordered by the position where its second occurrence appears. Keys are compared exactly.','Medium',array['APIs','Hashing'],'["0 <= keys.length <= 100000","Empty strings are ignored","The result contains no duplicate key"]'::jsonb,'[{"input":"[\"r1\", \"r2\", \"r1\", \"r3\", \"r2\"]","output":"[\"r1\", \"r2\"]"},{"input":"[\"\", \"x\", \"x\", \"x\"]","output":"[\"x\"]"}]'::jsonb,'{"JavaScript":"function duplicateRequestKeys(keys) {\n  // Return repeated keys in second-seen order\n}","Python":"def duplicate_request_keys(keys):\n    # Return repeated keys in second-seen order\n    pass"}'::jsonb,100,2),
  ('backend-api-problem-solving','deduplicate-records','Keep the Latest Record per ID','Implement latestRecords(records), where each record has an id and an integer updatedAt timestamp. Return one record per id, selecting the greatest updatedAt. For ties, keep the record that appeared first.','Medium',array['APIs','Data Processing'],'["0 <= records.length <= 100000","IDs are non-empty strings","The result order follows each ID''s first appearance"]'::jsonb,'[{"input":"[{id:\"a\",updatedAt:2,v:1},{id:\"b\",updatedAt:1},{id:\"a\",updatedAt:3,v:2}]","output":"[{id:\"a\",updatedAt:3,v:2},{id:\"b\",updatedAt:1}]"},{"input":"[]","output":"[]"}]'::jsonb,'{"JavaScript":"function latestRecords(records) {\n  // Keep the newest record for each id\n}","Python":"def latest_records(records):\n    # Keep the newest record for each id\n    pass"}'::jsonb,150,3),

  ('sql-database-foundations','daily-order-totals','Daily Order Totals','Use orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER, ordered_at DATE, amount NUMERIC(10,2)). Write a query returning each order date and summed amount, ordered by date. Sample fixtures are supplied in each example.','Easy',array['SQL','Aggregation'],'["Return order_date and total_amount","Include only dates present in orders","Use standard SQL date values"]'::jsonb,'[{"input":"orders: (1,4,2026-01-02,10.00), (2,5,2026-01-01,5.00), (3,4,2026-01-02,7.00)","output":"2026-01-01 | 5.00; 2026-01-02 | 17.00"},{"input":"orders: (8,2,2026-03-10,0.00)","output":"2026-03-10 | 0.00"}]'::jsonb,'{"SQL":"SELECT ordered_at AS order_date,\n       SUM(amount) AS total_amount\nFROM orders\nGROUP BY ordered_at\nORDER BY order_date;"}'::jsonb,100,1),
  ('sql-database-foundations','customers-without-orders','Customers Without Orders','Use customers(customer_id INTEGER PRIMARY KEY, name TEXT) and orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers). Return each customer ID and name with no matching order, sorted by customer_id.','Easy',array['SQL','Joins'],'["Return customer_id and name","Each customer appears at most once","Use a left anti-join or NOT EXISTS"]'::jsonb,'[{"input":"customers: (1,Ada), (2,Lin), (3,Mo); orders: (10,1)","output":"2 | Lin; 3 | Mo"},{"input":"customers: (7,Uma); orders: none","output":"7 | Uma"}]'::jsonb,'{"SQL":"SELECT customer.customer_id, customer.name\nFROM customers AS customer\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders AS order_row\n  WHERE order_row.customer_id = customer.customer_id\n)\nORDER BY customer.customer_id;"}'::jsonb,100,2),
  ('sql-database-foundations','top-customer-order-counts','Top Customer Order Counts','Use orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER). Return every customer tied for the largest order count and that count. The input has at least one order; sort results by customer_id.','Medium',array['SQL','Grouping'],'["Return customer_id and order_count","Include all ties","Only customers with one or more orders are ranked"]'::jsonb,'[{"input":"orders: (1,3), (2,1), (3,3), (4,1), (5,2)","output":"1 | 2; 3 | 2"},{"input":"orders: (6,9), (7,9)","output":"9 | 2"}]'::jsonb,'{"SQL":"WITH customer_counts AS (\n  SELECT customer_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY customer_id\n), ranked AS (\n  SELECT customer_id, order_count,\n         RANK() OVER (ORDER BY order_count DESC) AS position\n  FROM customer_counts\n)\nSELECT customer_id, order_count\nFROM ranked\nWHERE position = 1\nORDER BY customer_id;"}'::jsonb,150,3),

  ('trees-graphs-practice','tree-maximum-depth','Maximum Depth of a Binary Tree','Implement maxDepth(root) for a binary tree whose nodes have value, left, and right fields. Return the number of nodes on the longest root-to-leaf path. An empty tree has depth zero.','Medium',array['Trees','Recursion'],'["0 <= node count <= 100000","Node values are integers","The tree is valid"]'::jsonb,'[{"input":"[3,9,20,null,null,15,7]","output":"3"},{"input":"[]","output":"0"}]'::jsonb,'{"JavaScript":"function maxDepth(root) {\n  // Return the longest root-to-leaf node count\n}","Python":"def max_depth(root):\n    # Return the longest root-to-leaf node count\n    pass"}'::jsonb,100,1),
  ('trees-graphs-practice','count-components','Count Connected Components','Implement countComponents(nodeCount, edges) for an undirected graph with nodes numbered from 0 to nodeCount - 1. Return the number of connected components.','Medium',array['Graphs','Breadth-first Search'],'["1 <= nodeCount <= 100000","0 <= edges.length <= 200000","There are no duplicate edges or self-loops"]'::jsonb,'[{"input":"nodeCount = 5, edges = [[0,1],[1,2],[3,4]]","output":"2"},{"input":"nodeCount = 3, edges = []","output":"3"}]'::jsonb,'{"JavaScript":"function countComponents(nodeCount, edges) {\n  // Count graph components\n}","Python":"def count_components(node_count, edges):\n    # Count graph components\n    pass"}'::jsonb,150,2),
  ('trees-graphs-practice','shortest-unweighted-path','Shortest Unweighted Path','Implement shortestPath(nodeCount, edges, start, target) for an undirected unweighted graph. Return the minimum number of edges from start to target, or -1 when no path exists.','Hard',array['Graphs','Breadth-first Search'],'["1 <= nodeCount <= 100000","0 <= edges.length <= 200000","start and target are valid node indices"]'::jsonb,'[{"input":"nodeCount = 4, edges = [[0,1],[1,2],[0,3]], start = 0, target = 2","output":"2"},{"input":"nodeCount = 3, edges = [[0,1]], start = 0, target = 2","output":"-1"}]'::jsonb,'{"JavaScript":"function shortestPath(nodeCount, edges, start, target) {\n  // Return the shortest edge count or -1\n}","Python":"def shortest_path(node_count, edges, start, target):\n    # Return the shortest edge count or -1\n    pass"}'::jsonb,200,3),

  ('arrays-strings-interview-set','longest-unique-substring','Longest Unique Substring','Implement longestUniqueSubstring(text). Return the length of the longest contiguous substring containing no repeated characters.','Medium',array['Strings','Sliding Window'],'["0 <= text.length <= 200000","Characters are compared by exact code point"]'::jsonb,'[{"input":"\"abcabcbb\"","output":"3"},{"input":"\"bbbbb\"","output":"1"}]'::jsonb,'{"JavaScript":"function longestUniqueSubstring(text) {\n  // Return the longest non-repeating window length\n}","Python":"def longest_unique_substring(text):\n    # Return the longest non-repeating window length\n    pass"}'::jsonb,150,1),
  ('arrays-strings-interview-set','merge-overlapping-intervals','Merge Overlapping Intervals','Implement mergeIntervals(intervals). Merge all overlapping closed intervals and return the merged intervals sorted by start value. Touching endpoints overlap.','Medium',array['Arrays','Sorting'],'["0 <= intervals.length <= 100000","Each interval is [start, end] with start <= end"]'::jsonb,'[{"input":"[[1,3],[2,6],[8,10],[10,12]]","output":"[[1,6],[8,12]]"},{"input":"[[5,5]]","output":"[[5,5]]"}]'::jsonb,'{"JavaScript":"function mergeIntervals(intervals) {\n  // Return sorted, merged intervals\n}","Python":"def merge_intervals(intervals):\n    # Return sorted, merged intervals\n    pass"}'::jsonb,150,2),
  ('arrays-strings-interview-set','valid-palindrome','Normalized Palindrome','Implement isNormalizedPalindrome(text). Compare the string after ignoring non-alphanumeric ASCII characters and letter case. Return whether the normalized string reads the same forward and backward.','Easy',array['Strings','Two Pointers'],'["Input contains printable ASCII characters","An empty normalized string is a palindrome"]'::jsonb,'[{"input":"\"A man, a plan, a canal: Panama!\"","output":"true"},{"input":"\"SkillProof\"","output":"false"}]'::jsonb,'{"JavaScript":"function isNormalizedPalindrome(text) {\n  // Compare normalized characters from both ends\n}","Python":"def is_normalized_palindrome(text):\n    # Compare normalized characters from both ends\n    pass"}'::jsonb,100,3),
  ('arrays-hashing','merge-sorted-arrays','Merge Two Sorted Arrays','Implement mergeSortedArrays(left, right) and return one ascending array containing every value from both already-sorted inputs. Preserve duplicates and do not mutate either input.','Easy',array['Arrays','Two Pointers'],'["0 <= left.length + right.length <= 200000","Values are integers","Both inputs are sorted in non-decreasing order"]'::jsonb,'[{"input":"left = [1,3,5], right = [2,4,6]","output":"[1,2,3,4,5,6]"},{"input":"left = [-2,2,2], right = [-2,2]","output":"[-2,-2,2,2,2]"}]'::jsonb,'{"JavaScript":"function mergeSortedArrays(left, right) {\n  // Return a new merged sorted array\n}","Python":"def merge_sorted_arrays(left, right):\n    # Return a new merged sorted list\n    pass"}'::jsonb,100,4),
  ('arrays-hashing','count-target-subarrays','Count Subarrays with a Target Sum','Implement countTargetSubarrays(numbers, target). Return the number of contiguous subarrays whose values sum to target. Values may be negative, so a sliding window is not sufficient.','Medium',array['Arrays','Prefix Sums'],'["0 <= numbers.length <= 100000","Values and target are signed 32-bit integers","The answer fits in a signed 64-bit integer"]'::jsonb,'[{"input":"numbers = [1,1,1], target = 2","output":"2"},{"input":"numbers = [1,-1,0], target = 0","output":"3"}]'::jsonb,'{"JavaScript":"function countTargetSubarrays(numbers, target) {\n  // Return the number of matching contiguous subarrays\n}","Python":"def count_target_subarrays(numbers, target):\n    # Return the number of matching contiguous subarrays\n    pass"}'::jsonb,150,5),
  ('javascript-core-challenges','flatten-one-level','Flatten an Array by One Level','Implement flattenOneLevel(items). Return a new array where each direct nested array is replaced by its elements. Do not recursively flatten deeper arrays or mutate the input.','Easy',array['Arrays','JavaScript'],'["0 <= items.length <= 100000","Array elements may themselves contain arrays","Preserve the order of every value"]'::jsonb,'[{"input":"[1,[2,3],4,[5]]","output":"[1,2,3,4,5]"},{"input":"[[1,[2]],[],3]","output":"[1,[2],3]"}]'::jsonb,'{"JavaScript":"function flattenOneLevel(items) {\n  // Flatten direct child arrays only\n}","Python":"def flatten_one_level(items):\n    # Flatten direct child lists only\n    pass"}'::jsonb,100,4),
  ('javascript-core-challenges','group-objects-by-key','Group Records by a Key','Implement groupByKey(records, key). Return an object whose keys are the distinct string values at the given property and whose values are arrays of matching records in original order. Do not mutate records.','Medium',array['Objects','Grouping'],'["0 <= records.length <= 100000","Every record has the requested property","Property values are strings"]'::jsonb,'[{"input":"records = [{team:\"red\",id:1},{team:\"blue\",id:2},{team:\"red\",id:3}], key = \"team\"","output":"{blue:[{team:\"blue\",id:2}],red:[{team:\"red\",id:1},{team:\"red\",id:3}]}"},{"input":"records = [], key = \"team\"","output":"{}"}]'::jsonb,'{"JavaScript":"function groupByKey(records, key) {\n  // Return groups keyed by the selected property\n}","Python":"def group_by_key(records, key):\n    # Return groups keyed by the selected property\n    pass"}'::jsonb,150,5),
  ('web-development-fundamentals','parse-cookie-header','Parse a Cookie Header','Implement parseCookieHeader(header). Parse a semicolon-separated HTTP Cookie header into an object. Trim whitespace, preserve values containing equals signs, and let the first occurrence of a duplicate cookie name win.','Medium',array['Strings','HTTP'],'["Cookie names are non-empty","Split each pair at its first equals sign only","Ignore malformed pairs without an equals sign"]'::jsonb,'[{"input":"\"session=abc; theme=dark\"","output":"{session:\"abc\",theme:\"dark\"}"},{"input":"\"token=a=b; theme=light; token=second; broken\"","output":"{token:\"a=b\",theme:\"light\"}"}]'::jsonb,'{"JavaScript":"function parseCookieHeader(header) {\n  // Return cookie name/value pairs\n}","Python":"def parse_cookie_header(header):\n    # Return cookie name/value pairs\n    pass"}'::jsonb,150,4),
  ('web-development-fundamentals','format-byte-count','Format a Byte Count','Implement formatByteCount(bytes). Format a non-negative integer byte count using base-1024 units B, KiB, MiB, and GiB. Keep bytes as an integer; use one decimal place for larger units and do not advance beyond GiB.','Easy',array['Numbers','Formatting'],'["0 <= bytes <= 2^53 - 1","Use 1024 as the unit divisor","Round larger-unit values to one decimal place"]'::jsonb,'[{"input":"bytes = 0","output":"0 B"},{"input":"bytes = 1536","output":"1.5 KiB"}]'::jsonb,'{"JavaScript":"function formatByteCount(bytes) {\n  // Return a formatted byte count\n}","Python":"def format_byte_count(byte_count):\n    # Return a formatted byte count\n    pass"}'::jsonb,100,5),
  ('backend-api-problem-solving','parse-cursor-token','Validate a Pagination Cursor','Implement parseCursorToken(token). Accept only a base64url token that decodes to a JSON object with a non-empty string id and a non-negative integer createdAt. Return the object on success, otherwise return null. Do not throw for malformed input.','Medium',array['APIs','Validation'],'["Token uses base64url alphabet without padding","Decoded JSON must be an object","createdAt must be a safe non-negative integer"]'::jsonb,'[{"input":"token represents {\"id\":\"ord_7\",\"createdAt\":12}","output":"{id:\"ord_7\",createdAt:12}"},{"input":"token represents {\"id\":\"\",\"createdAt\":-1}","output":"null"}]'::jsonb,'{"JavaScript":"function parseCursorToken(token) {\n  // Decode and validate the cursor; return null on invalid input\n}","Python":"def parse_cursor_token(token):\n    # Decode and validate the cursor; return None on invalid input\n    pass"}'::jsonb,150,4),
  ('backend-api-problem-solving','retryable-http-status','Classify Retryable HTTP Statuses','Implement isRetryableStatus(status). Return true for HTTP 408, 425, 429, and status codes from 500 through 599; return false for all other integer status codes.','Easy',array['HTTP','Error Handling'],'["status is an integer from 100 through 599","Do not classify other 4xx responses as retryable"]'::jsonb,'[{"input":"status = 429","output":"true"},{"input":"status = 404","output":"false"}]'::jsonb,'{"JavaScript":"function isRetryableStatus(status) {\n  // Return whether a request may be retried\n}","Python":"def is_retryable_status(status):\n    # Return whether a request may be retried\n    pass"}'::jsonb,100,5),
  ('sql-database-foundations','products-never-ordered','Products Never Ordered','Use products(product_id INTEGER PRIMARY KEY, name TEXT) and order_items(order_id INTEGER, product_id INTEGER REFERENCES products). Write a query returning each product ID and name with no order-item rows. Sort by product_id.','Easy',array['SQL','Joins'],'["Return product_id and name","Each product appears at most once","Products with no order items must be included"]'::jsonb,'[{"input":"products: (1,Pen), (2,Book), (3,Cup); order_items: (10,1), (10,2)","output":"3 | Cup"},{"input":"products: (8,Map); order_items: none","output":"8 | Map"}]'::jsonb,'{"SQL":"SELECT product.product_id, product.name\nFROM products AS product\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items AS item\n  WHERE item.product_id = product.product_id\n)\nORDER BY product.product_id;"}'::jsonb,100,4),
  ('sql-database-foundations','monthly-running-sales','Monthly Running Sales','Use sales(sale_id INTEGER PRIMARY KEY, sold_on DATE, amount NUMERIC(10,2)). Write a query that first totals sales by calendar month, then returns each month and the cumulative total through that month in ascending order. Months with no sales are omitted.','Hard',array['SQL','Window Functions'],'["Return month_start and running_total","Use a window function over monthly totals","Use standard SQL date truncation or equivalent"]'::jsonb,'[{"input":"sales: (1,2026-01-03,10.00), (2,2026-01-20,5.00), (3,2026-02-02,7.00)","output":"2026-01-01 | 15.00; 2026-02-01 | 22.00"},{"input":"sales: (4,2026-04-15,2.50)","output":"2026-04-01 | 2.50"}]'::jsonb,'{"SQL":"WITH monthly AS (\n  SELECT DATE_TRUNC(''month'', sold_on)::date AS month_start,\n         SUM(amount) AS monthly_total\n  FROM sales\n  GROUP BY DATE_TRUNC(''month'', sold_on)::date\n)\nSELECT month_start,\n       SUM(monthly_total) OVER (ORDER BY month_start) AS running_total\nFROM monthly\nORDER BY month_start;"}'::jsonb,200,5),
  ('trees-graphs-practice','validate-binary-search-tree','Validate a Binary Search Tree','Implement isValidBST(root). A tree node has value, left, and right fields. Return whether every node satisfies strict BST ordering: all values in a left subtree are smaller and all values in a right subtree are larger.','Medium',array['Trees','Binary Search'],'["0 <= node count <= 100000","Node values are signed 32-bit integers","Duplicate values make the tree invalid"]'::jsonb,'[{"input":"[2,1,3]","output":"true"},{"input":"[5,1,4,null,null,3,6]","output":"false"}]'::jsonb,'{"JavaScript":"function isValidBST(root) {\n  // Validate all nodes against ancestor bounds\n}","Python":"def is_valid_bst(root):\n    # Validate all nodes against ancestor bounds\n    pass"}'::jsonb,150,4),
  ('trees-graphs-practice','level-order-traversal','Binary Tree Level Order','Implement levelOrder(root) for a binary tree whose nodes have value, left, and right fields. Return node values grouped by depth from top to bottom and left to right. Return an empty array for an empty tree.','Medium',array['Trees','Breadth-first Search'],'["0 <= node count <= 100000","Node values are integers","The tree is valid"]'::jsonb,'[{"input":"[3,9,20,null,null,15,7]","output":"[[3],[9,20],[15,7]]"},{"input":"[]","output":"[]"}]'::jsonb,'{"JavaScript":"function levelOrder(root) {\n  // Return one array of values per tree level\n}","Python":"def level_order(root):\n    # Return one list of values per tree level\n    pass"}'::jsonb,150,5),
  ('arrays-strings-interview-set','minimum-covering-window','Minimum Covering Window','Implement minimumCoveringWindow(text, target). Return the shortest contiguous substring of text containing every target character with the required multiplicity. If multiple shortest windows exist, return the leftmost. Return an empty string when no window exists.','Hard',array['Strings','Sliding Window'],'["0 <= text.length <= 100000","1 <= target.length <= 100000","Characters are compared exactly"]'::jsonb,'[{"input":"text = \"ADOBECODEBANC\", target = \"ABC\"","output":"\"BANC\""},{"input":"text = \"a\", target = \"aa\"","output":"\"\""}]'::jsonb,'{"JavaScript":"function minimumCoveringWindow(text, target) {\n  // Return the shortest leftmost substring covering target\n}","Python":"def minimum_covering_window(text, target):\n    # Return the shortest leftmost substring covering target\n    pass"}'::jsonb,200,4),
  ('arrays-strings-interview-set','run-length-encode','Run-Length Encode a String','Implement runLengthEncode(text). Replace each maximal run of identical characters with the character followed by the run length, including length one. Return an empty string for empty input.','Easy',array['Strings','Encoding'],'["0 <= text.length <= 100000","Input contains printable ASCII characters","Run lengths are positive decimal integers"]'::jsonb,'[{"input":"\"aaabbc\"","output":"a3b2c1"},{"input":"\"xyz\"","output":"x1y1z1"}]'::jsonb,'{"JavaScript":"function runLengthEncode(text) {\n  // Return character/count pairs\n}","Python":"def run_length_encode(text):\n    # Return character/count pairs\n    pass"}'::jsonb,100,5)
)
insert into public.coding_questions (
  collection_id, slug, title, problem_statement, difficulty, topic_tags, constraints, examples,
  starter_code_by_language, points, publication_status, question_order
)
select collection.id, seed.slug, seed.title, seed.problem_statement, seed.difficulty, seed.topic_tags,
  seed.constraints, seed.examples, seed.starter_code_by_language, seed.points, 'published', seed.question_order
from question_seed seed
join public.coding_test_sets collection on collection.slug = seed.collection_slug
on conflict (collection_id, slug) do update set
  title = excluded.title,
  problem_statement = excluded.problem_statement,
  difficulty = excluded.difficulty,
  topic_tags = excluded.topic_tags,
  constraints = excluded.constraints,
  examples = excluded.examples,
  starter_code_by_language = excluded.starter_code_by_language,
  points = excluded.points,
  publication_status = excluded.publication_status,
  question_order = excluded.question_order,
  updated_at = now();

insert into public.coding_test_cases (question_id, case_order, test_input, expected_output, visibility)
select question.id, example.ordinality::integer, example.value ->> 'input', example.value ->> 'output', 'visible'
from public.coding_questions question
cross join lateral jsonb_array_elements(question.examples) with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do update set
  test_input = excluded.test_input,
  expected_output = excluded.expected_output,
  visibility = excluded.visibility;

insert into public.coding_test_cases (question_id, case_order, test_input, expected_output, visibility)
select question.id, 100, hidden.test_input, hidden.expected_output, 'hidden'
from (values
  ('arrays-hashing','two-sum','numbers = [3,6,9], target = 15','[1,2]'),
  ('arrays-hashing','count-frequencies','[2,2,2,3]','{2: 3, 3: 1}'),
  ('arrays-hashing','longest-consecutive-run','[11,3,7,5,4,6]','5'),
  ('arrays-hashing','merge-sorted-arrays','left = [], right = [-1,0,4]','[-1,0,4]'),
  ('arrays-hashing','count-target-subarrays','numbers = [0,0,0], target = 0','6'),
  ('javascript-core-challenges','first-unique-character','"aabbcd"','4'),
  ('javascript-core-challenges','chunk-array','items = [1,2,3,4], size = 3','[[1,2,3],[4]]'),
  ('javascript-core-challenges','stable-deduplicate','[3,"x",3,"y","x"]','[3,"x","y"]'),
  ('javascript-core-challenges','flatten-one-level','[[1,2],[[3]],4]','[1,2,[3],4]'),
  ('javascript-core-challenges','group-objects-by-key','records = [{kind:"x",id:1},{kind:"x",id:2}], key = "kind"','{x:[{kind:"x",id:1},{kind:"x",id:2}]}'),
  ('web-development-fundamentals','paginate-items','items = [1,2,3,4,5,6], page = 2, pageSize = 3','[4,5,6]'),
  ('web-development-fundamentals','validate-hex-color','"#a1B2c3"','true'),
  ('web-development-fundamentals','merge-query-parameters','base = "q=old&z=9", updates = {q:null,a:"1"}','a=1&z=9'),
  ('web-development-fundamentals','parse-cookie-header','"x=a=b; empty=; x=last"','{x:"a=b",empty:""}'),
  ('web-development-fundamentals','format-byte-count','bytes = 1073741824','1.0 GiB'),
  ('backend-api-problem-solving','normalize-page-parameters','pageValue = "abc", limitValue = "0"','{page: 1, limit: 1}'),
  ('backend-api-problem-solving','unique-request-keys','["a","b","a","a","b"]','["a","b"]'),
  ('backend-api-problem-solving','deduplicate-records','[{id:"x",updatedAt:3},{id:"y",updatedAt:2},{id:"x",updatedAt:1}]','[{id:"x",updatedAt:3},{id:"y",updatedAt:2}]'),
  ('backend-api-problem-solving','parse-cursor-token','token contains invalid base64url','null'),
  ('backend-api-problem-solving','retryable-http-status','status = 503','true'),
  ('sql-database-foundations','daily-order-totals','orders: (order_id=1, customer_id=3, ordered_at=2026-02-01, amount=3.00), (order_id=2, customer_id=4, ordered_at=2026-02-01, amount=4.00)','2026-02-01 | 7.00'),
  ('sql-database-foundations','customers-without-orders','customers: (1,Ada), (2,Lin), (3,Mo); orders: (10,1)','2 | Lin; 3 | Mo'),
  ('sql-database-foundations','top-customer-order-counts','orders: (order_id=1,customer_id=1), (order_id=2,customer_id=1), (order_id=3,customer_id=1), (order_id=4,customer_id=2)','1 | 3'),
  ('sql-database-foundations','products-never-ordered','products: (1,Pen), (2,Notebook); order_items: (9,1)','2 | Notebook'),
  ('sql-database-foundations','monthly-running-sales','sales: (1,2026-01-01,1.25), (2,2026-03-01,2.00)','2026-01-01 | 1.25; 2026-03-01 | 3.25'),
  ('trees-graphs-practice','tree-maximum-depth','[1,2,3,4,null,null,5]','3'),
  ('trees-graphs-practice','count-components','nodeCount = 4, edges = [[0,1]]','3'),
  ('trees-graphs-practice','shortest-unweighted-path','nodeCount = 5, edges = [[0,1],[1,2],[2,4],[0,3]], start = 0, target = 4','3'),
  ('trees-graphs-practice','validate-binary-search-tree','[2,2,2]','false'),
  ('trees-graphs-practice','level-order-traversal','[1,2,3,4]','[[1],[2,3],[4]]'),
  ('arrays-strings-interview-set','longest-unique-substring','"pwwkew"','3'),
  ('arrays-strings-interview-set','merge-overlapping-intervals','[[1,4],[4,5],[9,9]]','[[1,5],[9,9]]'),
  ('arrays-strings-interview-set','valid-palindrome','"No x in Nixon"','true'),
  ('arrays-strings-interview-set','minimum-covering-window','text = "aabdec", target = "abc"','"abdec"'),
  ('arrays-strings-interview-set','run-length-encode','""','""')
) as hidden(collection_slug, question_slug, test_input, expected_output)
join public.coding_test_sets collection on collection.slug = hidden.collection_slug
join public.coding_questions question
  on question.collection_id = collection.id and question.slug = hidden.question_slug
on conflict (question_id, case_order) do update set
  test_input = excluded.test_input,
  expected_output = excluded.expected_output,
  visibility = excluded.visibility;

commit;
