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
select 'c-programming', seed.slug, seed.title, seed.problem_statement, seed.difficulty,
       seed.topic_tags, seed.constraints, seed.examples,
       seed.starter_code_by_language, seed.points
from jsonb_to_recordset($seed$[{"slug":"count-ascii-words-c","title":"Count ASCII Words","problem_statement":"Count maximal non-empty runs of bytes other than space, tab, carriage return, or newline in the null-terminated string. Return the number of runs.","difficulty":"Easy","topic_tags":["C","String Parsing"],"constraints":["Input is a valid null-terminated byte string","Length is at most 100000 bytes"],"examples":[{"input":"\"red  blue\\\\tgreen\"","output":"3"},{"input":"\"  one\\\\ntwo \"","output":"2"}],"signature":"size_t countAsciiWords(const char *text)","default":"0","points":100,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t countAsciiWords(const char *text) {\n    /* Count ASCII Words: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"normalize-ascii-spacing-c","title":"Normalize ASCII Spacing","problem_statement":"Write words separated by exactly one ordinary space into destination, removing leading and trailing ASCII whitespace (space, tab, CR, LF). Return the output length, or -1 if capacity is insufficient; include the final NUL in the capacity check.","difficulty":"Medium","topic_tags":["C","String Buffers","Capacity Checking"],"constraints":["source and destination are valid and do not overlap","Destination capacity is at least 1","Source length is at most 100000 bytes"],"examples":[{"input":"\"\\\\tred   oak\\\\n\"","output":"\"red oak\" (length 7)"},{"input":"\"a\\\\tb c\"","output":"\"a b c\" (length 5)"}],"signature":"int normalizeAsciiSpacing(const char *source, char *destination, size_t capacity)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nint normalizeAsciiSpacing(const char *source, char *destination, size_t capacity) {\n    /* Normalize ASCII Spacing: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"first-unique-byte-c","title":"Find the First Unique Byte","problem_statement":"Return the index of the first byte in a null-terminated string whose unsigned-byte value occurs exactly once. Return -1 if every byte repeats.","difficulty":"Medium","topic_tags":["C","Strings","Frequency Tables"],"constraints":["String length is at most 100000 bytes","Input bytes are nonzero and may have any unsigned-byte value"],"examples":[{"input":"\"swiss\"","output":"1"},{"input":"\"aabbcc\"","output":"-1"}],"signature":"int firstUniqueByte(const char *text)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nint firstUniqueByte(const char *text) {\n    /* Find the First Unique Byte: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"parse-signed-decimal-c","title":"Parse a Signed Decimal","problem_statement":"Parse an optional leading + or - followed by one or more decimal digits. Store the result and return 1 on success; return 0 for empty, malformed, or out-of-range input without changing the result.","difficulty":"Medium","topic_tags":["C","Parsing","Overflow Checks"],"constraints":["Result must fit signed 32-bit int","No whitespace or trailing bytes are allowed"],"examples":[{"input":"\"-2048\"","output":"1; result = -2048"},{"input":"\"12x\"","output":"0; result unchanged"}],"signature":"int parseSignedDecimal(const char *text, int *result)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nint parseSignedDecimal(const char *text, int *result) {\n    /* Parse a Signed Decimal: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"balanced-delimiters-c","title":"Validate Nested Delimiters","problem_statement":"Return 1 if parentheses, square brackets, and braces in text are correctly matched and nested, and 0 otherwise. Ignore all non-delimiter bytes.","difficulty":"Medium","topic_tags":["C","Stack","Character Parsing"],"constraints":["Text length is at most 100000 bytes","Input is a valid null-terminated string"],"examples":[{"input":"\"{a[(b)]}\"","output":"1"},{"input":"\"([)]\"","output":"0"}],"signature":"int balancedDelimiters(const char *text)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nint balancedDelimiters(const char *text) {\n    /* Validate Nested Delimiters: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"remove-byte-in-place-c","title":"Remove a Selected Byte In Place","problem_statement":"Delete every occurrence of unwanted from the writable null-terminated string by compacting the remaining bytes in their original order. Terminate the result and return its new length.","difficulty":"Easy","topic_tags":["C","Pointers","In-Place Strings"],"constraints":["Input is writable and null-terminated","String length is at most 100000 bytes"],"examples":[{"input":"\"banana\", unwanted = 'a'","output":"\"bnn\"; length = 3"},{"input":"\"miss\", unwanted = 'z'","output":"\"miss\"; length = 4"}],"signature":"size_t removeByte(char *text, char unwanted)","default":"0","points":100,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t removeByte(char *text, char unwanted) {\n    /* Remove a Selected Byte In Place: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"reverse-each-word-c","title":"Reverse Each Word In Place","problem_statement":"Reverse the bytes in each maximal non-space word of a writable string, leaving spaces and word order unchanged. Return the string length.","difficulty":"Easy","topic_tags":["C","Two Pointers","String Manipulation"],"constraints":["Input is writable and null-terminated","String length is at most 100000 bytes"],"examples":[{"input":"\"go code\"","output":"\"og edoc\""},{"input":"\"red  oak\"","output":"\"der  kao\""}],"signature":"size_t reverseEachWord(char *text)","default":"0","points":100,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t reverseEachWord(char *text) {\n    /* Reverse Each Word In Place: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"count-overlapping-substrings-c","title":"Count Overlapping Substrings","problem_statement":"Return the number of occurrences of a non-empty pattern in text, including matches that overlap previous matches.","difficulty":"Medium","topic_tags":["C","Substring Search"],"constraints":["Text length is at most 100000 bytes","Pattern length is between 1 and 1000 bytes"],"examples":[{"input":"\"aaaaa\", \"aa\"","output":"4"},{"input":"\"bananana\", \"ana\"","output":"3"}],"signature":"size_t countOverlapping(const char *text, const char *pattern)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t countOverlapping(const char *text, const char *pattern) {\n    /* Count Overlapping Substrings: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"stable-odd-even-partition-c","title":"Stable Odd-Even Partition","problem_statement":"Rearrange the writable array so odd values come first and even values follow, preserving original order within both groups. Return the number of odd values.","difficulty":"Medium","topic_tags":["C","Arrays","Stable Partition"],"constraints":["0 <= n <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[2,5,4,3,6]","output":"[5,3,2,4,6]; return 2"},{"input":"[8,1,7]","output":"[1,7,8]; return 2"}],"signature":"size_t stableOddEven(int *values, size_t n)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t stableOddEven(int *values, size_t n) {\n    /* Stable Odd-Even Partition: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"merge-sorted-arrays-c","title":"Merge Two Sorted Arrays","problem_statement":"Write the two nondecreasing input arrays into output in nondecreasing order, preserving duplicates, and return the number of values written. Output has capacity n + m and does not overlap either input.","difficulty":"Easy","topic_tags":["C","Arrays","Merge"],"constraints":["0 <= n,m <= 100000","Both inputs are sorted nondecreasing","Output has capacity n + m"],"examples":[{"input":"[1,4,7], [2,4]","output":"[1,2,4,4,7]"},{"input":"[-3,0], [1,2]","output":"[-3,0,1,2]"}],"signature":"size_t mergeSorted(const int *a, size_t n, const int *b, size_t m, int *output)","default":"0","points":100,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t mergeSorted(const int *a, size_t n, const int *b, size_t m, int *output) {\n    /* Merge Two Sorted Arrays: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"count-array-inversions-c","title":"Count Array Inversions","problem_statement":"Count index pairs (i,j) such that i < j and values[i] > values[j]. Return a 64-bit count and leave the input unchanged.","difficulty":"Hard","topic_tags":["C","Arrays","Divide and Conquer"],"constraints":["0 <= n <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[2,4,1,3,5]","output":"3"},{"input":"[5,4,3]","output":"3"}],"signature":"long long countInversions(const int *values, size_t n)","default":"0","points":200,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nlong long countInversions(const int *values, size_t n) {\n    /* Count Array Inversions: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"rotate-array-left-c","title":"Rotate an Array Left","problem_statement":"Rotate the array left by shift positions in place. A shift larger than n wraps around; an empty array remains unchanged. Return n.","difficulty":"Easy","topic_tags":["C","Arrays","In-Place Rotation"],"constraints":["0 <= n <= 100000","0 <= shift <= 1000000000"],"examples":[{"input":"[1,2,3,4,5], shift = 2","output":"[3,4,5,1,2]"},{"input":"[7,8,9], shift = 4","output":"[8,9,7]"}],"signature":"size_t rotateArrayLeft(int *values, size_t n, size_t shift)","default":"0","points":100,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t rotateArrayLeft(int *values, size_t n, size_t shift) {\n    /* Rotate an Array Left: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"compact-sorted-array-c","title":"Compact a Sorted Array","problem_statement":"Given a writable nondecreasing array, keep one copy of each distinct value at its front and return the distinct-value count. Elements after that prefix are unspecified.","difficulty":"Easy","topic_tags":["C","Arrays","Write Pointer"],"constraints":["0 <= n <= 100000","Input is sorted nondecreasing"],"examples":[{"input":"[1,1,2,2,2,5]","output":"length 3; prefix [1,2,5]"},{"input":"[4,4,4]","output":"length 1; prefix [4]"}],"signature":"size_t compactSorted(int *values, size_t n)","default":"0","points":100,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nsize_t compactSorted(int *values, size_t n) {\n    /* Compact a Sorted Array: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"closest-pair-sum-c","title":"Closest Pair Sum in a Sorted Array","problem_statement":"In a sorted array, choose two distinct indices whose values have a sum closest to target. Write the indices through left and right, return the absolute difference, and break ties with the lexicographically smallest index pair.","difficulty":"Medium","topic_tags":["C","Arrays","Two Pointers"],"constraints":["2 <= n <= 100000","Input is sorted","Values and target are signed 32-bit integers"],"examples":[{"input":"[ -4,-1,2,7 ], target = 5","output":"difference 0; indices 1 and 3"},{"input":"[1,3,8], target = 20","output":"difference 9; indices 1 and 2"}],"signature":"long long closestPairSum(const int *values, size_t n, int target, size_t *left, size_t *right)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nlong long closestPairSum(const int *values, size_t n, int target, size_t *left, size_t *right) {\n    /* Closest Pair Sum in a Sorted Array: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"maximum-circular-subarray-c","title":"Maximum Circular Subarray Sum","problem_statement":"Return the maximum sum of a non-empty contiguous segment of values, allowing the segment to wrap from the final element to the first.","difficulty":"Hard","topic_tags":["C","Arrays","Kadane Algorithm"],"constraints":["1 <= n <= 100000","Each value and the answer fit signed 64-bit"],"examples":[{"input":"[5,-3,5]","output":"10"},{"input":"[-4,-2,-7]","output":"-2"}],"signature":"long long maximumCircularSubarray(const int *values, size_t n)","default":"0","points":200,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nlong long maximumCircularSubarray(const int *values, size_t n) {\n    /* Maximum Circular Subarray Sum: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"trapped-rainwater-c","title":"Measure Trapped Rainwater","problem_statement":"Treat each nonnegative height as a unit-width bar and return the total units of water trapped between the bars after rain.","difficulty":"Medium","topic_tags":["C","Arrays","Two Pointers"],"constraints":["0 <= n <= 100000","0 <= heights[i] <= 100000"],"examples":[{"input":"[0,2,0,3,0,1,0,2]","output":"6"},{"input":"[3,1,2]","output":"1"}],"signature":"long long trappedRainwater(const int *heights, size_t n)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nlong long trappedRainwater(const int *heights, size_t n) {\n    /* Measure Trapped Rainwater: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"equilibrium-index-c","title":"Find the First Equilibrium Index","problem_statement":"Return the smallest index whose elements strictly to its left sum to the same value as elements strictly to its right. Return -1 if no such index exists.","difficulty":"Medium","topic_tags":["C","Arrays","Prefix Sums"],"constraints":["0 <= n <= 100000","All prefix sums fit signed 64-bit"],"examples":[{"input":"[1,7,3,6,5,6]","output":"3"},{"input":"[1,2,3]","output":"-1"}],"signature":"int equilibriumIndex(const int *values, size_t n)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nint equilibriumIndex(const int *values, size_t n) {\n    /* Find the First Equilibrium Index: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"count-subarrays-target-sum-c","title":"Count Subarrays With a Target Sum","problem_statement":"Return the number of non-empty contiguous subarrays whose elements sum exactly to target. Values may be negative.","difficulty":"Hard","topic_tags":["C","Arrays","Prefix Sums","Hashing"],"constraints":["0 <= n <= 100000","Prefix sums fit signed 64-bit","Answer fits signed 64-bit"],"examples":[{"input":"[1,1,1], target = 2","output":"2"},{"input":"[1,-1,0], target = 0","output":"3"}],"signature":"long long countSubarraysWithSum(const int *values, size_t n, long long target)","default":"0","points":200,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nlong long countSubarraysWithSum(const int *values, size_t n, long long target) {\n    /* Count Subarrays With a Target Sum: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"reverse-low-bits-c","title":"Reverse a Fixed-Width Bit Field","problem_statement":"Return the value formed by reversing the order of the lowest width bits of value. All bits above width in the result must be zero.","difficulty":"Medium","topic_tags":["C","Bit Manipulation"],"constraints":["1 <= width <= 32","value is an unsigned 32-bit integer"],"examples":[{"input":"value=0b1101, width=4","output":"0b1011 (11)"},{"input":"value=0b001, width=3","output":"0b100 (4)"}],"signature":"uint32_t reverseLowBits(uint32_t value, unsigned int width)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nuint32_t reverseLowBits(uint32_t value, unsigned int width) {\n    /* Reverse a Fixed-Width Bit Field: implement the specified behavior. */\n    return 0;\n}"}},{"slug":"align-offset-up-c","title":"Align an Offset Upward","problem_statement":"Store the smallest multiple of alignment that is at least offset. Return 1 on success, or 0 if alignment is zero or the result overflows size_t.","difficulty":"Medium","topic_tags":["C","Memory Alignment","Overflow"],"constraints":["Arguments are size_t values","Alignment may be any positive integer"],"examples":[{"input":"offset=13, alignment=8","output":"1; result=16"},{"input":"offset=12, alignment=0","output":"0"}],"signature":"int alignUp(size_t offset, size_t alignment, size_t *result)","default":"0","points":150,"starter_code_by_language":{"C":"#include <stddef.h>\n#include <stdint.h>\n\nint alignUp(size_t offset, size_t alignment, size_t *result) {\n    /* Align an Offset Upward: implement the specified behavior. */\n    return 0;\n}"}}]$seed$) as seed(
  slug text, title text, problem_statement text, difficulty text,
  topic_tags text[], constraints jsonb, examples jsonb,
  points integer, starter_code_by_language jsonb
);

do $$
declare seed_count integer;
begin
  select count(*) into seed_count from coding_question_seed;
  if seed_count <> 20 then
    raise exception 'Expected exactly 20 c-programming seed questions, found %', seed_count;
  end if;
  if (select count(distinct slug) from coding_question_seed) <> 20
     or (select count(distinct title) from coding_question_seed) <> 20
     or (select count(distinct problem_statement) from coding_question_seed) <> 20 then
    raise exception 'Duplicate slug, title, or problem statement in c-programming bank';
  end if;
  if exists (
    select 1 from coding_question_seed
    where slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
       or char_length(btrim(title)) < 8
       or char_length(btrim(problem_statement)) < 100
       or problem_statement ~* '(generic task|write appropriate code|todo|your solution here)'
       or difficulty not in ('Easy','Medium','Hard')
       or cardinality(topic_tags) < 2
       or jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) < 2
       or jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2
       or jsonb_typeof(starter_code_by_language) <> 'object'
       or starter_code_by_language <> jsonb_build_object('C', starter_code_by_language->>'C')
       or nullif(btrim(starter_code_by_language->>'C'), '') is null
       or points not between 1 and 1000
  ) then
    raise exception 'Incomplete, generic, or invalid c-programming seed record';
  end if;
  if exists (
    select 1
    from coding_question_seed seed
    cross join lateral jsonb_array_elements(seed.examples) example(value)
    where nullif(btrim(example.value->>'input'), '') is null
       or nullif(btrim(example.value->>'output'), '') is null
  ) or exists (
    select 1 from coding_question_seed seed
    where not exists (
      select 1 from jsonb_array_elements(seed.examples) example(value)
      where example.value->>'output' not in ('[]','null','""','0')
    )
  ) then
    raise exception 'Examples must contain concrete input and nontrivial output in c-programming';
  end if;
  if exists (select 1 from coding_question_seed where slug = any(array['count-vowels','string-length','array-maximum','bubble-sort','binary-search','count-set-bits-c','longest-equal-value-run-c']::text[])) then
    raise exception 'Seed duplicates a pre-existing published c-programming slug';
  end if;
  if (
    select count(*)
    from public.coding_questions question
    join public.coding_test_sets collection on collection.id = question.collection_id
    where collection.slug = 'c-programming'
      and question.publication_status = 'published'
      and question.slug = any(array['count-vowels','string-length','array-maximum','bubble-sort','binary-search','count-set-bits-c','longest-equal-value-run-c']::text[])
  ) <> 7 then
    raise exception 'Expected the seven existing published c-programming questions';
  end if;
  if not exists (
    select 1 from public.coding_test_sets
    where slug = 'c-programming' and publication_status = 'published'
      and supported_languages = '["C"]'::jsonb
  ) then
    raise exception 'Published c-programming collection with the required language is missing';
  end if;
end $$;

with target_collection as (
  select id from public.coding_test_sets where slug = 'c-programming'
), ordered_seed as (
  select collection.id as collection_id, seed.*,
         coalesce((select max(question.question_order)
                   from public.coding_questions question
                   where question.collection_id = collection.id), 0)
           + row_number() over (order by seed.slug) as question_order
  from coding_question_seed seed cross join target_collection collection
)
insert into public.coding_questions (
  collection_id, slug, title, problem_statement, difficulty, topic_tags,
  constraints, examples, starter_code_by_language, points, publication_status, question_order
)
select collection_id, slug, title, problem_statement, difficulty, topic_tags,
       constraints, examples, starter_code_by_language, points, 'published', question_order
from ordered_seed
on conflict (collection_id, slug) do nothing;

insert into public.coding_test_cases (
  question_id, case_order, test_input, expected_output, visibility
)
select question.id, example.ordinality::integer, example.value->>'input',
       example.value->>'output', 'visible'
from coding_question_seed seed
join public.coding_test_sets collection on collection.slug = 'c-programming'
join public.coding_questions question
  on question.collection_id = collection.id and question.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples)
  with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

commit;
