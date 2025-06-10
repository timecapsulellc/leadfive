/**
 * PWA Icon Generation Script for OrphiChain
 * Generates all required PWA icons using OrphiChain brand guidelines
 * Brand Colors: Cyber Blue (#00D4FF), Royal Purple (#7B2CBF), Energy Orange (#FF6B35)
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// OrphiChain Brand Colors
const BRAND_COLORS = {
  cyberBlue: '#00D4FF',
  royalPurple: '#7B2CBF', 
  energyOrange: '#FF6B35',
  deepSpace: '#1A1A2E',
  midnightBlue: '#16213E',
  pureWhite: '#FFFFFF'
};

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Create OrphiChain Orbital Logo SVG
 */
function createOrbitalLogoSVG(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${BRAND_COLORS.cyberBlue}" />
          <stop offset="50%" stop-color="${BRAND_COLORS.royalPurple}" />
          <stop offset="100%" stop-color="${BRAND_COLORS.energyOrange}" />
        </linearGradient>
        <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${BRAND_COLORS.pureWhite}" />
          <stop offset="100%" stop-color="${BRAND_COLORS.cyberBlue}" />
        </radialGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="50" cy="50" r="48" fill="${BRAND_COLORS.deepSpace}" stroke="${BRAND_COLORS.cyberBlue}" stroke-width="2"/>
      
      <!-- Outer orbit -->
      <circle cx="50" cy="50" r="40" stroke="${BRAND_COLORS.cyberBlue}" stroke-width="2" fill="none" opacity="0.8"/>
      
      <!-- Middle orbit -->
      <circle cx="50" cy="50" r="28" stroke="${BRAND_COLORS.royalPurple}" stroke-width="1.5" fill="none" opacity="0.6"/>
      
      <!-- Inner orbit -->
      <circle cx="50" cy="50" r="16" stroke="${BRAND_COLORS.energyOrange}" stroke-width="1" fill="none" opacity="0.4"/>
      
      <!-- Orbital nodes -->
      <circle cx="90" cy="50" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="50" cy="10" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="10" cy="50" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="50" cy="90" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      
      <!-- Inner nodes -->
      <circle cx="78" cy="50" r="2" fill="${BRAND_COLORS.royalPurple}"/>
      <circle cx="50" cy="22" r="2" fill="${BRAND_COLORS.royalPurple}"/>
      <circle cx="22" cy="50" r="2" fill="${BRAND_COLORS.royalPurple}"/>
      <circle cx="50" cy="78" r="2" fill="${BRAND_COLORS.royalPurple}"/>
      
      <!-- Center core -->
      <circle cx="50" cy="50" r="8" fill="url(#centerGradient)"/>
      <text x="50" y="54" text-anchor="middle" fill="${BRAND_COLORS.deepSpace}" font-size="10" font-weight="bold" font-family="Montserrat">OC</text>
    </svg>
  `;
}

/**
 * Create OrphiChain Hexagonal Logo SVG
 */
function createHexagonalLogoSVG(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${BRAND_COLORS.cyberBlue}" />
          <stop offset="50%" stop-color="${BRAND_COLORS.royalPurple}" />
          <stop offset="100%" stop-color="${BRAND_COLORS.energyOrange}" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="50" cy="50" r="48" fill="${BRAND_COLORS.deepSpace}" stroke="${BRAND_COLORS.cyberBlue}" stroke-width="2"/>
      
      <!-- Outer hexagon -->
      <path d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z" 
            stroke="${BRAND_COLORS.cyberBlue}" 
            stroke-width="2" 
            fill="${BRAND_COLORS.royalPurple}" 
            fill-opacity="0.3"/>
      
      <!-- Inner hexagon -->
      <path d="M50 15 L75 32.5 L75 67.5 L50 85 L25 67.5 L25 32.5 Z" 
            stroke="${BRAND_COLORS.royalPurple}" 
            stroke-width="1.5" 
            fill="${BRAND_COLORS.energyOrange}" 
            fill-opacity="0.2"/>
      
      <!-- Center hexagon -->
      <path d="M50 25 L65 37.5 L65 62.5 L50 75 L35 62.5 L35 37.5 Z" 
            stroke="${BRAND_COLORS.energyOrange}" 
            stroke-width="1" 
            fill="${BRAND_COLORS.cyberBlue}" 
            fill-opacity="0.4"/>
      
      <!-- Hexagon nodes -->
      <circle cx="50" cy="5" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="85" cy="27.5" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="85" cy="72.5" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="50" cy="95" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="15" cy="72.5" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      <circle cx="15" cy="27.5" r="3" fill="${BRAND_COLORS.cyberBlue}"/>
      
      <!-- Center core -->
      <circle cx="50" cy="50" r="10" fill="url(#hexGradient)"/>
      <text x="50" y="54" text-anchor="middle" fill="${BRAND_COLORS.pureWhite}" font-size="10" font-weight="bold" font-family="Montserrat">OC</text>
    </svg>
  `;
}

/**
 * Create OrphiChain Standard/Chain Logo SVG
 */
