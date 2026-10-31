begin;

create temporary table arrays_strings_seed (
  collection_slug text not null default 'arrays-strings-interview-set',
  slug text primary key,
  title text not null,
  problem_statement text not null,
  difficulty text not null,
  topic_tags text[] not null,
  constraints jsonb not null,
  examples jsonb not null,
  function_name text not null,
  js_parameters text not null,
  py_function_name text not null,
  py_parameters text not null,
  starter_hint text not null
) on commit drop;

insert into arrays_strings_seed
select 'arrays-strings-interview-set', s.slug, s.title, s.problem_statement, s.difficulty,
  s.topic_tags, s.constraints, s.examples, s.function_name, s.js_parameters,
  s.py_function_name, s.py_parameters, s.starter_hint
from jsonb_to_recordset($seed$
[
  {"slug":"reverse-word-order","title":"Reverse the Word Order","problem_statement":"Reverse the order of words in a sentence and join them with one space. A word is a maximal run of non-space characters; discard leading, trailing, and repeated spaces without changing characters inside words.","difficulty":"Easy","topic_tags":["Strings","Scanning"],"constraints":["1 <= text.length <= 100000","text contains ASCII spaces and visible non-space characters"],"examples":[{"input":"\"  the sky  is blue \"","output":"blue is sky the"},{"input":"\"one more   time\"","output":"time more one"}],"function_name":"reverseWordOrder","js_parameters":"text","py_function_name":"reverse_word_order","py_parameters":"text","starter_hint":"Scan maximal non-space runs, retain their order, then reverse the collected word list before joining."},
  {"slug":"string-rotation-check","title":"Check Whether One String Rotates Into Another","problem_statement":"Return true when candidate can be obtained by cutting source at one position and swapping the two pieces. Zero-position rotation is allowed; character comparisons are case-sensitive and lengths must match.","difficulty":"Easy","topic_tags":["Strings","Search"],"constraints":["0 <= source.length, candidate.length <= 100000","Strings contain lowercase English letters"],"examples":[{"input":"source = \"waterbottle\", candidate = \"erbottlewat\"","output":"true"},{"input":"source = \"algorithm\", candidate = \"logarithm\"","output":"false"}],"function_name":"isStringRotation","js_parameters":"source, candidate","py_function_name":"is_string_rotation","py_parameters":"source, candidate","starter_hint":"Check equal lengths and search candidate within the concatenation of source with itself."},
  {"slug":"group-strings-by-shift-pattern","title":"Group Strings by Their Shift Pattern","problem_statement":"Group lowercase words whose adjacent letter differences match modulo 26; for example, cyclic shifts share a pattern. Preserve first-seen group order and input order within each group.","difficulty":"Medium","topic_tags":["Strings","Hash Map"],"constraints":["0 <= words.length <= 10000","0 <= words[i].length <= 100","words contain lowercase English letters"],"examples":[{"input":"[\"abc\", \"bcd\", \"acef\", \"xyz\", \"az\", \"ba\", \"a\", \"z\"]","output":"[[\"abc\",\"bcd\",\"xyz\"],[\"acef\"],[\"az\",\"ba\"],[\"a\",\"z\"]]"},{"input":"[\"ab\", \"bc\", \"xy\", \"za\"]","output":"[[\"ab\",\"bc\",\"xy\",\"za\"]]"}],"function_name":"groupByShiftPattern","js_parameters":"words","py_function_name":"group_by_shift_pattern","py_parameters":"words","starter_hint":"Normalize each adjacent alphabet offset modulo 26 and use that offset sequence as an insertion-ordered group key."},
  {"slug":"longest-palindromic-substring","title":"Longest Palindromic Substring","problem_statement":"Return a longest palindromic contiguous substring. If multiple answers have maximum length, choose the one with the smallest starting index.","difficulty":"Medium","topic_tags":["Strings","Two Pointers"],"constraints":["1 <= text.length <= 5000","text contains lowercase English letters"],"examples":[{"input":"\"babad\"","output":"bab"},{"input":"\"cbbd\"","output":"bb"}],"function_name":"longestPalindromicSubstring","js_parameters":"text","py_function_name":"longest_palindromic_substring","py_parameters":"text","starter_hint":"Expand around odd and even centers while tracking the longest range and its earliest-start tie-break."},
  {"slug":"normalize-unix-path","title":"Normalize an Absolute Unix Path","problem_statement":"Collapse repeated slashes, ignore '.' path components, and resolve '..' by removing the previous directory when possible. Return one leading slash with no trailing slash except for the root path.","difficulty":"Medium","topic_tags":["Strings","Stack"],"constraints":["1 <= path.length <= 100000","path begins with '/' and contains lowercase names, '.', '..', and '/'"],"examples":[{"input":"\"/home//user/../docs/\"","output":"/home/docs"},{"input":"\"/a/./b/../../c/\"","output":"/c"}],"function_name":"normalizeUnixPath","js_parameters":"path","py_function_name":"normalize_unix_path","py_parameters":"path","starter_hint":"Split on slash, ignore empty and dot components, and use a stack that pops only when a parent component can be removed."},
  {"slug":"decode-nested-repetition","title":"Decode Nested Repetition Notation","problem_statement":"Decode expressions where k[substring] repeats the substring k times; brackets may nest and counts are positive integers immediately before '['. Return the fully expanded text.","difficulty":"Medium","topic_tags":["Strings","Stack"],"constraints":["1 <= encoded.length <= 10000","1 <= repeat count <= 1000","Decoded result length does not exceed 100000"],"examples":[{"input":"\"3[a2[c]]\"","output":"accaccacc"},{"input":"\"2[abc]3[cd]ef\"","output":"abcabccdcdcdef"}],"function_name":"decodeRepetition","js_parameters":"encoded","py_function_name":"decode_repetition","py_parameters":"encoded","starter_hint":"Use stacks for the prior text and repeat count, restoring the prior prefix when each closing bracket is reached."},
  {"slug":"basic-expression-calculator","title":"Evaluate an Expression With Parentheses","problem_statement":"Evaluate a valid expression containing non-negative integers, addition, subtraction, parentheses, and spaces. Unary plus and minus are allowed before numbers or parenthesized expressions; intermediate values fit signed 32-bit range.","difficulty":"Hard","topic_tags":["Strings","Stack","Parsing"],"constraints":["1 <= expression.length <= 100000","Expression is valid and contains only digits, spaces, +, -, (, )"],"examples":[{"input":"\"1 + 1\"","output":"2"},{"input":"\"-(2 - 3) + 10\"","output":"11"}],"function_name":"evaluateExpression","js_parameters":"expression","py_function_name":"evaluate_expression","py_parameters":"expression","starter_hint":"Accumulate multi-digit numbers and use a sign plus a stack of outer signs when entering or leaving parentheses."},
  {"slug":"compare-dotted-versions","title":"Compare Dotted Version Numbers","problem_statement":"Compare version strings composed of non-negative integer components separated by dots. Missing trailing components equal zero, leading zeroes do not matter, and return -1, 0, or 1 for lower, equal, or higher.","difficulty":"Medium","topic_tags":["Strings","Parsing"],"constraints":["1 <= first.length, second.length <= 1000","Each component contains decimal digits and fits in a signed 32-bit integer"],"examples":[{"input":"first = \"1.01\", second = \"1.001.0\"","output":"0"},{"input":"first = \"1.0.1\", second = \"1\"","output":"1"}],"function_name":"compareVersions","js_parameters":"first, second","py_function_name":"compare_versions","py_parameters":"first, second","starter_hint":"Compare parsed numeric components by index, treating any missing component as zero rather than comparing text."},
  {"slug":"add-binary-strings","title":"Add Two Binary Strings","problem_statement":"Return the binary representation of the sum of two non-empty binary strings. Inputs have no leading zero unless the value is zero; do not convert either full string to a machine integer.","difficulty":"Easy","topic_tags":["Strings","Arithmetic"],"constraints":["1 <= first.length, second.length <= 100000","Inputs contain only '0' and '1'"],"examples":[{"input":"first = \"11\", second = \"1\"","output":"100"},{"input":"first = \"1010\", second = \"1011\"","output":"10101"}],"function_name":"addBinaryStrings","js_parameters":"first, second","py_function_name":"add_binary_strings","py_parameters":"first, second","starter_hint":"Walk both strings from right to left, append each sum bit, propagate carry, then reverse the collected digits."},
  {"slug":"multiply-decimal-strings","title":"Multiply Large Decimal Strings","problem_statement":"Return the product of two non-negative decimal integer strings without converting either whole operand to a machine integer. The result has no leading zeroes unless it is exactly zero.","difficulty":"Medium","topic_tags":["Strings","Arithmetic"],"constraints":["1 <= first.length, second.length <= 200","Inputs contain decimal digits and have no leading zero unless equal to '0'"],"examples":[{"input":"first = \"123\", second = \"456\"","output":"56088"},{"input":"first = \"99\", second = \"99\"","output":"9801"}],"function_name":"multiplyDecimalStrings","js_parameters":"first, second","py_function_name":"multiply_decimal_strings","py_parameters":"first, second","starter_hint":"Accumulate digit products into positional slots, propagate carries from right to left, and strip only leading zero slots."},
  {"slug":"edit-distance-strings","title":"Minimum Edit Distance","problem_statement":"Return the minimum number of single-character insertions, deletions, and substitutions required to transform source into target. Every operation costs one.","difficulty":"Medium","topic_tags":["Strings","Dynamic Programming"],"constraints":["0 <= source.length, target.length <= 1000","Strings contain lowercase English letters"],"examples":[{"input":"source = \"horse\", target = \"ros\"","output":"3"},{"input":"source = \"intention\", target = \"execution\"","output":"5"}],"function_name":"editDistance","js_parameters":"source, target","py_function_name":"edit_distance","py_parameters":"source, target","starter_hint":"Build the prefix dynamic-programming recurrence using deletion, insertion, and match-or-substitution transitions."},
  {"slug":"dictionary-word-segmentation","title":"Segment Text Into Dictionary Words","problem_statement":"Return true if text can be split into dictionary words placed consecutively. A word may be reused any number of times, and the empty text is segmentable.","difficulty":"Medium","topic_tags":["Strings","Dynamic Programming","Hash Set"],"constraints":["0 <= text.length <= 1000","1 <= dictionary.length <= 10000","1 <= dictionary[i].length <= 30"],"examples":[{"input":"text = \"leetcode\", dictionary = [\"leet\", \"code\"]","output":"true"},{"input":"text = \"catsandog\", dictionary = [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]","output":"false"}],"function_name":"canSegmentWords","js_parameters":"text, dictionary","py_function_name":"can_segment_words","py_parameters":"text, dictionary","starter_hint":"Mark reachable prefix boundaries and extend only from a reachable boundary when a dictionary word matches."},
  {"slug":"interleaving-two-strings","title":"Check Interleaving of Two Strings","problem_statement":"Return true if candidate uses every character from first and second exactly once while preserving the original order of each source string. The candidate length equals the sum of the source lengths.","difficulty":"Hard","topic_tags":["Strings","Dynamic Programming"],"constraints":["0 <= first.length, second.length <= 1000","first.length + second.length = candidate.length","Strings contain lowercase English letters"],"examples":[{"input":"first = \"aabcc\", second = \"dbbca\", candidate = \"aadbbcbcac\"","output":"true"},{"input":"first = \"aabcc\", second = \"dbbca\", candidate = \"aadbbbaccc\"","output":"false"}],"function_name":"isInterleaving","js_parameters":"first, second, candidate","py_function_name":"is_interleaving","py_parameters":"first, second, candidate","starter_hint":"Use prefix-pair dynamic programming where a candidate position is reachable from either matching source prefix."},
  {"slug":"longest-repeating-character-replacement","title":"Longest Uniform Window After Replacements","problem_statement":"For uppercase text and replacement budget k, return the longest contiguous substring that can be changed into one repeated character using at most k replacements.","difficulty":"Medium","topic_tags":["Strings","Sliding Window"],"constraints":["0 <= text.length <= 100000","text contains uppercase English letters","0 <= k <= text.length"],"examples":[{"input":"text = \"ABAB\", k = 2","output":"4"},{"input":"text = \"AABABBA\", k = 2","output":"5"}],"function_name":"longestUniformWindow","js_parameters":"text, k","py_function_name":"longest_uniform_window","py_parameters":"text, k","starter_hint":"Track the most frequent letter in a sliding window and shrink while window length minus that frequency exceeds k."},
  {"slug":"all-anagram-start-indices","title":"Find Every Anagram Start","problem_statement":"Return ascending indices where a substring of text is a permutation of pattern. Both strings contain lowercase English letters; overlapping matches must all be included.","difficulty":"Medium","topic_tags":["Strings","Frequency Counting","Sliding Window"],"constraints":["1 <= text.length <= 100000","1 <= pattern.length <= 100000"],"examples":[{"input":"text = \"cbaebabacd\", pattern = \"abc\"","output":"[0,6]"},{"input":"text = \"abab\", pattern = \"ab\"","output":"[0,1,2]"}],"function_name":"anagramStartIndices","js_parameters":"text, pattern","py_function_name":"anagram_start_indices","py_parameters":"text, pattern","starter_hint":"Maintain a fixed-width character frequency window and record its start whenever it matches pattern frequencies."},
  {"slug":"justify-text-lines","title":"Fully Justify Text Lines","problem_statement":"Pack words into lines of width maxWidth. Fully justify every non-final multiword line by distributing spaces evenly, assigning extra spaces to leftmost gaps; left-align the final line and one-word lines. Every output line has exactly maxWidth characters.","difficulty":"Hard","topic_tags":["Strings","Greedy","Formatting"],"constraints":["1 <= words.length <= 300","1 <= words[i].length <= maxWidth <= 100"],"examples":[{"input":"words = [\"This\", \"is\", \"an\", \"example\", \"of\", \"text\", \"justification.\"], maxWidth = 16","output":"[\"This    is    an\",\"example  of text\",\"justification.  \"]"},{"input":"words = [\"What\", \"must\", \"be\", \"acknowledgment\", \"shall\", \"be\"], maxWidth = 16","output":"[\"What   must   be\",\"acknowledgment  \",\"shall be        \"]"}],"function_name":"justifyText","js_parameters":"words, maxWidth","py_function_name":"justify_text","py_parameters":"words, max_width","starter_hint":"Greedily choose each line's words, then distribute its remaining spaces by quotient and remainder across gaps."},
  {"slug":"zigzag-string-conversion","title":"Convert Text to Zigzag Rows","problem_statement":"Write text across numRows by moving down the rows and diagonally back up, then concatenate rows from top to bottom. If there is one row or at least as many rows as characters, the text is unchanged.","difficulty":"Medium","topic_tags":["Strings","Simulation"],"constraints":["1 <= text.length <= 10000","1 <= numRows <= 10000","text contains printable ASCII characters"],"examples":[{"input":"text = \"PAYPALISHIRING\", numRows = 3","output":"PAHNAPLSIIGYIR"},{"input":"text = \"PAYPALISHIRING\", numRows = 4","output":"PINALSIGYAHRPI"}],"function_name":"zigzagConvert","js_parameters":"text, numRows","py_function_name":"zigzag_convert","py_parameters":"text, num_rows","starter_hint":"Append each character to its current row and reverse the row direction only at the top and bottom boundaries."},
  {"slug":"shortest-common-supersequence","title":"Lexicographically Smallest Shortest Supersequence","problem_statement":"Return a shortest string that contains both inputs as subsequences. If multiple shortest strings exist, return the lexicographically smallest one.","difficulty":"Hard","topic_tags":["Strings","Dynamic Programming"],"constraints":["0 <= first.length, second.length <= 1000","Strings contain lowercase English letters"],"examples":[{"input":"first = \"abac\", second = \"cab\"","output":"cabac"},{"input":"first = \"geek\", second = \"eke\"","output":"geeke"}],"function_name":"shortestCommonSupersequence","js_parameters":"first, second","py_function_name":"shortest_common_supersequence","py_parameters":"first, second","starter_hint":"Use an LCS-length table to reconstruct a shortest merge, resolving equal-length reconstruction choices lexicographically."},
  {"slug":"restore-valid-ip-addresses","title":"Restore IPv4 Addresses","problem_statement":"Insert exactly three dots into a digit string to produce all valid IPv4 addresses while preserving digit order. Each segment is 0 through 255 and has no leading zero unless it is exactly zero; sort results lexicographically.","difficulty":"Medium","topic_tags":["Strings","Backtracking"],"constraints":["4 <= digits.length <= 12","digits contains only decimal digits"],"examples":[{"input":"\"25525511135\"","output":"[\"255.255.11.135\",\"255.255.111.35\"]"},{"input":"\"101023\"","output":"[\"1.0.10.23\",\"1.0.102.3\",\"10.1.0.23\",\"10.10.2.3\",\"101.0.2.3\"]"}],"function_name":"restoreIpAddresses","js_parameters":"digits","py_function_name":"restore_ip_addresses","py_parameters":"digits","starter_hint":"Backtrack over four segment lengths, pruning values above 255 and segments with forbidden leading zeroes."},
  {"slug":"longest-string-chain","title":"Longest Word Chain","problem_statement":"A word can follow another when inserting exactly one lowercase letter anywhere in the shorter word produces the longer word. Return the longest chain that can be formed from the distinct input words, using each at most once.","difficulty":"Medium","topic_tags":["Strings","Dynamic Programming","Sorting"],"constraints":["1 <= words.length <= 1000","1 <= words[i].length <= 16","words are distinct lowercase strings"],"examples":[{"input":"[\"a\", \"b\", \"ba\", \"bca\", \"bda\", \"bdca\"]","output":"4"},{"input":"[\"xbc\", \"pcxbcf\", \"xb\", \"cxbc\", \"pcxbc\"]","output":"5"}],"function_name":"longestWordChain","js_parameters":"words","py_function_name":"longest_word_chain","py_parameters":"words","starter_hint":"Process words by increasing length and compute each best chain from all strings formed by deleting one character."}
]
$seed$::jsonb) as s(
  slug text, title text, problem_statement text, difficulty text, topic_tags text[],
  constraints jsonb, examples jsonb, function_name text, js_parameters text,
  py_function_name text, py_parameters text, starter_hint text
);

