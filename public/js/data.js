/* SKIDS Vision — product data */
var FRAME_COLORS = [
  {id:'crystal-blue', name:'Crystal Blue',   hex:'#2b6cb0'},
  {id:'midnight',     name:'Midnight',      hex:'#3a3866'},
  {id:'amber',        name:'Sunbeam Amber', hex:'#e8a04c'},
  {id:'meadow',       name:'Meadow',        hex:'#5a7148'},
  {id:'plum',         name:'Plum',          hex:'#6b2640'},
  {id:'rose',         name:'Dusty Rose',    hex:'#c98a9e'}
];
/* shape path drawn in a 300x240 face coordinate space (used for try-on + card thumbs) */
var FRAMES = [
  {id:'explorer', name:'Explorer', cat:'sporty',  shape:'round-rect', age:'6–12 yrs', price:1499, badge:'Best seller',
   blurb:'Flexible hinges, shatter-resistant lenses — built for the playground.',
   tags:['Flexible hinges','Shatter-resistant','Light 18g'],
   path:'M96 104 q 30 -12 58 4 v 26 h -58 z M204 104 q 30 -12 58 4 v 26 h -58 z M154 122 h 14',
   colors:['crystal-blue','midnight','amber','meadow']},
  {id:'scholar', name:'Scholar', cat:'classic', shape:'rect', age:'8–14 yrs', price:1299, badge:'',
   blurb:'The everyday frame. Lightweight, quietly classic, all-day comfort.',
   tags:['Lightweight','Hypoallergenic tips','Anti-slip'],
   path:'M96 106 h 58 v 26 h -58 z M204 106 h 58 v 26 h -58 z M154 118 h 14',
   colors:['midnight','plum','crystal-blue']},
  {id:'sunbeam', name:'Sunbeam', cat:'playful', shape:'round', age:'4–10 yrs', price:1199, badge:'',
   blurb:'Round, vibrant and cheerful — the frame children actually ask for.',
   tags:['Vibrant','Durable','Flexible bridge'],
   path:'M126 122 a 28 28 0 1 1 .1 0 M232 122 a 28 28 0 1 1 .1 0 M154 120 h 14',
   colors:['amber','rose','meadow']},
  {id:'feather', name:'Feather', cat:'minimal', shape:'wire', age:'8–14 yrs', price:1699, badge:'New',
   blurb:'Ultra-thin titanium wire. Barely-there comfort for sensitive faces.',
   tags:['Titanium','Ultra-thin','Feather 12g'],
   path:'M100 110 h 50 v 22 h -50 z M206 110 h 50 v 22 h -50 z M150 120 h 16',
   colors:['crystal-blue','midnight','rose']},
  {id:'striker', name:'Striker', cat:'sporty', shape:'wrap', age:'6–12 yrs', price:1599, badge:'',
   blurb:'Wrap-fit stability that stays on through every sprint and fall.',
   tags:['Wrap-fit','Impact rated','Sweat-proof'],
   path:'M94 112 h 60 v 20 h -60 z M202 112 h 60 v 20 h -60 z M154 120 h 14',
   colors:['meadow','midnight','crystal-blue']},
  {id:'stargazer', name:'Stargazer', cat:'playful', shape:'cat-eye', age:'6–12 yrs', price:1449, badge:'',
   blurb:'A soft cat-eye lift. Confident colour for a confident small person.',
   tags:['Cat-eye','Spring hinges','Vibrant'],
   path:'M96 110 q 30 -14 58 2 l 0 20 q -30 -12 -58 -2 z M206 110 q 30 -14 -58 2 l 0 20 q 30 -12 58 -2 z',
   colors:['plum','rose','amber']},
  {id:'atlas', name:'Atlas', cat:'classic', shape:'square', age:'10–14 yrs', price:1399, badge:'',
   blurb:'A grown-up square, scaled for teens who want to look older than twelve.',
   tags:['Square','Acetate','Bold'],
   path:'M98 108 h 56 l 6 24 h -62 z M206 108 h 56 l 6 24 h -62 z M160 120 h 14',
   colors:['midnight','plum']},
  {id:'pebble', name:'Pebble', cat:'minimal', shape:'round', age:'4–8 yrs', price:1099, badge:'',
   blurb:'Small faces deserve small frames. Soft, round, nearly invisible weight.',
   tags:['Small fit','Rounded','Bendy temple'],
   path:'M128 122 a 24 24 0 1 1 .1 0 M224 122 a 24 24 0 1 1 .1 0 M152 120 h 20',
   colors:['rose','amber','meadow']}
];
var LENS_OPTIONS = [
  {id:'standard',  name:'Standard clear lenses',        desc:'Included, anti-glare coated', price:0},
  {id:'bluecut',   name:'Blue-cut lenses',              desc:'Filters screen blue light',   price:300},
  {id:'photo',     name:'Photochromic lenses',          desc:'Darken outdoors automatically', price:900},
  {id:'myopiactl', name:'Myopia-control lenses',       desc:'Peripheral defocus design, per clinic plan', price:1500}
];
var CATS = [
  {id:'all', name:'All frames'},
  {id:'sporty', name:'Sporty'},
  {id:'classic', name:'Classic'},
  {id:'playful', name:'Playful'},
  {id:'minimal', name:'Minimal'}
];
var ORDER_STAGES = ['Order placed','AI fitting','In the lab','Dispatched','Delivered'];
