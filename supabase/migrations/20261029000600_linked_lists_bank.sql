begin;

create temporary table linked_list_question_seed (
  slug text not null,
  title text not null,
  problem_statement text not null,
  difficulty text not null,
  topic_tags text[] not null,
  constraints jsonb not null,
  examples jsonb not null
) on commit drop;

insert into linked_list_question_seed
select slug, title, problem_statement, difficulty, topic_tags, constraints, examples
from jsonb_to_recordset($seed$
[
  {"slug":"stable-pivot-partition","title":"Stable Partition Around a Pivot","problem_statement":"Implement solve(input), where input has head and pivot. Relink the original singly linked nodes so values below pivot precede values at least pivot; preserve the relative order within both groups and return the new head. Do not copy values into replacement nodes. Node convention: each node has integer value and next; null ends the list. JavaScript/Python use objects, Java uses ListNode references, and C++ uses ListNode pointers.","difficulty":"Medium","topic_tags":["Linked Lists","Stable Partition"],"constraints":["0 <= node count <= 100000","Values and pivot are signed 32-bit integers"],"examples":[{"input":"values=[1,4,3,2,5,2], pivot=3","output":"[1,2,2,4,3,5]"},{"input":"values=[3,1,2,3,0], pivot=3","output":"[1,2,0,3,3]"}]},
  {"slug":"rotate-list-right-by-k","title":"Rotate a Linked List Right","problem_statement":"Implement solve(input) with head and nonnegative k. Move the final k nodes to the front, preserving their order, and return the new head. Reduce k modulo the list length; do not allocate replacement nodes. Each singly linked node has value and next; null marks the tail.","difficulty":"Medium","topic_tags":["Linked Lists","Pointer Rewiring"],"constraints":["1 <= node count <= 100000","0 <= k <= 1000000000"],"examples":[{"input":"values=[1,2,3,4,5], k=2","output":"[4,5,1,2,3]"},{"input":"values=[0,1,2], k=4","output":"[2,0,1]"}]},
  {"slug":"swap-adjacent-nodes","title":"Swap Adjacent Nodes by Link","problem_statement":"Implement solve(input) with head. Swap each adjacent pair by changing next pointers, not node values. If the list has odd length, keep its final node in place. Return the possibly changed head. Nodes are singly linked {value,next}.","difficulty":"Medium","topic_tags":["Linked Lists","Pointer Rewiring"],"constraints":["2 <= node count <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[1,2,3,4,5,6]","output":"[2,1,4,3,6,5]"},{"input":"[7,8,9]","output":"[8,7,9]"}]},
  {"slug":"reverse-complete-k-groups","title":"Reverse Complete Groups of K Nodes","problem_statement":"Implement solve(input) with head and k. Reverse each complete consecutive group of k nodes in place; leave a final group shorter than k unchanged. Return the new head and preserve node values and identity. Node convention: singly linked {value,next}.","difficulty":"Hard","topic_tags":["Linked Lists","Group Reversal"],"constraints":["1 <= node count <= 100000","1 <= k <= node count"],"examples":[{"input":"values=[1,2,3,4,5,6,7], k=3","output":"[3,2,1,6,5,4,7]"},{"input":"values=[1,2,3,4,5], k=3","output":"[3,2,1,4,5]"}]},
  {"slug":"interleave-list-ends","title":"Interleave the First and Last Nodes","problem_statement":"Implement solve(input) with head. Reorder the same nodes as first, last, second, second-last, continuing inward; do not change values. Return the head and ensure the final link is null. Each node is singly linked with value and next.","difficulty":"Medium","topic_tags":["Linked Lists","Fast and Slow Pointers"],"constraints":["1 <= node count <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[1,2,3,4,5,6]","output":"[1,6,2,5,3,4]"},{"input":"[10,20,30,40,50]","output":"[10,50,20,40,30]"}]},
  {"slug":"palindrome-list-and-restore","title":"Check a Palindrome and Restore Links","problem_statement":"Implement solve(input) with head. Return true when the node values form a palindrome from head to tail. Use O(1) auxiliary space and restore every next pointer to its original target before returning. Nodes are singly linked {value,next}.","difficulty":"Medium","topic_tags":["Linked Lists","Fast and Slow Pointers"],"constraints":["1 <= node count <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[1,2,3,2,1]","output":"true"},{"input":"[1,2,2,3]","output":"false"}]},
  {"slug":"merge-k-sorted-linked-lists","title":"Merge K Sorted Linked Lists","problem_statement":"Implement solve(input) with heads, an array of heads of nondecreasing singly linked lists. Return one sorted list containing every input node exactly once; reuse nodes. Target O(N log k) time, where N is the total number of nodes. Nodes have value and next.","difficulty":"Hard","topic_tags":["Linked Lists","Heap","K-Way Merge"],"constraints":["1 <= number of lists <= 10000","0 <= total nodes <= 200000","Each input list is sorted nondecreasingly"],"examples":[{"input":"[[1,4,7],[1,3,8],[2,6]]","output":"[1,1,2,3,4,6,7,8]"},{"input":"[[2,9],[1,5,10],[3,4]]","output":"[1,2,3,4,5,9,10]"}]},
  {"slug":"first-shared-node-identity","title":"Find the First Shared Node by Identity","problem_statement":"Implement solve(input) with headA and headB. Return the exact first node shared by identity, not merely a node with an equal value, or null if the lists are disjoint. Both lists are acyclic singly linked lists and may have unequal prefix lengths; node fields are value and next. For examples, serialize a returned node as the values from that node through the tail.","difficulty":"Medium","topic_tags":["Linked Lists","Two Pointers"],"constraints":["0 <= total distinct nodes <= 200000","Node values may repeat","Input lists are acyclic"],"examples":[{"input":"A=[4,1]+shared[8,4,5]; B=[5,6,1]+shared[8,4,5]","output":"[8,4,5]"},{"input":"A=[9,2]+shared[7,3]; B=[5,8]+shared[7,3]","output":"[7,3]"}]},
  {"slug":"split-list-into-k-parts","title":"Split a List into K Consecutive Parts","problem_statement":"Implement solve(input) with head and positive k. Return k heads partitioning the original nodes in order. Part lengths must differ by at most one, with earlier parts receiving extra nodes; terminate each part with null and use no replacement nodes. Nodes are singly linked {value,next}.","difficulty":"Medium","topic_tags":["Linked Lists","Partitioning"],"constraints":["0 <= node count <= 100000","1 <= k <= 100000"],"examples":[{"input":"values=[1,2,3,4,5,6,7,8,9,10], k=3","output":"[[1,2,3,4],[5,6,7],[8,9,10]]"},{"input":"values=[4,8,12,16,20], k=2","output":"[[4,8,12],[16,20]]"}]},
  {"slug":"remove-zero-sum-list-ranges","title":"Remove Consecutive Zero-Sum Ranges","problem_statement":"Implement solve(input) with head. Remove every consecutive range whose values sum to zero; overlapping ranges must be resolved until no zero-sum range remains. Return the remaining list using the original surviving nodes. Use prefix sums. Nodes are singly linked {value,next}.","difficulty":"Hard","topic_tags":["Linked Lists","Prefix Sum"],"constraints":["0 <= node count <= 10000","-1000 <= node value <= 1000"],"examples":[{"input":"[1,2,-3,3,1]","output":"[3,1]"},{"input":"[1,2,3,-3,-2]","output":"[1]"}]},
  {"slug":"add-forward-order-digit-lists","title":"Add Numbers in Forward Digit Order","problem_statement":"Implement solve(input) with heads a and b. Each list stores a nonnegative integer's digits most-significant first, without leading zeroes except for zero itself. Return a newly allocated digit list for the sum in the same order; do not mutate inputs. Each node's value is a digit and next is its link.","difficulty":"Medium","topic_tags":["Linked Lists","Carry Arithmetic"],"constraints":["1 <= each input list length <= 10000","Each node value is a digit from 0 to 9"],"examples":[{"input":"a=[7,2,4,3], b=[5,6,4]","output":"[7,8,0,7]"},{"input":"a=[9,9,9], b=[1]","output":"[1,0,0,0]"}]},
  {"slug":"swap-kth-nodes-from-ends","title":"Swap the Kth Nodes from Both Ends","problem_statement":"Implement solve(input) with head and one-based k. Swap the nodes at position k from the start and position k from the end by relinking them, not by exchanging values. Return the new head. The list is singly linked; node fields are value and next.","difficulty":"Medium","topic_tags":["Linked Lists","Two Pointers"],"constraints":["1 <= node count <= 100000","1 <= k <= node count"],"examples":[{"input":"values=[1,2,3,4,5], k=2","output":"[1,4,3,2,5]"},{"input":"values=[10,20,30,40], k=2","output":"[10,30,20,40]"}]},
  {"slug":"deduplicate-unsorted-list-first","title":"Keep First Occurrences in an Unsorted List","problem_statement":"Implement solve(input) with head. Remove every node whose value appeared earlier, keeping the first occurrence and preserving survivor order. Use O(n) expected time and O(n) extra space. The input is a singly linked list with value and next fields.","difficulty":"Easy","topic_tags":["Linked Lists","Hash Set"],"constraints":["0 <= node count <= 100000","Node values are signed 32-bit integers"],"examples":[{"input":"[3,1,3,2,1,4,2]","output":"[3,1,2,4]"},{"input":"[8,8,5,8,5,6]","output":"[8,5,6]"}]},
  {"slug":"sort-linked-list-nlogn","title":"Sort a Linked List in O(N Log N) Time","problem_statement":"Implement solve(input) with head. Sort node values in nondecreasing order in O(n log n) time, using O(1) auxiliary pointer space (recursion stack is excluded). Relink the original singly linked nodes; do not copy them into an array. Nodes have value and next.","difficulty":"Hard","topic_tags":["Linked Lists","Merge Sort"],"constraints":["0 <= node count <= 100000","Node values are signed 32-bit integers"],"examples":[{"input":"[4,2,1,3]","output":"[1,2,3,4]"},{"input":"[-1,5,3,4,0]","output":"[-1,0,3,4,5]"}]},
  {"slug":"next-greater-value-per-node","title":"Next Greater Value for Every List Node","problem_statement":"Implement solve(input) with head. For each node, find the nearest node to its right with a strictly larger value; output that value, or zero when none exists. Return an integer array in list order and leave all links untouched. Nodes are singly linked {value,next}.","difficulty":"Medium","topic_tags":["Linked Lists","Monotonic Stack"],"constraints":["0 <= node count <= 100000","0 <= node value <= 100000"],"examples":[{"input":"[2,1,5]","output":"[5,5,0]"},{"input":"[2,7,4,3,5]","output":"[7,0,5,5,0]"}]},
  {"slug":"remove-nodes-dominated-to-right","title":"Remove Nodes with a Greater Value to Their Right","problem_statement":"Implement solve(input) with head. Delete each node for which at least one later node has a strictly greater value. Preserve the order of survivors and return the new head. Nodes are singly linked {value,next}; values are not copied into a replacement list.","difficulty":"Medium","topic_tags":["Linked Lists","Monotonic Stack"],"constraints":["1 <= node count <= 100000","Node values are signed 32-bit integers"],"examples":[{"input":"[5,2,13,3,8]","output":"[13,8]"},{"input":"[12,15,10,11,5,6,2,3]","output":"[15,11,6,3]"}]},
  {"slug":"count-components-from-value-set","title":"Count Connected Components from a Value Set","problem_statement":"Implement solve(input) with head and allowed, a set of values. Count maximal contiguous runs of nodes whose values belong to allowed; a non-allowed node separates components. Return the count without changing links. Nodes are singly linked {value,next}, and list values are distinct.","difficulty":"Medium","topic_tags":["Linked Lists","Hash Set"],"constraints":["1 <= node count <= 100000","List values are distinct","0 <= allowed size <= node count"],"examples":[{"input":"values=[0,1,2,3,4], allowed={0,1,3,4}","output":"2"},{"input":"values=[1,2,3,4,5], allowed={2,4}","output":"2"}]},
  {"slug":"reverse-list-subrange","title":"Reverse a One-Based List Subrange","problem_statement":"Implement solve(input) with head, left, and right. Reverse the links from one-based position left through right in one traversal; positions are valid. Keep all nodes and values, and return the head. Input nodes are singly linked {value,next}.","difficulty":"Medium","topic_tags":["Linked Lists","Sublist Reversal"],"constraints":["1 <= node count <= 100000","1 <= left <= right <= node count"],"examples":[{"input":"values=[1,2,3,4,5], left=2, right=4","output":"[1,4,3,2,5]"},{"input":"values=[6,7,8,9], left=1, right=3","output":"[8,7,6,9]"}]},
  {"slug":"merge-zero-delimited-list-groups","title":"Merge Values Between Zero Delimiters","problem_statement":"Implement solve(input) with head. The list begins and ends with zero; interior zeroes delimit nonempty groups of positive values. Replace each group by one node containing its sum, remove delimiters, and return the resulting list. Nodes have value and next.","difficulty":"Easy","topic_tags":["Linked Lists","Traversal"],"constraints":["3 <= node count <= 100000","First and last values are zero","All interior group values are positive"],"examples":[{"input":"[0,3,1,0,4,5,2,0]","output":"[4,11]"},{"input":"[0,5,6,0,2,0]","output":"[11,2]"}]},
  {"slug":"reverse-list-runs-of-equal-parity","title":"Reverse Each Equal-Parity Run","problem_statement":"Implement solve(input) with head. For every maximal contiguous run whose values have the same parity, reverse the node order in that run and leave the run's position in the list unchanged. Return head; do not change node values. Nodes are singly linked {value,next}.","difficulty":"Medium","topic_tags":["Linked Lists","Segment Reversal"],"constraints":["1 <= node count <= 100000","Node values are signed 32-bit integers"],"examples":[{"input":"[2,4,1,3,6,8,5]","output":"[4,2,3,1,8,6,5]"},{"input":"[7,9,2,4,1]","output":"[9,7,4,2,1]"}]}
]
$seed$::jsonb) as records(
  slug text, title text, problem_statement text, difficulty text,
  topic_tags text[], constraints jsonb, examples jsonb
);

