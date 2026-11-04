// Sample data used by seed.ts. Plain data only, no logic.
//
// Tags are written by hand (lowercase, same style as generated tags) so the
// topics look natural and recommendations have something real to match on.

export interface SeedUser {
  fullName: string;
  email: string;
  interests: string[];
}

// Every seeded account signs in with this password. It is only for local demos.
export const demoPassword = "Articulink123";

export interface SeedArticle {
  title: string;
  author: string;
  summary: string;
  tags: string[];
  content: string;
  // How long ago the article was published. Several are under 168 hours
  // (7 days) so the "latest" and "trending" views have fresh content.
  hoursAgo: number;
  // 0 to 9: roughly how many readers engage with it. Gives uneven rankings.
  popularity: number;
}

export const seedUsers: SeedUser[] = [
  { fullName: "Amara Okafor", email: "amara.okafor@example.com", interests: ["technology", "ai", "productivity"] },
  { fullName: "Liam Chen", email: "liam.chen@example.com", interests: ["software", "ai", "design"] },
  { fullName: "Sofia Rossi", email: "sofia.rossi@example.com", interests: ["travel", "food", "books"] },
  { fullName: "Kwame Mensah", email: "kwame.mensah@example.com", interests: ["finance", "technology", "environment"] },
  { fullName: "Priya Nair", email: "priya.nair@example.com", interests: ["health", "fitness", "wellness"] },
  { fullName: "Noah Williams", email: "noah.williams@example.com", interests: ["science", "space", "books"] },
  { fullName: "Elena Petrova", email: "elena.petrova@example.com", interests: ["design", "travel", "culture"] },
  { fullName: "Tunde Adeyemi", email: "tunde.adeyemi@example.com", interests: ["food", "cooking", "finance"] },
  // No interests on purpose: recommendations rely only on what they read.
  { fullName: "Marlow Hughes", email: "marlow.hughes@example.com", interests: [] },
];

