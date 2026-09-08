/* SKIDS Vision — product data */
var FRAME_COLORS = [
  { id: "crystal-blue", name: "Crystal Blue", hex: "#2b6cb0" },
  { id: "midnight", name: "Midnight", hex: "#3a3866" },
  { id: "amber", name: "Sunbeam Amber", hex: "#e8a04c" },
  { id: "meadow", name: "Meadow", hex: "#5a7148" },
  { id: "plum", name: "Plum", hex: "#6b2640" },
  { id: "rose", name: "Dusty Rose", hex: "#c98a9e" },
];
/* Illustrative sample collection. Replace with verified supplier SKUs and dimensions. */
var FRAMES = [
  {
    id: "explorer",
    name: "Explorer",
    cat: "sporty",
    shape: "round-rect",
    age: "6–12 yrs",
    price: 1499,
    blurb:
      "A rounded, sporty shape with colour that stands out. An easy place to start for everyday adventures.",
    tags: ["Sporty shape", "Four colour ideas", "Sample design"],
    colors: ["crystal-blue", "midnight", "amber", "meadow"],
  },
  {
    id: "scholar",
    name: "Scholar",
    cat: "classic",
    shape: "rect",
    age: "8–14 yrs",
    price: 1299,
    blurb: "The everyday frame. Lightweight, quietly classic, all-day comfort.",
    tags: ["Classic shape", "Three colour ideas", "Sample design"],
    colors: ["midnight", "plum", "crystal-blue"],
  },
  {
    id: "sunbeam",
    name: "Sunbeam",
    cat: "playful",
    shape: "round",
    age: "4–10 yrs",
    price: 1199,
    blurb: "Round, vibrant and cheerful — the frame children actually ask for.",
    tags: ["Round shape", "Warm colour ideas", "Sample design"],
    colors: ["amber", "rose", "meadow"],
  },
  {
    id: "feather",
    name: "Feather",
    cat: "minimal",
    shape: "wire",
    age: "8–14 yrs",
    price: 1699,
    blurb:
      "A delicate wire-inspired silhouette for children who prefer a quieter look.",
    tags: ["Wire-inspired", "Three colour ideas", "Sample design"],
    colors: ["crystal-blue", "midnight", "rose"],
  },
  {
    id: "striker",
    name: "Striker",
    cat: "sporty",
    shape: "wrap",
    age: "6–12 yrs",
    price: 1599,
    blurb:
      "A compact sporty silhouette, with deep colours for a bolder everyday look.",
    tags: ["Sporty silhouette", "Three colour ideas", "Sample design"],
    colors: ["meadow", "midnight", "crystal-blue"],
  },
  {
    id: "stargazer",
    name: "Stargazer",
    cat: "playful",
    shape: "cat-eye",
    age: "6–12 yrs",
    price: 1449,
    blurb:
      "A soft cat-eye lift. Confident colour for a confident small person.",
    tags: ["Cat-eye", "Warm colour ideas", "Sample design"],
    colors: ["plum", "rose", "amber"],
  },
  {
    id: "atlas",
    name: "Atlas",
    cat: "classic",
    shape: "square",
    age: "10–14 yrs",
    price: 1399,
    blurb:
      "A grown-up square, scaled for teens who want to look older than twelve.",
    tags: ["Square shape", "Deep colour ideas", "Sample design"],
    colors: ["midnight", "plum"],
  },
  {
    id: "pebble",
    name: "Pebble",
    cat: "minimal",
    shape: "round",
    age: "4–8 yrs",
    price: 1099,
    blurb:
      "Small faces deserve small frames. Soft, round, nearly invisible weight.",
    tags: ["Smaller age guide", "Round shape", "Sample design"],
    colors: ["rose", "amber", "meadow"],
  },
];
var LENS_OPTIONS = [
  {
    id: "standard",
    name: "Standard clear lenses",
    desc: "Base lens estimate; confirm material and coating",
    price: 0,
  },
  {
    id: "bluecut",
    name: "Blue-cut lenses",
    desc: "Optional coating; discuss whether it is needed",
    price: 300,
  },
  {
    id: "photo",
    name: "Photochromic lenses",
    desc: "Darken outdoors automatically",
    price: 900,
  },
  {
    id: "myopiactl",
    name: "Myopia-control lenses",
    desc: "Only if prescribed; brand and final cost need confirmation",
    price: 1500,
  },
];
var CATS = [
  { id: "all", name: "All frames" },
  { id: "sporty", name: "Sporty" },
  { id: "classic", name: "Classic" },
  { id: "playful", name: "Playful" },
  { id: "minimal", name: "Minimal" },
];