do $validate$
begin
  if (select count(*) from linked_list_question_seed) <> 20
     or (select count(distinct slug) from linked_list_question_seed) <> 20
     or (select count(distinct title) from linked_list_question_seed) <> 20
     or (select count(distinct problem_statement) from linked_list_question_seed) <> 20 then
    raise exception 'linked-lists seed must contain exactly 20 distinct questions';
  end if;
  if exists (
    select 1 from linked_list_question_seed
    where slug in ('reverse-list','has-cycle','merge-two-lists','remove-nth-from-end',
      'middle-node','add-two-reversed-digit-lists','remove-sorted-list-duplicates')
       or char_length(btrim(title)) < 12
       or char_length(btrim(problem_statement)) < 180
       or difficulty not in ('Easy','Medium','Hard')
       or jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) < 2
       or jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2
       or exists (select 1 from jsonb_array_elements(examples) e
         where nullif(btrim(e->>'input'),'') is null
            or nullif(btrim(e->>'output'),'') is null
            or btrim(e->>'output') in ('[]','[ ]','null','[null]','{}'))
  ) then
    raise exception 'linked-lists seed has invalid content or duplicates an existing slug';
  end if;
end
$validate$;

with question_rows as (
  select collection.id as collection_id, seed.slug, seed.title,
    seed.problem_statement || E'\n\nIn every language, solve(input) receives one record with the named fields above. Linked-list fields are actual nodes, not arrays; return nodes or the scalar/array result required by the statement. Node convention: JavaScript/Python nodes expose value and next; Java nodes are ListNode objects; C++ nodes are ListNode pointers. The examples serialize lists as their node values in traversal order.' as problem_statement,
    seed.difficulty, seed.topic_tags, seed.constraints, seed.examples,
    jsonb_build_object(
      'JavaScript', 'function solve(input) {' || E'\n  // Implement the specified pointer algorithm' || E'\n  return null;' || E'\n}',
      'Python', 'def solve(input):' || E'\n    # Implement the specified pointer algorithm' || E'\n    return None',
      'Java', 'import java.util.*;' || E'\nclass ListNode { int value; ListNode next; }' || E'\nclass Solution {' || E'\n  static Object solve(Map<String, Object> input) {' || E'\n    // Implement the specified pointer algorithm' || E'\n    return null;' || E'\n  }' || E'\n}',
      'C++', '#include <any>' || E'\n#include <string>' || E'\n#include <unordered_map>' || E'\nstruct ListNode { int value; ListNode* next; };' || E'\nclass Solution {' || E'\npublic:' || E'\n  std::any solve(const std::unordered_map<std::string, std::any>& input) {' || E'\n    // Implement the specified pointer algorithm' || E'\n    return {};' || E'\n  }' || E'\n};'
    ) as starter_code_by_language,
    case seed.difficulty when 'Easy' then 100 when 'Medium' then 150 else 200 end as points
  from linked_list_question_seed seed
  join public.coding_test_sets collection on collection.slug = 'linked-lists'
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
from linked_list_question_seed seed
join public.coding_test_sets collection on collection.slug = 'linked-lists'
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
  where collection.slug = 'linked-lists'
    and question.slug in (select slug from linked_list_question_seed)
    and question.publication_status = 'published';
  if question_count <> 20 then
    raise exception 'linked-lists must have exactly 20 published seeded questions';
  end if;

  if exists (
    select 1
    from public.coding_questions question
    join public.coding_test_sets collection on collection.id = question.collection_id
    where collection.slug = 'linked-lists'
      and question.slug in (select slug from linked_list_question_seed)
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
    raise exception 'linked-lists questions must include all four language starters';
  end if;

  select sum(jsonb_array_length(examples)) into expected_case_count
  from linked_list_question_seed;
  select count(*) into visible_case_count
  from public.coding_test_cases test_case
  join public.coding_questions question on question.id = test_case.question_id
  join public.coding_test_sets collection on collection.id = question.collection_id
  where collection.slug = 'linked-lists'
    and question.slug in (select slug from linked_list_question_seed)
    and test_case.visibility = 'visible';
  if visible_case_count <> expected_case_count then
    raise exception 'linked-lists visible cases must match the seeded examples';
  end if;
end
$post_validate$;

commit;
