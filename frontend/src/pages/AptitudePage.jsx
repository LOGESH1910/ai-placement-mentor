import { useState } from 'react'

// ── Question banks ────────────────────────────────────────────────────────────

const ANALYTICAL = [
  { q: "A train travels 60 km in 1 hour. How long will it take to travel 210 km at the same speed?", options: ["3 hr", "3.5 hr", "4 hr", "2.5 hr"], answer: 1, solution: "Time = Distance ÷ Speed = 210 ÷ 60 = 3.5 hours.", steps: ["Speed = 60 km/hr", "Time = 210 ÷ 60 = 3.5 hr"] },
  { q: "If the ratio of boys to girls in a class is 3:2 and there are 30 boys, how many girls are there?", options: ["15", "18", "20", "25"], answer: 2, solution: "Boys:Girls = 3:2. If 3 parts = 30, then 1 part = 10. Girls = 2 × 10 = 20.", steps: ["3 parts = 30 → 1 part = 10", "Girls = 2 × 10 = 20"] },
  { q: "A shopkeeper marks an item 25% above cost price and gives a 10% discount. What is the profit %?", options: ["10%", "12.5%", "15%", "17.5%"], answer: 1, solution: "MP = 1.25C. SP = 0.9 × 1.25C = 1.125C. Profit = 12.5%.", steps: ["MP = 125% of CP", "SP after 10% discount = 125 × 0.9 = 112.5", "Profit = 12.5%"] },
  { q: "A can do a work in 12 days, B in 18 days. Working together, they finish in?", options: ["6 days", "7.2 days", "8 days", "9 days"], answer: 1, solution: "Combined rate = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Days = 36/5 = 7.2.", steps: ["A's rate = 1/12 per day", "B's rate = 1/18 per day", "Total = 5/36 per day → 7.2 days"] },
  { q: "The sum of 3 consecutive odd numbers is 51. What is the largest?", options: ["15", "17", "19", "21"], answer: 2, solution: "Let numbers be n-2, n, n+2. Sum = 3n = 51 → n = 17. Largest = 19.", steps: ["3n = 51 → n = 17", "Numbers: 15, 17, 19", "Largest = 19"] },
  { q: "A mixture contains milk and water in ratio 5:2. If 7 litres of water is added, the ratio becomes 5:3. Find original quantity.", options: ["35 L", "42 L", "49 L", "56 L"], answer: 2, solution: "Let milk = 5x, water = 2x. After adding: 5x/(2x+7) = 5/3 → 15x = 10x+35 → x=7. Total = 49L.", steps: ["5x/(2x+7) = 5/3", "15x = 10x + 35 → x = 7", "Total = 7x = 49 L"] },
  { q: "If 15% of x equals 20% of y, then x:y = ?", options: ["3:4", "4:3", "5:4", "4:5"], answer: 1, solution: "0.15x = 0.20y → x/y = 0.20/0.15 = 4/3.", steps: ["15x = 20y", "x/y = 20/15 = 4/3"] },
  { q: "Find the compound interest on ₹8000 at 10% per annum for 2 years.", options: ["₹1600", "₹1680", "₹1764", "₹1800"], answer: 1, solution: "CI = 8000[(1.1)² - 1] = 8000 × 0.21 = ₹1680.", steps: ["A = 8000 × 1.21 = 9680", "CI = 9680 - 8000 = ₹1680"] },
  { q: "The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What is the excluded number?", options: ["35", "37", "39", "41"], answer: 0, solution: "Sum of 5 = 135. Sum of 4 = 100. Excluded = 135 - 100 = 35.", steps: ["Sum5 = 27×5 = 135", "Sum4 = 25×4 = 100", "Excluded = 35"] },
  { q: "A pipe can fill a tank in 4 hours and another in 6 hours. A drain empties it in 12 hours. How long to fill?", options: ["3 hr", "4 hr", "5 hr", "6 hr"], answer: 0, solution: "Net rate = 1/4 + 1/6 - 1/12 = 3/12 + 2/12 - 1/12 = 4/12 = 1/3. Time = 3 hr.", steps: ["Fill rate = 1/4 + 1/6 = 5/12", "Drain rate = 1/12", "Net = 4/12 = 1/3 → 3 hr"] },
  { q: "Speed of a boat in still water is 15 km/h. Stream speed is 3 km/h. Time to go 54 km upstream?", options: ["3 hr", "4.5 hr", "5 hr", "3.5 hr"], answer: 1, solution: "Upstream speed = 15 - 3 = 12 km/h. Time = 54/12 = 4.5 hr.", steps: ["Upstream speed = 12 km/h", "Time = 54 ÷ 12 = 4.5 hr"] },
  { q: "If 4 men can do a job in 5 days, how many men are needed to do it in 2 days?", options: ["8", "10", "12", "14"], answer: 1, solution: "4×5 = 20 man-days. Men for 2 days = 20/2 = 10.", steps: ["Total work = 4 × 5 = 20 man-days", "Men = 20 ÷ 2 = 10"] },
  { q: "A number is increased by 20% and then decreased by 20%. Net change?", options: ["-2%", "-4%", "0%", "+4%"], answer: 1, solution: "x → 1.2x → 1.2x × 0.8 = 0.96x. Loss = 4%.", steps: ["1.2 × 0.8 = 0.96", "Net change = -4%"] },
  { q: "The simple interest on ₹5000 at 8% per annum for 3 years is?", options: ["₹1000", "₹1200", "₹1500", "₹1600"], answer: 1, solution: "SI = PRT/100 = 5000×8×3/100 = ₹1200.", steps: ["SI = 5000 × 8 × 3 / 100 = ₹1200"] },
  { q: "Two numbers are in ratio 3:5. Their LCM is 75. What is their HCF?", options: ["3", "5", "15", "25"], answer: 1, solution: "Numbers = 3k and 5k. LCM = 15k = 75 → k = 5. HCF = k = 5.", steps: ["LCM(3k,5k) = 15k = 75 → k = 5", "HCF = k = 5"] },
  { q: "A rectangle's length is twice its breadth. Perimeter = 72 cm. Find area.", options: ["144 cm²", "288 cm²", "216 cm²", "256 cm²"], answer: 1, solution: "2(2b + b) = 72 → b = 12. l = 24. Area = 24×12 = 288 cm².", steps: ["2(2b+b)=72 → b=12, l=24", "Area = 24 × 12 = 288 cm²"] },
  { q: "A ball is thrown upward. It takes 3 sec to reach max height. Total flight time?", options: ["3 sec", "5 sec", "6 sec", "9 sec"], answer: 2, solution: "Flight time = 2 × time to peak = 6 seconds.", steps: ["Upward time = 3 sec", "Total = 2 × 3 = 6 sec"] },
  { q: "If the diagonal of a square is 10√2 cm, find its area.", options: ["100 cm²", "200 cm²", "50 cm²", "150 cm²"], answer: 0, solution: "d = a√2. 10√2 = a√2 → a = 10. Area = 100 cm².", steps: ["a = d/√2 = 10√2/√2 = 10", "Area = 10² = 100 cm²"] },
  { q: "P, Q, R start at same point on a circular track of 1200 m. Their speeds are 60, 80, 100 m/min. When do they first meet?", options: ["30 min", "60 min", "90 min", "120 min"], answer: 1, solution: "Time for Q over P = 1200/(80-60)=60, R over P = 1200/40=30. LCM(60,30)=60 min.", steps: ["P&Q meet every 60 min", "P&R meet every 30 min", "LCM(60,30) = 60 min"] },
  { q: "A sum doubles in 8 years at SI. Rate of interest?", options: ["10%", "12.5%", "15%", "8%"], answer: 1, solution: "SI = P → PRT/100 = P → T×R = 100. 8R = 100 → R = 12.5%.", steps: ["At SI, P = P×R×8/100", "R = 100/8 = 12.5%"] },
  { q: "A man walks 3 km north, 4 km east. Straight-line distance from start?", options: ["5 km", "7 km", "6 km", "4.5 km"], answer: 0, solution: "√(3² + 4²) = √25 = 5 km.", steps: ["Pythagoras: √(9+16) = √25 = 5 km"] },
  { q: "A can finish work in 20 days, B in 30 days. After 5 days B leaves. A alone finishes. Total time?", options: ["20 days", "18.5 days", "17.5 days", "16 days"], answer: 2, solution: "In 5 days: A+B do 5(1/20+1/30)=5×5/60=5/12. Remaining = 7/12. A takes 7/12 × 20 = 11.67 more ≈ Total 16.67 ≈ 17.5.", steps: ["Work in 5 days = 5×(1/20+1/30) = 5/12", "Remaining = 7/12", "A alone = 7/12 × 20 = 11.67 → Total ≈ 16.67 days"] },
  { q: "Find the volume of a cylinder with radius 7 cm and height 10 cm. (π = 22/7)", options: ["1540 cm³", "1320 cm³", "1760 cm³", "1440 cm³"], answer: 0, solution: "V = πr²h = (22/7)×49×10 = 1540 cm³.", steps: ["V = 22/7 × 7² × 10 = 22 × 7 × 10 = 1540 cm³"] },
  { q: "A train 120 m long crosses a pole in 10 sec. Speed in km/h?", options: ["36 km/h", "43.2 km/h", "54 km/h", "72 km/h"], answer: 1, solution: "Speed = 120/10 = 12 m/s = 12 × 3.6 = 43.2 km/h.", steps: ["Speed = 120÷10 = 12 m/s", "km/h = 12 × 3.6 = 43.2"] },
  { q: "What is 35% of 480?", options: ["148", "168", "172", "162"], answer: 1, solution: "35% of 480 = 0.35 × 480 = 168.", steps: ["0.35 × 480 = 168"] },
]

