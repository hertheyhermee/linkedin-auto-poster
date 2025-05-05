require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

module.exports = async function postToLinkedIn({ content, imagePath }) {
  console.log('Starting LinkedIn post process...');
  const browser = await chromium.launch({ 
    headless: true, // Set to true for production
    slowMo: 50 // Slow down operations to appear more human-like
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Navigate to LinkedIn login
    console.log('Navigating to LinkedIn login...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });
    
    // Fill in login credentials
    console.log('Filling login credentials...');
    await page.fill('#username', process.env.LINKEDIN_EMAIL);
    await page.fill('#password', process.env.LINKEDIN_PASSWORD);
    
    // Click login button
    console.log('Submitting login...');
    await page.click('[type="submit"]');
    
    // Wait for navigation with a longer timeout
    console.log('Waiting for login to complete...');
    await page.waitForNavigation({ timeout: 100000, waitUntil: 'networkidle' });
    
    // Navigate to feed and wait for it to load
    console.log('Navigating to feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle' });
    
    // Wait for the feed to be fully loaded
    console.log('Waiting for feed to load...');
    await page.waitForTimeout(10000); // Give extra time for the feed to load
    
    // Use robust text selector for the share button
    console.log('Looking for share button...');
    const shareButton = await page.waitForSelector('button:has-text("Start a post")', { timeout: 15000 });
    if (!shareButton) {
      throw new Error('Could not find the "Start a post" button.');
    }
    await shareButton.scrollIntoViewIfNeeded();
    console.log('Clicking share button...');
    await shareButton.click();
    
    // Wait for the post modal to appear
    console.log('Waiting for post modal...');
    await page.waitForSelector('div[role="textbox"]', { timeout: 60000 });
    
    // Type the content
    console.log('Typing content...');
    const textbox = await page.$('div[role="textbox"]');
    await textbox.fill(content);
    
    // Upload image if provided
    if (imagePath) {
      console.log('Uploading image...');
      // Click the image icon (may need to update selector if LinkedIn changes UI)
      await page.click('button[aria-label="Add a photo"]');
      // Wait for file input to appear
      const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
      // Set the file to upload
      await fileInput.setInputFiles(path.resolve(imagePath));
      // Wait for image to upload (may need to adjust timeout)
      await page.waitForTimeout(5000);
    }
    
    // Try different selectors for the post button
    console.log('Looking for post button...');
    const postButtonSelectors = [
      'button.share-actions__primary-action',
      'button#ember842',
      'button[data-control-name="share.post"]',
      'button[aria-label="Post"]'
    ];
    
    let postButton = null;
    for (const selector of postButtonSelectors) {
      try {
        postButton = await page.waitForSelector(selector, { timeout: 5000 });
        if (postButton) break;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!postButton) {
      throw new Error('Could not find post button with any selector');
    }
    
    console.log('Clicking post button...');
    await postButton.click();
    
    // Wait for post to complete
    console.log('Waiting for post to complete...');
    await page.waitForTimeout(10000); // Wait 10 seconds
    
    console.log('Post completed successfully!');
    return true;
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    return false;
  } finally {
    await browser.close();
  }
};
