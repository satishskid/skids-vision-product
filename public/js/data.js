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
