begin;

create temporary table trees_graphs_seed (
  slug text not null,
  title text not null,
  problem_statement text not null,
  difficulty text not null,
  topic_tags text[] not null,
  constraints jsonb not null,
  examples jsonb not null,
  starter_code_by_language jsonb not null
) on commit drop;

insert into trees_graphs_seed
select slug, title, problem_statement, difficulty, topic_tags, constraints, examples, starter_code_by_language
from jsonb_to_recordset($seed$
[
  {"slug":"count-leaf-nodes","title":"Count the Leaf Nodes","problem_statement":"Implement countLeafNodes(levelOrder). The binary tree is encoded in breadth-first order: each non-null node consumes the next two array entries as its left and right children; null denotes a missing child, and trailing nulls may be omitted. Return the number of nodes with no children. [] represents an empty tree.","difficulty":"Easy","topic_tags":["Trees","DFS"],"constraints":["0 <= levelOrder.length <= 100000","Node values are signed 32-bit integers"],"examples":[{"input":"[8,3,10,1,6,null,14]","output":"3"},{"input":"[1,2,3,null,4]","output":"2"}],"starter_code_by_language":{"JavaScript":"function countLeafNodes(levelOrder) {\n  // Return the number of nodes with no children.\n}","Python":"def count_leaf_nodes(level_order):\n    # Return the number of nodes with no children.\n    pass"}},
  {"slug":"sum-left-leaf-values","title":"Sum Values at Left Leaves","problem_statement":"Implement sumLeftLeaves(levelOrder) using the stated breadth-first binary-tree encoding: non-null nodes consume two child entries, null means absent, and trailing nulls may be omitted. Return the sum of values at leaf nodes that are left children; an empty tree contributes 0.","difficulty":"Easy","topic_tags":["Trees","DFS"],"constraints":["0 <= levelOrder.length <= 100000","The answer fits a signed 64-bit integer"],"examples":[{"input":"[5,3,8,2,4]","output":"6"},{"input":"[1,2,3,null,4]","output":"4"}],"starter_code_by_language":{"JavaScript":"function sumLeftLeaves(levelOrder) {\n  // Return the sum of values at left-child leaves.\n}","Python":"def sum_left_leaves(level_order):\n    # Return the sum of values at left-child leaves.\n    pass"}},
  {"slug":"binary-tree-level-widths","title":"Measure Actual Nodes at Each Depth","problem_statement":"Implement levelWidths(levelOrder). Decode the binary tree in breadth-first order (null marks an absent child and consumes no children of its own). Return the number of existing nodes at each depth from root to deepest; do not count gaps between nodes.","difficulty":"Easy","topic_tags":["Trees","BFS"],"constraints":["0 <= levelOrder.length <= 100000"],"examples":[{"input":"[1,2,3,4,null,null,5]","output":"[1,2,2]"},{"input":"[6,null,8,9]","output":"[1,1,1]"}],"starter_code_by_language":{"JavaScript":"function levelWidths(levelOrder) {\n  // Return one actual-node count per depth.\n}","Python":"def level_widths(level_order):\n    # Return one actual-node count per depth.\n    pass"}},
  {"slug":"binary-tree-zigzag-levels","title":"Traverse Tree Levels in a Zigzag","problem_statement":"Implement zigzagLevels(levelOrder) with the breadth-first binary-tree encoding described here: null marks an absent child; each real node consumes two child entries. Return one array per depth, traversing even depths left-to-right and odd depths right-to-left.","difficulty":"Medium","topic_tags":["Trees","BFS"],"constraints":["0 <= levelOrder.length <= 100000"],"examples":[{"input":"[3,9,20,null,null,15,7]","output":"[[3],[20,9],[15,7]]"},{"input":"[1,2,3,4,5]","output":"[[1],[3,2],[4,5]]"}],"starter_code_by_language":{"JavaScript":"function zigzagLevels(levelOrder) {\n  // Return the level arrays in alternating directions.\n}","Python":"def zigzag_levels(level_order):\n    # Return the level arrays in alternating directions.\n    pass"}},
  {"slug":"binary-tree-diameter","title":"Find the Tree Diameter in Edges","problem_statement":"Implement treeDiameter(levelOrder). Decode a binary tree from breadth-first entries, where null means no node. Return the greatest number of edges on any path between two nodes. The empty and one-node trees have diameter 0.","difficulty":"Easy","topic_tags":["Trees","Postorder"],"constraints":["0 <= levelOrder.length <= 100000"],"examples":[{"input":"[1,2,3,4,5]","output":"3"},{"input":"[1,null,2,null,3]","output":"2"}],"starter_code_by_language":{"JavaScript":"function treeDiameter(levelOrder) {\n  // Return the maximum path length measured in edges.\n}","Python":"def tree_diameter(level_order):\n    # Return the maximum path length measured in edges.\n    pass"}},
  {"slug":"binary-tree-maximum-path-sum","title":"Find the Maximum Node Path Sum","problem_statement":"Implement maximumPathSum(levelOrder) for a non-empty breadth-first-encoded binary tree (null marks absent children). A path may start and end at any nodes, must follow parent-child edges, and cannot repeat a node. Return the largest sum of node values on any such path.","difficulty":"Hard","topic_tags":["Trees","Dynamic Programming"],"constraints":["1 <= levelOrder.length <= 10000","Node values are signed 32-bit integers"],"examples":[{"input":"[-10,9,20,null,null,15,7]","output":"42"},{"input":"[2,-1]","output":"2"}],"starter_code_by_language":{"JavaScript":"function maximumPathSum(levelOrder) {\n  // Return the maximum sum over all simple tree paths.\n}","Python":"def maximum_path_sum(level_order):\n    # Return the maximum sum over all simple tree paths.\n    pass"}},
  {"slug":"tree-downward-target-path-count","title":"Count Downward Paths with a Target Sum","problem_statement":"Implement countDownwardTargetPaths(levelOrder, target). The tree uses breadth-first entries with null for missing nodes. Count every non-empty path whose nodes run downward from parent to child and whose values sum to target; paths may begin at any node.","difficulty":"Medium","topic_tags":["Trees","Prefix Sums"],"constraints":["0 <= levelOrder.length <= 10000","Node values and target are signed 32-bit integers"],"examples":[{"input":"[10,5,-3,3,2,null,11,3,-2,null,1], 8","output":"3"},{"input":"[1,-1,1], 1","output":"2"}],"starter_code_by_language":{"JavaScript":"function countDownwardTargetPaths(levelOrder, target) {\n  // Return the number of non-empty downward paths summing to target.\n}","Python":"def count_downward_target_paths(level_order, target):\n    # Return the number of non-empty downward paths summing to target.\n    pass"}},
  {"slug":"binary-tree-right-profile","title":"Read the Tree from Its Right Side","problem_statement":"Implement rightSideProfile(levelOrder). Decode the tree using breadth-first entries and null child markers. Return the rightmost node value at each depth, starting at the root.","difficulty":"Medium","topic_tags":["Trees","BFS"],"constraints":["0 <= levelOrder.length <= 100000"],"examples":[{"input":"[1,2,3,null,5,null,4]","output":"[1,3,4]"},{"input":"[1,2,3,4]","output":"[1,3,4]"}],"starter_code_by_language":{"JavaScript":"function rightSideProfile(levelOrder) {\n  // Return the rightmost value at each depth.\n}","Python":"def right_side_profile(level_order):\n    # Return the rightmost value at each depth.\n    pass"}},
  {"slug":"binary-tree-balance-check","title":"Check Whether Every Subtree Is Height-Balanced","problem_statement":"Implement isHeightBalanced(levelOrder). In the breadth-first encoding, null denotes a missing child. Return true exactly when every node's left and right subtree heights differ by at most one; an empty tree is balanced.","difficulty":"Easy","topic_tags":["Trees","Postorder"],"constraints":["0 <= levelOrder.length <= 100000"],"examples":[{"input":"[3,9,20,null,null,15,7]","output":"true"},{"input":"[1,2,2,3,3,null,null,4,4]","output":"false"}],"starter_code_by_language":{"JavaScript":"function isHeightBalanced(levelOrder) {\n  // Return whether every node satisfies the height condition.\n}","Python":"def is_height_balanced(level_order):\n    # Return whether every node satisfies the height condition.\n    pass"}},
  {"slug":"bst-inclusive-range-sum","title":"Sum Keys in an Inclusive BST Range","problem_statement":"Implement bstRangeSum(levelOrder, low, high). levelOrder encodes a binary-search tree with distinct integer keys; left keys are smaller and right keys larger. Return the sum of keys in [low, high], inclusive. Use the BST ordering to avoid visiting irrelevant subtrees when possible.","difficulty":"Easy","topic_tags":["Trees","BST","Pruning"],"constraints":["0 <= levelOrder.length <= 100000","Keys and bounds are signed 32-bit integers","low <= high","The sum fits signed 64-bit integer"],"examples":[{"input":"[10,5,15,3,7,null,18], 7, 15","output":"32"},{"input":"[8,4,12,2,6,10,14], 5, 11","output":"24"}],"starter_code_by_language":{"JavaScript":"function bstRangeSum(levelOrder, low, high) {\n  // Return the sum of stored keys in the inclusive range.\n}","Python":"def bst_range_sum(level_order, low, high):\n    # Return the sum of stored keys in the inclusive range.\n    pass"}},
  {"slug":"undirected-component-sizes","title":"Report Connected Component Sizes","problem_statement":"Implement componentSizes(n, edges). The graph is simple and undirected, with vertices 0 through n-1 and each edge [u,v]. Return the sizes of all connected components in ascending order.","difficulty":"Medium","topic_tags":["Graphs","DFS"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000"],"examples":[{"input":"6, [[0,1],[1,2],[4,5]]","output":"[1,2,3]"},{"input":"5, [[0,2],[2,4],[1,3]]","output":"[1,2,2]"}],"starter_code_by_language":{"JavaScript":"function componentSizes(n, edges) {\n  // Return component sizes sorted in ascending order.\n}","Python":"def component_sizes(n, edges):\n    # Return component sizes sorted in ascending order.\n    pass"}},
  {"slug":"count-unreachable-vertex-pairs","title":"Count Vertex Pairs with No Connecting Path","problem_statement":"Implement countUnreachablePairs(n, edges) for a simple undirected graph with vertices 0..n-1 and edges [u,v]. Return the number of unordered pairs of distinct vertices that lie in different connected components.","difficulty":"Medium","topic_tags":["Graphs","Components","Counting"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","The answer fits signed 64-bit integer"],"examples":[{"input":"5, [[0,1],[2,3]]","output":"8"},{"input":"4, [[0,1],[1,2]]","output":"3"}],"starter_code_by_language":{"JavaScript":"function countUnreachablePairs(n, edges) {\n  // Return the number of disconnected unordered vertex pairs.\n}","Python":"def count_unreachable_pairs(n, edges):\n    # Return the number of disconnected unordered vertex pairs.\n    pass"}},
  {"slug":"unweighted-shortest-path-count","title":"Count Shortest Routes Between Two Vertices","problem_statement":"Implement countShortestRoutes(n, edges, source, destination). The input is a simple undirected graph on vertices 0..n-1. Count distinct shortest vertex sequences from source to destination; return 0 if no route exists. Return the count modulo 1,000,000,007.","difficulty":"Medium","topic_tags":["Graphs","BFS","Path Counting"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","source and destination are valid vertices"],"examples":[{"input":"5, [[0,1],[0,2],[1,3],[2,3],[3,4]], 0, 3","output":"2"},{"input":"4, [[0,1],[1,2]], 0, 3","output":"0"}],"starter_code_by_language":{"JavaScript":"function countShortestRoutes(n, edges, source, destination) {\n  // Return the number of shortest paths modulo 1,000,000,007, or zero when unreachable.\n}","Python":"def count_shortest_routes(n, edges, source, destination):\n    # Return the number of shortest paths modulo 1,000,000,007, or zero when unreachable.\n    pass"}},
  {"slug":"unweighted-distance-map","title":"Compute Distances from a Graph Source","problem_statement":"Implement distancesFromSource(n, edges, source) for a simple undirected graph whose vertices are 0..n-1. Return an n-element array of shortest edge counts from source; use -1 for unreachable vertices.","difficulty":"Easy","topic_tags":["Graphs","BFS"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","source is a valid vertex"],"examples":[{"input":"5, [[0,1],[1,2],[0,3]], 0","output":"[0,1,2,1,-1]"},{"input":"4, [[0,1],[2,3]], 2","output":"[-1,-1,0,1]"}],"starter_code_by_language":{"JavaScript":"function distancesFromSource(n, edges, source) {\n  // Return shortest edge distances; use -1 when unreachable.\n}","Python":"def distances_from_source(n, edges, source):\n    # Return shortest edge distances; use -1 when unreachable.\n    pass"}},
  {"slug":"first-redundant-undirected-edge","title":"Find the First Edge That Closes a Cycle","problem_statement":"Implement firstRedundantEdge(n, edges). Edges [u,v] are processed in order in an initially edgeless undirected graph over vertices 0..n-1. Return the first edge whose endpoints were already connected before insertion, preserving its input order, or [] if every insertion joins separate components.","difficulty":"Medium","topic_tags":["Graphs","Union Find"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","No edge is a self-loop"],"examples":[{"input":"4, [[0,1],[1,2],[2,3],[0,3]]","output":"[0,3]"},{"input":"5, [[0,1],[2,3],[1,2]]","output":"[]"}],"starter_code_by_language":{"JavaScript":"function firstRedundantEdge(n, edges) {\n  // Return the first cycle-closing edge, or an empty array.\n}","Python":"def first_redundant_edge(n, edges):\n    # Return the first cycle-closing edge, or an empty list.\n    pass"}},
  {"slug":"lexicographic-topological-order","title":"Return the Smallest Available Topological Order","problem_statement":"Implement lexicographicTopologicalOrder(n, edges) for a directed graph on vertices 0..n-1. Each edge [u,v] means u must precede v. Repeatedly choose the smallest-labeled currently zero-indegree vertex. Return that order, or [] if a directed cycle prevents a full ordering.","difficulty":"Medium","topic_tags":["Graphs","Topological Sort","Priority Queue"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","No duplicate directed edges"],"examples":[{"input":"4, [[0,2],[1,2],[2,3]]","output":"[0,1,2,3]"},{"input":"4, [[0,2],[1,2],[2,3],[3,1]]","output":"[]"}],"starter_code_by_language":{"JavaScript":"function lexicographicTopologicalOrder(n, edges) {\n  // Return the prescribed order, or [] if the graph has a cycle.\n}","Python":"def lexicographic_topological_order(n, edges):\n    # Return the prescribed order, or [] if the graph has a cycle.\n    pass"}},
  {"slug":"directed-eventual-safe-vertices","title":"Find Vertices That Cannot Reach a Directed Cycle","problem_statement":"Implement eventualSafeVertices(n, edges) for a directed graph with vertices 0..n-1 and edges [u,v]. Return ascending labels of vertices from which no directed cycle is reachable. Vertices with no outgoing edges are safe.","difficulty":"Medium","topic_tags":["Graphs","Reverse Topological Processing"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000"],"examples":[{"input":"4, [[0,1],[1,2],[2,1],[3,2]]","output":"[]"},{"input":"5, [[0,1],[1,2],[2,3],[3,4]]","output":"[0,1,2,3,4]"}],"starter_code_by_language":{"JavaScript":"function eventualSafeVertices(n, edges) {\n  // Return all cycle-unreachable vertices in ascending order.\n}","Python":"def eventual_safe_vertices(n, edges):\n    # Return all cycle-unreachable vertices in ascending order.\n    pass"}},
  {"slug":"undirected-articulation-vertices","title":"Find Vertices Whose Removal Splits the Graph","problem_statement":"Implement articulationVertices(n, edges) for a connected simple undirected graph on vertices 0..n-1. Return ascending labels of vertices whose removal, together with all incident edges, increases the number of connected components.","difficulty":"Hard","topic_tags":["Graphs","DFS","Articulation Points"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","The graph is connected"],"examples":[{"input":"5, [[0,1],[1,2],[2,0],[1,3],[3,4]]","output":"[1,3]"},{"input":"4, [[0,1],[1,2],[2,3],[3,0]]","output":"[]"}],"starter_code_by_language":{"JavaScript":"function articulationVertices(n, edges) {\n  // Return articulation vertex labels in ascending order.\n}","Python":"def articulation_vertices(n, edges):\n    # Return articulation vertex labels in ascending order.\n    pass"}},
  {"slug":"undirected-bridge-edges","title":"List the Bridges of a Connected Graph","problem_statement":"Implement bridgeEdges(n, edges) for a connected simple undirected graph with vertices 0..n-1. Return every edge whose removal disconnects the graph, written [u,v] with u < v and sorted lexicographically.","difficulty":"Hard","topic_tags":["Graphs","DFS","Bridges"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000","The graph is connected"],"examples":[{"input":"5, [[0,1],[1,2],[2,0],[1,3],[3,4]]","output":"[[1,3],[3,4]]"},{"input":"4, [[0,1],[1,2],[2,3],[3,0]]","output":"[]"}],"starter_code_by_language":{"JavaScript":"function bridgeEdges(n, edges) {\n  // Return normalized bridge edges in lexicographic order.\n}","Python":"def bridge_edges(n, edges):\n    # Return normalized bridge edges in lexicographic order.\n    pass"}},
  {"slug":"minimum-edge-additions-to-connect","title":"Compute the Minimum New Links Needed","problem_statement":"Implement minimumLinksToConnect(n, edges) for a simple undirected graph on vertices 0..n-1. Return the minimum number of new edges needed to make the graph connected; a new edge may join any two vertices in different components.","difficulty":"Easy","topic_tags":["Graphs","Components"],"constraints":["1 <= n <= 100000","0 <= edges.length <= 200000"],"examples":[{"input":"6, [[0,1],[1,2],[3,4]]","output":"2"},{"input":"4, [[0,1],[1,2],[2,3]]","output":"0"}],"starter_code_by_language":{"JavaScript":"function minimumLinksToConnect(n, edges) {\n  // Return the minimum number of additional links.\n}","Python":"def minimum_links_to_connect(n, edges):\n    # Return the minimum number of additional links.\n    pass"}}
]
$seed$::jsonb) as records(
  slug text, title text, problem_statement text, difficulty text,
  topic_tags text[], constraints jsonb, examples jsonb, starter_code_by_language jsonb
);

do $validation$
begin
  if (select count(*) from trees_graphs_seed) <> 20
     or (select count(distinct slug) from trees_graphs_seed) <> 20
     or (select count(distinct title) from trees_graphs_seed) <> 20
     or (select count(distinct problem_statement) from trees_graphs_seed) <> 20
     or exists (select 1 from trees_graphs_seed where btrim(slug) = '' or btrim(title) = '' or btrim(problem_statement) = '')
     or exists (select 1 from trees_graphs_seed where problem_statement ilike '%implement solve(%' or problem_statement ilike '%placeholder%')
     or exists (select 1 from trees_graphs_seed where jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2)
     or exists (select 1 from trees_graphs_seed where jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) = 0)
     or exists (select 1 from trees_graphs_seed seed cross join lateral jsonb_array_elements(seed.examples) example where btrim(coalesce(example.value ->> 'input','')) = '' or btrim(coalesce(example.value ->> 'output','')) = '')
     or exists (select seed.slug from trees_graphs_seed seed cross join lateral jsonb_array_elements(seed.examples) example group by seed.slug having count(*) <> count(distinct (example.value ->> 'input')))
     or exists (select 1 from trees_graphs_seed where starter_code_by_language - array['JavaScript','Python'] <> '{}'::jsonb)
     or exists (select 1 from trees_graphs_seed where not (starter_code_by_language ?& array['JavaScript','Python']))
     or exists (select 1 from trees_graphs_seed seed cross join lateral jsonb_each_text(seed.starter_code_by_language) starter where btrim(starter.value) = '')
     or exists (
       select 1 from trees_graphs_seed
       where slug in ('tree-maximum-depth','count-components','shortest-unweighted-path',
         'validate-binary-search-tree','level-order-traversal','bipartite-graph-check','validate-undirected-tree')
     ) then
    raise exception 'trees-graphs-practice seed must contain exactly 20 distinct, complete questions with language starters and at least two examples each';
  end if;
  if not exists (
    select 1 from public.coding_test_sets
    where slug = 'trees-graphs-practice' and publication_status = 'published'
      and supported_languages = '["JavaScript","Python"]'::jsonb
  ) then
    raise exception 'trees-graphs-practice collection is missing or has unexpected supported languages';
  end if;
end
$validation$;

with question_rows as (
  select
    collection.id as collection_id,
    seed.slug,
    seed.title,
    case
      when 'Trees' = any(seed.topic_tags) then
        'Tree encoding: [] and [null] are empty; otherwise levelOrder is breadth-first from the root. Each real node consumes the next two entries as its left and right children; null marks an absent node and consumes no children. Trailing nulls may be omitted. '
        || seed.problem_statement
      when 'Graphs' = any(seed.topic_tags) then
        'Graph encoding: vertices are 0 through n-1 and each edge is [u,v]; edges are undirected unless this problem explicitly says directed. '
        || seed.problem_statement
      else seed.problem_statement
    end as problem_statement,
    seed.difficulty,
    seed.topic_tags,
    seed.constraints,
    seed.examples,
    seed.starter_code_by_language,
    case seed.difficulty when 'Easy' then 100 when 'Medium' then 150 else 200 end as points,
    coalesce((select max(q.question_order) from public.coding_questions q where q.collection_id = collection.id), 0)
      + row_number() over (order by seed.slug)::integer as question_order
  from trees_graphs_seed seed
  cross join public.coding_test_sets collection
  where collection.slug = 'trees-graphs-practice'
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
select question.id, example.ordinality::integer, example.value ->> 'input', example.value ->> 'output', 'visible'
from trees_graphs_seed seed
join public.coding_test_sets collection on collection.slug = 'trees-graphs-practice'
join public.coding_questions question on question.collection_id = collection.id and question.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples) with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

commit;