export const seedArticles: SeedArticle[] = [
  // ---------- Technology and AI ----------
  {
    title: "How Small Teams Are Shipping Faster With AI Code Assistants",
    author: "Priya Raman",
    summary:
      "AI code assistants are changing how small engineering teams work, mostly by removing boring tasks rather than replacing developers. The teams seeing the biggest gains are the ones that still review everything carefully.",
    tags: ["ai", "software", "productivity", "technology"],
    content:
      "A few years ago, a team of four could not realistically maintain three products at once. Today many of them do, and the change is less about magic and more about small savings that add up: boilerplate written in seconds, tests drafted from a description, and error messages explained in plain language.\n\nThe catch is that speed only helps if the code is still understood. The teams getting good results treat the assistant like a fast junior colleague. They read every suggestion, keep pull requests small, and never merge code they could not explain to a teammate.",
    hoursAgo: 14,
    popularity: 9,
  },
  {
    title: "What Large Language Models Actually Do When They Answer a Question",
    author: "Daniel Okoye",
    summary:
      "A language model does not look facts up in a database; it predicts the next word based on patterns learned in training. Understanding that explains both why it is so useful and why it sometimes sounds confident and is wrong.",
    tags: ["ai", "machine-learning", "technology", "explainer"],
    content:
      "When you type a question, the model breaks it into small pieces called tokens and then predicts which token is most likely to come next, over and over, until the answer is complete. There is no lookup step. Everything it appears to know is compressed into numbers learned from an enormous amount of text.\n\nThis is why the same system can write a poem and explain a tax form, and also why it can invent a source that does not exist. Treat its answers as a strong first draft, and check anything that matters against a reliable reference.",
    hoursAgo: 30,
    popularity: 8,
  },
  {
    title: "The Quiet Return of Local-First Software",
    author: "Marta Kowalski",
    summary:
      "Apps that keep your data on your own device and sync it in the background are making a comeback. They stay fast, work offline, and give users more control over their information.",
    tags: ["software", "privacy", "technology", "design"],
    content:
      "For about fifteen years the default was simple: put everything in the cloud and show a spinner while it loads. Local-first apps flip that around. Your notes, drawings or tasks live on your device first, so the app opens instantly and keeps working on a train with no signal.\n\nSyncing still happens, just quietly in the background. For users the benefits are speed and ownership. For developers the hard part is merging edits from several devices, which is why a whole new generation of tools exists to solve exactly that.",
    hoursAgo: 52,
    popularity: 5,
  },
  {
    title: "Why Your Phone Battery Degrades and What Actually Helps",
    author: "Jonas Eriksen",
    summary:
      "Lithium-ion batteries wear out a little with every charge cycle, and heat does more damage than almost anything else. A few simple habits can add a year or more of useful life.",
    tags: ["technology", "gadgets", "explainer"],
    content:
      "Every time a lithium-ion battery charges and discharges, tiny chemical changes make it hold slightly less energy. You cannot stop that, but you can slow it down. The biggest enemy is heat, so avoid leaving the phone in a hot car or charging it under a pillow.\n\nKeeping the charge between roughly twenty and eighty percent is gentler than running it to empty or leaving it at one hundred all night. Many phones now include a setting that does this for you, and it is worth switching on.",
    hoursAgo: 24 * 12,
    popularity: 4,
  },
  {
    title: "A Beginner's Guide to Understanding APIs",
    author: "Amina Yusuf",
    summary:
      "An API is simply a menu of requests one program can make to another. This guide explains the idea with a restaurant comparison and walks through what a typical request and response look like.",
    tags: ["software", "beginners", "technology", "explainer"],
    content:
      "Imagine a restaurant. You do not walk into the kitchen; you read the menu, tell the waiter what you want, and the food arrives. An API works the same way. One program sends a clear request, and another program, which you never see inside, sends back a response.\n\nMost web APIs use URLs and plain text formats such as JSON. Asking for a list of articles, for example, is just a request to an address, and the reply is a tidy list of titles, authors and dates that any app can display.",
    hoursAgo: 24 * 40,
    popularity: 6,
  },

  // ---------- Health and fitness ----------
  {
    title: "Sleep Is the Cheapest Performance Upgrade You Aren't Using",
    author: "Dr. Nadia Hassan",
    summary:
      "Most people know they should sleep more but treat it as optional. Consistent sleep improves mood, memory and physical recovery more than most supplements or gadgets.",
    tags: ["health", "sleep", "wellness"],
    content:
      "We spend money on trackers, supplements and productivity apps, yet the biggest lever is free. Regular, sufficient sleep sharpens memory, steadies mood and helps muscles repair. Missing it for even a few nights makes ordinary tasks feel harder.\n\nThe best advice is unglamorous: keep a similar bedtime and wake time, dim the lights in the last hour of the day, and keep screens out of bed. Small, repeatable habits beat dramatic one-off fixes.",
    hoursAgo: 40,
    popularity: 9,
  },
  {
    title: "Strength Training After 40: A Practical Starter Plan",
    author: "Coach Rachel Bell",
    summary:
      "Muscle and bone density naturally decline with age, but lifting weights slows and even reverses much of that. Two short sessions a week are enough to begin.",
    tags: ["fitness", "health", "strength"],
    content:
      "You do not need a gym membership or heavy barbells to start. Two sessions a week built around a squat, a push, a pull and a hinge cover most of the body. Begin with weights that feel light and focus on smooth, controlled movement.\n\nAdd a little resistance every week or two, rest between sessions, and expect to feel stronger within a month. Consistency matters far more than intensity, especially in the first few months.",
    hoursAgo: 24 * 5,
    popularity: 7,
  },
  {
    title: "The Real Science Behind Intermittent Fasting",
    author: "Dr. Samuel Adeleke",
    summary:
      "Intermittent fasting helps some people control their eating, but the research is more modest than the headlines. The main benefit appears to be simplicity, not a metabolic trick.",
    tags: ["health", "nutrition", "science"],
    content:
      "Studies comparing fasting schedules with ordinary calorie control usually find similar results. People who fast tend to eat less overall, mostly because there are fewer hours in which to eat. That is useful for some, but it is not a secret switch for fat loss.\n\nFasting is not suitable for everyone, including people who are pregnant, have a history of disordered eating, or take certain medications. Anyone unsure should talk to a doctor before changing how they eat.",
    hoursAgo: 24 * 21,
    popularity: 5,
  },
  {
    title: "Ten-Minute Walks and Why They Beat the Gym Guilt",
    author: "Coach Rachel Bell",
    summary:
      "Short walks add up to real health benefits and are far easier to keep up than an ambitious workout plan. Ten minutes after meals is a good place to start.",
    tags: ["fitness", "wellness", "productivity"],
    content:
      "Many of us quit exercise plans because they ask too much. A ten-minute walk asks almost nothing, yet it lifts mood, helps digestion and clears the head. Three of them in a day is half an hour of activity you barely noticed.\n\nTie the walk to something you already do: after lunch, after a call, or when the kettle is boiling. Habits stick best when they ride on top of existing routines.",
    hoursAgo: 24 * 33,
    popularity: 3,
  },

  // ---------- Science and space ----------
  {
    title: "What the James Webb Telescope Is Teaching Us About Early Galaxies",
    author: "Dr. Elena Marchetti",
    summary:
      "Webb's infrared eyes can see light that has travelled for over thirteen billion years. Its images show galaxies that look more developed than astronomers expected so soon after the Big Bang.",
    tags: ["space", "science", "astronomy"],
    content:
      "Because light takes time to arrive, looking far away means looking back in time. Webb is built to detect the stretched, infrared light from the earliest galaxies, and what it finds is surprising: some already look bright, structured and rich in heavy elements.\n\nThat does not break our understanding of the universe, but it asks astronomers to refine their models of how quickly stars and galaxies form. Every new set of observations adds another clue.",
    hoursAgo: 70,
    popularity: 8,
  },
  {
    title: "How Scientists Are Teaching Bacteria to Eat Plastic",
    author: "Dr. Kenji Watanabe",
    summary:
      "Researchers have found, and improved, enzymes that break down some common plastics. The work is promising for recycling, though it is still far from solving the waste problem on its own.",
    tags: ["science", "environment", "biology"],
    content:
      "The first plastic-eating bacterium was discovered at a bottle recycling site, where microbes had slowly adapted to a new food source. Since then labs have engineered stronger versions of its enzymes that work faster and at higher temperatures.\n\nThe goal is not to let plastic-eating microbes loose in the wild. It is to use controlled reactors that turn old bottles back into raw materials. Cutting plastic use in the first place remains the most effective step.",
    hoursAgo: 24 * 18,
    popularity: 6,
  },
  {
    title: "Why the Moon Is Back on the Agenda",
    author: "Dr. Elena Marchetti",
    summary:
      "Several countries and companies are planning new missions to the Moon. This time the aim is not a flag and a footprint, but a lasting presence that can support science and further travel.",
    tags: ["space", "science", "exploration"],
    content:
      "The first lunar race was about proving something. The new one is about building something: landing sites, power systems and eventually habitats. Water ice near the poles is a major attraction, since it can be turned into drinking water and rocket fuel.\n\nSmaller spacecraft from private companies are also making missions cheaper and more frequent. Not every attempt will succeed, but each one teaches engineers something the next team can use.",
    hoursAgo: 24 * 26,
    popularity: 4,
  },
  {
    title: "Inside the Race to Build a Practical Quantum Computer",
    author: "Dr. Kenji Watanabe",
    summary:
      "Quantum computers promise to solve certain problems far faster than any ordinary machine, but they are fragile and error-prone. The field's central challenge is making them reliable.",
    tags: ["science", "technology", "quantum"],
    content:
      "A quantum bit can hold a blend of zero and one at the same time, which lets a quantum computer explore many possibilities together. The difficulty is that these states are delicate; heat, vibration or stray radiation can ruin a calculation.\n\nMost current work is about error correction, using many physical bits to protect one reliable one. Useful machines are still some way off, but progress in chemistry and materials simulation is already being tested.",
    hoursAgo: 24 * 48,
    popularity: 3,
  },

  // ---------- Travel ----------
  {
    title: "Three Days in Lisbon on a Sensible Budget",
    author: "Sofia Almeida",
    summary:
      "Lisbon is hilly, sunny and friendlier on the wallet than most western European capitals. A simple three-day plan covers the highlights without rushing.",
    tags: ["travel", "europe", "budget"],
    content:
      "Start in Alfama, wandering the narrow streets uphill to a viewpoint at sunrise, when the city is quiet and the light is soft. Spend the afternoon in the tiled lanes of Baixa and treat yourself to a custard tart from a local bakery.\n\nOn day two take the train to Belem for the monastery and the riverside, and save day three for slower things: a market lunch, a tram ride, and an evening of live music in a small bar.",
    hoursAgo: 90,
    popularity: 7,
  },
  {
    title: "Slow Travel: Why Staying Longer Beats Seeing More",
    author: "Elena Petrova",
    summary:
      "Visiting fewer places for longer costs less, reduces stress and leads to better memories. Slow travel is less about rules and more about leaving space in the schedule.",
    tags: ["travel", "wellness", "slow-living"],
    content:
      "A packed itinerary can turn a holiday into a list of photographs. Staying in one town for a week lets you learn the corner cafe, notice the local rhythm and say yes to unplanned invitations. It also cuts the money and time spent on transport.\n\nYou do not need to give up ambition. Pick one base, add a few day trips, and leave whole afternoons empty. The empty afternoons are often what you remember.",
    hoursAgo: 24 * 15,
    popularity: 5,
  },
  {
    title: "A First-Timer's Guide to Train Travel Across Japan",
    author: "Sofia Almeida",
    summary:
      "Japan's rail network is punctual, clean and easy to use once you understand a few basics. This guide covers tickets, seat reservations and how to read the signs.",
    tags: ["travel", "japan", "trains"],
    content:
      "The most famous service is the shinkansen, the high-speed line connecting major cities. You can buy tickets at machines with an English option, and reserved seats are well worth it on busy routes. Local lines use the same prepaid cards as buses and shops.\n\nPlatforms are marked clearly with the car numbers, so you can queue exactly where your door will open. Be on time, keep phone calls for the platform, and enjoy a station lunch box on board.",
    hoursAgo: 24 * 35,
    popularity: 6,
  },

  // ---------- Food ----------
  {
    title: "The Case for Cooking Once and Eating Three Times",
    author: "Tunde Adeyemi",
    summary:
      "Batch cooking is not about eating the same plate three days in a row. It is about preparing flexible building blocks that turn into different meals during the week.",
    tags: ["food", "cooking", "productivity"],
    content:
      "On a calm Sunday, cook a big pot of beans or lentils, roast a tray of vegetables and make one sauce. Through the week these become a salad, a wrap, a soup, or a quick stir-fry, and each meal tastes different with a new topping.\n\nThe saving is not only money. Knowing dinner is mostly done removes the tired evening decision about what to eat, and makes it much easier to cook rather than order out.",
    hoursAgo: 110,
    popularity: 6,
  },
  {
    title: "West African Jollof Rice: The Technique Behind the Debate",
    author: "Amina Yusuf",
    summary:
      "Everyone has an opinion on who makes the best jollof, but the great versions share a method: a deeply cooked tomato base and gentle steam. Here is how to get it right.",
    tags: ["food", "cooking", "culture"],
    content:
      "The heart of jollof is the base: tomatoes, peppers and onions blended, then fried until the oil separates and the colour turns a deep red. Rushing this step leaves the rice sharp and thin.\n\nAdd stock and washed rice, cover the pot tightly, and cook on low heat so the grains steam rather than boil. A little char at the bottom, often called the party bottom, is considered a bonus, not a mistake.",
    hoursAgo: 24 * 9,
    popularity: 9,
  },
  {
    title: "Fermentation at Home: Starting With Just Cabbage and Salt",
    author: "Tunde Adeyemi",
    summary:
      "Sauerkraut needs only cabbage, salt and patience. It is the easiest first ferment, and a good way to learn how to keep good bacteria happy.",
    tags: ["food", "cooking", "health"],
    content:
      "Shred a cabbage, massage it with salt until it releases liquid, and press it into a clean jar so the cabbage stays under its own brine. That is the whole recipe. Cover loosely and keep it somewhere cool, away from direct sunlight.\n\nAfter a few days, you will see bubbles and notice a pleasant sour smell. Taste it regularly and move it to the fridge when it is tangy enough for you.",
    hoursAgo: 24 * 29,
    popularity: 2,
  },

  // ---------- Finance ----------
  {
    title: "Building an Emergency Fund When Money Is Tight",
    author: "Kwame Mensah",
    summary:
      "An emergency fund is the cushion that keeps a bad month from becoming a crisis. Start with a small target and automate it so it happens without willpower.",
    tags: ["finance", "saving", "budgeting"],
    content:
      "Saving six months of expenses sounds impossible if you are barely covering the bills. Start smaller: aim for one month's rent, or even just a few hundred in a separate account. Having anything set aside changes how you handle surprises.\n\nSet up an automatic transfer on payday, however small. Treat it like a bill, and increase it a little whenever your income rises. Over time the habit matters more than the amount.",
    hoursAgo: 60,
    popularity: 8,
  },
  {
    title: "Index Funds Explained Without the Jargon",
    author: "Kwame Mensah",
    summary:
      "An index fund buys a small slice of many companies at once, which keeps costs low and spreads risk. It is a popular option for people who do not want to pick stocks.",
    tags: ["finance", "investing", "beginners"],
    content:
      "Instead of betting on one company, an index fund follows a list, such as the largest businesses in a country. When the companies on the list grow, so does the fund. Because nobody is choosing stocks, the fees are usually much lower.\n\nNo investment is risk-free and values can fall as well as rise. This is general information, not personal advice, so consider your own situation or speak to a qualified adviser.",
    hoursAgo: 24 * 22,
    popularity: 7,
  },
  {
    title: "The Hidden Cost of Subscription Creep",
    author: "Jonas Eriksen",
    summary:
      "Small monthly payments are easy to forget and easy to multiply. A quarterly audit can free up a surprising amount of money.",
    tags: ["finance", "budgeting", "technology"],
    content:
      "Music, video, storage, a fitness app, a free trial you forgot to cancel: each is cheap alone, but together they can rival a rent payment. Companies rely on the fact that cancelling takes effort and doing nothing is easy.\n\nOnce a quarter, scroll through your bank statement and list every recurring charge. Keep the ones you use weekly, pause the rest, and set a reminder before any trial ends.",
    hoursAgo: 24 * 44,
    popularity: 4,
  },

  // ---------- Design ----------
  {
    title: "Whitespace Is Not Wasted Space",
    author: "Liam Chen",
    summary:
      "Empty space gives a design room to breathe and helps readers focus on what matters. Learning to leave it alone is one of the hardest and most valuable design skills.",
    tags: ["design", "ui", "typography"],
    content:
      "New designers often fill every gap, afraid that blank areas look unfinished. In practice, generous spacing around text and images makes a page feel calmer and more confident, and it guides the eye from one idea to the next.\n\nTry doubling the margin around a block of text and see how the reading experience changes. If it feels better, the space was doing real work.",
    hoursAgo: 100,
    popularity: 6,
  },
  {
    title: "How to Choose a Colour Palette You Won't Regret",
    author: "Elena Petrova",
    summary:
      "A good palette is small, consistent and tested in real situations. Start with one main colour, add a neutral, and use a single accent sparingly.",
    tags: ["design", "colour", "branding"],
    content:
      "Beginners often pick six bright colours and struggle to make them work together. A calmer approach is to choose one brand colour, a warm or cool neutral for backgrounds and text, and one accent for the things you want people to click.\n\nTest the palette on real screens, in sunlight and at night. If text is hard to read or the accent loses its punch, adjust before you build anything on top of it.",
    hoursAgo: 24 * 16,
    popularity: 5,
  },
  {
    title: "Accessible Design Is Just Good Design",
    author: "Liam Chen",
    summary:
      "Features built for people with disabilities, such as clear contrast and keyboard support, make products better for everyone. Accessibility is cheapest when it starts at the beginning.",
    tags: ["design", "accessibility", "ui"],
    content:
      "Captions help in a noisy station. Good contrast helps in bright sunshine. Keyboard shortcuts help anyone whose hands are full. Many features first created for people with disabilities end up becoming everyday conveniences.\n\nStart with the basics: readable text sizes, strong contrast, clear labels on every button and a layout that works with a keyboard alone. Fixing these early is far easier than repairing them later.",
    hoursAgo: 24 * 38,
    popularity: 3,
  },

  // ---------- Productivity ----------
  {
    title: "The Case for Single-Tasking",
    author: "Amara Okafor",
    summary:
      "Switching between tasks costs more time and energy than most people realise. Working on one thing at a time, in short focused blocks, usually produces better results in less time.",
    tags: ["productivity", "focus", "wellness"],
    content:
      "Every time you jump from a document to a chat message and back, your brain has to reload what it was doing. Those tiny delays add up, and the work that follows is usually shallower and full of small mistakes.\n\nTry a twenty-five minute block with notifications off and a single clear goal. Take a short break, then start the next one. Many people find they finish earlier than when they tried to do everything at once.",
    hoursAgo: 120,
    popularity: 7,
  },
  {
    title: "A Weekly Review That Takes Twenty Minutes",
    author: "Amara Okafor",
    summary:
      "A short weekly review keeps small tasks from piling up and helps you pick what matters next. All you need is a list, a calendar and a quiet twenty minutes.",
    tags: ["productivity", "planning", "habits"],
    content:
      "Pick the same time every week, such as Friday afternoon or Sunday evening. Look back at what you finished, move unfinished items to a proper date or delete them, and glance at the week ahead for meetings or deadlines.\n\nFinish by choosing the three most important things for next week. That small ritual turns a vague to-do list into a plan, and makes Monday morning much calmer.",
    hoursAgo: 24 * 14,
    popularity: 5,
  },
  {
    title: "Why Meetings Fail and How to Fix Them",
    author: "Daniel Okoye",
    summary:
      "Most bad meetings lack a clear purpose, the right attendees or a decision at the end. Three small changes can make them shorter and more useful.",
    tags: ["productivity", "work", "teams"],
    content:
      "Before sending an invite, ask whether a short written update would do. If a meeting is needed, share the goal and any reading in advance, and invite only the people who must contribute or decide.\n\nEnd by writing down what was decided, who owns each action and by when. If a meeting has no outcome, it was a conversation, and probably could have been a message.",
    hoursAgo: 24 * 52,
    popularity: 2,
  },

  // ---------- Environment ----------
  {
    title: "Rooftop Solar: What the Payback Period Really Looks Like",
    author: "Kwame Mensah",
    summary:
      "Solar panels can lower electricity bills for many homes, but the payback time depends on sunshine, local prices and installation costs. A realistic estimate starts with your own bills.",
    tags: ["environment", "energy", "solar"],
    content:
      "The advertised savings assume a sunny roof and rising electricity prices. To get a realistic estimate, collect a year of bills, ask installers for quotes that include batteries and maintenance, and check whether your area allows you to sell extra power back.\n\nPayback often takes several years, after which the power is close to free. If you plan to move soon, check whether the system adds value to the property.",
    hoursAgo: 80,
    popularity: 6,
  },
  {
    title: "Cities Are Planting Tiny Forests, and They Work",
    author: "Dr. Kenji Watanabe",
    summary:
      "Dense mini-forests, some the size of a tennis court, grow quickly and cool neighbourhoods. They also create small pockets of habitat in the middle of cities.",
    tags: ["environment", "cities", "nature"],
    content:
      "Planting trees close together, in several layers, mimics how natural woodland grows. In a few years the canopy closes, shading the ground and lowering the temperature of nearby streets on hot days.\n\nThese forests also absorb noise and rain, and give birds and insects somewhere to live. They are cheap to start, and often become favourite spots for local volunteers and schools.",
    hoursAgo: 24 * 31,
    popularity: 4,
  },

  // ---------- Books and culture ----------
  {
    title: "Five Novels That Changed How I Think About Time",
    author: "Noah Williams",
    summary:
      "Fiction can stretch, fold and slow down time in ways nothing else can. These five novels each treat the passing of years in a surprising and memorable way.",
    tags: ["books", "fiction", "culture"],
    content:
      "Some books cover a single day in hundreds of pages; others leap through generations in a sentence. Reading them side by side shows how flexible time can be, and how much of our experience of it is a matter of attention.\n\nWhat they share is a respect for small details. A smell, a song or a half-remembered phrase can carry a character across decades. Each is a reminder to notice the present while it is here.",
    hoursAgo: 150,
    popularity: 4,
  },
  {
    title: "Why Reading Slowly Is Having a Moment",
    author: "Sofia Almeida",
    summary:
      "Readers are rediscovering the pleasure of taking their time with a book. Slow reading means fewer pages, better memory and more enjoyment.",
    tags: ["books", "wellness", "culture"],
    content:
      "We scroll quickly through headlines all day, so it is no surprise that some people now crave the opposite. Slow reading means finishing one chapter with full attention, pausing to think, and perhaps jotting down a line that stayed with you.\n\nYou will read fewer books in a year, but remember more of them. Pair it with a quiet corner and a phone left in another room, and ten minutes can feel like a holiday.",
    hoursAgo: 24 * 27,
    popularity: 0,
  },
];