do $validate$
declare
  target_id uuid;
  existing_count integer;
begin
  select id into target_id from public.coding_test_sets where slug = 'arrays-strings-interview-set';
  if target_id is null then raise exception 'Missing arrays-strings-interview-set collection'; end if;
  select count(*) into existing_count from public.coding_questions
    where collection_id = target_id and slug not in (select slug from arrays_strings_seed);
  if existing_count <> 7 or exists (
    select 1 from unnest(array['longest-unique-substring','merge-overlapping-intervals',
      'valid-palindrome','minimum-covering-window','run-length-encode',
      'longest-common-prefix','longest-proper-prefix-suffix']) required(slug)
    where not exists (select 1 from public.coding_questions q where q.collection_id = target_id and q.slug = required.slug)
  ) then raise exception 'Unexpected existing arrays-strings bank; expected the known seven rows'; end if;
  if (select count(*) from arrays_strings_seed) <> 20
    or (select count(distinct slug) from arrays_strings_seed) <> 20
    or (select count(distinct starter_hint) from arrays_strings_seed) <> 20 then
    raise exception 'arrays-strings seed must contain exactly 20 distinct questions and hints';
  end if;
  if exists (select 1 from arrays_strings_seed where collection_slug <> 'arrays-strings-interview-set'
    or slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(btrim(title)) < 8
    or char_length(btrim(problem_statement)) < 100
    or difficulty not in ('Easy','Medium','Hard') or cardinality(topic_tags) = 0
    or jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) = 0
    or jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2
    or function_name = '' or js_parameters = '' or py_function_name = '' or py_parameters = ''
    or char_length(starter_hint) < 50 or starter_hint ilike '%implement the described algorithm%') then
    raise exception 'Invalid or generic arrays-strings seed fields';
  end if;
  if exists (select 1 from arrays_strings_seed s cross join lateral jsonb_array_elements(s.examples) e
    where jsonb_typeof(e) <> 'object' or jsonb_typeof(e->'input') <> 'string'
      or jsonb_typeof(e->'output') <> 'string' or e->>'input' = '' or e->>'output' = ''
      or e->>'output' in ('[]','[null]','null','undefined')) then
    raise exception 'Every example must contain concrete non-placeholder string input and output';
  end if;
  if exists (select 1 from arrays_strings_seed where slug in
    ('longest-unique-substring','merge-overlapping-intervals','valid-palindrome',
     'minimum-covering-window','run-length-encode','longest-common-prefix',
     'longest-proper-prefix-suffix')) then
    raise exception 'Seed duplicates a previously published arrays-strings slug';
  end if;
