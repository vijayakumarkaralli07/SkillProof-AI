begin;

create temporary table stacks_queue_question_seed (
  slug text not null,
  title text not null,
  problem_statement text not null,
  difficulty text not null,
  topic_tags text[] not null,
  constraints jsonb not null,
  examples jsonb not null
) on commit drop;

insert into stacks_queue_question_seed
select slug, title, problem_statement, difficulty, topic_tags, constraints, examples
from jsonb_to_recordset($seed$
[
  {
    "slug": "canonicalize-absolute-path",
    "title": "Canonicalize an Absolute File Path",
    "problem_statement": "Implement solve(input) with path, an absolute Unix-style path. Collapse repeated slashes and '.', resolve '..' by removing the preceding directory when one exists, and never move above root. Return the canonical path with no trailing slash except for root.",
    "difficulty": "Medium",
    "topic_tags": [
      "Stack",
      "Path Parsing"
    ],
    "constraints": [
      "1 <= path.length <= 100000",
      "Path components contain printable non-space ASCII characters"
    ],
    "examples": [
      {
        "input": "\"/a/./b/../../c/\"",
        "output": "\"/c\""
      },
      {
        "input": "\"/home//user/../docs/./draft\"",
        "output": "\"/home/docs/draft\""
      }
    ]
  },
  {
    "slug": "remove-exact-adjacent-groups",
    "title": "Remove Repeated Adjacent Groups",
    "problem_statement": "Implement solve(input) with text and k. Whenever k equal adjacent characters accumulate, remove those k; then continue scanning, allowing characters separated by the removed group to become adjacent and trigger further removals. Return the stable final string after all cascades.",
    "difficulty": "Medium",
    "topic_tags": [
      "Stack",
      "String Reduction"
    ],
    "constraints": [
      "1 <= text.length <= 100000",
      "2 <= k <= text.length+1"
    ],
    "examples": [
      {
        "input": "text=\"deeedbbcccbdaa\", k=3",
        "output": "\"aa\""
      },
      {
        "input": "text=\"pbbcggttciiippooaais\", k=2",
        "output": "\"ps\""
      }
    ]
  },
  {
    "slug": "minimum-invalid-parentheses-removal",
    "title": "Remove the Fewest Invalid Parentheses",
    "problem_statement": "Implement solve(input) with text containing lowercase letters and parentheses. Return all distinct strings obtainable by deleting the minimum number of parentheses so the result is balanced. Sort answers lexicographically; letters may not be deleted.",
    "difficulty": "Hard",
    "topic_tags": [
      "Stack",
      "Breadth-First Search"
    ],
    "constraints": [
      "0 <= text.length <= 25",
      "text contains lowercase English letters, '(' and ')'"
    ],
    "examples": [
      {
        "input": "\"()())()\"",
        "output": "[\"(())()\",\"()()()\"]"
      },
      {
        "input": "\"(a)())()\"",
        "output": "[\"(a())()\",\"(a)()()\"]"
      }
    ]
  },
  {
    "slug": "longest-valid-parentheses-substring",
    "title": "Longest Valid Parentheses Substring",
    "problem_statement": "Implement solve(input) with text containing only parentheses. Return the length of the longest contiguous substring that is balanced under ordinary parenthesis matching; a valid subsequence with gaps does not count.",
    "difficulty": "Hard",
    "topic_tags": [
      "Stack",
      "Dynamic Programming"
    ],
    "constraints": [
      "0 <= text.length <= 200000",
      "text contains only '(' and ')'"
    ],
    "examples": [
      {
        "input": "\")()())\"",
        "output": "4"
      },
      {
        "input": "\"()(())\"",
        "output": "6"
      }
    ]
  },
  {
    "slug": "wildcard-parentheses-validity",
    "title": "Validate Parentheses with Wildcards",
    "problem_statement": "Implement solve(input) with text containing '(', ')' and '*'. Each '*' may represent one opening parenthesis, one closing parenthesis, or an empty string. Return true iff some assignment makes the complete string balanced.",
    "difficulty": "Medium",
    "topic_tags": [
      "Stack",
      "Greedy"
    ],
    "constraints": [
      "0 <= text.length <= 100000",
      "text contains only '(', ')' and '*'"
    ],
    "examples": [
      {
        "input": "\"(*))\"",
        "output": "true"
      },
      {
        "input": "\"(*()\"",
        "output": "true"
      }
    ]
  },
  {
    "slug": "next-smaller-values",
    "title": "Next Strictly Smaller Values",
    "problem_statement": "Implement solve(input) with values. For each index, return the value at the nearest later index with a strictly smaller value, or -1 if none exists. Equal values are not smaller. Preserve the input order in the result.",
    "difficulty": "Medium",
    "topic_tags": [
      "Monotonic Stack",
      "Arrays"
    ],
    "constraints": [
      "1 <= values.length <= 200000",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "[4,8,5,2,25]",
        "output": "[2,5,2,-1,-1]"
      },
      {
        "input": "[3,3,2,6,5]",
        "output": "[2,2,-1,5,-1]"
      }
    ]
  },
  {
    "slug": "largest-histogram-rectangle-area",
    "title": "Largest Rectangle in a Histogram",
    "problem_statement": "Implement solve(input) with heights. Each bar has unit width. Return the greatest area of a rectangle spanning consecutive bars whose height does not exceed the shortest bar in that span. Target O(n) time.",
    "difficulty": "Hard",
    "topic_tags": [
      "Monotonic Stack",
      "Geometry"
    ],
    "constraints": [
      "1 <= heights.length <= 200000",
      "0 <= heights[i] <= 1000000000"
    ],
    "examples": [
      {
        "input": "[2,1,5,6,2,3]",
        "output": "10"
      },
      {
        "input": "[4,2,0,3,2,5]",
        "output": "6"
      }
    ]
  },
  {
    "slug": "largest-rectangle-binary-matrix",
    "title": "Largest All-One Rectangle in a Matrix",
    "problem_statement": "Implement solve(input) with matrix, a rectangular grid of '0' and '1'. Return the area of the largest axis-aligned rectangle containing only ones. The matrix may have zero rows or columns.",
    "difficulty": "Hard",
    "topic_tags": [
      "Monotonic Stack",
      "Matrix"
    ],
    "constraints": [
      "0 <= rows,columns <= 300",
      "rows * columns <= 90000"
    ],
    "examples": [
      {
        "input": "[[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]",
        "output": "6"
      },
      {
        "input": "[[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"]]",
        "output": "6"
      }
    ]
  },
  {
    "slug": "sum-of-subarray-minima",
    "title": "Sum the Minimum of Every Subarray",
    "problem_statement": "Implement solve(input) with positive integer values. Sum the minimum element over every nonempty contiguous subarray and return the sum modulo 1,000,000,007. Handle duplicate minima so each subarray contributes exactly once; target O(n) time.",
    "difficulty": "Hard",
    "topic_tags": [
      "Monotonic Stack",
      "Contribution Counting"
    ],
    "constraints": [
      "1 <= values.length <= 200000",
      "1 <= values[i] <= 1000000000"
    ],
    "examples": [
      {
        "input": "[3,1,2,4]",
        "output": "17"
      },
      {
        "input": "[11,81,94,43,3]",
        "output": "444"
      }
    ]
  },
  {
    "slug": "circular-next-greater-values",
    "title": "Next Greater Values in a Circular Array",
    "problem_statement": "Implement solve(input) with values treated as circular. At each position, find the first strictly greater value encountered moving forward, excluding the starting position; return -1 if no greater value exists. Return answers in original index order.",
    "difficulty": "Medium",
    "topic_tags": [
      "Monotonic Stack",
      "Circular Array"
    ],
    "constraints": [
      "1 <= values.length <= 200000",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "[1,2,1]",
        "output": "[2,-1,2]"
      },
      {
        "input": "[5,4,3]",
        "output": "[-1,5,5]"
      }
    ]
  },
  {
    "slug": "directional-mass-collisions",
    "title": "Resolve Directional Mass Collisions",
    "problem_statement": "Implement solve(input) with nonzero signed objects. Positive objects move right, negative objects move left, and absolute value is mass. Only a right-moving object followed by a left-moving object can collide; the smaller disappears, or both disappear on equal mass. Return survivors in order.",
    "difficulty": "Medium",
    "topic_tags": [
      "Stack",
      "Simulation"
    ],
    "constraints": [
      "1 <= objects.length <= 100000",
      "1 <= abs(objects[i]) <= 1000000"
    ],
    "examples": [
      {
        "input": "[5,10,-5]",
        "output": "[5,10]"
      },
      {
        "input": "[8,-8,3]",
        "output": "[3]"
      }
    ]
  },
  {
    "slug": "remove-k-digits-minimum-number",
    "title": "Remove K Digits to Minimize a Number",
    "problem_statement": "Implement solve(input) with decimal string digits and integer k. Remove exactly k digits while preserving the order of the remaining digits to form the smallest possible nonnegative integer. Remove leading zeroes; return the string \"0\" if no nonzero digit remains.",
    "difficulty": "Medium",
    "topic_tags": [
      "Monotonic Stack",
      "Greedy"
    ],
    "constraints": [
      "1 <= digits.length <= 100000",
      "0 <= k <= digits.length"
    ],
    "examples": [
      {
        "input": "digits=\"1432219\", k=3",
        "output": "\"1219\""
      },
      {
        "input": "digits=\"10200\", k=1",
        "output": "\"200\""
      }
    ]
  },
  {
    "slug": "smallest-distinct-character-subsequence",
    "title": "Smallest Subsequence Containing Distinct Characters",
    "problem_statement": "Implement solve(input) with lowercase text. Return the lexicographically smallest subsequence containing each distinct character exactly once. Selected characters must remain in their original relative order.",
    "difficulty": "Medium",
    "topic_tags": [
      "Monotonic Stack",
      "Greedy"
    ],
    "constraints": [
      "1 <= text.length <= 100000",
      "text contains lowercase English letters"
    ],
    "examples": [
      {
        "input": "\"cbacdcbc\"",
        "output": "\"acdb\""
      },
      {
        "input": "\"bcabc\"",
        "output": "\"abc\""
      }
    ]
  },
  {
    "slug": "evaluate-infix-with-unary-minus",
    "title": "Evaluate Infix Arithmetic with Unary Minus",
    "problem_statement": "Implement solve(input) with a valid expression containing nonnegative integers, parentheses, unary minus, and binary +,-,*,/. Multiplication and division precede addition and subtraction; division truncates toward zero. Return the integer value.",
    "difficulty": "Hard",
    "topic_tags": [
      "Stack",
      "Expression Parsing"
    ],
    "constraints": [
      "1 <= expression.length <= 100000",
      "Intermediate values fit signed 64-bit integers",
      "Division by zero does not occur"
    ],
    "examples": [
      {
        "input": "\"2*(3+4)-10/3\"",
        "output": "11"
      },
      {
        "input": "\"-(2+3)*4+18/5\"",
        "output": "-17"
      }
    ]
  },
  {
    "slug": "exclusive-time-nested-functions",
    "title": "Compute Exclusive Time from Nested Logs",
    "problem_statement": "Implement solve(input) with function count n and logs of form \"id:start:t\" or \"id:end:t\". Calls are single-threaded and nested; an end timestamp is inclusive. Return each function's exclusive execution time, excluding time spent in child calls.",
    "difficulty": "Medium",
    "topic_tags": [
      "Stack",
      "Event Processing"
    ],
    "constraints": [
      "1 <= n <= 10000",
      "1 <= logs.length <= 100000",
      "Logs form a valid nested trace with nonnegative timestamps"
    ],
    "examples": [
      {
        "input": "n=2, logs=[\"0:start:0\",\"1:start:2\",\"1:end:5\",\"0:end:6\"]",
        "output": "[3,4]"
      },
      {
        "input": "n=2, logs=[\"0:start:0\",\"0:end:1\",\"1:start:2\",\"1:end:4\"]",
        "output": "[2,3]"
      }
    ]
  },
  {
    "slug": "sliding-window-maximum-deque",
    "title": "Maximum Value in Every Sliding Window",
    "problem_statement": "Implement solve(input) with values and window length k. Return the maximum of each contiguous window of length k from left to right. Design an O(n) solution using a deque; each index should enter and leave the deque at most once.",
    "difficulty": "Hard",
    "topic_tags": [
      "Deque",
      "Sliding Window"
    ],
    "constraints": [
      "1 <= values.length <= 200000",
      "1 <= k <= values.length",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[1,3,-1,-3,5,3,6,7], k=3",
        "output": "[3,3,5,5,6,7]"
      },
      {
        "input": "values=[9,8,7,6,5], k=2",
        "output": "[9,8,7,6]"
      }
    ]
  },
  {
    "slug": "shortest-subarray-sum-at-least-target",
    "title": "Shortest Subarray with Sum at Least Target",
    "problem_statement": "Implement solve(input) with values and positive target. Return the length of the shortest nonempty contiguous subarray whose sum is at least target, or zero if none exists. Values may be negative; target O(n) time with prefix sums and a monotonic deque.",
    "difficulty": "Hard",
    "topic_tags": [
      "Deque",
      "Prefix Sum"
    ],
    "constraints": [
      "1 <= values.length <= 100000",
      "1 <= target <= 1000000000000",
      "-1000000000 <= values[i] <= 1000000000"
    ],
    "examples": [
      {
        "input": "values=[2,-1,2], target=3",
        "output": "3"
      },
      {
        "input": "values=[84,-37,32,40,95], target=167",
        "output": "3"
      }
    ]
  },
  {
    "slug": "first-unique-character-stream",
    "title": "First Unique Character After Each Stream Prefix",
    "problem_statement": "Implement solve(input) with lowercase string text. After each character arrives, report the earliest character whose count in the prefix is exactly one, or '#' if no such character exists. Return a string with one report per input character.",
    "difficulty": "Medium",
    "topic_tags": [
      "Queue",
      "Frequency Counting"
    ],
    "constraints": [
      "1 <= text.length <= 200000",
      "text contains lowercase English letters"
    ],
    "examples": [
      {
        "input": "\"aabc\"",
        "output": "\"a#bb\""
      },
      {
        "input": "\"abac\"",
        "output": "\"aabb\""
      }
    ]
  },
  {
    "slug": "queue-interleave-two-halves",
    "title": "Interleave the Two Halves of a Queue",
    "problem_statement": "Implement solve(input) with values representing a queue of even length. Interleave the first half and second half, beginning with the first item of the first half, and return the queue contents. Preserve the relative order within both halves.",
    "difficulty": "Easy",
    "topic_tags": [
      "Queue",
      "Interleaving"
    ],
    "constraints": [
      "2 <= values.length <= 100000",
      "values.length is even",
      "Values are distinct integers"
    ],
    "examples": [
      {
        "input": "[1,2,3,4,5,6,7,8]",
        "output": "[1,5,2,6,3,7,4,8]"
      },
      {
        "input": "[10,20,30,40]",
        "output": "[10,30,20,40]"
      }
    ]
  },
  {
    "slug": "round-robin-completion-order",
    "title": "Simulate Round-Robin Task Completion",
    "problem_statement": "Implement solve(input) with positive task durations and positive quantum. Tasks enter a FIFO queue in index order; each receives min(remaining duration, quantum) time, and unfinished tasks return to the back. Return task indices in completion order.",
    "difficulty": "Medium",
    "topic_tags": [
      "Queue",
      "Simulation"
    ],
    "constraints": [
      "1 <= durations.length <= 100000",
      "1 <= durations[i],quantum <= 1000000000"
    ],
    "examples": [
      {
        "input": "durations=[5,1,3], quantum=2",
        "output": "[1,2,0]"
      },
      {
        "input": "durations=[6,4,2], quantum=3",
        "output": "[2,0,1]"
      }
    ]
  }
]
$seed$::jsonb) as records(
  slug text, title text, problem_statement text, difficulty text,
  topic_tags text[], constraints jsonb, examples jsonb
);

