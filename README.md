# Age Calculator

A free, privacy-respecting online age calculator that computes your exact age in years, months, days, hours, minutes, and seconds. Also provides zodiac signs, generation info, birthstone, planet ages, and more.

## Features

- **Exact Age Calculation**: Calculate your precise age in years, months, and days
- **Time Breakdown**: View total days, weeks, hours, minutes, and seconds lived
- **Astrology Info**: Western zodiac sign, Chinese zodiac, birthstone, and birth flower
- **Life Information**: Generation label, life stage, and retirement year estimate
- **Fun Facts**: Dog and cat age equivalents, estimated heartbeats and breaths
- **Planet Ages**: See how old you are on Mercury, Venus, Mars, Jupiter, and Saturn
- **100% Private**: All calculations run in your browser - no data is sent to any server
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom styling with CSS variables for theming
- **Vanilla JavaScript**: No frameworks - pure JavaScript for calculations
- **Vite**: Build tool for development and production bundling

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HeyitsSridhar/Age-Caluclator.git
cd Age-Caluclator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Project Structure

```
Age-Caluclator/
├── public/           # Static assets (logo, favicon)
├── src/              # Source files
│   ├── main.js      # JavaScript logic
│   └── styles.css   # Styling
├── index.html       # Main HTML file
├── vite.config.js   # Vite configuration
└── package.json     # Project dependencies
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. The workflow builds the project and deploys it to GitHub Pages on every push to the main branch.

### Manual Deployment

To deploy manually:
1. Build the project: `npm run build`
2. Upload the contents of the `dist/` folder to your hosting provider

## Privacy

This calculator is 100% client-side. No personal data is ever sent to a server. All calculations happen directly in your web browser.

## License

This project is open source and available under the MIT License.

## Live Demo

Visit the live site at: https://heyitsSridhar.github.io/Age-Caluclator/
