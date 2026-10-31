begin;

create temporary table sorting_search_seed (
  slug text not null,
  title text not null,
  problem_statement text not null,
  difficulty text not null,
  topic_tags text[] not null,
  constraints jsonb not null,
  examples jsonb not null,
  starter_code_by_language jsonb not null
) on commit drop;

insert into sorting_search_seed
select slug, title, problem_statement, difficulty, topic_tags, constraints, examples, starter_code_by_language
from jsonb_to_recordset($seed$
[
  {
    "slug": "kth-in-two-sorted-arrays",
    "title": "Select a Rank Across Two Sorted Arrays",
    "problem_statement": "Implement kthSmallestAcross(first, second, k). Both input arrays are sorted in non-decreasing order. Return the value at one-based rank k in their combined sorted multiset without materializing the full merge.",
    "difficulty": "Hard",
    "topic_tags": [
      "Binary Search",
      "Arrays",
      "Selection"
    ],
    "constraints": [
      "1 <= first.length + second.length <= 200000",
      "1 <= k <= first.length + second.length",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "first=[1,4,9], second=[2,3,10], k=4",
        "output": "4"
      },
      {
        "input": "first=[-5,0], second=[-2,7,8], k=2",
        "output": "-2"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function kthSmallestAcross(first, second, k) {\n  // Return the value at one-based rank k.\n}",
      "Python": "def kth_smallest_across(first, second, k):\n    # Return the value at one-based rank k.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int kthSmallestAcross(int[] first, int[] second, int k) {\n      // Return the value at one-based rank k.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long kthSmallestAcross(const vector<long long>& first, const vector<long long>& second, int k) {\n    // Return the value at one-based rank k.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "median-of-two-sorted-arrays-stream",
    "title": "Find the Median of Two Sorted Arrays",
    "problem_statement": "Implement medianOfSortedPair(first, second). The two arrays are individually sorted in non-decreasing order and their combined length is nonzero. Return the median as a floating-point number; for an even total length, average the two middle values without integer truncation.",
    "difficulty": "Hard",
    "topic_tags": [
      "Binary Search",
      "Arrays",
      "Median"
    ],
    "constraints": [
      "1 <= first.length + second.length <= 200000",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "first=[1,3], second=[2]",
        "output": "2.0"
      },
      {
        "input": "first=[1,2], second=[3,4]",
        "output": "2.5"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function medianOfSortedPair(first, second) {\n  // Return the combined median as a number.\n}",
      "Python": "def median_of_sorted_pair(first, second):\n    # Return the combined median as a float.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static double medianOfSortedPair(int[] first, int[] second) {\n      // Return the combined median without integer truncation.\n    return 0.0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\ndouble medianOfSortedPair(const vector<int>& first, const vector<int>& second) {\n    // Return the combined median without integer truncation.\n    return 0.0;\n}"
    }
  },
  {
    "slug": "sorted-array-occurrence-count",
    "title": "Count Every Occurrence in a Sorted Array",
    "problem_statement": "Implement countOccurrences(values, target). values is sorted in non-decreasing order and may contain duplicates. Return the number of entries equal to target using logarithmic search boundaries rather than scanning the full array.",
    "difficulty": "Easy",
    "topic_tags": [
      "Binary Search",
      "Arrays"
    ],
    "constraints": [
      "0 <= values.length <= 200000",
      "Values and target are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[1,2,2,2,5,8], target=2",
        "output": "3"
      },
      {
        "input": "values=[-3,-1,0,4], target=3",
        "output": "0"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function countOccurrences(values, target) {\n  // Return how many array entries equal target.\n}",
      "Python": "def count_occurrences(values, target):\n    # Return how many array entries equal target.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int countOccurrences(int[] values, int target) {\n      // Return how many array entries equal target.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nint countOccurrences(const vector<int>& values, int target) {\n    // Return how many array entries equal target.\n    return 0;\n}"
    }
  },
  {
    "slug": "first-and-last-target-range",
    "title": "Locate the First and Last Target Positions",
    "problem_statement": "Implement targetRange(values, target). values is sorted in non-decreasing order. Return [firstIndex, lastIndex] for target, or [-1,-1] if it is absent. The two boundaries must be found in O(log n) time.",
    "difficulty": "Medium",
    "topic_tags": [
      "Binary Search",
      "Arrays"
    ],
    "constraints": [
      "0 <= values.length <= 200000",
      "Values and target are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[1,2,2,2,4,7], target=2",
        "output": "[1,3]"
      },
      {
        "input": "values=[1,3,5,7], target=4",
        "output": "[-1,-1]"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function targetRange(values, target) {\n  // Return [firstIndex, lastIndex], or [-1, -1].\n}",
      "Python": "def target_range(values, target):\n    # Return [first_index, last_index], or [-1, -1].\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int[] targetRange(int[] values, int target) {\n      // Return [firstIndex, lastIndex], or [-1, -1].\n    return new int[0];\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nvector<int> targetRange(const vector<int>& values, int target) {\n    // Return {firstIndex, lastIndex}, or {-1, -1}.\n    return {};\n}"
    }
  },
  {
    "slug": "nearest-sorted-value",
    "title": "Choose the Nearest Value in a Sorted Array",
    "problem_statement": "Implement nearestValue(values, target). values is non-empty and sorted in non-decreasing order. Return the array value with the smallest absolute distance from target; if two different values tie, return the smaller value.",
    "difficulty": "Easy",
    "topic_tags": [
      "Binary Search",
      "Arrays"
    ],
    "constraints": [
      "1 <= values.length <= 200000",
      "Values and target are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[-8,-2,4,9], target=1",
        "output": "-2"
      },
      {
        "input": "values=[1,4,7,10], target=8",
        "output": "7"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function nearestValue(values, target) {\n  // Return the closest stored value; break ties toward the smaller value.\n}",
      "Python": "def nearest_value(values, target):\n    # Return the closest stored value; break ties toward the smaller value.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int nearestValue(int[] values, int target) {\n      // Return the closest stored value; break ties toward the smaller value.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nint nearestValue(const vector<int>& values, int target) {\n    // Return the closest stored value; break ties toward the smaller value.\n    return 0;\n}"
    }
  },
  {
    "slug": "integer-square-root-floor",
    "title": "Compute the Integer Square Root",
    "problem_statement": "Implement integerSquareRoot(value) for a non-negative integer. Return floor(sqrt(value)) without using floating-point square-root operations. Intermediate multiplication must not overflow the chosen integer type.",
    "difficulty": "Easy",
    "topic_tags": [
      "Binary Search",
      "Number Theory"
    ],
    "constraints": [
      "0 <= value <= 2147483647"
    ],
    "examples": [
      {
        "input": "value=26",
        "output": "5"
      },
      {
        "input": "value=144",
        "output": "12"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function integerSquareRoot(value) {\n  // Return floor(sqrt(value)) using integer comparisons.\n}",
      "Python": "def integer_square_root(value):\n    # Return floor(sqrt(value)) using integer comparisons.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int integerSquareRoot(int value) {\n      // Return floor(sqrt(value)) using safe integer comparisons.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nint integerSquareRoot(int value) {\n    // Return floor(sqrt(value)) using safe integer comparisons.\n    return 0;\n}"
    }
  },
  {
    "slug": "minimum-capacity-within-days",
    "title": "Find the Minimum Shipping Capacity",
    "problem_statement": "Implement minimumShippingCapacity(weights, days). Packages must be shipped in their given order, at most one contiguous prefix per day, with total daily weight no greater than the ship capacity. Return the smallest capacity that ships every package within days.",
    "difficulty": "Medium",
    "topic_tags": [
      "Binary Search",
      "Greedy"
    ],
    "constraints": [
      "1 <= weights.length <= 100000",
      "1 <= weights[i] <= 10000",
      "1 <= days <= weights.length"
    ],
    "examples": [
      {
        "input": "weights=[1,2,3,4,5,6,7,8,9,10], days=5",
        "output": "15"
      },
      {
        "input": "weights=[3,2,2,4,1,4], days=3",
        "output": "6"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function minimumShippingCapacity(weights, days) {\n  // Return the least capacity that meets the day limit.\n}",
      "Python": "def minimum_shipping_capacity(weights, days):\n    # Return the least capacity that meets the day limit.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int minimumShippingCapacity(int[] weights, int days) {\n      // Return the least capacity that meets the day limit.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long minimumShippingCapacity(const vector<int>& weights, int days) {\n    // Return the least capacity that meets the day limit.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "minimum-rate-to-finish-jobs",
    "title": "Find the Minimum Integer Processing Rate",
    "problem_statement": "Implement minimumRate(workloads, hours). In each hour, one workload is selected and up to rate units are completed; unfinished work stays for later hours, and at most one workload can be processed in an hour. Return the smallest positive integer rate that completes all workloads within hours.",
    "difficulty": "Medium",
    "topic_tags": [
      "Binary Search",
      "Feasibility Search"
    ],
    "constraints": [
      "1 <= workloads.length <= 100000",
      "1 <= workloads[i] <= 1000000000",
      "workloads.length <= hours <= 1000000000000"
    ],
    "examples": [
      {
        "input": "workloads=[3,6,7,11], hours=8",
        "output": "4"
      },
      {
        "input": "workloads=[30,11,23,4,20], hours=6",
        "output": "23"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function minimumRate(workloads, hours) {\n  // Return the minimum positive integer rate.\n}",
      "Python": "def minimum_rate(workloads, hours):\n    # Return the minimum positive integer rate.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int minimumRate(int[] workloads, long hours) {\n      // Return the minimum positive integer rate.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long minimumRate(const vector<int>& workloads, long long hours) {\n    // Return the minimum positive integer rate.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "minimize-largest-contiguous-load",
    "title": "Minimize the Largest Contiguous Partition Sum",
    "problem_statement": "Implement minimizeLargestPartition(values, groups). Split the non-negative array into exactly groups non-empty contiguous parts. Return the smallest possible value of the largest part sum.",
    "difficulty": "Hard",
    "topic_tags": [
      "Binary Search",
      "Greedy",
      "Partitioning"
    ],
    "constraints": [
      "1 <= values.length <= 100000",
      "0 <= values[i] <= 1000000000",
      "1 <= groups <= values.length",
      "The total sum fits signed 64-bit integer"
    ],
    "examples": [
      {
        "input": "values=[7,2,5,10,8], groups=2",
        "output": "18"
      },
      {
        "input": "values=[1,2,3,4,5], groups=2",
        "output": "9"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function minimizeLargestPartition(values, groups) {\n  // Return the minimum possible largest contiguous-part sum.\n}",
      "Python": "def minimize_largest_partition(values, groups):\n    # Return the minimum possible largest contiguous-part sum.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static long minimizeLargestPartition(int[] values, int groups) {\n      // Return the minimum possible largest contiguous-part sum.\n    return 0L;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long minimizeLargestPartition(const vector<int>& values, int groups) {\n    // Return the minimum possible largest contiguous-part sum.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "kth-missing-positive",
    "title": "Select the Kth Missing Positive Integer",
    "problem_statement": "Implement kthMissingPositive(values, k). values is a strictly increasing array of positive integers. Return the kth positive integer absent from values, counting from 1.",
    "difficulty": "Medium",
    "topic_tags": [
      "Binary Search",
      "Arrays"
    ],
    "constraints": [
      "0 <= values.length <= 200000",
      "1 <= k <= 1000000000",
      "values.length + k <= 1000000000"
    ],
    "examples": [
      {
        "input": "values=[2,3,4,7,11], k=5",
        "output": "9"
      },
      {
        "input": "values=[1,2,3,4], k=2",
        "output": "6"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function kthMissingPositive(values, k) {\n  // Return the kth positive integer omitted from values.\n}",
      "Python": "def kth_missing_positive(values, k):\n    # Return the kth positive integer omitted from values.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int kthMissingPositive(int[] values, int k) {\n      // Return the kth positive integer omitted from values.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long kthMissingPositive(const vector<int>& values, long long k) {\n    // Return the kth positive integer omitted from values.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "count-inversions",
    "title": "Count Out-of-Order Index Pairs",
    "problem_statement": "Implement countInversions(values). An inversion is a pair (i,j) with i < j and values[i] > values[j]. Return the number of inversions using an algorithm faster than quadratic; equal values do not form inversions.",
    "difficulty": "Medium",
    "topic_tags": [
      "Sorting",
      "Merge Sort",
      "Counting"
    ],
    "constraints": [
      "0 <= values.length <= 200000",
      "Values are signed 32-bit integers",
      "The answer fits signed 64-bit integer"
    ],
    "examples": [
      {
        "input": "values=[2,4,1,3,5]",
        "output": "3"
      },
      {
        "input": "values=[5,4,3,2,1]",
        "output": "10"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function countInversions(values) {\n  // Return the number of index pairs that are out of order.\n}",
      "Python": "def count_inversions(values):\n    # Return the number of index pairs that are out of order.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static long countInversions(int[] values) {\n      // Return the number of index pairs that are out of order.\n    return 0L;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long countInversions(const vector<int>& values) {\n    // Return the number of index pairs that are out of order.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "merge-k-sorted-lists-as-array",
    "title": "Merge Several Sorted Arrays",
    "problem_statement": "Implement mergeSortedArrays(arrays). Each inner integer array is sorted in non-decreasing order. Return one sorted array containing every element, including duplicates. Aim for O(N log k) time when there are k input arrays and N total values.",
    "difficulty": "Medium",
    "topic_tags": [
      "Sorting",
      "Heap",
      "K-Way Merge"
    ],
    "constraints": [
      "0 <= arrays.length <= 10000",
      "0 <= total number of values <= 200000",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "arrays=[[1,4,9],[1,3,10],[2,2,8]]",
        "output": "[1,1,2,2,3,4,8,9,10]"
      },
      {
        "input": "arrays=[[],[-3,0],[2]]",
        "output": "[-3,0,2]"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function mergeSortedArrays(arrays) {\n  // Return all values in one non-decreasing array.\n}",
      "Python": "def merge_sorted_arrays(arrays):\n    # Return all values in one non-decreasing array.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int[] mergeSortedArrays(int[][] arrays) {\n      // Return all values in one non-decreasing array.\n    return new int[0];\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nvector<int> mergeSortedArrays(const vector<vector<int>>& arrays) {\n    // Return all values in one non-decreasing array.\n    return {};\n}"
    }
  },
  {
    "slug": "count-smaller-elements-to-right",
    "title": "Count Smaller Values to the Right",
    "problem_statement": "Implement smallerToRight(values). For each index i, return how many later indices j have values[j] < values[i]. Preserve input order in the result and use an O(n log n) or better algorithm.",
    "difficulty": "Hard",
    "topic_tags": [
      "Sorting",
      "Merge Sort",
      "Order Statistics"
    ],
    "constraints": [
      "0 <= values.length <= 200000",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[5,2,6,1]",
        "output": "[2,1,1,0]"
      },
      {
        "input": "values=[2,0,1]",
        "output": "[2,0,0]"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function smallerToRight(values) {\n  // Return one strict-smaller suffix count per input position.\n}",
      "Python": "def smaller_to_right(values):\n    # Return one strict-smaller suffix count per input position.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int[] smallerToRight(int[] values) {\n      // Return one strict-smaller suffix count per input position.\n    return new int[0];\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nvector<int> smallerToRight(const vector<int>& values) {\n    // Return one strict-smaller suffix count per input position.\n    return {};\n}"
    }
  },
  {
    "slug": "minimum-swaps-to-sort-distinct",
    "title": "Find the Fewest Swaps Needed to Sort",
    "problem_statement": "Implement minimumSwapsToSort(values). All values are distinct. One operation swaps any two positions. Return the minimum number of swaps required to arrange the array in strictly increasing order.",
    "difficulty": "Medium",
    "topic_tags": [
      "Sorting",
      "Permutation Cycles"
    ],
    "constraints": [
      "1 <= values.length <= 100000",
      "Values are distinct signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[4,3,2,1]",
        "output": "2"
      },
      {
        "input": "values=[7,1,3,2,4,5,6]",
        "output": "5"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function minimumSwapsToSort(values) {\n  // Return the minimum number of arbitrary swaps.\n}",
      "Python": "def minimum_swaps_to_sort(values):\n    # Return the minimum number of arbitrary swaps.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int minimumSwapsToSort(int[] values) {\n      // Return the minimum number of arbitrary swaps.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nint minimumSwapsToSort(const vector<int>& values) {\n    // Return the minimum number of arbitrary swaps.\n    return 0;\n}"
    }
  },
  {
    "slug": "largest-adjacent-gap",
    "title": "Find the Largest Gap After Sorting",
    "problem_statement": "Implement largestSortedGap(values). Sort the input conceptually and return the largest difference between adjacent values. Return 0 when fewer than two values are present. The algorithm should run in linear expected time without comparison-sorting all values.",
    "difficulty": "Hard",
    "topic_tags": [
      "Sorting",
      "Buckets"
    ],
    "constraints": [
      "0 <= values.length <= 200000",
      "Values are integers in [-1000000000,1000000000]"
    ],
    "examples": [
      {
        "input": "values=[3,6,9,1]",
        "output": "3"
      },
      {
        "input": "values=[10,-10,0,25]",
        "output": "15"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function largestSortedGap(values) {\n  // Return the largest adjacent difference in sorted order.\n}",
      "Python": "def largest_sorted_gap(values):\n    # Return the largest adjacent difference in sorted order.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static long largestSortedGap(int[] values) {\n      // Return the largest adjacent difference in sorted order.\n    return 0L;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long largestSortedGap(const vector<int>& values) {\n    // Return the largest adjacent difference in sorted order.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "maximum-nonoverlapping-meetings",
    "title": "Schedule the Most Non-Overlapping Meetings",
    "problem_statement": "Implement maximumMeetings(intervals). Each interval is [start,end] with start < end. Select the greatest number of pairwise non-overlapping intervals; a meeting may begin exactly when the previous meeting ends. Return the selected original indices, in chronological order; for equal end times, prefer the smaller original index.",
    "difficulty": "Medium",
    "topic_tags": [
      "Sorting",
      "Greedy",
      "Intervals"
    ],
    "constraints": [
      "0 <= intervals.length <= 200000",
      "Interval endpoints are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "intervals=[[1,3],[2,4],[3,5],[0,7],[5,6]]",
        "output": "[0,2,4]"
      },
      {
        "input": "intervals=[[4,7],[1,4],[2,3],[7,9]]",
        "output": "[2,0,3]"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function maximumMeetings(intervals) {\n  // Return chosen original indices in chronological order.\n}",
      "Python": "def maximum_meetings(intervals):\n    # Return chosen original indices in chronological order.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int[] maximumMeetings(int[][] intervals) {\n      // Return chosen original indices in chronological order.\n    return new int[0];\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nvector<int> maximumMeetings(const vector<vector<int>>& intervals) {\n    // Return chosen original indices in chronological order.\n    return {};\n}"
    }
  },
  {
    "slug": "mountain-peak-index",
    "title": "Find the Peak of a Mountain Array",
    "problem_statement": "Implement mountainPeakIndex(values). The array strictly increases to one peak and strictly decreases afterward; both sides of the peak are non-empty. Return the peak's index in O(log n) time.",
    "difficulty": "Easy",
    "topic_tags": [
      "Binary Search",
      "Arrays"
    ],
    "constraints": [
      "3 <= values.length <= 200000",
      "Adjacent values are distinct",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[0,3,8,6,2]",
        "output": "2"
      },
      {
        "input": "values=[1,5,9,12,7,3]",
        "output": "3"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function mountainPeakIndex(values) {\n  // Return the index of the unique mountain maximum.\n}",
      "Python": "def mountain_peak_index(values):\n    # Return the index of the unique mountain maximum.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static int mountainPeakIndex(int[] values) {\n      // Return the index of the unique mountain maximum.\n    return 0;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nint mountainPeakIndex(const vector<int>& values) {\n    // Return the index of the unique mountain maximum.\n    return 0;\n}"
    }
  },
  {
    "slug": "search-monotone-matrix",
    "title": "Search a Row-and-Column Sorted Matrix",
    "problem_statement": "Implement containsInSortedMatrix(matrix, target). Every row is strictly increasing left-to-right and every column is strictly increasing top-to-bottom. Return whether target occurs. The matrix may have zero rows or zero columns; target values are distinct.",
    "difficulty": "Medium",
    "topic_tags": [
      "Binary Search",
      "Matrices"
    ],
    "constraints": [
      "0 <= rows, columns <= 10000",
      "rows * columns <= 200000",
      "Values are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "matrix=[[1,4,7,11],[2,5,8,12],[3,6,9,16]], target=6",
        "output": "true"
      },
      {
        "input": "matrix=[[1,4,7],[2,5,8],[3,6,9]], target=10",
        "output": "false"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function containsInSortedMatrix(matrix, target) {\n  // Return whether target occurs in the sorted matrix.\n}",
      "Python": "def contains_in_sorted_matrix(matrix, target):\n    # Return whether target occurs in the sorted matrix.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static boolean containsInSortedMatrix(int[][] matrix, int target) {\n      // Return whether target occurs in the sorted matrix.\n    return false;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nbool containsInSortedMatrix(const vector<vector<int>>& matrix, int target) {\n    // Return whether target occurs in the sorted matrix.\n    return false;\n}"
    }
  },
  {
    "slug": "pair-sum-closest-to-target",
    "title": "Find a Pair with Sum Closest to the Target",
    "problem_statement": "Implement closestPairSum(values, target). Choose two distinct indices whose values have a sum closest to target. Return that sum; if several pairs tie in absolute difference, return the smallest tied sum. Input order is arbitrary.",
    "difficulty": "Medium",
    "topic_tags": [
      "Sorting",
      "Two Pointers"
    ],
    "constraints": [
      "2 <= values.length <= 200000",
      "Values and target are signed 32-bit integers"
    ],
    "examples": [
      {
        "input": "values=[-4,2,7,11], target=6",
        "output": "7"
      },
      {
        "input": "values=[1,4,6,9], target=10",
        "output": "10"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function closestPairSum(values, target) {\n  // Return the closest attainable sum, breaking ties toward the smaller sum.\n}",
      "Python": "def closest_pair_sum(values, target):\n    # Return the closest attainable sum, breaking ties toward the smaller sum.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static long closestPairSum(int[] values, int target) {\n      // Return the closest attainable sum, breaking ties toward the smaller sum.\n    return 0L;\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nlong long closestPairSum(const vector<int>& values, int target) {\n    // Return the closest attainable sum, breaking ties toward the smaller sum.\n    return 0LL;\n}"
    }
  },
  {
    "slug": "stable-sort-records-by-key",
    "title": "Stably Sort Records by Their Numeric Key",
    "problem_statement": "Implement stableSortRecords(records). Each record is [key, label], where key is an integer and label is a string. Return all records sorted by key ascending while preserving the original relative order of records with equal keys.",
    "difficulty": "Easy",
    "topic_tags": [
      "Sorting",
      "Stability"
    ],
    "constraints": [
      "0 <= records.length <= 100000",
      "Keys are signed 32-bit integers",
      "Labels are non-empty strings"
    ],
    "examples": [
      {
        "input": "records=[[3,\"oak\"],[1,\"elm\"],[3,\"ash\"],[2,\"fir\"],[1,\"yew\"]]",
        "output": "[[1,\"elm\"],[1,\"yew\"],[2,\"fir\"],[3,\"oak\"],[3,\"ash\"]]"
      },
      {
        "input": "records=[[0,\"first\"],[0,\"second\"],[-1,\"third\"]]",
        "output": "[[-1,\"third\"],[0,\"first\"],[0,\"second\"]]"
      }
    ],
    "starter_code_by_language": {
      "JavaScript": "function stableSortRecords(records) {\n  // Return records sorted by key, preserving equal-key input order.\n}",
      "Python": "def stable_sort_records(records):\n    # Return records sorted by key, preserving equal-key input order.\n    pass",
      "Java": "import java.util.*;\n\npublic class Solution {\n  static List<List<Object>> stableSortRecords(List<List<Object>> records) {\n      // Return sorted key/label records while preserving equal-key order.\n    return Collections.emptyList();\n  }\n}",
      "C++": "#include <vector>\n#include <string>\n#include <utility>\n#include <cstdint>\nusing namespace std;\n\nvector<pair<int,string>> stableSortRecords(const vector<pair<int,string>>& records) {\n    // Return sorted key/label records while preserving equal-key order.\n    return {};\n}"
    }
  }
]
$seed$::jsonb) as records(
  slug text, title text, problem_statement text, difficulty text,
  topic_tags text[], constraints jsonb, examples jsonb, starter_code_by_language jsonb
);

do $validation$
begin
  if (select count(*) from sorting_search_seed) <> 20
     or (select count(distinct slug) from sorting_search_seed) <> 20
     or (select count(distinct title) from sorting_search_seed) <> 20
     or (select count(distinct problem_statement) from sorting_search_seed) <> 20
     or exists (select 1 from sorting_search_seed where btrim(slug) = '' or btrim(title) = '' or btrim(problem_statement) = '')
     or exists (select 1 from sorting_search_seed where problem_statement ilike '%implement solve(%' or problem_statement ilike '%placeholder%')
     or exists (select 1 from sorting_search_seed where jsonb_typeof(examples) <> 'array' or jsonb_array_length(examples) < 2)
     or exists (select 1 from sorting_search_seed where jsonb_typeof(constraints) <> 'array' or jsonb_array_length(constraints) = 0)
     or exists (select 1 from sorting_search_seed seed cross join lateral jsonb_array_elements(seed.examples) example where btrim(coalesce(example.value ->> 'input','')) = '' or btrim(coalesce(example.value ->> 'output','')) = '')
     or exists (select seed.slug from sorting_search_seed seed cross join lateral jsonb_array_elements(seed.examples) example group by seed.slug having count(*) <> count(distinct (example.value ->> 'input')))
     or exists (select 1 from sorting_search_seed where starter_code_by_language - array['JavaScript','Python','Java','C++'] <> '{}'::jsonb)
     or exists (select 1 from sorting_search_seed where not (starter_code_by_language ?& array['JavaScript','Python','Java','C++']))
     or exists (select 1 from sorting_search_seed seed cross join lateral jsonb_each_text(seed.starter_code_by_language) starter where btrim(starter.value) = '')
     or exists (
       select 1 from sorting_search_seed
       where slug in ('quick-select','search-rotated-array','merge-intervals','first-bad-version',
         'search-insert-position','insertion-sort-count','lower-bound-index')
     ) then
    raise exception 'sorting-binary-search seed must contain exactly 20 distinct, complete questions with language starters and at least two examples each';
  end if;
  if not exists (
    select 1 from public.coding_test_sets
    where slug = 'sorting-binary-search' and publication_status = 'published'
      and supported_languages = '["JavaScript","Python","Java","C++"]'::jsonb
  ) then
    raise exception 'sorting-binary-search collection is missing or has unexpected supported languages';
  end if;
end
$validation$;

with question_rows as (
  select
    collection.id as collection_id,
    seed.*,
    case seed.difficulty when 'Easy' then 100 when 'Medium' then 150 else 200 end as points,
    coalesce((select max(q.question_order) from public.coding_questions q where q.collection_id = collection.id), 0)
      + row_number() over (order by seed.slug)::integer as question_order
  from sorting_search_seed seed
  cross join public.coding_test_sets collection
  where collection.slug = 'sorting-binary-search'
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
from sorting_search_seed seed
join public.coding_test_sets collection on collection.slug = 'sorting-binary-search'
join public.coding_questions question on question.collection_id = collection.id and question.slug = seed.slug
cross join lateral jsonb_array_elements(seed.examples) with ordinality as example(value, ordinality)
on conflict (question_id, case_order) do nothing;

commit;
