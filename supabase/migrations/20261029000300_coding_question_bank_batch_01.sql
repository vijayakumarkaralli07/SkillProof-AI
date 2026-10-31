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
select *
from jsonb_to_recordset($seed$
[
  {"collection_slug":"arrays-hashing","slug":"product-except-self","title":"Product of Array Except Self","problem_statement":"Given an integer array, return an array where each position contains the product of every input value except the value at that position. Do not use division. Products fit in a signed 32-bit integer.","difficulty":"Medium","topic_tags":["Arrays","Prefix Products"],"constraints":["2 <= numbers.length <= 100000","-30 <= numbers[i] <= 30","Every output product fits in a signed 32-bit integer"],"examples":[{"input":"[1, 2, 3, 4]","output":"[24,12,8,6]"},{"input":"[-1, 1, 0, -3, 3]","output":"[0,0,9,0,0]"}],"starter_code_by_language":{"JavaScript":"function productExceptSelf(numbers) {\n  // Return the product array without using division\n  return [];\n}","Python":"def product_except_self(numbers):\n    # Return the product array without using division\n    return []"},"points":150},
  {"collection_slug":"arrays-hashing","slug":"majority-element","title":"Find the Majority Element","problem_statement":"Return the value that occurs strictly more than half the time in the input array. A majority element is guaranteed to exist.","difficulty":"Easy","topic_tags":["Arrays","Frequency Counting"],"constraints":["1 <= numbers.length <= 100000","A majority element is guaranteed to exist"],"examples":[{"input":"[3, 2, 3]","output":"3"},{"input":"[2, 2, 1, 1, 1, 2, 2]","output":"2"}],"starter_code_by_language":{"JavaScript":"function majorityElement(numbers) {\n  // Return the value occurring more than half the time\n  return 0;\n}","Python":"def majority_element(numbers):\n    # Return the value occurring more than half the time\n    return 0"},"points":100},
  {"collection_slug":"arrays-strings-interview-set","slug":"longest-proper-prefix-suffix","title":"Find the Longest Proper Prefix That Is Also a Suffix","problem_statement":"Return the longest string that is both a proper prefix and a proper suffix of text. The prefix and suffix may overlap, but neither may be the entire string. Return an empty string when no non-empty match exists.","difficulty":"Medium","topic_tags":["Strings","Prefix Function"],"constraints":["0 <= text.length <= 100000","Comparison is case-sensitive"],"examples":[{"input":"\"ababab\"","output":"abab"},{"input":"\"abcab\"","output":"ab"}],"starter_code_by_language":{"JavaScript":"function longestProperPrefixSuffix(text) {\n  // Return the longest proper prefix that is also a suffix\n  return \"\";\n}","Python":"def longest_proper_prefix_suffix(text):\n    # Return the longest proper prefix that is also a suffix\n    return \"\""},"points":150},
  {"collection_slug":"arrays-strings-interview-set","slug":"longest-common-prefix","title":"Longest Common Prefix","problem_statement":"Given a list of strings, return their longest common prefix. Return an empty string when the strings have no common prefix or the list is empty.","difficulty":"Easy","topic_tags":["Strings","Prefix Scanning"],"constraints":["0 <= words.length <= 10000","0 <= words[i].length <= 10000"],"examples":[{"input":"[\"flower\", \"flow\", \"flight\"]","output":"fl"},{"input":"[\"dog\", \"racecar\", \"car\"]","output":""}],"starter_code_by_language":{"JavaScript":"function longestCommonPrefix(words) {\n  // Return the shared prefix\n  return \"\";\n}","Python":"def longest_common_prefix(words):\n    # Return the shared prefix\n    return \"\""},"points":100},
  {"collection_slug":"backend-api-problem-solving","slug":"pagination-window","title":"Calculate a Pagination Window","problem_statement":"Given a zero-based page index, requested page size, and total row count, return an object with offset, limit, and totalPages. Clamp page size to [1, 100], clamp the page index to a valid page (use zero when there are no pages), and return totalPages as zero for an empty result set.","difficulty":"Medium","topic_tags":["Pagination","Input Validation"],"constraints":["pageIndex and totalRows are non-negative integers","pageSize is an integer","At most 100 rows may be requested"],"examples":[{"input":"pageIndex = 2, pageSize = 10, totalRows = 23","output":"{\"offset\":20,\"limit\":10,\"totalPages\":3}"},{"input":"pageIndex = 9, pageSize = 0, totalRows = 0","output":"{\"offset\":0,\"limit\":1,\"totalPages\":0}"}],"starter_code_by_language":{"JavaScript":"function paginationWindow(pageIndex, pageSize, totalRows) {\n  // Return { offset, limit, totalPages }\n  return { offset: 0, limit: 1, totalPages: 0 };\n}","Python":"def pagination_window(page_index, page_size, total_rows):\n    # Return a dictionary with offset, limit, and totalPages\n    return {\"offset\": 0, \"limit\": 1, \"totalPages\": 0}"},"points":150},
  {"collection_slug":"backend-api-problem-solving","slug":"exponential-backoff-delays","title":"Calculate Exponential Backoff Delays","problem_statement":"Return one delay per retry. The first delay is baseDelayMs; each subsequent delay doubles, but no delay may exceed maxDelayMs. If retryCount is zero, return an empty array.","difficulty":"Medium","topic_tags":["Retries","Backoff","API Reliability"],"constraints":["0 <= retryCount <= 20","1 <= baseDelayMs <= maxDelayMs <= 1000000000"],"examples":[{"input":"baseDelayMs = 100, retryCount = 4, maxDelayMs = 500","output":"[100,200,400,500]"},{"input":"baseDelayMs = 50, retryCount = 3, maxDelayMs = 1000","output":"[50,100,200]"}],"starter_code_by_language":{"JavaScript":"function exponentialBackoffDelays(baseDelayMs, retryCount, maxDelayMs) {\n  // Return the capped delay for each retry\n  return [];\n}","Python":"def exponential_backoff_delays(base_delay_ms, retry_count, max_delay_ms):\n    # Return the capped delay for each retry\n    return []"},"points":150},
  {"collection_slug":"c-programming","slug":"longest-equal-value-run-c","title":"Find the Longest Run of Equal Values","problem_statement":"Given an integer array, return the length of its longest contiguous run of equal values. Return zero for an empty array.","difficulty":"Easy","topic_tags":["Arrays","Scanning"],"constraints":["0 <= n <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"values = [1, 1, 2, 2, 2, 1], n = 6","output":"3"},{"input":"values = [4, 5, 6], n = 3","output":"1"}],"starter_code_by_language":{"C":"int longestEqualRun(const int values[], int n) {\n    /* Return the longest contiguous run length */\n    return 0;\n}"},"points":100},
  {"collection_slug":"c-programming","slug":"count-set-bits-c","title":"Count Set Bits","problem_statement":"Return the number of 1 bits in the unsigned 32-bit representation of value. Use an unsigned 32-bit input so the full bit range is defined.","difficulty":"Easy","topic_tags":["Bit Manipulation","C Fundamentals"],"constraints":["value is an unsigned 32-bit integer"],"examples":[{"input":"11","output":"3"},{"input":"128","output":"1"}],"starter_code_by_language":{"C":"unsigned int countSetBits(unsigned int value) {\n    /* Return the number of one bits */\n    return 0;\n}"},"points":100},
  {"collection_slug":"cpp-programming","slug":"rotate-matrix-clockwise-cpp","title":"Rotate a Square Matrix Clockwise","problem_statement":"Return a new matrix formed by rotating the square input matrix 90 degrees clockwise. Do not mutate the input.","difficulty":"Medium","topic_tags":["Vectors","Matrices","In-Place Reasoning"],"constraints":["0 <= matrix.size() <= 1000","Every row has the same length as the matrix"],"examples":[{"input":"[[1, 2, 3], [4, 5, 6], [7, 8, 9]]","output":"[[7,4,1],[8,5,2],[9,6,3]]"},{"input":"[[1, 2], [3, 4]]","output":"[[3,1],[4,2]]"}],"starter_code_by_language":{"C++":"vector<vector<int>> rotateClockwise(const vector<vector<int>>& matrix) {\n    // Return the matrix rotated by 90 degrees\n    return {};\n}"},"points":150},
  {"collection_slug":"cpp-programming","slug":"longest-increasing-run-cpp","title":"Longest Strictly Increasing Contiguous Run","problem_statement":"Return the length of the longest contiguous run in which every value is strictly greater than its predecessor. Return zero for an empty array.","difficulty":"Easy","topic_tags":["Vectors","Array Scanning"],"constraints":["0 <= values.size() <= 100000","-1000000000 <= values[i] <= 1000000000"],"examples":[{"input":"[1, 3, 2, 4, 6, 8, 1]","output":"4"},{"input":"[5, 4, 3]","output":"1"}],"starter_code_by_language":{"C++":"int longestIncreasingRun(const vector<int>& values) {\n    // Return the longest contiguous increasing length\n    return 0;\n}"},"points":100},
  {"collection_slug":"csharp-programming","slug":"count-positive-csharp","title":"Count Positive Values","problem_statement":"Return how many integers in the input list are strictly greater than zero. Zero and negative values do not count.","difficulty":"Easy","topic_tags":["Lists","LINQ or Iteration"],"constraints":["0 <= values.Count <= 100000","-1000000000 <= values[i] <= 1000000000"],"examples":[{"input":"[-2, 0, 3, 7, -1]","output":"2"},{"input":"[0, -4]","output":"0"}],"starter_code_by_language":{"C#":"public static int CountPositive(List<int> values) {\n    // Count values greater than zero\n    return 0;\n}"},"points":100},
  {"collection_slug":"csharp-programming","slug":"first-repeated-value-csharp","title":"Find the First Repeated Value","problem_statement":"Scan the list from left to right and return the first value whose earlier occurrence is nearest to the current position. Return null if no value repeats.","difficulty":"Easy","topic_tags":["Lists","HashSet"],"constraints":["0 <= values.Count <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[2, 1, 3, 5, 3, 2]","output":"3"},{"input":"[4, 5, 6]","output":"null"}],"starter_code_by_language":{"C#":"public static int? FirstRepeatedValue(List<int> values) {\n    // Return the first repeated value, or null\n    return null;\n}"},"points":100},
  {"collection_slug":"dbms-database-design","slug":"find-overlapping-room-bookings","title":"Find Overlapping Room Bookings","problem_statement":"Given room_bookings(booking_id, room_id, start_time, end_time), return each pair of distinct bookings in the same room whose time intervals overlap. Treat intervals as half-open, so a booking ending exactly when another starts is not an overlap. Return each pair once with the smaller booking_id first, sorted by both IDs.","difficulty":"Medium","topic_tags":["SQL","Self Join","Intervals"],"constraints":["booking_id is unique","start_time is earlier than end_time","Times use a consistent timezone"],"examples":[{"input":"bookings: (1,101,09:00,11:00),(2,101,10:00,12:00),(3,101,12:00,13:00),(4,202,09:00,10:00)","output":"1 | 2"},{"input":"bookings: (5,8,09:00,10:00),(6,8,10:00,11:00)","output":"(no rows)"}],"starter_code_by_language":{"SQL":"SELECT a.booking_id AS booking_a, b.booking_id AS booking_b\nFROM room_bookings AS a\nJOIN room_bookings AS b\n  ON a.room_id = b.room_id\n AND a.booking_id < b.booking_id\n AND a.start_time < b.end_time\n AND b.start_time < a.end_time\nORDER BY a.booking_id, b.booking_id;"},"points":150},
  {"collection_slug":"dbms-database-design","slug":"employees-above-department-average","title":"Find Employees Above Their Department Average","problem_statement":"Given employees(employee_id, name, department_id, salary), return employees whose salary is strictly greater than the average salary in their department. Sort by employee_id ascending.","difficulty":"Medium","topic_tags":["SQL","Correlated Subquery","Aggregation"],"constraints":["department_id and salary are non-null","Return employee_id, name, and salary"],"examples":[{"input":"employees: (1,Ada,10,120),(2,Lin,10,80),(3,Mo,20,90),(4,Noa,20,110)","output":"1 | Ada | 120.00\n4 | Noa | 110.00"},{"input":"employees: (5,Rae,30,50)","output":"(no rows)"}],"starter_code_by_language":{"SQL":"SELECT e.employee_id, e.name, e.salary\nFROM employees AS e\nWHERE e.salary > (\n  SELECT AVG(peer.salary)\n  FROM employees AS peer\n  WHERE peer.department_id = e.department_id\n)\nORDER BY e.employee_id;"},"points":150},
  {"collection_slug":"dynamic-programming","slug":"min-cost-climbing-stairs","title":"Minimum Cost to Reach the Top","problem_statement":"cost[i] is the cost to stand on stair i. Start at stair 0 or stair 1, pay the cost of each stair you land on, and move one or two steps at a time. Return the minimum cost to move beyond the final stair.","difficulty":"Medium","topic_tags":["Dynamic Programming","Arrays"],"constraints":["2 <= cost.length <= 100000","0 <= cost[i] <= 10000"],"examples":[{"input":"[10, 15, 20]","output":"15"},{"input":"[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]","output":"6"}],"starter_code_by_language":{"JavaScript":"function minCostClimbingStairs(cost) {\n  // Return the minimum total cost to reach the top\n  return 0;\n}","Python":"def min_cost_climbing_stairs(cost):\n    # Return the minimum total cost to reach the top\n    return 0"},"points":150},
  {"collection_slug":"dynamic-programming","slug":"equal-subset-partition","title":"Partition an Array into Equal Sums","problem_statement":"Return true if the array can be partitioned into two subsets with equal sums. Every value is a positive integer; each input element may be used at most once.","difficulty":"Medium","topic_tags":["Dynamic Programming","Subset Sum"],"constraints":["1 <= values.length <= 200","1 <= values[i] <= 100","The total sum is at most 20000"],"examples":[{"input":"[1, 5, 11, 5]","output":"true"},{"input":"[1, 2, 3, 5]","output":"false"}],"starter_code_by_language":{"JavaScript":"function canPartitionEqualSubsetSum(values) {\n  // Return whether two equal-sum subsets exist\n  return false;\n}","Python":"def can_partition_equal_subset_sum(values):\n    # Return whether two equal-sum subsets exist\n    return False"},"points":150},
  {"collection_slug":"go-programming","slug":"rotate-slice-left-go","title":"Rotate a Slice Left","problem_statement":"Return a new slice containing values rotated left by k positions. Reduce k modulo the slice length and return an empty slice for empty input.","difficulty":"Easy","topic_tags":["Slices","Indexing"],"constraints":["0 <= len(values) <= 100000","0 <= k <= 1000000000"],"examples":[{"input":"values = [1, 2, 3, 4], k = 1","output":"[2,3,4,1]"},{"input":"values = [5, 6, 7], k = 5","output":"[7,5,6]"}],"starter_code_by_language":{"Go":"func rotateLeft(values []int, k int) []int {\n    // Return a left-rotated copy\n    return nil\n}"},"points":100},
  {"collection_slug":"go-programming","slug":"first-missing-positive-go","title":"Find the First Missing Positive Integer","problem_statement":"Return the smallest positive integer that does not occur in the input slice. The input may contain negative values and duplicates.","difficulty":"Medium","topic_tags":["Slices","In-Place Algorithms"],"constraints":["0 <= len(values) <= 100000","-1000000000 <= values[i] <= 1000000000"],"examples":[{"input":"[3, 4, -1, 1]","output":"2"},{"input":"[1, 2, 0]","output":"3"}],"starter_code_by_language":{"Go":"func firstMissingPositive(values []int) int {\n    // Return the smallest absent positive integer\n    return 1\n}"},"points":150},
  {"collection_slug":"java-fundamentals","slug":"second-largest-distinct-java","title":"Second Largest Distinct Value","problem_statement":"Return the second-largest distinct integer in the array. Return null when fewer than two distinct values exist.","difficulty":"Easy","topic_tags":["Arrays","Collections"],"constraints":["0 <= values.length <= 100000","Values are signed 32-bit integers"],"examples":[{"input":"[4, 1, 7, 7, 3]","output":"4"},{"input":"[5, 5]","output":"null"}],"starter_code_by_language":{"Java":"static Integer secondLargestDistinct(int[] values) {\n  // Return the second-largest distinct value, or null\n  return null;\n}"},"points":100},
  {"collection_slug":"java-fundamentals","slug":"sum-decimal-digits-java","title":"Sum the Decimal Digits","problem_statement":"Return the sum of the decimal digits of the absolute value of n. Treat zero as having digit sum zero.","difficulty":"Easy","topic_tags":["Math","Loops"],"constraints":["n is a signed 32-bit integer"],"examples":[{"input":"-502","output":"7"},{"input":"0","output":"0"}],"starter_code_by_language":{"Java":"static int digitSum(int n) {\n  // Sum the digits of the absolute value\n  return 0;\n}"},"points":100},
  {"collection_slug":"javascript-core-challenges","slug":"interleave-two-arrays","title":"Interleave Two Arrays","problem_statement":"Return a new array by alternating one value from left and one from right, starting with left. When one array runs out, append the remaining values from the other array in their original order.","difficulty":"Easy","topic_tags":["Arrays","Iteration"],"constraints":["0 <= left.length, right.length <= 100000"],"examples":[{"input":"left = [1, 2, 3], right = [\"a\", \"b\"]","output":"[1,\"a\",2,\"b\",3]"},{"input":"left = [], right = [4, 5]","output":"[4,5]"}],"starter_code_by_language":{"JavaScript":"function interleaveArrays(left, right) {\n  // Alternate values and append any remainder\n  return [];\n}","Python":"def interleave_arrays(left, right):\n    # Alternate values and append any remainder\n    return []"},"points":100},
  {"collection_slug":"javascript-core-challenges","slug":"sum-object-property","title":"Sum a Numeric Object Property","problem_statement":"Given an array of objects and a property name, sum that property's numeric values. Ignore records where the property is missing or is not a finite number.","difficulty":"Easy","topic_tags":["Objects","Array Methods"],"constraints":["0 <= records.length <= 100000","property is a non-empty string"],"examples":[{"input":"records = [{\"amount\":4},{\"amount\":2.5},{\"amount\":\"3\"},{}], property = \"amount\"","output":"6.5"},{"input":"records = [{\"score\":-2},{\"score\":3}], property = \"score\"","output":"1"}],"starter_code_by_language":{"JavaScript":"function sumNumericProperty(records, property) {\n  // Sum finite numeric values for property\n  return 0;\n}","Python":"def sum_numeric_property(records, property):\n    # Sum finite numeric values for property\n    return 0"},"points":100},
  {"collection_slug":"linked-lists","slug":"remove-sorted-list-duplicates","title":"Remove Duplicates from a Sorted List","problem_statement":"A singly linked list is represented by its node values in order. Return the values after removing repeated adjacent values, keeping one copy of each. The input is sorted in non-decreasing order.","difficulty":"Easy","topic_tags":["Linked Lists","Traversal"],"constraints":["0 <= values.length <= 100000","values is sorted in non-decreasing order"],"examples":[{"input":"[1, 1, 2, 3, 3]","output":"[1,2,3]"},{"input":"[]","output":"[]"}],"starter_code_by_language":{"JavaScript":"function removeSortedDuplicates(values) {\n  // Return node values with adjacent duplicates removed\n  return [];\n}","Python":"def remove_sorted_duplicates(values):\n    # Return node values with adjacent duplicates removed\n    return []"},"points":100},
  {"collection_slug":"linked-lists","slug":"add-two-reversed-digit-lists","title":"Add Two Numbers as Reversed-Digit Lists","problem_statement":"Each non-empty array represents a non-negative integer whose digits are stored in reverse order. Add the represented integers and return the result in the same reversed-digit format. Do not convert the entire number to a native integer.","difficulty":"Medium","topic_tags":["Linked Lists","Carry Propagation","Arithmetic"],"constraints":["1 <= first.length, second.length <= 10000","Each value is a digit from 0 through 9","Inputs have no leading zero unless the value is zero"],"examples":[{"input":"first = [2, 4, 3], second = [5, 6, 4]","output":"[7,0,8]"},{"input":"first = [0], second = [0]","output":"[0]"}],"starter_code_by_language":{"JavaScript":"function addTwoNumbers(first, second) {\n  // Return the sum as reversed digits\n  return [];\n}","Python":"def add_two_numbers(first, second):\n    # Return the sum as reversed digits\n    return []"},"points":150},
  {"collection_slug":"python-programming","slug":"transpose-matrix-python","title":"Transpose a Matrix","problem_statement":"Return the transpose of a rectangular matrix: rows become columns and columns become rows. The matrix may have zero rows; when non-empty, every row has the same length.","difficulty":"Easy","topic_tags":["Lists","Nested Iteration"],"constraints":["0 <= rows <= 1000","0 <= columns <= 1000"],"examples":[{"input":"[[1, 2, 3], [4, 5, 6]]","output":"[[1,4],[2,5],[3,6]]"},{"input":"[[7], [8]]","output":"[[7,8]]"}],"starter_code_by_language":{"Python":"def transpose(matrix):\n    # Return the rows and columns exchanged\n    return []"},"points":100},
  {"collection_slug":"python-programming","slug":"deduplicate-consecutive-values","title":"Remove Consecutive Duplicate Values","problem_statement":"Given a list of integers, return a new list with each consecutive run reduced to one value. Non-consecutive occurrences remain separate.","difficulty":"Easy","topic_tags":["Lists","Iteration"],"constraints":["0 <= len(values) <= 100000","Values are integers"],"examples":[{"input":"[1, 1, 2, 2, 2, 3, 1]","output":"[1,2,3,1]"},{"input":"[]","output":"[]"}],"starter_code_by_language":{"Python":"def deduplicate_consecutive(values):\n    # Keep one value from each consecutive run\n    return []"},"points":100},
  {"collection_slug":"recursion-backtracking","slug":"binary-strings-length-n","title":"Generate Binary Strings of Length N","problem_statement":"Return all binary strings of length n in lexicographic order, with 0 before 1. Return an empty list when n is zero.","difficulty":"Medium","topic_tags":["Recursion","Backtracking"],"constraints":["0 <= n <= 12"],"examples":[{"input":"2","output":"[\"00\",\"01\",\"10\",\"11\"]"},{"input":"1","output":"[\"0\",\"1\"]"}],"starter_code_by_language":{"JavaScript":"function binaryStrings(n) {\n  // Return all strings in lexicographic order\n  return [];\n}","Python":"def binary_strings(n):\n    # Return all strings in lexicographic order\n    return []"},"points":150},
  {"collection_slug":"recursion-backtracking","slug":"count-grid-paths","title":"Count Paths Through an Empty Grid","problem_statement":"Starting at the top-left cell of an rows-by-columns grid, count paths to the bottom-right cell when each move is either one cell right or one cell down. Return zero if either dimension is zero.","difficulty":"Medium","topic_tags":["Recursion","Combinatorics","Dynamic Programming"],"constraints":["0 <= rows, columns <= 30","The result fits in a signed 64-bit integer"],"examples":[{"input":"rows = 3, columns = 3","output":"6"},{"input":"rows = 2, columns = 4","output":"4"}],"starter_code_by_language":{"JavaScript":"function countGridPaths(rows, columns) {\n  // Return the number of right/down paths\n  return 0;\n}","Python":"def count_grid_paths(rows, columns):\n    # Return the number of right/down paths\n    return 0"},"points":150},
  {"collection_slug":"sorting-binary-search","slug":"lower-bound-index","title":"Find the Lower Bound Index","problem_statement":"In a sorted non-decreasing array, return the first index whose value is greater than or equal to target. Return the array length if no such value exists.","difficulty":"Easy","topic_tags":["Binary Search","Arrays"],"constraints":["0 <= values.length <= 100000","values is sorted in non-decreasing order"],"examples":[{"input":"values = [1, 2, 2, 4], target = 2","output":"1"},{"input":"values = [1, 3, 5], target = 6","output":"3"}],"starter_code_by_language":{"JavaScript":"function lowerBound(values, target) {\n  // Return the first qualifying index\n  return 0;\n}","Python":"def lower_bound(values, target):\n    # Return the first qualifying index\n    return 0"},"points":100},
  {"collection_slug":"sorting-binary-search","slug":"insertion-sort-count","title":"Count Insertion Sort Shifts","problem_statement":"Count how many element shifts insertion sort performs when sorting the array in ascending order. A shift occurs each time a prior element is moved one position to the right.","difficulty":"Medium","topic_tags":["Sorting","Insertion Sort"],"constraints":["0 <= values.length <= 10000","Values are integers"],"examples":[{"input":"[2, 1, 3, 1]","output":"3"},{"input":"[1, 2, 3]","output":"0"}],"starter_code_by_language":{"JavaScript":"function countInsertionSortShifts(values) {\n  // Return the number of rightward element shifts\n  return 0;\n}","Python":"def count_insertion_sort_shifts(values):\n    # Return the number of rightward element shifts\n    return 0"},"points":150},
  {"collection_slug":"sql-database-foundations","slug":"top-customers-by-spend","title":"Rank Customers by Total Spend","problem_statement":"Given customers(customer_id, name) and orders(order_id, customer_id, amount), return each customer with their total spend, including customers with no orders as zero. Sort by total spend descending, then customer_id ascending.","difficulty":"Medium","topic_tags":["SQL","Aggregation","LEFT JOIN"],"constraints":["Return customer_id, name, total_spend","Use zero for customers without orders"],"examples":[{"input":"customers: (1,Ada),(2,Lin); orders: (10,1,5.00),(11,1,7.50)","output":"1 | Ada | 12.50\n2 | Lin | 0.00"},{"input":"customers: (3,Mo); orders: (12,3,4.25)","output":"3 | Mo | 4.25"}],"starter_code_by_language":{"SQL":"SELECT c.customer_id, c.name, COALESCE(SUM(o.amount), 0) AS total_spend\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY total_spend DESC, c.customer_id;"},"points":150},
  {"collection_slug":"sql-database-foundations","slug":"duplicate-email-report","title":"Find Duplicate Email Addresses","problem_statement":"Given users(user_id, email), return each email that occurs more than once and its occurrence count. Sort emails lexicographically.","difficulty":"Easy","topic_tags":["SQL","GROUP BY","HAVING"],"constraints":["email is non-null","Return email and occurrence_count"],"examples":[{"input":"users: (1,a@example.com),(2,b@example.com),(3,a@example.com)","output":"a@example.com | 2"},{"input":"users: (4,x@example.com),(5,y@example.com)","output":"(no rows)"}],"starter_code_by_language":{"SQL":"SELECT email, COUNT(*) AS occurrence_count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY email;"},"points":100},
  {"collection_slug":"stacks-queues","slug":"validate-stack-sequences","title":"Validate Stack Push and Pop Sequences","problem_statement":"A stack receives the values in pushed order and may pop at any time. Return true if popped can be produced using this process, otherwise return false.","difficulty":"Medium","topic_tags":["Stacks","Simulation"],"constraints":["0 <= pushed.length = popped.length <= 100000","Values are distinct integers","popped contains the same values as pushed"],"examples":[{"input":"pushed = [1, 2, 3, 4, 5], popped = [4, 5, 3, 2, 1]","output":"true"},{"input":"pushed = [1, 2, 3], popped = [3, 1, 2]","output":"false"}],"starter_code_by_language":{"JavaScript":"function validateStackSequences(pushed, popped) {\n  // Simulate pushes and pops\n  return false;\n}","Python":"def validate_stack_sequences(pushed, popped):\n    # Simulate pushes and pops\n    return False"},"points":150},
  {"collection_slug":"stacks-queues","slug":"evaluate-rpn","title":"Evaluate Reverse Polish Notation","problem_statement":"Evaluate an expression in reverse Polish notation containing signed integer operands and the operators +, -, *, and /. Division truncates toward zero. The expression is valid and division by zero does not occur.","difficulty":"Medium","topic_tags":["Stacks","Expression Evaluation"],"constraints":["1 <= tokens.length <= 10000","Every intermediate result fits in a signed 32-bit integer"],"examples":[{"input":"[\"2\", \"1\", \"+\", \"3\", \"*\"]","output":"9"},{"input":"[\"7\", \"-3\", \"/\"]","output":"-2"}],"starter_code_by_language":{"JavaScript":"function evaluateRpn(tokens) {\n  // Return the integer result\n  return 0;\n}","Python":"def evaluate_rpn(tokens):\n    # Return the integer result\n    return 0"},"points":150},
  {"collection_slug":"trees-graphs-practice","slug":"bipartite-graph-check","title":"Check Whether an Undirected Graph Is Bipartite","problem_statement":"Given an undirected graph as an adjacency list, return true if its vertices can be split into two groups so every edge connects different groups. An empty graph is bipartite.","difficulty":"Medium","topic_tags":["Graphs","Bipartite Coloring"],"constraints":["0 <= graph.length <= 100000","The adjacency list describes an undirected graph"],"examples":[{"input":"[[1, 3], [0, 2], [1, 3], [0, 2]]","output":"true"},{"input":"[[1, 2], [0, 2], [0, 1]]","output":"false"}],"starter_code_by_language":{"JavaScript":"function isBipartite(graph) {\n  // Return whether the graph is two-colorable\n  return false;\n}","Python":"def is_bipartite(graph):\n    # Return whether the graph is two-colorable\n    return False"},"points":150},
  {"collection_slug":"trees-graphs-practice","slug":"validate-undirected-tree","title":"Validate an Undirected Tree","problem_statement":"Given nodeCount numbered vertices and an undirected edge list, return true exactly when the graph is connected and has no cycles. The graph has no self-edges or duplicate edges.","difficulty":"Medium","topic_tags":["Graphs","Trees","Cycle Detection"],"constraints":["1 <= nodeCount <= 100000","0 <= edges.length <= 100000","Each edge connects two different valid vertices"],"examples":[{"input":"nodeCount = 5, edges = [[0, 1], [0, 2], [0, 3], [1, 4]]","output":"true"},{"input":"nodeCount = 4, edges = [[0, 1], [1, 2], [2, 0], [2, 3]]","output":"false"}],"starter_code_by_language":{"JavaScript":"function isUndirectedTree(nodeCount, edges) {\n  // Return whether the graph is connected and acyclic\n  return false;\n}","Python":"def is_undirected_tree(node_count, edges):\n    # Return whether the graph is connected and acyclic\n    return False"},"points":150},
  {"collection_slug":"typescript-challenges","slug":"group-words-by-length-ts","title":"Group Words by Length","problem_statement":"Return an object whose keys are decimal word lengths and whose values are arrays of words of that length in their original order. Include only lengths that occur.","difficulty":"Easy","topic_tags":["TypeScript","Objects","Grouping"],"constraints":["0 <= words.length <= 100000","Words contain lowercase English letters"],"examples":[{"input":"[\"go\", \"typescript\", \"ai\", \"code\"]","output":"{\"2\":[\"go\",\"ai\"],\"4\":[\"code\"],\"10\":[\"typescript\"]}"},{"input":"[\"a\", \"bb\"]","output":"{\"1\":[\"a\"],\"2\":[\"bb\"]}"}],"starter_code_by_language":{"TypeScript":"function groupWordsByLength(words: string[]): Record<string, string[]> {\n  // Group words without changing their order\n  return {};\n}"},"points":100},
  {"collection_slug":"typescript-challenges","slug":"safe-integer-parser-ts","title":"Parse a Safe Integer","problem_statement":"Parse a string containing an optional leading sign followed by one or more decimal digits. Return the integer value when the full string is valid and the value is within JavaScript's safe integer range; otherwise return null. Do not accept whitespace or trailing characters.","difficulty":"Medium","topic_tags":["TypeScript","Validation","Numbers"],"constraints":["0 <= text.length <= 100","The accepted value is within Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER"],"examples":[{"input":"\"-2048\"","output":"-2048"},{"input":"\"12px\"","output":"null"}],"starter_code_by_language":{"TypeScript":"function parseSafeInteger(text: string): number | null {\n  // Validate the entire string and safe range\n  return null;\n}"},"points":150},
  {"collection_slug":"web-development-fundamentals","slug":"escape-html-text","title":"Escape Text for Safe HTML Output","problem_statement":"Replace ampersands, less-than signs, greater-than signs, double quotes, and apostrophes with their HTML entities: &amp;, &lt;, &gt;, &quot;, and &#39;. Escape ampersands first so generated entities are not escaped again.","difficulty":"Easy","topic_tags":["Web Security","Strings","HTML"],"constraints":["0 <= text.length <= 100000","Escape exactly the five listed characters"],"examples":[{"input":"\"<p>A & B</p>\"","output":"&lt;p&gt;A &amp; B&lt;/p&gt;"},{"input":"\"Tom's \\\"book\\\"\"","output":"Tom&#39;s &quot;book&quot;"}],"starter_code_by_language":{"JavaScript":"function escapeHtml(text) {\n  // Return the escaped text\n  return \"\";\n}","Python":"def escape_html(text):\n    # Return the escaped text\n    return \"\""},"points":100},
  {"collection_slug":"web-development-fundamentals","slug":"validate-url-slug","title":"Validate a URL Slug","problem_statement":"Return true when slug is non-empty, contains only lowercase ASCII letters, digits, and single hyphens between groups, and does not start or end with a hyphen. Return false otherwise.","difficulty":"Easy","topic_tags":["Web","Validation","Regular Expressions"],"constraints":["0 <= slug.length <= 200"],"examples":[{"input":"\"skill-proof-2\"","output":"true"},{"input":"\"-bad--slug-\"","output":"false"}],"starter_code_by_language":{"JavaScript":"function isValidSlug(slug) {\n  // Validate lowercase hyphen-separated groups\n  return false;\n}","Python":"def is_valid_slug(slug):\n    # Validate lowercase hyphen-separated groups\n    return False"},"points":100}
]
$seed$::jsonb) as seed(
  collection_slug text,
  slug text,
  title text,
  problem_statement text,
  difficulty text,
  topic_tags text[],
  constraints jsonb,
  examples jsonb,
  starter_code_by_language jsonb,
  points integer
);

do $validate_seed$
begin
  if (select count(*) from coding_question_seed) <> 40
    or (select count(distinct collection_slug) from coding_question_seed) <> 20 then
    raise exception 'Coding question batch must seed exactly two questions for each of 20 collections.';
  end if;

  if exists (
    select 1
    from coding_question_seed
    group by collection_slug
    having count(*) <> 2
  ) or exists (
    select 1
    from coding_question_seed
    group by collection_slug, slug
    having count(*) > 1
  ) then
    raise exception 'Coding question batch contains duplicate or incomplete collection entries.';
  end if;

  if exists (
    select 1
    from coding_question_seed seed
    left join public.coding_test_sets collection
      on collection.slug = seed.collection_slug
     and collection.publication_status = 'published'
    where collection.id is null
  ) then
    raise exception 'Coding question batch references a missing or unpublished collection.';
  end if;

  if exists (
    select 1
    from coding_question_seed seed
    where char_length(btrim(seed.title)) = 0
      or char_length(btrim(seed.problem_statement)) = 0
      or seed.difficulty not in ('Easy', 'Medium', 'Hard')
      or seed.points not between 0 and 1000
      or jsonb_typeof(seed.examples) <> 'array'
      or jsonb_array_length(seed.examples) < 2
      or jsonb_typeof(seed.starter_code_by_language) <> 'object'
      or not exists (
        select 1
        from jsonb_each_text(seed.starter_code_by_language) as starter(key, value)
        where char_length(btrim(starter.value)) > 0
      )
      or exists (
        select 1
        from jsonb_array_elements(seed.examples) as example(value)
        where jsonb_typeof(example.value) <> 'object'
          or nullif(btrim(example.value ->> 'input'), '') is null
          or example.value ->> 'output' is null
      )
  ) then
    raise exception 'Coding question batch contains invalid question content or examples.';
  end if;
end;
$validate_seed$;

with question_rows as (
  select
    collection.id as collection_id,
    seed.*,
    coalesce(existing.max_order, 0)
      + row_number() over (partition by collection.id order by seed.slug)::integer as question_order
  from coding_question_seed seed
  join public.coding_test_sets collection
    on collection.slug = seed.collection_slug
   and collection.publication_status = 'published'
  cross join lateral (
    select max(question.question_order) as max_order
    from public.coding_questions question
    where question.collection_id = collection.id
  ) existing
)
insert into public.coding_questions (
  collection_id,
  slug,
  title,
  problem_statement,
  difficulty,
  topic_tags,
  constraints,
  examples,
  starter_code_by_language,
  points,
  publication_status,
  question_order
)
select
  question_rows.collection_id,
  question_rows.slug,
  question_rows.title,
  question_rows.problem_statement,
  question_rows.difficulty,
  question_rows.topic_tags,
  question_rows.constraints,
  question_rows.examples,
  question_rows.starter_code_by_language,
  question_rows.points,
  'published',
  question_rows.question_order
from question_rows
on conflict (collection_id, slug) do nothing;

insert into public.coding_test_cases (
  question_id,
  case_order,
  test_input,
  expected_output,
  visibility
)
select
  question.id,
  example.ordinality::integer,
  example.value ->> 'input',
  example.value ->> 'output',
  'visible'
from coding_question_seed seed
join public.coding_test_sets collection
  on collection.slug = seed.collection_slug
join public.coding_questions question
  on question.collection_id = collection.id
 and question.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples)
  with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

commit;