end
$validate$;

with target as (
  select s.id, coalesce(max(q.question_order), 0) as max_order
  from public.coding_test_sets s
  left join public.coding_questions q on q.collection_id = s.id
  where s.slug = 'arrays-strings-interview-set'
  group by s.id
)
insert into public.coding_questions (
  collection_id, slug, title, problem_statement, difficulty, topic_tags, constraints,
  examples, starter_code_by_language, points, publication_status, question_order
)
select target.id, seed.slug, seed.title, seed.problem_statement, seed.difficulty, seed.topic_tags,
  seed.constraints, seed.examples,
  jsonb_build_object(
    'JavaScript', format('function %s(%s) {' || E'\n' || '  // TODO: %s' || E'\n' || '}', seed.function_name, seed.js_parameters, seed.starter_hint),
    'Python', format('def %s(%s):' || E'\n' || '    # TODO: %s' || E'\n' || '    pass', seed.py_function_name, seed.py_parameters, seed.starter_hint)
  ),
  case seed.difficulty when 'Easy' then 100 when 'Medium' then 150 else 200 end,
  'published', target.max_order + row_number() over (order by seed.slug)
from arrays_strings_seed seed cross join target
on conflict (collection_id, slug) do nothing;

insert into public.coding_test_cases (question_id, case_order, test_input, expected_output, visibility)
select q.id, example.ordinality::integer, example.value->>'input', example.value->>'output', 'visible'
from arrays_strings_seed seed
join public.coding_test_sets collection on collection.slug = seed.collection_slug
join public.coding_questions q on q.collection_id = collection.id and q.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples) with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

