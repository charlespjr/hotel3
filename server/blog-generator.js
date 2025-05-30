const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const blogTopics = [
  {
    title: "How to Book a Hotel Without a Credit Card",
    slug: "book-hotel-without-credit-card",
    keywords: ["hotel booking", "no credit card", "alternative payment", "hotel reservation"]
  },
  {
    title: "Best Time to Book Hotels for Maximum Savings",
    slug: "best-time-to-book-hotels",
    keywords: ["hotel deals", "booking timing", "savings tips", "hotel discounts"]
  },
  {
    title: "Hotel Booking Tips for First-Time Travelers",
    slug: "hotel-booking-tips-first-time-travelers",
    keywords: ["first time travel", "hotel booking guide", "travel tips", "accommodation"]
  },
  {
    title: "How to Find Pet-Friendly Hotels",
    slug: "find-pet-friendly-hotels",
    keywords: ["pet friendly", "hotel with pets", "travel with pets", "pet accommodation"]
  },
  {
    title: "Understanding Hotel Room Types and Amenities",
    slug: "hotel-room-types-amenities",
    keywords: ["hotel rooms", "room types", "hotel amenities", "accommodation options"]
  }
];

async function generateArticle(topic) {
  const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic.title}". 
  Include relevant information about ${topic.keywords.join(', ')}. 
  The article should be well-structured with headings, subheadings, and bullet points where appropriate.
  Include practical tips and advice. Make it engaging and informative.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional travel writer specializing in hotel accommodations and travel tips."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    return generateHTML(topic, content);
  } catch (error) {
    console.error(`Error generating article for ${topic.title}:`, error);
    throw error;
  }
}

function generateHTML(topic, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic.title} - Hotel Booking Guide</title>
    <meta name="description" content="Learn everything about ${topic.title.toLowerCase()}. Expert tips and advice for hotel bookings.">
    <meta name="keywords" content="${topic.keywords.join(', ')}">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
        </nav>
    </header>
    <main>
        <article>
            <h1>${topic.title}</h1>
            <div class="content">
                ${content}
            </div>
        </article>
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} Hotel Booking Guide. All rights reserved.</p>
    </footer>
</body>
</html>`;
}

async function generateSitemap(articles) {
  const baseUrl = process.env.BASE_URL || 'https://yourdomain.com';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${articles.map(article => `
    <url>
        <loc>${baseUrl}/blog/${article.slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

  await fs.writeFile(path.join(__dirname, '../client/sitemap.xml'), sitemap);
}

async function generateAllArticles() {
  try {
    console.log('Starting bulk article generation...');
    
    // Create blog directory if it doesn't exist
    const blogDir = path.join(__dirname, '../client/blog');
    await fs.mkdir(blogDir, { recursive: true });

    // Generate all articles
    for (const topic of blogTopics) {
      console.log(`Generating article: ${topic.title}`);
      const html = await generateArticle(topic);
      const filePath = path.join(blogDir, `${topic.slug}.html`);
      await fs.writeFile(filePath, html);
      console.log(`Saved article: ${topic.slug}.html`);
    }

    // Generate sitemap
    console.log('Generating sitemap...');
    await generateSitemap(blogTopics);
    console.log('Sitemap generated successfully');

    console.log('All articles and sitemap generated successfully!');
  } catch (error) {
    console.error('Error in bulk article generation:', error);
    throw error;
  }
}

module.exports = {
  generateAllArticles,
  blogTopics
}; 