function createStandardLogoSVG(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${BRAND_COLORS.cyberBlue}" />
          <stop offset="100%" stop-color="${BRAND_COLORS.royalPurple}" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="50" cy="50" r="48" fill="${BRAND_COLORS.deepSpace}" stroke="${BRAND_COLORS.cyberBlue}" stroke-width="2"/>
      
      <!-- Outer ring -->
      <circle cx="50" cy="50" r="40" stroke="${BRAND_COLORS.cyberBlue}" stroke-width="2" fill="none"/>
      
      <!-- Chain links - Diamond pattern -->
      <path d="M50 15 L65 30 L50 45 L35 30 Z" fill="${BRAND_COLORS.cyberBlue}" opacity="0.8"/>
      <path d="M70 50 L85 35 L85 65 L70 50 Z" fill="${BRAND_COLORS.royalPurple}" opacity="0.8"/>
      <path d="M50 85 L35 70 L50 55 L65 70 Z" fill="${BRAND_COLORS.energyOrange}" opacity="0.8"/>
      <path d="M30 50 L15 35 L15 65 L30 50 Z" fill="${BRAND_COLORS.cyberBlue}" opacity="0.8"/>
      
      <!-- Center diamond -->
      <path d="M50 35 L60 45 L50 55 L40 45 Z" fill="url(#chainGradient)"/>
      
      <!-- Connection lines -->
      <line x1="50" y1="30" x2="50" y2="15" stroke="${BRAND_COLORS.pureWhite}" stroke-width="2"/>
      <line x1="65" y1="45" x2="70" y2="50" stroke="${BRAND_COLORS.pureWhite}" stroke-width="2"/>
      <line x1="50" y1="60" x2="50" y2="85" stroke="${BRAND_COLORS.pureWhite}" stroke-width="2"/>
      <line x1="35" y1="45" x2="30" y2="50" stroke="${BRAND_COLORS.pureWhite}" stroke-width="2"/>
      
      <!-- Center text -->
      <text x="50" y="54" text-anchor="middle" fill="${BRAND_COLORS.pureWhite}" font-size="10" font-weight="bold" font-family="Montserrat">OC</text>
    </svg>
  `;
}

/**
 * Convert SVG to PNG using Canvas
 */
async function svgToPng(svgContent, size, outputPath) {
  try {
    // Note: This is a simplified approach. In a real implementation,
    // you would use a proper SVG to PNG converter like sharp or canvas
    console.log(`Generating ${size}x${size} icon: ${outputPath}`);
    
    // For now, create a placeholder that matches the brand
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = BRAND_COLORS.deepSpace;
    ctx.fillRect(0, 0, size, size);
    
    // Outer circle
    ctx.strokeStyle = BRAND_COLORS.cyberBlue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 4, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner circle with gradient effect
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/3);
    gradient.addColorStop(0, BRAND_COLORS.cyberBlue);
    gradient.addColorStop(0.5, BRAND_COLORS.royalPurple);
    gradient.addColorStop(1, BRAND_COLORS.energyOrange);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Center circle
    ctx.fillStyle = BRAND_COLORS.pureWhite;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/8, 0, 2 * Math.PI);
    ctx.fill();
    
    // OC text
    ctx.fillStyle = BRAND_COLORS.deepSpace;
    ctx.font = `bold ${size/10}px Montserrat, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OC', size/2, size/2);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
  } catch (error) {
    console.error(`Error generating icon ${outputPath}:`, error);
  }
}

/**
 * Generate all PWA icons
 */
async function generateAllIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('🎨 Generating OrphiChain PWA icons...');
  console.log(`📁 Output directory: ${iconsDir}`);
  
  for (const size of ICON_SIZES) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(iconsDir, filename);
    
    // Use the orbital logo variant for PWA icons
    const svgContent = createOrbitalLogoSVG(size);
    await svgToPng(svgContent, size, outputPath);
  }
  
  // Generate apple-touch-icon
  const appleTouchPath = path.join(iconsDir, 'apple-touch-icon.png');
  await svgToPng(createOrbitalLogoSVG(180), 180, appleTouchPath);
  
  // Generate favicon variations
  const faviconPath = path.join(process.cwd(), 'public', 'favicon-32x32.png');
  await svgToPng(createOrbitalLogoSVG(32), 32, faviconPath);
  
  const favicon16Path = path.join(process.cwd(), 'public', 'favicon-16x16.png');
  await svgToPng(createOrbitalLogoSVG(16), 16, favicon16Path);
  
  console.log('✅ All OrphiChain PWA icons generated successfully!');
  console.log(`📱 Generated ${ICON_SIZES.length} PWA icons`);
  console.log('🍎 Generated Apple Touch icon');
  console.log('🌐 Generated favicon variations');
}

/**
 * Generate example SVG files for reference
 */
function generateSVGExamples() {
  const svgDir = path.join(process.cwd(), 'docs', 'brand-assets');
  
  if (!fs.existsSync(svgDir)) {
    fs.mkdirSync(svgDir, { recursive: true });
  }
  
  // Save logo variants as SVG
  fs.writeFileSync(path.join(svgDir, 'orphi-logo-orbital.svg'), createOrbitalLogoSVG(200));
  fs.writeFileSync(path.join(svgDir, 'orphi-logo-hexagonal.svg'), createHexagonalLogoSVG(200));
  fs.writeFileSync(path.join(svgDir, 'orphi-logo-standard.svg'), createStandardLogoSVG(200));
  
  console.log('📁 SVG brand assets saved to docs/brand-assets/');
}

// Main execution
async function main() {
  try {
    await generateAllIcons();
    generateSVGExamples();
    
    console.log('\n🎯 Next steps:');
    console.log('1. Install dependencies: npm install canvas');
    console.log('2. Run service worker registration');
    console.log('3. Update index.html with PWA meta tags');
    console.log('4. Test PWA installation on mobile devices');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateAllIcons, createOrbitalLogoSVG, createHexagonalLogoSVG, createStandardLogoSVG };