do $verify$
declare
  target_id uuid;
  row_count integer;
  case_count integer;
begin
  select id into target_id from public.coding_test_sets where slug = 'arrays-strings-interview-set';
  select count(*) into row_count from public.coding_questions
    where collection_id = target_id and slug in (select slug from arrays_strings_seed);
  if row_count <> 20 then raise exception 'Expected 20 arrays-strings questions, found %', row_count; end if;
  if exists (select 1 from public.coding_questions q
    where q.collection_id = target_id and q.slug in (select slug from arrays_strings_seed)
      and (jsonb_typeof(q.starter_code_by_language) <> 'object'
        or not (q.starter_code_by_language ? 'JavaScript')
        or not (q.starter_code_by_language ? 'Python')
        or q.starter_code_by_language->>'JavaScript' = ''
        or q.starter_code_by_language->>'Python' = '')) then
    raise exception 'Both supported starter languages must be present';
  end if;
  select count(*) into case_count from public.coding_test_cases c
    join public.coding_questions q on q.id = c.question_id
    where q.collection_id = target_id and q.slug in (select slug from arrays_strings_seed)
      and c.visibility = 'visible';
  if case_count <> (select sum(jsonb_array_length(examples)) from arrays_strings_seed) then
    raise exception 'Visible arrays-strings example test cases do not match seed examples';
  end if;
end
$verify$;

commit;
