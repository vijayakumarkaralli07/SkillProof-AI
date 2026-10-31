begin;

create temporary table arrays_hashing_seed (
  collection_slug text not null default 'arrays-hashing',
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

insert into arrays_hashing_seed
select 'arrays-hashing', s.slug, s.title, s.problem_statement, s.difficulty,
  s.topic_tags, s.constraints, s.examples, s.function_name, s.js_parameters,
  s.py_function_name, s.py_parameters, s.starter_hint
from jsonb_to_recordset($seed$
[
  {"slug":"maximum-product-subarray","title":"Maximum Product of a Contiguous Subarray","problem_statement":"Return the largest product obtainable from a non-empty contiguous range. A negative value can swap the roles of the current largest and smallest products; the answer is exactly representable as a JavaScript safe integer.","difficulty":"Medium","topic_tags":["Arrays","Dynamic Programming"],"constraints":["1 <= numbers.length <= 20000","-10 <= numbers[i] <= 10","The answer is at most 9007199254740991 in absolute value"],"examples":[{"input":"[2, 3, -2, 4]","output":"6"},{"input":"[-2, 3, -4]","output":"24"}],"function_name":"maximumProductSubarray","js_parameters":"numbers","py_function_name":"maximum_product_subarray","py_parameters":"numbers","starter_hint":"At each value retain both ending-here extrema, swapping them before extending when the new value is negative."},
  {"slug":"first-missing-positive","title":"First Missing Positive","problem_statement":"Given an unsorted integer array, find its smallest absent positive value. Design a linear-time algorithm using constant auxiliary space; rearranging the input array is allowed.","difficulty":"Hard","topic_tags":["Arrays","Index Placement"],"constraints":["1 <= numbers.length <= 100000","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"[1, 2, 0]","output":"3"},{"input":"[3, 4, -1, 1]","output":"2"}],"function_name":"firstMissingPositive","js_parameters":"numbers","py_function_name":"first_missing_positive","py_parameters":"numbers","starter_hint":"Place each in-range positive value x at index x minus one, then scan for the first index that disagrees."},
  {"slug":"top-k-frequent-values","title":"Top K Frequent Values","problem_statement":"Return the k integers with greatest frequency, ordered by descending frequency and then ascending numeric value for ties. Every distinct value has a count, and k is between one and the number of distinct values.","difficulty":"Medium","topic_tags":["Arrays","Hash Map","Ordering"],"constraints":["1 <= numbers.length <= 100000","1 <= k <= number of distinct values","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"numbers = [1, 1, 1, 2, 2, 3], k = 2","output":"[1,2]"},{"input":"numbers = [4, 4, 5, 5, 6], k = 2","output":"[4,5]"}],"function_name":"topKFrequentValues","js_parameters":"numbers, k","py_function_name":"top_k_frequent_values","py_parameters":"numbers, k","starter_hint":"Count values once, then order by the explicit frequency-descending and value-ascending tie-break."},
  {"slug":"rotate-array-right","title":"Rotate an Array Right","problem_statement":"Return the input values rotated right by k positions. If k exceeds the array length, rotations wrap around; an empty array returns empty. Do not use a built-in rotation helper.","difficulty":"Medium","topic_tags":["Arrays","In-Place","Reversal"],"constraints":["0 <= numbers.length <= 100000","0 <= k <= 1000000000"],"examples":[{"input":"numbers = [1, 2, 3, 4, 5, 6, 7], k = 3","output":"[5,6,7,1,2,3,4]"},{"input":"numbers = [-1, -100, 3, 99], k = 2","output":"[3,99,-1,-100]"}],"function_name":"rotateArrayRight","js_parameters":"numbers, k","py_function_name":"rotate_array_right","py_parameters":"numbers, k","starter_hint":"Reduce the rotation modulo the length and use three reversals to move the suffix to the front."},
  {"slug":"three-sum-unique-triplets","title":"Unique Triplets Summing to Zero","problem_statement":"Return every distinct value triplet whose sum is zero. Sort each triplet ascending and return triplets in lexicographic order; duplicate input values must not produce duplicate triplets.","difficulty":"Medium","topic_tags":["Arrays","Sorting","Two Pointers"],"constraints":["3 <= numbers.length <= 3000","-100000 <= numbers[i] <= 100000"],"examples":[{"input":"[-1, 0, 1, 2, -1, -4]","output":"[[-1,-1,2],[-1,0,1]]"},{"input":"[-2, 0, 0, 2, 2]","output":"[[-2,0,2]]"}],"function_name":"threeSumTriplets","js_parameters":"numbers","py_function_name":"three_sum_triplets","py_parameters":"numbers","starter_hint":"Sort once, fix each first value, and sweep the remaining suffix with two pointers while skipping duplicates."},
  {"slug":"next-lexicographic-permutation","title":"Next Lexicographic Permutation","problem_statement":"Rearrange the array into the next lexicographically greater permutation. If none exists, rearrange it into ascending order. Modify and return the input without generating all permutations.","difficulty":"Medium","topic_tags":["Arrays","Permutation","In-Place"],"constraints":["1 <= numbers.length <= 100000","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"[1, 2, 3]","output":"[1,3,2]"},{"input":"[1, 1, 5]","output":"[1,5,1]"}],"function_name":"nextPermutation","js_parameters":"numbers","py_function_name":"next_permutation","py_parameters":"numbers","starter_hint":"Find the rightmost ascending pivot, swap it with the smallest greater suffix value, then reverse the suffix."},
  {"slug":"distinct-count-each-window","title":"Distinct Values in Each Window","problem_statement":"For every contiguous window of width k, return the number of distinct integers in that window, in left-to-right order. The width is valid and does not exceed the array length.","difficulty":"Medium","topic_tags":["Arrays","Hash Map","Sliding Window"],"constraints":["1 <= numbers.length <= 100000","1 <= k <= numbers.length","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"numbers = [1, 2, 1, 3, 4, 2, 3], k = 4","output":"[3,4,4,3]"},{"input":"numbers = [1, 1, 2, 2, 3], k = 3","output":"[2,2,2]"}],"function_name":"distinctCountsPerWindow","js_parameters":"numbers, k","py_function_name":"distinct_counts_per_window","py_parameters":"numbers, k","starter_hint":"Maintain a value-to-count map as the window advances and remove keys only when their count reaches zero."},
  {"slug":"longest-ones-after-flips","title":"Longest Ones After at Most K Flips","problem_statement":"Given a binary array and a flip budget k, return the maximum length of a contiguous range that can be all ones after changing at most k zeroes to ones.","difficulty":"Medium","topic_tags":["Arrays","Sliding Window"],"constraints":["0 <= bits.length <= 100000","bits[i] is 0 or 1","0 <= k <= bits.length"],"examples":[{"input":"bits = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2","output":"6"},{"input":"bits = [0, 0, 1, 1, 0, 1, 1], k = 1","output":"5"}],"function_name":"longestOnesAfterFlips","js_parameters":"bits, k","py_function_name":"longest_ones_after_flips","py_parameters":"bits, k","starter_hint":"Expand a sliding window and advance its left edge whenever the zero count exceeds the flip budget."},
  {"slug":"pivot-index-balanced-sums","title":"Find the Leftmost Pivot Index","problem_statement":"Return the smallest index where the sum strictly to its left equals the sum strictly to its right. The pivot value is excluded from both sums; return -1 if no index qualifies.","difficulty":"Easy","topic_tags":["Arrays","Prefix Sums"],"constraints":["1 <= numbers.length <= 100000","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"[1, 7, 3, 6, 5, 6]","output":"3"},{"input":"[1, 2, 3, 3]","output":"2"}],"function_name":"pivotIndex","js_parameters":"numbers","py_function_name":"pivot_index","py_parameters":"numbers","starter_hint":"Compare the running left sum with total sum minus left sum and the current value at each index."},
  {"slug":"container-maximum-water-area","title":"Maximum Water Container Area","problem_statement":"Choose two different indices as vertical sides of a container. Its area is the distance between indices times the shorter height; return the greatest possible area.","difficulty":"Medium","topic_tags":["Arrays","Two Pointers"],"constraints":["2 <= heights.length <= 100000","0 <= heights[i] <= 1000000000","The answer is at most 9007199254740991"],"examples":[{"input":"[1, 8, 6, 2, 5, 4, 8, 3, 7]","output":"49"},{"input":"[1, 2, 1]","output":"2"}],"function_name":"maximumContainerArea","js_parameters":"heights","py_function_name":"maximum_container_area","py_parameters":"heights","starter_hint":"Start at both ends and move the shorter side inward, since moving the taller side cannot improve the limiting height."},
  {"slug":"longest-mountain-range","title":"Longest Mountain Range","problem_statement":"Return the length of the longest contiguous range that strictly increases to one peak and then strictly decreases. A mountain needs at least one step on each side; return zero when no such range exists.","difficulty":"Medium","topic_tags":["Arrays","Two Pointers"],"constraints":["0 <= numbers.length <= 100000","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"[2, 1, 4, 7, 3, 2, 5]","output":"5"},{"input":"[0, 2, 0, 1, 0]","output":"3"}],"function_name":"longestMountain","js_parameters":"numbers","py_function_name":"longest_mountain","py_parameters":"numbers","starter_hint":"Identify each strict peak, then extend left through increasing values and right through decreasing values."},
  {"slug":"find-disappeared-values","title":"Find Values Missing From One Through N","problem_statement":"An array of length n contains values in [1,n], with duplicates allowed. Return every value from that range that is absent, in ascending order, using constant auxiliary space apart from the output.","difficulty":"Easy","topic_tags":["Arrays","Index Marking"],"constraints":["1 <= numbers.length <= 100000","1 <= numbers[i] <= numbers.length"],"examples":[{"input":"[4, 3, 2, 7, 8, 2, 3, 1]","output":"[5,6]"},{"input":"[1, 1, 2, 2]","output":"[3,4]"}],"function_name":"findDisappearedValues","js_parameters":"numbers","py_function_name":"find_disappeared_values","py_parameters":"numbers","starter_hint":"Use each value to mark its corresponding in-array index, then report positions that remain unmarked."},
  {"slug":"sorted-squares-merge","title":"Squares of a Sorted Array","problem_statement":"Given a non-decreasing integer array that may contain negatives, return the squares in non-decreasing order. Aim for linear time by exploiting that the largest remaining square is at an endpoint.","difficulty":"Easy","topic_tags":["Arrays","Two Pointers"],"constraints":["0 <= numbers.length <= 100000","-100000 <= numbers[i] <= 100000","numbers is sorted in non-decreasing order"],"examples":[{"input":"[-4, -1, 0, 3, 10]","output":"[0,1,9,16,100]"},{"input":"[-7, -3, 2, 3, 11]","output":"[4,9,9,49,121]"}],"function_name":"sortedSquares","js_parameters":"numbers","py_function_name":"sorted_squares","py_parameters":"numbers","starter_hint":"Compare absolute values at the two ends and fill the result array from its largest index toward zero."},
  {"slug":"kth-largest-element","title":"Kth Largest Value With Duplicates","problem_statement":"Return the kth largest array value, counting repeated values as separate positions in the ordering. k is one-based; the array is not guaranteed to be sorted.","difficulty":"Medium","topic_tags":["Arrays","Selection","Heap"],"constraints":["1 <= numbers.length <= 100000","1 <= k <= numbers.length","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"numbers = [3, 2, 1, 5, 6, 4], k = 2","output":"5"},{"input":"numbers = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4","output":"4"}],"function_name":"kthLargest","js_parameters":"numbers, k","py_function_name":"kth_largest","py_parameters":"numbers, k","starter_hint":"Use a size-k min-heap or selection partition so the kth value is determined without sorting the full array."},
  {"slug":"shortest-unsorted-subarray","title":"Shortest Segment to Sort","problem_statement":"Return the length of the shortest contiguous segment which, if sorted ascending, makes the entire array non-decreasing. Return zero if the input is already non-decreasing.","difficulty":"Medium","topic_tags":["Arrays","Monotonic Scan"],"constraints":["1 <= numbers.length <= 100000","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"[2, 6, 4, 8, 10, 9, 15]","output":"5"},{"input":"[1, 3, 2, 2, 2]","output":"4"}],"function_name":"shortestUnsortedSubarray","js_parameters":"numbers","py_function_name":"shortest_unsorted_subarray","py_parameters":"numbers","starter_hint":"Find the first and last inversions, then extend the boundaries to include values outside the segment's min-max range."},
  {"slug":"maximum-circular-subarray-sum","title":"Maximum Circular Subarray Sum","problem_statement":"Return the greatest sum of a non-empty contiguous range in a circular integer array. A range may wrap from the final element to the first, but no element may be used twice.","difficulty":"Medium","topic_tags":["Arrays","Dynamic Programming"],"constraints":["1 <= numbers.length <= 100000","-1000000000 <= numbers[i] <= 1000000000","The answer is at most 9007199254740991 in absolute value"],"examples":[{"input":"[5, -3, 5]","output":"10"},{"input":"[3, -1, 2, -1]","output":"4"}],"function_name":"maximumCircularSubarraySum","js_parameters":"numbers","py_function_name":"maximum_circular_subarray_sum","py_parameters":"numbers","starter_hint":"Compare Kadane's maximum range against total sum minus the minimum range, with an all-negative guard."},
  {"slug":"longest-arithmetic-subsequence-length","title":"Longest Arithmetic Subsequence","problem_statement":"Return the length of the longest subsequence whose adjacent selected values all have the same difference. Selected elements must keep their input order but need not be adjacent.","difficulty":"Medium","topic_tags":["Arrays","Dynamic Programming","Hash Map"],"constraints":["2 <= numbers.length <= 1000","-1000000000 <= numbers[i] <= 1000000000"],"examples":[{"input":"[3, 6, 9, 12]","output":"4"},{"input":"[9, 4, 7, 2, 10]","output":"3"}],"function_name":"longestArithmeticSubsequence","js_parameters":"numbers","py_function_name":"longest_arithmetic_subsequence","py_parameters":"numbers","starter_hint":"For each ending index, map each difference to the best arithmetic subsequence length ending there."},
  {"slug":"count-pairs-with-difference","title":"Count Index Pairs With Exact Difference","problem_statement":"Count pairs of indices i < j whose values differ in absolute value by exactly difference. When difference is zero, equal values at separate indices count as separate pairs.","difficulty":"Medium","topic_tags":["Arrays","Hash Map","Counting"],"constraints":["0 <= numbers.length <= 100000","0 <= difference <= 1000000000","-1000000000 <= numbers[i] <= 1000000000","The answer is at most 9007199254740991"],"examples":[{"input":"numbers = [1, 5, 3, 4, 2], difference = 2","output":"3"},{"input":"numbers = [1, 3, 3, 5], difference = 2","output":"4"}],"function_name":"countPairsWithDifference","js_parameters":"numbers, difference","py_function_name":"count_pairs_with_difference","py_parameters":"numbers, difference","starter_hint":"For a positive difference use seen-value lookups; for zero, add the prior frequency of the current value."},
  {"slug":"minimum-length-subarray-threshold","title":"Shortest Subarray Reaching a Threshold","problem_statement":"Given positive integers and a target, return the minimum length of a non-empty contiguous subarray whose sum is at least target. Return zero if no such range exists.","difficulty":"Medium","topic_tags":["Arrays","Sliding Window"],"constraints":["1 <= numbers.length <= 100000","1 <= numbers[i] <= 100000","1 <= target <= 1000000000"],"examples":[{"input":"target = 7, numbers = [2, 3, 1, 2, 4, 3]","output":"2"},{"input":"target = 15, numbers = [1, 2, 3, 4, 5]","output":"5"}],"function_name":"minimumLengthAtLeastTarget","js_parameters":"target, numbers","py_function_name":"minimum_length_at_least_target","py_parameters":"target, numbers","starter_hint":"Expand a window until its sum meets target, then shrink from the left while preserving validity to minimize length."},
  {"slug":"spiral-matrix-traversal","title":"Spiral Traversal of a Rectangular Matrix","problem_statement":"Return matrix elements in clockwise spiral order starting at the top-left. The matrix can be rectangular, contain one row or column, or be empty.","difficulty":"Medium","topic_tags":["Arrays","Matrices","Simulation"],"constraints":["0 <= rows, columns <= 1000","rows * columns <= 100000"],"examples":[{"input":"[[1, 2, 3], [4, 5, 6], [7, 8, 9]]","output":"[1,2,3,6,9,8,7,4,5]"},{"input":"[[1, 2, 3, 4]]","output":"[1,2,3,4]"}],"function_name":"spiralOrder","js_parameters":"matrix","py_function_name":"spiral_order","py_parameters":"matrix","starter_hint":"Maintain shrinking top, bottom, left, and right boundaries and traverse each edge only while boundaries remain valid."}
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
  select id into target_id from public.coding_test_sets where slug = 'arrays-hashing';
  if target_id is null then raise exception 'Missing arrays-hashing collection'; end if;
  select count(*) into existing_count from public.coding_questions
    where collection_id = target_id and slug not in (select slug from arrays_hashing_seed);
  if existing_count <> 7 or exists (
    select 1 from unnest(array['two-sum','count-frequencies','longest-consecutive-run',
      'merge-sorted-arrays','count-target-subarrays','majority-element','product-except-self']) required(slug)
    where not exists (select 1 from public.coding_questions q where q.collection_id = target_id and q.slug = required.slug)
  ) then raise exception 'Unexpected existing arrays-hashing bank; expected the known seven rows'; end if;
  if (select count(*) from arrays_hashing_seed) <> 20
    or (select count(distinct slug) from arrays_hashing_seed) <> 20
    or (select count(distinct starter_hint) from arrays_hashing_seed) <> 20 then
    raise exception 'arrays-hashing seed must contain exactly 20 distinct questions and hints';
  end if;
  if exists (select 1 from arrays_hashing_seed where collection_slug <> 'arrays-hashing'
    or slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(btrim(title)) < 8
    or char_length(btrim(problem_statement)) < 100
    or difficulty not in ('Easy','Medium','Hard') or cardinality(topic_tags) = 0
    or jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) = 0
    or jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2
    or function_name = '' or js_parameters = '' or py_function_name = '' or py_parameters = ''
    or char_length(starter_hint) < 50 or starter_hint ilike '%implement the described algorithm%') then
    raise exception 'Invalid or generic arrays-hashing seed fields';
  end if;
  if exists (select 1 from arrays_hashing_seed s cross join lateral jsonb_array_elements(s.examples) e
    where jsonb_typeof(e) <> 'object' or jsonb_typeof(e->'input') <> 'string'
      or jsonb_typeof(e->'output') <> 'string' or e->>'input' = '' or e->>'output' = ''
      or e->>'output' in ('[]','[null]','null','undefined')) then
    raise exception 'Every example must contain concrete non-placeholder string input and output';
  end if;
  if exists (select 1 from arrays_hashing_seed where slug in
    ('two-sum','count-frequencies','longest-consecutive-run','merge-sorted-arrays',
     'count-target-subarrays','majority-element','product-except-self')) then
    raise exception 'Seed duplicates a previously published arrays-hashing slug';
  end if;
end
$validate$;

with target as (
  select s.id, coalesce(max(q.question_order), 0) as max_order
  from public.coding_test_sets s
  left join public.coding_questions q on q.collection_id = s.id
  where s.slug = 'arrays-hashing'
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
from arrays_hashing_seed seed cross join target
on conflict (collection_id, slug) do nothing;

insert into public.coding_test_cases (question_id, case_order, test_input, expected_output, visibility)
select q.id, example.ordinality::integer, example.value->>'input', example.value->>'output', 'visible'
from arrays_hashing_seed seed
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
  select id into target_id from public.coding_test_sets where slug = 'arrays-hashing';
  select count(*) into row_count from public.coding_questions
    where collection_id = target_id and slug in (select slug from arrays_hashing_seed);
  if row_count <> 20 then raise exception 'Expected 20 arrays-hashing questions, found %', row_count; end if;
  if exists (select 1 from public.coding_questions q
    where q.collection_id = target_id and q.slug in (select slug from arrays_hashing_seed)
      and (jsonb_typeof(q.starter_code_by_language) <> 'object'
        or not (q.starter_code_by_language ? 'JavaScript')
        or not (q.starter_code_by_language ? 'Python')
        or q.starter_code_by_language->>'JavaScript' = ''
        or q.starter_code_by_language->>'Python' = '')) then
    raise exception 'Both supported starter languages must be present';
  end if;
  select count(*) into case_count from public.coding_test_cases c
    join public.coding_questions q on q.id = c.question_id
    where q.collection_id = target_id and q.slug in (select slug from arrays_hashing_seed)
      and c.visibility = 'visible';
  if case_count <> (select sum(jsonb_array_length(examples)) from arrays_hashing_seed) then
    raise exception 'Visible arrays-hashing example test cases do not match seed examples';
  end if;
end
$verify$;

commit;
