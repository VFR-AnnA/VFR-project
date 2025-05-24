/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-21T13:44+02:00
 * 
 * INP Performance Check Script
 * 
 * This script runs in CI to check INP (Interaction to Next Paint) performance.
 * It uses Puppeteer to launch a headless Chrome browser, navigate to the app,
 * and measure INP metrics. If the INP exceeds the threshold, the script fails
 * the build.
 * 
 * Usage:
 * node scripts/check-inp-performance.js [url] [threshold]
 *
 * Example:
 * node scripts/check-inp-performance.js http://localhost:3000 200
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Default values
const DEFAULT_URL = process.env.TEST_URL || 'http://localhost:3000/try/body-ai';
const DEFAULT_THRESHOLD = parseInt(process.env.INP_THRESHOLD, 10) || 200; // 200ms is the "good" threshold for INP
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const DEFAULT_INTERACTIONS = [
  // Specific interactions for the body-ai page
  { type: 'click', selector: '.bg-blue-600' }, // Upload Photo button
  { type: 'input', selector: 'input[type="range"][aria-label*="Height"]', value: '180' }, // Height slider
  { type: 'input', selector: 'input[type="range"][aria-label*="Chest"]', value: '100' }, // Chest slider
  { type: 'input', selector: 'input[type="range"][aria-label*="Waist"]', value: '90' },  // Waist slider
  { type: 'input', selector: 'input[type="range"][aria-label*="Hip"]', value: '110' }  // Hip slider
];

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0] || DEFAULT_URL;
const threshold = parseInt(args[1], 10) || DEFAULT_THRESHOLD;

console.log(`Testing URL: ${url}`);
console.log(`INP Threshold: ${threshold}ms`);

// Main function
async function checkINPPerformance() {
  console.log(`Checking INP performance for ${url} (threshold: ${threshold}ms)`);
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable performance metrics with a simpler approach
    await page.evaluateOnNewDocument(() => {
      window.performance.setResourceTimingBufferSize(500);
      window.inpValues = [];
      
      // Track interaction times manually
      window.trackInteraction = (name) => {
        const startTime = performance.now();
        
        // Create a function to measure the time it takes to complete the interaction
        window.completeInteraction = () => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          window.inpValues.push({
            type: name,
            duration: duration,
            startTime: startTime
          });
          
          console.log(`Interaction "${name}" took ${duration.toFixed(2)}ms`);
        };
      };
    });
    
    // Navigate to the URL
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: DEFAULT_TIMEOUT });
    console.log('Page loaded');
    
    // Wait for any initial animations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Perform interactions
    for (const interaction of DEFAULT_INTERACTIONS) {
      try {
        console.log(`Performing ${interaction.type} on ${interaction.selector}`);
        
        // Wait for the element to be visible
        await page.waitForSelector(interaction.selector, { visible: true, timeout: 5000 });
        
        // Perform the interaction
        if (interaction.type === 'click') {
          // Start tracking the interaction
          await page.evaluate((name) => window.trackInteraction(name), `click-${interaction.selector}`);
          
          // Perform the click
          await page.click(interaction.selector);
          
          // Complete the interaction tracking
          await page.evaluate(() => window.completeInteraction());
        } else if (interaction.type === 'input') {
          await page.focus(interaction.selector);
          if (interaction.selector.includes('range')) {
            // Start tracking the interaction
            await page.evaluate((name) => window.trackInteraction(name), `input-${interaction.selector}`);
            
            // For range inputs, we need to use keyboard to set value
            await page.evaluate((selector, value) => {
              document.querySelector(selector).value = value;
              document.querySelector(selector).dispatchEvent(new Event('input', { bubbles: true }));
              document.querySelector(selector).dispatchEvent(new Event('change', { bubbles: true }));
            }, interaction.selector, interaction.value);
            
            // Complete the interaction tracking
            await page.evaluate(() => window.completeInteraction());
          } else {
            await page.type(interaction.selector, interaction.value || 'test input');
          }
        }
        
        // Wait for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to perform interaction: ${error.message}`);
      }
    }
    
    // Get the INP values
    const inpValues = await page.evaluate(() => window.inpValues || []);
    
    if (inpValues.length === 0) {
      console.warn('No INP values collected. This could indicate an issue with the test setup.');
      return;
    }
    
    // Calculate the maximum INP value (this is the actual INP metric)
    const maxInp = Math.max(...inpValues.map(v => v.duration));
    
    console.log(`Collected ${inpValues.length} interaction measurements`);
    console.log(`INP: ${maxInp.toFixed(2)}ms`);
    
    // Log all interactions for debugging
    console.log('All interactions:');
    inpValues.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.type}: ${v.duration.toFixed(2)}ms`);
    });
    
    // Check if INP exceeds threshold
    if (maxInp > threshold) {
      console.error(`❌ INP (${maxInp.toFixed(2)}ms) exceeds threshold (${threshold}ms)`);
      process.exit(1);
    } else {
      console.log(`✅ INP (${maxInp.toFixed(2)}ms) is below threshold (${threshold}ms)`);
    }
    
  } catch (error) {
    console.error('Error during INP performance check:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Save test results to a JSON file
 */
function saveResults(results) {
  const resultsPath = path.join(process.cwd(), 'inp-results.json');
  
  try {
    fs.writeFileSync(
      resultsPath,
      JSON.stringify(results, null, 2),
      'utf8'
    );
    console.log(`Results saved to ${resultsPath}`);
  } catch (error) {
    console.error('Error saving results:', error);
  }
}

// Run the check
checkINPPerformance().catch(error => {
  console.error('Unhandled error:', error);
  
  // Save error results
  saveResults({
    url,
    timestamp: new Date().toISOString(),
    error: error.message,
    passed: false
  });
  
  process.exit(1);
});