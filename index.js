const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { slug, label, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://chatgpt.com/g/g-68659216a67c8191a91604afe44e6655-brightgift-image-generator', { waitUntil: 'networkidle2' });

    // TODO: Automate login if needed

    // Type the prompt into the chat input
    await page.waitForSelector('textarea');
    await page.type('textarea', prompt);
    await page.keyboard.press('Enter');

    // Wait for images to appear (adjust selector as needed)
    await page.waitForSelector('img', { timeout: 20000 }); // Wait up to 20s for at least one image

    // Extract all image URLs (customize selector if needed)
    const imageUrls = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map(img => img.src)
    );

    await browser.close();
    res.json({ success: true, message: 'Prompt sent to GPT', slug, label, prompt, imageUrls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Puppeteer error', details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Puppeteer server running on port ${port}`)); 