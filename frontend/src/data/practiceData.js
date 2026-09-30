/* Practice question bank — curated placement-style questions across
   categories. Completion status is tracked locally per user. */

export const PRACTICE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'coding', label: 'Coding' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'sql', label: 'SQL' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'dsa', label: 'DSA' },
  { id: 'mcq', label: 'Technical MCQs' },
]

export const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

export const QUESTIONS = [
  /* ── Coding ─────────────────────────────────────────────────────────── */
  { id: 'c1', title: 'Two Sum', category: 'coding', topic: 'Arrays & Hashing', difficulty: 'Easy', minutes: 15, type: 'Coding',
    hint: 'Complement lookup in a hash map gives O(n).', link: 'https://leetcode.com/problems/two-sum/' },
  { id: 'c2', title: 'Valid Parentheses', category: 'coding', topic: 'Stacks', difficulty: 'Easy', minutes: 15, type: 'Coding',
    hint: 'Push openers, pop and match on closers.', link: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: 'c3', title: 'Merge Intervals', category: 'coding', topic: 'Sorting', difficulty: 'Medium', minutes: 25, type: 'Coding',
    hint: 'Sort by start; extend or push intervals.', link: 'https://leetcode.com/problems/merge-intervals/' },
  { id: 'c4', title: 'Longest Substring Without Repeating Characters', category: 'coding', topic: 'Sliding Window', difficulty: 'Medium', minutes: 25, type: 'Coding',
    hint: 'Window with last-seen index map.', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: 'c5', title: 'Coin Change', category: 'coding', topic: 'Dynamic Programming', difficulty: 'Medium', minutes: 30, type: 'Coding',
    hint: 'Bottom-up DP over amounts.', link: 'https://leetcode.com/problems/coin-change/' },
  { id: 'c6', title: 'Course Schedule', category: 'coding', topic: 'Graphs', difficulty: 'Medium', minutes: 30, type: 'Coding',
    hint: 'Cycle detection via topological sort.', link: 'https://leetcode.com/problems/course-schedule/' },
  { id: 'c7', title: 'Binary Tree Level Order Traversal', category: 'coding', topic: 'Trees', difficulty: 'Easy', minutes: 20, type: 'Coding',
    hint: 'BFS with level-sized batches.', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { id: 'c8', title: 'Median of Two Sorted Arrays', category: 'coding', topic: 'Binary Search', difficulty: 'Hard', minutes: 40, type: 'Coding',
    hint: 'Partition both arrays around median.', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { id: 'c9', title: 'Trapping Rain Water', category: 'coding', topic: 'Two Pointers', difficulty: 'Hard', minutes: 35, type: 'Coding',
    hint: 'Water = min(maxL, maxR) − height.', link: 'https://leetcode.com/problems/trapping-rain-water/' },
  { id: 'c10', title: 'LRU Cache Design', category: 'coding', topic: 'Design', difficulty: 'Medium', minutes: 30, type: 'Coding',
    hint: 'HashMap + doubly linked list.', link: 'https://leetcode.com/problems/lru-cache/' },

  /* ── Aptitude ───────────────────────────────────────────────────────── */
  { id: 'a1', title: 'Train crosses a platform — time & speed', category: 'aptitude', topic: 'Speed & Distance', difficulty: 'Easy', minutes: 5, type: 'MCQ',
    hint: 'Distance = train + platform length.' },
  { id: 'a2', title: 'Profit & loss with successive discounts', category: 'aptitude', topic: 'Percentages', difficulty: 'Easy', minutes: 6, type: 'MCQ',
    hint: 'Apply discounts multiplicatively.' },
  { id: 'a3', title: 'Work done by A and B together', category: 'aptitude', topic: 'Time & Work', difficulty: 'Medium', minutes: 7, type: 'MCQ',
    hint: 'Add rates as fractions of job/day.' },
  { id: 'a4', title: 'Compound interest for 2 years', category: 'aptitude', topic: 'Interest', difficulty: 'Easy', minutes: 5, type: 'MCQ',
    hint: 'A = P(1+r/100)².' },
  { id: 'a5', title: 'Boat upstream/downstream speed puzzle', category: 'aptitude', topic: 'Boats & Streams', difficulty: 'Medium', minutes: 7, type: 'MCQ',
    hint: 'Still speed = (u+v)/2.' },
  { id: 'a6', title: 'Number series completion', category: 'aptitude', topic: 'Series', difficulty: 'Medium', minutes: 6, type: 'MCQ',
    hint: 'Check differences, then ratios.' },
  { id: 'a7', title: 'Blood relation deduction', category: 'aptitude', topic: 'Reasoning', difficulty: 'Medium', minutes: 8, type: 'MCQ',
    hint: 'Draw the family tree stepwise.' },
  { id: 'a8', title: 'Synonym & antonym rapid set', category: 'aptitude', topic: 'Verbal Ability', difficulty: 'Easy', minutes: 6, type: 'MCQ',
    hint: 'Learn 10 words a day with usage.' },

  /* ── SQL ────────────────────────────────────────────────────────────── */
  { id: 's1', title: 'Find duplicate emails in a table', category: 'sql', topic: 'Group By', difficulty: 'Easy', minutes: 10, type: 'Query',
    hint: 'GROUP BY email HAVING COUNT(*) > 1.' },
  { id: 's2', title: 'Second highest salary without LIMIT', category: 'sql', topic: 'Subqueries', difficulty: 'Medium', minutes: 15, type: 'Query',
    hint: 'MAX(salary) WHERE salary < MAX(salary).' },
  { id: 's3', title: 'Department-wise average salary above threshold', category: 'sql', topic: 'Aggregation', difficulty: 'Easy', minutes: 12, type: 'Query',
    hint: 'JOIN employees to departments, GROUP BY dept.' },
  { id: 's4', title: 'Customers who never ordered (anti-join)', category: 'sql', topic: 'Joins', difficulty: 'Medium', minutes: 15, type: 'Query',
    hint: 'LEFT JOIN … WHERE o.id IS NULL.' },
  { id: 's5', title: 'Top 3 earners per department (window function)', category: 'sql', topic: 'Window Functions', difficulty: 'Hard', minutes: 20, type: 'Query',
    hint: 'DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC).' },
  { id: 's6', title: 'Month-over-month growth using LAG', category: 'sql', topic: 'Window Functions', difficulty: 'Hard', minutes: 20, type: 'Query',
    hint: 'LAG(revenue) OVER (ORDER BY month).' },

  /* ── Java ───────────────────────────────────────────────────────────── */
  { id: 'j1', title: 'HashMap internal working explanation', category: 'java', topic: 'Collections', difficulty: 'Medium', minutes: 10, type: 'Interview',
    hint: 'Buckets, hashing, treeification at 8 entries.' },
  { id: 'j2', title: 'String immutability — why and how', category: 'java', topic: 'Strings', difficulty: 'Easy', minutes: 8, type: 'Interview',
    hint: 'Security, caching, thread safety.' },
  { id: 'j3', title: 'Checked vs unchecked exceptions with examples', category: 'java', topic: 'Exceptions', difficulty: 'Easy', minutes: 8, type: 'Interview',
    hint: 'Compiler-enforced vs RuntimeException family.' },
  { id: 'j4', title: 'equals() and hashCode() contract', category: 'java', topic: 'Object Methods', difficulty: 'Medium', minutes: 12, type: 'Interview',
    hint: 'Equal objects must have equal hash codes.' },
  { id: 'j5', title: 'Implement thread-safe singleton', category: 'java', topic: 'Concurrency', difficulty: 'Hard', minutes: 20, type: 'Coding',
    hint: 'Double-checked locking with volatile, or enum.' },
  { id: 'j6', title: 'ArrayList vs LinkedList — when each wins', category: 'java', topic: 'Collections', difficulty: 'Easy', minutes: 7, type: 'Interview',
    hint: 'Access vs insertion cost profiles.' },

  /* ── Python ─────────────────────────────────────────────────────────── */
  { id: 'p1', title: 'Mutable default argument pitfall', category: 'python', topic: 'Functions', difficulty: 'Easy', minutes: 8, type: 'Interview',
    hint: 'Defaults evaluate once at definition.' },
  { id: 'p2', title: 'Generator vs list memory behaviour', category: 'python', topic: 'Generators', difficulty: 'Medium', minutes: 10, type: 'Interview',
    hint: 'Lazy evaluation, constant memory.' },
  { id: 'p3', title: 'Decorators from scratch (timing decorator)', category: 'python', topic: 'Functions', difficulty: 'Medium', minutes: 18, type: 'Coding',
    hint: 'functools.wraps preserves metadata.' },
  { id: 'p4', title: 'GIL and its impact on multithreading', category: 'python', topic: 'Concurrency', difficulty: 'Hard', minutes: 15, type: 'Interview',
    hint: 'One thread executes bytecode at a time.' },
  { id: 'p5', title: 'Flatten nested list recursively and iteratively', category: 'python', topic: 'Recursion', difficulty: 'Medium', minutes: 15, type: 'Coding',
    hint: 'Type check elements, recurse on lists.' },

  /* ── DSA theory ─────────────────────────────────────────────────────── */
  { id: 'd1', title: 'Time complexity of common heap operations', category: 'dsa', topic: 'Heaps', difficulty: 'Easy', minutes: 6, type: 'MCQ',
    hint: 'Insert/extract O(log n), peek O(1).' },
  { id: 'd2', title: 'When does quicksort degrade to O(n²)?', category: 'dsa', topic: 'Sorting', difficulty: 'Medium', minutes: 8, type: 'MCQ',
    hint: 'Consistently bad pivots on sorted input.' },
  { id: 'd3', title: 'BFS vs DFS — applications of each', category: 'dsa', topic: 'Graphs', difficulty: 'Easy', minutes: 9, type: 'Interview',
    hint: 'Shortest path unweighted vs deep exploration.' },
  { id: 'd4', title: 'Detect a cycle in a linked list in O(1) space', category: 'dsa', topic: 'Linked Lists', difficulty: 'Medium', minutes: 12, type: 'Coding',
    hint: 'Floyd’s fast/slow pointers.' },
  { id: 'd5', title: 'Explain memoization vs tabulation', category: 'dsa', topic: 'Dynamic Programming', difficulty: 'Medium', minutes: 10, type: 'Interview',
    hint: 'Top-down cache vs bottom-up table.' },

  /* ── General technical MCQs ─────────────────────────────────────────── */
  { id: 'm1', title: 'Which layer does TCP operate at?', category: 'mcq', topic: 'Networks', difficulty: 'Easy', minutes: 3, type: 'MCQ',
    hint: 'Transport layer.' },
  { id: 'm2', title: 'What does ACID guarantee in transactions?', category: 'mcq', topic: 'DBMS', difficulty: 'Easy', minutes: 4, type: 'MCQ',
    hint: 'Atomicity, Consistency, Isolation, Durability.' },
  { id: 'm3', title: 'Purpose of virtual memory', category: 'mcq', topic: 'Operating Systems', difficulty: 'Medium', minutes: 4, type: 'MCQ',
    hint: 'Isolation + larger logical address space.' },
  { id: 'm4', title: 'Which normalization form removes transitive dependencies?', category: 'mcq', topic: 'DBMS', difficulty: 'Medium', minutes: 4, type: 'MCQ',
    hint: 'Third normal form (3NF).' },
  { id: 'm5', title: 'Deadlock requires which four conditions?', category: 'mcq', topic: 'Operating Systems', difficulty: 'Medium', minutes: 5, type: 'MCQ',
    hint: 'Mutual exclusion, hold-and-wait, no preemption, circular wait.' },
]

export const QUESTION_TYPES = ['All', 'MCQ', 'Coding', 'Query', 'Interview']

export function getQuestionById(id) {
  return QUESTIONS.find((q) => q.id === id)
}
