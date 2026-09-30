/* HR interview question bank — curated questions with model answer
   frameworks and evaluation tips. */

export const HR_QUESTIONS = [
  {
    id: 'tell-about-yourself',
    q: 'Tell me about yourself.',
    tag: 'Opening',
    framework: 'Present → Past → Future. Cover who you are professionally, one or two proof points, and why this role is the logical next step.',
    answer:
      'I’m a final-year Computer Science student focused on backend development. Over the last year I built a placement-preparation platform using Java, Spring Boot and React — it taught me API design, authentication and shipping a real product end to end. Alongside that I solved 300+ DSA problems, which sharpened my problem-solving under constraints.\n\nI’m looking for a role where I can contribute to production systems from day one and learn from experienced engineers — which is exactly what this position offers.',
    tips: [
      'Keep it 60–90 seconds — an elevator pitch, not your life story',
      'Anchor claims with specific, verifiable evidence (numbers, projects)',
      'End by connecting your goals to the company’s work',
    ],
    pitfalls: ['Reciting your resume line by line', 'Sharing personal details irrelevant to the job'],
  },
  {
    id: 'strengths-weaknesses',
    q: 'What are your strengths and weaknesses?',
    tag: 'Self-awareness',
    framework: 'Strengths: pick 1–2 relevant traits + concrete proof. Weakness: a genuine growth area + the system you use to manage it + visible progress.',
    answer:
      'My key strength is structured problem-solving — I break ambiguous problems into testable parts. When our mock-interview feature produced inconsistent AI scores, I isolated variables and built a scoring rubric that cut variance significantly.\n\nA weakness I’ve worked on is over-polishing before sharing. I now timebox drafts and seek feedback early; my last project went through three review cycles instead of my usual one big reveal.',
    tips: [
      'Choose a real weakness — "perfectionism" reads as evasive unless backed by a fix',
      'Show the improvement trajectory, not just the flaw',
    ],
    pitfalls: ['Humble-brag weaknesses ("I work too hard")', 'Listing strengths without evidence'],
  },
  {
    id: 'why-hire-you',
    q: 'Why should we hire you?',
    tag: 'Fit',
    framework: 'Match triangle: your skills ↔ role requirements, your values ↔ company culture, plus momentum — you’re already learning what they need next.',
    answer:
      'Three reasons. First, the exact skill overlap: your stack is Java microservices and I’ve shipped REST APIs with Spring Boot, including auth and testing. Second, I learn fast under feedback — my internship code reviews moved me from draft-quality to merge-ready in weeks. Third, I’m invested in this domain: I build side projects in this space because I enjoy it, so ramp-up won’t be a chore.',
    tips: [
      'Reference the actual job description requirements',
      'Differentiate with one memorable proof point',
    ],
    pitfalls: ['Generic answers any candidate could give', 'Comparing yourself to other (unknown) candidates'],
  },
  {
    id: 'five-years',
    q: 'Where do you see yourself in five years?',
    tag: 'Ambition',
    framework: 'Show direction, not titles. Depth of skill first, scope of impact second, and alignment with how THIS company could host that growth.',
    answer:
      'In five years I want to be a dependable senior engineer — someone who designs systems others can extend confidently. Short term, that means mastering your core stack and owning features end to end. I’d also like to mentor juniors eventually; teaching deepened my own fundamentals when I peer-tutored classmates.',
    tips: ['Tie ambition to contribution, not just personal ascent', 'It’s fine to say you’re exploring specialisations honestly'],
    pitfalls: ['Naming their competitors as the dream employer', '"Your seat" clichés without substance'],
  },
  {
    id: 'conflict-teamwork',
    q: 'Describe a conflict you faced in a team and how you resolved it.',
    tag: 'Behavioural',
    framework: 'STAR: Situation, Task, Action, Result. Focus on your actions and the relationship outcome, not on winning the argument.',
    answer:
      'Situation: our four-person capstone team split between two architecture choices a week before the demo deadline. Task: as coordinator I had to unblock us without demotivating anyone. Action: I ran a 30-minute structured debate where each side listed risks and unknowns, then proposed a two-hour spike to prototype the riskiest part of each option. Result: data picked the winner — everyone committed, we hit the deadline and the losing idea’s author became its strongest advocate after seeing results.',
    tips: ['Pick a professional/academic conflict, never personal drama', 'Emphasise listening and process, not dominance'],
    pitfalls: ['Blaming teammates', 'Choosing an example where you avoided conflict entirely'],
  },
  {
    id: 'failure',
    q: 'Tell me about a failure or mistake.',
    tag: 'Resilience',
    framework: 'Own it fully → show the lesson → prove changed behaviour. The follow-up "what did you learn?" is where this question is really scored.',
    answer:
      'In my second year I led a hackathon team and insisted on building a custom auth system instead of using a library — we spent nine hours debugging session bugs and missed the feature cut. Owning it: I underestimated integration cost and overestimated our time. Since then I default to proven libraries for commodity problems and reserve custom engineering for where we genuinely differentiate. In my next project we shipped auth in an hour and spent the saved time on our unique recommendation engine, which won us second place.',
    tips: ['Real failures only — interviewers smell sanitised stories', 'The behavioural change must be specific'],
    pitfalls: ['Failure-blaming ("the team failed")', 'Choosing something trivial ("I was late once")'],
  },
  {
    id: 'why-this-company',
    q: 'Why do you want to work here?',
    tag: 'Motivation',
    framework: 'Research triangle: product/problem admiration + growth environment + mutual fit. Prove research with specifics only true of this company.',
    answer:
      'Two specifics drew me in. First, your platform handles X scale — I read your engineering blog post about migrating to event-driven services, and that’s exactly the kind of architecture challenge I want to learn from. Second, your internship alumni describe strong mentorship culture, which matches how I grow best. And candidly: your product solves a problem I’ve personally felt, so motivation will never be my bottleneck.',
    tips: ['Cite something recent (launch, blog, release) — proves fresh research', 'Connect their needs to your growth path'],
    pitfalls: ['"Prestigious company" flattery with zero specifics', 'Answering only from your own benefit'],
  },
  {
    id: 'pressure-deadline',
    q: 'How do you handle pressure or tight deadlines?',
    tag: 'Composure',
    framework: 'System > stoicism. Describe your prioritisation method, communication habits and one proof story.',
    answer:
      'Pressure is a triage problem. When multiple deadlines collide I list everything with effort estimates and impact, confirm priorities with stakeholders, then protect deep-work blocks for the critical path. During exam season I maintained my open-source contributions by pre-planning two-week sprints — smaller daily commits instead of weekend heroics. I also flag risk early: the moment a deadline looks unrealistic I say so with options, not silence.',
    tips: ['Name a concrete prioritisation technique', 'Early escalation signals maturity, not weakness'],
    pitfalls: ['"I just push through" — unsustainable and unreflective', 'Claiming pressure never affects you'],
  },
  {
    id: 'salary-expectation',
    q: 'What are your salary expectations?',
    tag: 'Negotiation',
    framework: 'Defer gracefully if early; if pressed, give a researched range anchored to market data for the role and city, staying flexible on total compensation.',
    answer:
      'Based on market rates for this role and my preparation level, I’m targeting somewhere in the ₹X–Y range, though I’m flexible — learning opportunity and growth trajectory matter a lot at this stage. Could you share the band allocated for this position?',
    tips: ['Research typical fresher packages for the company beforehand', 'Ranges keep negotiation space; single numbers anchor you down'],
    pitfalls: ['Naming a number with no research behind it', 'Refusing to engage at all when directly asked'],
  },
  {
    id: 'questions-for-us',
    q: 'Do you have any questions for us?',
    tag: 'Closing',
    framework: 'Always ask 2–3 prepared questions. Mix: role clarity (day-to-day), growth (mentorship, reviews), team (how success is measured). Never say "no".',
    answer:
      'Good options to choose from:\n\n• What does success look like for this role in the first six months?\n• How are technical decisions made on the team — who has final call and how are disagreements resolved?\n• What do engineers early in their career here usually underestimate?\n• What’s the onboarding and mentorship structure for new graduates?',
    tips: ['Asking about growth signals long-term intent', 'Reference something from earlier in the conversation for bonus points'],
    pitfalls: ['Questions answered by 30 seconds on their website', 'Asking only about perks and leaves'],
  },
]

export const MOCK_MODES = [
  { id: 'technical', label: 'Technical Mock Interview', icon: '💻', color: '#4f46e5',
    desc: 'Core CS + coding discussion questions with AI scoring across technical depth and clarity.' },
  { id: 'hr', label: 'HR Mock Interview', icon: '🤝', color: '#0ea5e9',
    desc: 'Classic HR rounds — introductions, situational judgement and culture-fit evaluation.' },
  { id: 'mixed', label: 'Mixed Round', icon: '🎯', color: '#7c3aed',
    desc: 'Alternating technical and HR questions simulating a full placement loop.' },
]