do $validate$
begin
  if (select count(*) from stacks_queue_question_seed) <> 20
     or (select count(distinct slug) from stacks_queue_question_seed) <> 20
     or (select count(distinct title) from stacks_queue_question_seed) <> 20
     or (select count(distinct problem_statement) from stacks_queue_question_seed) <> 20 then
    raise exception 'stacks-queues seed must contain exactly 20 distinct questions';
  end if;
  if exists (
    select 1 from stacks_queue_question_seed
    where slug in ('valid-parentheses','min-stack','queue-reconstruction','decode-string',
      'next-greater-element','evaluate-rpn','validate-stack-sequences')
       or char_length(btrim(title)) < 12
       or char_length(btrim(problem_statement)) < 150
       or difficulty not in ('Easy','Medium','Hard')
       or jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) < 2
       or jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2
       or exists (select 1 from jsonb_array_elements(examples) e
         where nullif(btrim(e->>'input'),'') is null
            or nullif(btrim(e->>'output'),'') is null
            or btrim(e->>'output') in ('[]','[ ]','null','[null]','{}'))
  ) then
    raise exception 'stacks-queues seed has invalid content or duplicates an existing slug';
  end if;
end
$validate$;

with question_rows as (
  select collection.id as collection_id, seed.slug, seed.title,
    seed.problem_statement || E'\n\nIn every language, implement solve(input) where input is one record with the named fields above. Return the stated scalar, string, or array result; the examples use JSON-style values.' as problem_statement,
    seed.difficulty, seed.topic_tags, seed.constraints, seed.examples,
    jsonb_build_object(
      'JavaScript', 'function solve(input) {' || E'\n  // Implement the specified stack or queue algorithm' || E'\n  return null;' || E'\n}',
      'Python', 'def solve(input):' || E'\n    # Implement the specified stack or queue algorithm' || E'\n    return None',
      'Java', 'import java.util.*;' || E'\nclass Solution {' || E'\n  static Object solve(Map<String, Object> input) {' || E'\n    // Implement the specified stack or queue algorithm' || E'\n    return null;' || E'\n  }' || E'\n}',
      'C++', '#include <any>' || E'\n#include <string>' || E'\n#include <unordered_map>' || E'\nclass Solution {' || E'\npublic:' || E'\n  std::any solve(const std::unordered_map<std::string, std::any>& input) {' || E'\n    // Implement the specified stack or queue algorithm' || E'\n    return {};' || E'\n  }' || E'\n};'
    ) as starter_code_by_language,
    case seed.difficulty when 'Easy' then 100 when 'Medium' then 150 else 200 end as points
  from stacks_queue_question_seed seed
  join public.coding_test_sets collection on collection.slug = 'stacks-queues'
), ordered_rows as (
  select question_rows.*,
    coalesce((select max(question_order) from public.coding_questions
      where collection_id = question_rows.collection_id), 0)
      + row_number() over (partition by collection_id order by slug) as question_order
  from question_rows
)
insert into public.coding_questions (
  collection_id, slug, title, problem_statement, difficulty, topic_tags, constraints,
  examples, starter_code_by_language, points, publication_status, question_order
)
select collection_id, slug, title, problem_statement, difficulty, topic_tags, constraints,
  examples, starter_code_by_language, points, 'published', question_order
