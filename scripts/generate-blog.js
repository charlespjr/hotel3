const fetch = require('node-fetch');
require('dotenv').config();

async function generateBlog() {
  try {
    const response = await fetch('http://localhost:3001/api/generate-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Success:', data.message);
    } else {
      console.error('Error:', data.error);
      console.error('Details:', data.details);
    }
  } catch (error) {
    console.error('Failed to generate blog:', error);
  }
}

generateBlog(); 