/* Interest-led editorial stories, not clinical recommendations. */
var PERSONAS = [
  {
    id: "scientist",
    label: "The scientist",
    name: "For the one who asks “why?”",
    headline: "Big questions.\nBright little eyes.",
    story:
      "You see their questions becoming discoveries. They see a fascinating leaf. A pair that feels like them is one small part of caring for the curious mind behind it.",
    image: "/assets/persona-scientist.webp",
    alt: "A curious child in navy rectangular glasses studying a leaf with a magnifying glass",
    colour: "midnight",
    frame: "scholar",
    style: "classic",
    frameNote: "A quiet, rectangular look for a very curious mind.",
    lensTitle: "Clear lenses, everyday exploring",
    lensNote:
      "Ask about prescription lenses and an easy-to-clean coating. Curiosity doesn’t need a special lens.",
    lensLink: "Talk about everyday lenses",
    caption: "Today’s discovery: a whole world in one leaf.",
    palette: "sage",
  },
  {
    id: "doctor",
    label: "The little doctor",
    name: "For the one who makes everyone feel better",
    headline: "A caring heart.\nA future full of possibility.",
    story:
      "A check-up for every teddy. A bandage for every bump. You see their kindness today, and the person it could become tomorrow.",
    image: "/assets/persona-doctor.webp",
    alt: "A child in rose round glasses playing doctor with a toy stethoscope and a teddy bear",
    colour: "rose",
    frame: "sunbeam",
    style: "playful",
    frameNote:
      "Soft, round and full of warmth. A little colour for a caring little person.",
    lensTitle: "Clear lenses for little details",
    lensNote:
      "Start with an eye examination and their prescription. Your optician can help choose the material, coating and fit.",
    lensLink: "Talk about their first pair",
    caption: "The teddy is in very good hands.",
    palette: "sky",
  },
  {
    id: "sports",
    label: "The sport star",
    name: "For the “one more game” kid",
    headline: "Big team spirit.\nTheir own little style.",
    story:
      "You see determination, teamwork and a future full of possibilities. They just want one more game. A sporty everyday look for the child who gives everything a go.",
    image: "/assets/persona-sports.webp",
    alt: "A smiling child in blue glasses holding a football while resting beside the playing field",
    colour: "crystal-blue",
    frame: "explorer",
    style: "sporty",
    frameNote: "A rounded blue frame with a playful, sporty feel.",
    lensTitle: "Everyday glasses ≠ sports protection",
    lensNote:
      "This is a look for off the field. Ask your optician about protective sports eyewear for the games they play.",
    lensLink: "Ask about sports eyewear",
    caption: "Half-time. Full of stories.",
    palette: "ochre",
  },
  {
    id: "creator",
    label: "The creator",
    name: "For the beautifully messy maker",
    headline: "A little colour.\nA lot of “I made this.”",
    story:
      "You see an artist, a designer, a maker of wonderful things. They see a cardboard box with potential. Let their glasses be another way to express who they are.",
    image: "/assets/persona-creator.webp",
    alt: "A child in plum cat-eye glasses smiling at a colourful cardboard creation on an art table",
    colour: "plum",
    frame: "stargazer",
    style: "playful",
    frameNote: "A soft cat-eye shape. A colour with something to say.",
    lensTitle: "Clear lenses for colourful days",
    lensNote:
      "Start with their prescription. Ask your optician about lens care and coatings for everyday fingerprints and smudges.",
    lensLink: "Talk about lens care",
    caption: "A masterpiece. According to its maker.",
    palette: "rose",
  },
  {
    id: "adventurer",
    label: "The adventurer",
    name: "For the “what’s over there?” kid",
    headline: "Small footsteps.\nA world of firsts.",
    story:
      "You see their independence growing. They see a path they haven’t tried yet. From today’s pocket full of pebbles to tomorrow’s possibilities, there is so much to discover.",
    image: "/assets/persona-adventurer.webp",
    alt: "A child in green glasses with a gentle outdoor tint exploring a leafy garden path",
    colour: "meadow",
    frame: "striker",
    style: "sporty",
    frameNote: "A compact green frame that feels right at home outside.",
    lensTitle: "A conversation about changing light",
    lensNote:
      "Ask whether photochromic lenses suit their prescription and routine. Tint and performance vary with the lens and conditions.",
    lensLink: "Explore outdoor lens options",
    caption: "The long way home is the interesting one.",
    palette: "moss",
  },
];
