// Export 16 Phosphor icons as SVGs for use in Astro
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const iconNames = [
  'DeviceMobile',   // Tech/Electronics
  'Book',           // Books
  'TShirt',         // Fashion/Apparel
  'House',          // Home/Decor
  'Tree',           // Outdoor/Gear
  'CookingPot',     // Kitchen/Food
  'PuzzlePiece',    // Toys/Games
  'Flower',         // Beauty/Personal, Gardening/Plant
  'SoccerBall',     // Sports
  'PawPrint',       // Pets
  'Baby',           // Baby
  'Car',            // Automotive
  'Briefcase',      // Office/Work
  'MusicNote',      // Music
  'Heartbeat',      // Health/Wellness
  'ShoppingBag',    // Generic/Other
  'BeerBottle',     // Beverages
  'Pencil',         // Stationery
  'Package',        // Subscription Box
  'Wrench',         // DIY
  'Smiley',         // Humor
  // New icons for additional categories
  'Diamond',        // Jewelry
  'PaintBrush',     // Art Supplies
  'Sparkle',        // Beauty/Makeup
  'Backpack',       // Outdoor Gear
  'Shield',         // Safety Gear (alternative to Helmet)
  'Scissors',       // Craft
  'Palette',        // Art & Design
  'FilmSlate',      // Film Gear
  'Lamp',           // Lighting
  'Note',           // Stationary
  'Ticket',         // Entertainment
  'FrameCorners'    // Decor
];
const icons = require('phosphor-react');

const outputDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const color = '#1C2E4A'; // Brand color for icons
const size = 80;

for (const name of iconNames) {
  const Icon = icons[name];
  if (!Icon) {
    console.warn(`Icon not found: ${name}`);
    continue;
  }
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { size, weight: 'duotone', color })
  );
  fs.writeFileSync(path.join(outputDir, `${name}.svg`), svg);
  console.log(`Exported ${name}.svg`);
} 