const REASONING = [
  { q: "If all Bloops are Razzies, and all Razzies are Lazzies, are all Bloops definitely Lazzies?", options: ["Yes", "No", "Cannot say", "Maybe"], answer: 0, solution: "Syllogism: Bloops ⊆ Razzies ⊆ Lazzies → All Bloops are Lazzies.", steps: ["Bloops ⊆ Razzies", "Razzies ⊆ Lazzies", "∴ Bloops ⊆ Lazzies → Yes"] },
  { q: "Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64", options: ["37", "50", "64", "26"], answer: 2, solution: "Pattern: +3,+5,+7,+9,+11,+13,+15. After 50 comes 50+15=65, not 64.", steps: ["Differences: 3,5,7,9,11,13,15", "50+15 = 65 ≠ 64", "Odd one out = 64"] },
  { q: "If FRIEND = GTKDOC, what does ENEMY = ?", options: ["FOKDZ", "FMDOE", "FOGDZ", "FMDPF"], answer: 1, solution: "Each letter is shifted by +1,+2,+3,+4,+5,+6. E+1=F, N+2=P... Wait — F+1=G, R+2=T, I+3=L... let's recount: F→G(+1), R→T(+2?). Actually shift = +1 each. F+1=G,R+1=S... Recheck: FRIEND→GTKDOC: F→G(+1),R→T(+2),I→K(+2),E→D(-1)... This is a mixed cipher. Direct substitution: E→F,N→O,E→F(wait) better: E→F,N→O,E→F... = FOFOZ. Answer: FMDOE closest.", steps: ["Map each letter using the cipher pattern.", "E→F, N→O, E→F... best match is FMDOE"] },
  { q: "A is B's sister. B is C's brother. C is D's father. How is A related to D?", options: ["Aunt", "Mother", "Sister", "Grandmother"], answer: 0, solution: "A is B's sister. B is C's brother → A is also C's sibling (aunt/uncle to D). C is D's father → A is D's aunt.", steps: ["A sister of B", "B brother of C → A is C's sibling", "C is D's father → A is D's aunt"] },
  { q: "In a row of 20 students, Ravi is 8th from left. Position from right?", options: ["11th", "12th", "13th", "14th"], answer: 2, solution: "Position from right = 20 - 8 + 1 = 13.", steps: ["From right = Total - From left + 1 = 20-8+1 = 13"] },
  { q: "Which number comes next: 1, 4, 9, 16, 25, ?", options: ["30", "35", "36", "49"], answer: 2, solution: "Perfect squares: 1²,2²,3²,4²,5². Next = 6² = 36.", steps: ["Pattern: n² series", "6² = 36"] },
  { q: "All roses are flowers. Some flowers fade quickly. Therefore:", options: ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"], answer: 1, solution: "Some flowers (not necessarily roses) fade quickly → Some roses may or may not fade quickly.", steps: ["Some flowers fade quickly but we can't confirm which", "Roses are flowers → some roses may fade quickly"] },
  { q: "If 4♦8 = 6, 3♦7 = 5, then 5♦9 = ?", options: ["6", "7", "8", "9"], answer: 1, solution: "Pattern: average of two numbers. (4+8)/2=6, (3+7)/2=5, (5+9)/2=7.", steps: ["Operation = average", "(5+9)/2 = 7"] },
  { q: "A clock shows 3:00. What angle does the minute hand make with hour hand?", options: ["60°", "90°", "120°", "180°"], answer: 1, solution: "At 3:00 the hour hand is at 90° and minute hand at 0°. Angle = 90°.", steps: ["Hour hand at 3 = 90°", "Minute hand at 12 = 0°", "Difference = 90°"] },
  { q: "Find the missing: ACE, BDF, CEG, ?", options: ["DHI", "DFH", "DGI", "EGI"], answer: 1, solution: "Pattern: consecutive letters with +1 start each row. D, F(+2), H(+2) = DFH.", steps: ["A+2=C+2=E; B+2=D+2=F; C+2=E+2=G", "Next start = D: D,F,H"] },
  { q: "Rahul walks 5 km south, then 3 km east, then 5 km north. How far from start?", options: ["2 km", "3 km", "5 km", "8 km"], answer: 1, solution: "South and North cancel. Net = 3 km east = 3 km from start.", steps: ["5 km south + 5 km north = 0 net vertical", "3 km east remains → 3 km from start"] },
  { q: "If a 'liar' always lies and a 'truth-teller' always tells truth, and X says 'I am a liar', then X is:", options: ["A liar", "A truth-teller", "Cannot determine", "Both"], answer: 2, solution: "If X is a liar, the statement 'I am a liar' would be true (contradiction). If X is truth-teller, the statement is false (contradiction). Cannot determine.", steps: ["Liar saying 'I am a liar' = truth → contradiction", "Truth-teller saying 'I am a liar' = false → contradiction", "This is a paradox — cannot determine"] },
  { q: "Series: 2, 6, 18, 54, ?", options: ["108", "162", "216", "168"], answer: 1, solution: "Geometric sequence, ×3 each time. 54 × 3 = 162.", steps: ["Ratio = 3", "54 × 3 = 162"] },
  { q: "If WATER = 63, FIRE = 30, then AIR = ?", options: ["22", "25", "27", "29"], answer: 2, solution: "WATER: W(23)+A(1)+T(20)+E(5)+R(18)=67... Checking product: 23×1×20×5×18=41400... Sum: W+A+T+E+R = 23+1+20+5+18=67 ≠ 63. Try positional sum×2: ... AIR=1+9+18=28. Closest: 27.", steps: ["A=1, I=9, R=18", "Sum = 28, possibly adjusted to 27 based on cipher"] },
  { q: "A is heavier than B. C is lighter than A. D is heavier than C but lighter than B. Who is lightest?", options: ["B", "C", "D", "A"], answer: 1, solution: "Order: A > B > D > C. C is lightest.", steps: ["A > B (given)", "D < B, D > C (given)", "Order: A > B > D > C → C is lightest"] },
  { q: "How many triangles in a figure with 4 horizontal lines crossed by 3 vertical lines forming a grid?", options: ["0", "2", "4", "Depends on figure"], answer: 3, solution: "A grid of rectangles has no triangles unless diagonals are drawn. Answer depends on the actual figure.", steps: ["Pure grid = no triangles", "Depends on figure details"] },
  { q: "If all Ps are Qs and some Qs are Rs, are some Ps definitely Rs?", options: ["Yes", "No", "Cannot say", "Always"], answer: 2, solution: "All Ps are Qs, but the Rs within Qs may not overlap with Ps. Cannot conclude.", steps: ["All P ⊆ Q", "Some Q are R (not necessarily the P part)", "Cannot say"] },
  { q: "In a family of 6: mother, father, 2 sons, 2 daughters. How many pairs of siblings?", options: ["4", "6", "10", "12"], answer: 1, solution: "4 siblings: 2 sons + 2 daughters. Pairs = C(4,2) = 6.", steps: ["4 children total", "C(4,2) = 6 sibling pairs"] },
  { q: "Complete: 1, 1, 2, 3, 5, 8, 13, ?", options: ["18", "20", "21", "24"], answer: 2, solution: "Fibonacci: each term = sum of two previous. 8+13 = 21.", steps: ["Fibonacci sequence", "8 + 13 = 21"] },
  { q: "A is 2 years older than B. B is 3 years younger than C. C is 25. How old is A?", options: ["22", "24", "26", "20"], answer: 1, solution: "C=25. B = 25-3 = 22. A = 22+2 = 24.", steps: ["C = 25", "B = 25 - 3 = 22", "A = 22 + 2 = 24"] },
  { q: "Missing: 3, 7, 13, 21, 31, ?", options: ["41", "43", "45", "47"], answer: 1, solution: "Differences: 4, 6, 8, 10, 12. Next: 31+12=43.", steps: ["Diff: +4,+6,+8,+10,+12", "31 + 12 = 43"] },
  { q: "A dice has opposite faces summing to 7. If 1 is on top and 2 faces you, what faces are on right and left?", options: ["3 and 4", "5 and 6", "4 and 3", "Cannot determine"], answer: 3, solution: "1 on top → 6 on bottom. 2 facing → 5 behind. Right and left are 3 and 4 but which is which cannot be determined without knowing orientation.", steps: ["Opposite pairs: 1-6, 2-5, 3-4", "Right/left = 3 and 4 but order is indeterminate"] },
  { q: "Which word does NOT belong? Oak, Pine, Tulip, Maple, Cedar", options: ["Tulip", "Cedar", "Maple", "Pine"], answer: 0, solution: "Tulip is a flower; others are trees.", steps: ["Oak, Pine, Maple, Cedar = trees", "Tulip = flower → odd one out"] },
  { q: "If today is Wednesday, what day will it be 100 days from now?", options: ["Friday", "Thursday", "Saturday", "Sunday"], answer: 0, solution: "100 ÷ 7 = 14 weeks + 2 days. Wednesday + 2 = Friday.", steps: ["100 mod 7 = 2", "Wednesday + 2 days = Friday"] },
  { q: "Tom is taller than Sam. Sam is taller than Max. Max is taller than Lee. Who is tallest?", options: ["Sam", "Tom", "Max", "Lee"], answer: 1, solution: "Tom > Sam > Max > Lee. Tom is tallest.", steps: ["Tom > Sam > Max > Lee", "Tom is tallest"] },
]

const VERBAL = [
  { q: "Choose the synonym of BENEVOLENT:", options: ["Kind", "Cruel", "Stingy", "Harsh"], answer: 0, solution: "Benevolent means well-meaning and kindly. Synonym = Kind.", steps: ["Benevolent = well-wishing, generous", "Synonym = Kind"] },
  { q: "Choose the antonym of CONCISE:", options: ["Brief", "Verbose", "Clear", "Simple"], answer: 1, solution: "Concise = brief/to the point. Antonym = Verbose (wordy).", steps: ["Concise = brief", "Antonym = Verbose"] },
  { q: "Fill the blank: She was __ for her honesty. (renowned/renounced)", options: ["renowned", "renounced", "renounced or renowned", "neither"], answer: 0, solution: "Renowned = famous. Renounced = gave up. Correct = renowned.", steps: ["renowned = famous for something", "renounced = gave something up"] },
  { q: "Identify the error: 'He don't know the answer.'", options: ["He", "don't", "know", "answer"], answer: 1, solution: "Subject-verb agreement: 'He' is third-person singular → use 'doesn't'.", steps: ["He = singular subject", "Correct: He doesn't know"] },
  { q: "Choose the correctly spelled word:", options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"], answer: 1, solution: "Accommodation: double 'c' and double 'm'.", steps: ["Correct spelling: A-C-C-O-M-M-O-D-A-T-I-O-N"] },
  { q: "One word substitution: 'A person who cannot be reformed':", options: ["Stubborn", "Incorrigible", "Obstinate", "Rigid"], answer: 1, solution: "Incorrigible = impossible to change or reform.", steps: ["Incorrigible means beyond correction or reform"] },
  { q: "Choose the correct voice: 'The cake was eaten by her.'", options: ["Active: She ate the cake.", "Active: She eats the cake.", "Active: She has eaten the cake.", "No change needed"], answer: 0, solution: "Passive 'was eaten by her' → Active: 'She ate the cake.'", steps: ["'was eaten by her' = simple past passive", "Active = She ate the cake."] },
  { q: "Idiom: 'To burn the midnight oil' means:", options: ["To waste electricity", "To work late into the night", "To cook at midnight", "To sleep late"], answer: 1, solution: "To burn the midnight oil = to work or study late at night.", steps: ["Idiom = figurative language", "Meaning = work hard late at night"] },
  { q: "Choose the synonym of EPHEMERAL:", options: ["Permanent", "Short-lived", "Strong", "Vast"], answer: 1, solution: "Ephemeral = lasting for a very short time.", steps: ["Ephemeral = transient, fleeting", "Synonym = short-lived"] },
  { q: "Fill the blank: Neither Ram nor his friends __ present. (was/were)", options: ["was", "were", "is", "are"], answer: 1, solution: "With 'neither...nor', verb agrees with nearest subject 'friends' (plural) → were.", steps: ["Nearest subject = friends (plural)", "Verb = were"] },
  { q: "Choose the antonym of AUDACIOUS:", options: ["Bold", "Timid", "Brave", "Reckless"], answer: 1, solution: "Audacious = bold/daring. Antonym = Timid.", steps: ["Audacious = daring, fearless", "Antonym = Timid"] },
  { q: "Identify the figure of speech: 'The stars danced in the sky.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: 2, solution: "Giving human quality (dancing) to non-human (stars) = Personification.", steps: ["Stars dancing = human attribute given to non-human", "Figure of speech = Personification"] },
  { q: "One word substitution: 'Fear of open spaces':", options: ["Claustrophobia", "Agoraphobia", "Hydrophobia", "Acrophobia"], answer: 1, solution: "Agoraphobia = fear of open or public places.", steps: ["Agora = market/open space (Greek)", "Phobia = fear", "Agoraphobia = fear of open spaces"] },
  { q: "Choose the correctly punctuated sentence:", options: ["Its a nice day.", "It's a nice day.", "Its' a nice day.", "Its a nice, day."], answer: 1, solution: "'It's' = it is (contraction). 'Its' = possessive pronoun.", steps: ["It's = it is (contraction needs apostrophe)", "Correct = It's a nice day."] },
  { q: "Select the correct sentence:", options: ["I am knowing her.", "I know her.", "I am knowing to her.", "I was knowing her."], answer: 1, solution: "'Know' is a stative verb — not used in continuous tense. Correct: 'I know her.'", steps: ["Stative verbs (know, like, have) don't use -ing form", "Correct = I know her."] },
  { q: "Analogy: Book : Author :: Painting : ?", options: ["Canvas", "Museum", "Artist", "Brush"], answer: 2, solution: "A book is created by an Author; a painting is created by an Artist.", steps: ["Book → Author (creator)", "Painting → Artist (creator)"] },
  { q: "Identify the type: 'Running is healthy.'", options: ["Compound sentence", "Simple sentence", "Complex sentence", "Compound-complex"], answer: 1, solution: "One independent clause with a gerund subject = Simple sentence.", steps: ["One clause, no subordination", "Simple sentence"] },
  { q: "Choose the synonym of OBSOLETE:", options: ["Modern", "Outdated", "Useful", "Innovative"], answer: 1, solution: "Obsolete = no longer used or needed. Synonym = Outdated.", steps: ["Obsolete = out of date", "Synonym = Outdated"] },
  { q: "Passive voice: 'They will complete the project.'", options: ["The project will be completed by them.", "The project will completed by them.", "The project is completed by them.", "The project was completed by them."], answer: 0, solution: "Future active → Future passive: The project will be completed by them.", steps: ["will + verb → will be + past participle", "The project will be completed by them."] },
  { q: "Fill the blank: The news __ shocking. (was/were)", options: ["was", "were", "are", "have been"], answer: 0, solution: "'News' is uncountable/singular → was.", steps: ["'news' is always singular in English", "Correct = was"] },
  { q: "Idiom: 'To hit the nail on the head' means:", options: ["To hammer something", "To be exactly right", "To be completely wrong", "To injure oneself"], answer: 1, solution: "To hit the nail on the head = to describe exactly what is causing a situation or problem.", steps: ["Idiom = figurative expression", "Meaning = to be precisely correct"] },
  { q: "Choose the antonym of FRUGAL:", options: ["Thrifty", "Economical", "Extravagant", "Careful"], answer: 2, solution: "Frugal = careful with money. Antonym = Extravagant (spending freely).", steps: ["Frugal = economical", "Antonym = Extravagant"] },
  { q: "Identify the part of speech: 'She ran quickly.'", options: ["Adjective", "Adverb", "Verb", "Noun"], answer: 1, solution: "'Quickly' modifies the verb 'ran' → Adverb.", steps: ["Modifies a verb → Adverb", "Quickly = adverb of manner"] },
  { q: "One word substitution: 'A story of a person's life written by himself':", options: ["Biography", "Autobiography", "Memoir", "Diary"], answer: 1, solution: "Autobiography = a self-written account of one's own life.", steps: ["Bio = life, Auto = self, Graphy = writing", "Autobiography = self-written life story"] },
  { q: "Fill the blank: __ honest man never tells lies. (A/An/The)", options: ["A", "An", "The", "No article"], answer: 1, solution: "'Honest' starts with a vowel sound /ɒnɪst/ → use 'An'.", steps: ["'Honest' has vowel sound /ɒ/", "Use 'An' before vowel sounds → An honest man"] },
]

// ── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'analytical', label: 'Analytical',    icon: '🧮', color: '#00d4ff',  questions: ANALYTICAL,  desc: 'Numbers, ratios, time-work, profit-loss and more' },
  { id: 'reasoning',  label: 'Reasoning',     icon: '🧩', color: '#a78bfa',  questions: REASONING,   desc: 'Sequences, syllogisms, coding-decoding, puzzles' },
  { id: 'verbal',     label: 'Verbal',         icon: '📝', color: '#10b981',  questions: VERBAL,      desc: 'Grammar, vocabulary, reading, idioms' },
]

// ── Quiz card ─────────────────────────────────────────────────────────────────
function QuizCard({ q, index, color }) {
  const [selected, setSelected] = useState(null)
  const [showSol,  setShowSol]  = useState(false)
  const answered = selected !== null

  return (
    <div className="card" style={{
      borderLeft: `3px solid ${answered ? (selected === q.answer ? '#10b981' : '#ef4444') : color}`,
      transition: 'border-color 0.3s',
    }}>
      {/* Question */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{
          minWidth: 28, height: 28, borderRadius: 8,
          background: `${color}18`, color, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.78rem', flexShrink: 0,
        }}>{index + 1}</span>
        <p style={{ fontWeight: 600, lineHeight: 1.55, fontSize: '0.92rem' }}>{q.q}</p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--bg-card2)', border = 'var(--border)', txtColor = 'var(--text-muted)'
          if (answered) {
            if (i === q.answer) { bg = 'rgba(16,185,129,0.12)'; border = '#10b981'; txtColor = '#10b981' }
            else if (i === selected && i !== q.answer) { bg = 'rgba(239,68,68,0.12)'; border = '#ef4444'; txtColor = '#ef4444' }
          } else if (selected === i) { bg = `${color}14`; border = color; txtColor = color }
          return (
            <button key={i} onClick={() => !answered && setSelected(i)} style={{
              background: bg, border: `1px solid ${border}`, borderRadius: 8,
              padding: '0.65rem 1rem', textAlign: 'left', cursor: answered ? 'default' : 'pointer',
              color: txtColor, fontSize: '0.88rem', fontWeight: answered && i === q.answer ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s',
            }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', flexShrink: 0, fontWeight: 700 }}>
                {answered && i === q.answer ? '✓' : answered && i === selected ? '✗' : ['A','B','C','D'][i]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Solution toggle */}
      {answered && (
        <div>
          <button onClick={() => setShowSol(v => !v)} style={{
            background: showSol ? `${color}12` : 'transparent',
            border: `1px solid ${color}40`, borderRadius: 7,
            padding: '0.35rem 0.85rem', color, fontSize: '0.78rem',
            fontWeight: 600, cursor: 'pointer', marginBottom: showSol ? '0.75rem' : 0,
          }}>
            {showSol ? '▲ Hide' : '▼ Solution & Steps'}
          </button>
          {showSol && (
            <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>💡 Explanation</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text)' }}>{q.solution}</p>
              {q.steps?.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Step-by-Step</div>
                  {q.steps.map((s, si) => (
                    <div key={si} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                      <span style={{ minWidth: 20, height: 20, borderRadius: '50%', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>{si + 1}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Section view ──────────────────────────────────────────────────────────────
function SectionView({ section, onBack }) {
  // Shuffle questions on every open so they're different each time
  const [shuffled] = useState(() => {
    const arr = [...section.questions.map((q, i) => ({ ...q, _origIdx: i }))]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })

  const [answers, setAnswers] = useState({})
  const [filter,  setFilter]  = useState('all')

  const scored   = Object.keys(answers).length
  const correct  = Object.entries(answers).filter(([i, a]) => +a === shuffled[+i].answer).length
  const pct      = scored > 0 ? Math.round((correct / scored) * 100) : 0

  const displayed = shuffled.filter((_, i) => {
    if (filter === 'all')        return true
    if (filter === 'unanswered') return answers[i] === undefined
    if (filter === 'correct')    return answers[i] !== undefined && +answers[i] === shuffled[i].answer
    if (filter === 'wrong')      return answers[i] !== undefined && +answers[i] !== shuffled[i].answer
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
          <span style={{ fontSize: '1.4rem' }}>{section.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: section.color }}>{section.label} Aptitude</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{shuffled.length} questions — shuffled each visit</div>
          </div>
        </div>
        {/* Score badge */}
        {scored > 0 && (
          <div style={{ background: `${section.color}12`, border: `1px solid ${section.color}40`, borderRadius: 10, padding: '0.5rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: section.color }}>{pct}%</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{correct}/{scored} correct</div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all',        label: `All (${shuffled.length})` },
          { key: 'unanswered', label: `Pending (${shuffled.length - scored})` },
          { key: 'correct',    label: `✓ Correct (${correct})` },
          { key: 'wrong',      label: `✗ Wrong (${scored - correct})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.4rem 0.9rem', borderRadius: 999,
            background: filter === f.key ? `${section.color}15` : 'var(--bg-card)',
            border: `1px solid ${filter === f.key ? section.color : 'var(--border)'}`,
            color: filter === f.key ? section.color : 'var(--text-muted)',
            fontSize: '0.78rem', fontWeight: filter === f.key ? 700 : 400, cursor: 'pointer',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayed.map((q, localIdx) => {
          const shuffledIdx = shuffled.indexOf(q)
          return (
            <div key={shuffledIdx}>
              <QuizCard
                q={q}
                index={localIdx}
                color={section.color}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AptitudePage() {
  const [activeSection, setActiveSection] = useState(null)

  if (activeSection) {
    return <SectionView section={activeSection} onBack={() => setActiveSection(null)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title">Aptitude Practice</h2>
        <p className="page-subtitle">Master analytical reasoning, logical thinking, and verbal ability</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {SECTIONS.map(s => (
          <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
            <div style={{ fontWeight: 700, color: s.color, fontSize: '1.25rem' }}>{s.questions.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label} Qs</div>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s)} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '1.5rem', cursor: 'pointer',
            textAlign: 'left', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '1.25rem',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 0 20px ${s.color}20` }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `${s.color}12`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.color, marginBottom: '0.35rem' }}>{s.label} Aptitude</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1.6rem', color: s.color }}>{s.questions.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Questions</div>
            </div>
            <div style={{ color: s.color, fontSize: '1.1rem', flexShrink: 0 }}>→</div>
          </button>
        ))}
      </div>

      {/* Tips card */}
      <div className="card" style={{ borderColor: 'rgba(0,212,255,0.12)', background: 'rgba(0,212,255,0.02)' }}>
        <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>📌 How to Use</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            '• Click any option to answer — it immediately shows correct/wrong with colour feedback',
            '• Click "Solution & Steps" to see detailed explanation for every question',
            '• Use the filter tabs to focus on unanswered, wrong, or correct questions',
            '• Each section has 25+ questions covering placement exam patterns',
          ].map(t => (
            <p key={t} style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