from ordered_rows
on conflict (collection_id, slug) do nothing;

insert into public.coding_test_cases (question_id, case_order, test_input, expected_output, visibility)
select question.id, example.ordinality::integer, example.value->>'input',
  example.value->>'output', 'visible'
from stacks_queue_question_seed seed
join public.coding_test_sets collection on collection.slug = 'stacks-queues'
join public.coding_questions question
  on question.collection_id = collection.id and question.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples) with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

do $post_validate$
declare
  question_count integer;
  expected_case_count integer;
  visible_case_count integer;
begin
  select count(*) into question_count
  from public.coding_questions question
  join public.coding_test_sets collection on collection.id = question.collection_id
  where collection.slug = 'stacks-queues'
    and question.slug in (select slug from stacks_queue_question_seed)
    and question.publication_status = 'published';
  if question_count <> 20 then
    raise exception 'stacks-queues must have exactly 20 published seeded questions';
  end if;

  if exists (
    select 1
    from public.coding_questions question
    join public.coding_test_sets collection on collection.id = question.collection_id
    where collection.slug = 'stacks-queues'
      and question.slug in (select slug from stacks_queue_question_seed)
      and (
        jsonb_typeof(question.starter_code_by_language) <> 'object'
        or not (question.starter_code_by_language ? 'JavaScript')
        or not (question.starter_code_by_language ? 'Python')
        or not (question.starter_code_by_language ? 'Java')
        or not (question.starter_code_by_language ? 'C++')
        or nullif(btrim(question.starter_code_by_language->>'JavaScript'), '') is null
        or nullif(btrim(question.starter_code_by_language->>'Python'), '') is null
        or nullif(btrim(question.starter_code_by_language->>'Java'), '') is null
        or nullif(btrim(question.starter_code_by_language->>'C++'), '') is null
      )
  ) then
    raise exception 'stacks-queues questions must include all four language starters';
  end if;

  select sum(jsonb_array_length(examples)) into expected_case_count
  from stacks_queue_question_seed;
  select count(*) into visible_case_count
  from public.coding_test_cases test_case
  join public.coding_questions question on question.id = test_case.question_id
  join public.coding_test_sets collection on collection.id = question.collection_id
  where collection.slug = 'stacks-queues'
    and question.slug in (select slug from stacks_queue_question_seed)
    and test_case.visibility = 'visible';
  if visible_case_count <> expected_case_count then
    raise exception 'stacks-queues visible cases must match the seeded examples';
  end if;
end
$post_validate$;

commit;
