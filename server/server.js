const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const liteApi = require("liteapi-node-sdk");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
// Load environment variables from .env file
// Ensure you have a .env file in the root directory with:
// PROD_API_KEY=your_lite_api_key_here
// DEEPSEEK_API_KEY=your_deepseek_api_key_here
// FRONTEND_URL=http://localhost:your_frontend_port (if applicable for CORS in dev)
require("dotenv").config();
console.log("Environment variables loaded:", {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? "Present" : "Missing",
  PROD_API_KEY: process.env.PROD_API_KEY ? "Present" : "Missing",
  FRONTEND_URL: process.env.FRONTEND_URL || "Not set",
  BASE_URL: process.env.BASE_URL || "Not set"
});
const { sendBookingConfirmation } = require('./email');
const { generateAllArticles, generateArticle, blogTopics, generateHTML } = require('./blog-generator');
const OpenAI = require('openai');

// Initialize DeepSeek OpenAI client
const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
let openaiClient;
if (deepSeekApiKey) {
  openaiClient = new OpenAI({
    apiKey: deepSeekApiKey,
    baseURL: 'https://api.deepseek.com/v1', // Or 'https://api.deepseek.com'
  });
  console.log("DeepSeek OpenAI client initialized.");
} else {
  console.warn("DEEPSEEK_API_KEY not found in .env. DeepSeek client not initialized.");
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Add blog posts endpoint
app.get('/api/blog-posts', (req, res) => {
    try {
        const blogDir = path.join(__dirname, '../client/blog');
        const files = fs.readdirSync(blogDir);
        const blogPosts = files.filter(file => file.endsWith('.html'));
        res.json(blogPosts);
    } catch (error) {
        console.error('Error reading blog posts:', error);
        res.status(500).json({ error: 'Failed to load blog posts' });
    }
});

// Serve individual blog posts
app.get('/blog/:post', (req, res) => {
    const postFile = req.params.post;
    const blogDir = path.join(__dirname, '../client/blog');
    const postPath = path.join(blogDir, postFile);
    
    if (fs.existsSync(postPath)) {
        res.sendFile(postPath);
    } else {
        res.status(404).send('Blog post not found');
    }
});

const apiKey = process.env.PROD_API_KEY;

// Log API key status
console.log("API Key configured:", apiKey ? "Present" : "Missing");

app.use(bodyParser.json());

// Prefix all API routes with /api

/**
 * Fetches hotel list from LITE API based on city/country,
 * then gets full rates for these hotels based on checkin, checkout, and adults.
 * @param {object} searchParams - Contains city, countryCode, checkin, checkout, adults.
 * @returns {Promise<object>} Object containing rates array or empty if not found/error.
 */
async function fetchHotelsAndRates(searchParams) {
  const { city, countryCode, checkin, checkout, adults } = searchParams;
  console.log("Refactored search: Searching hotels with params:", { countryCode, city, checkin, checkout, adults });
  const apiKey = process.env.PROD_API_KEY; // Ensure this is accessible
  if (!apiKey) {
    throw new Error("LITE_API_KEY (PROD_API_KEY) missing");
  }
  const sdk = liteApi(apiKey);

  try {
    const hotelListResponse = await sdk.getHotels(countryCode, city, 0, 10); // Limit to 10 for now
    if (!hotelListResponse || !hotelListResponse.data || !Array.isArray(hotelListResponse.data)) {
      console.error("Invalid hotel list response from LITE API:", hotelListResponse);
      return { rates: [] }; // Or throw specific error
    }
    const hotelsData = hotelListResponse.data;
    if (hotelsData.length === 0) {
      console.log("No hotels found by LITE API for the given criteria.");
      return { rates: [] };
    }
    const hotelIds = hotelsData.map((hotel) => hotel.id);
    const ratesResponse = await sdk.getFullRates({
      hotelIds: hotelIds,
      occupancies: [{ adults: parseInt(adults, 10) }],
      currency: "USD", // Or make configurable
      guestNationality: "US", // Or make configurable
      checkin: checkin,
      checkout: checkout,
    });
    if (!ratesResponse || !ratesResponse.data) {
      console.error("Invalid rates response from LITE API:", ratesResponse);
      return { rates: [] }; // Or throw specific error
    }
    const ratesData = ratesResponse.data;
    ratesData.forEach((rate) => {
      rate.hotel = hotelsData.find((hotel) => hotel.id === rate.hotelId);
    });
    return { rates: ratesData };
  } catch (error) {
    console.error("Error in fetchHotelsAndRates:", error);
    throw error; // Re-throw to be caught by caller
  }
}

app.get("/api/search-hotels", async (req, res) => {
  console.log("Search endpoint hit via GET");
  const { checkin, checkout, adults, city, countryCode } = req.query;
  try {
    const result = await fetchHotelsAndRates({ city, countryCode, checkin, checkout, adults });
    res.json(result);
  } catch (error) {
    console.error("Error in /api/search-hotels GET endpoint:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.get("/api/search-rates", async (req, res) => {
  console.log("Rate endpoint hit");
  const { checkin, checkout, adults, hotelId } = req.query;
  const sdk = liteApi(apiKey);

  try {
    // Fetch rates only for the specified hotel
    const rates = (
      await sdk.getFullRates({
        hotelIds: [hotelId],
        occupancies: [{ adults: parseInt(adults, 10) }],
        currency: "USD",
        guestNationality: "US",
        checkin: checkin,
        checkout: checkout,
      })
    ).data;

    // Fetch hotel details
    const hotelsResponse = await sdk.getHotelDetails(hotelId);
    const hotelInfo = hotelsResponse.data;

    // Prepare the response data
    const rateInfo = rates.map((hotel) =>
      hotel.roomTypes.flatMap((roomType) => {
        // Define the board types we're interested in
        const boardTypes = ["RO", "BI"];

        // Filter rates by board type and sort by refundable tag
        return boardTypes
          .map((boardType) => {
            const filteredRates = roomType.rates.filter((rate) => rate.boardType === boardType);

            // Sort to prioritize 'RFN' over 'NRFN'
            const sortedRates = filteredRates.sort((a, b) => {
              if (
                a.cancellationPolicies.refundableTag === "RFN" &&
                b.cancellationPolicies.refundableTag !== "RFN"
              ) {
                return -1; // a before b
              } else if (
                b.cancellationPolicies.refundableTag === "RFN" &&
                a.cancellationPolicies.refundableTag !== "RFN"
              ) {
                return 1; // b before a
              }
              return 0; // no change in order
            });

            // Return the first rate meeting the criteria if it exists
            if (sortedRates.length > 0) {
              const rate = sortedRates[0];
              return {
                rateName: rate.name,
                offerId: roomType.offerId,
                board: rate.boardName,
                refundableTag: rate.cancellationPolicies.refundableTag,
                retailRate: rate.retailRate.total[0].amount,
                originalRate: rate.retailRate.suggestedSellingPrice[0].amount,
              };
            }
            return null; // or some default object if no rates meet the criteria
          })
          .filter((rate) => rate !== null); // Filter out null values if no rates meet the criteria
      })
    );
    res.json({ hotelInfo, rateInfo });
  } catch (error) {
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: "No availability found" });
  }
});

app.post("/api/prebook", async (req, res) => {
  //console.log(req.body);
  const { rateId, voucherCode } = req.body;
  const sdk = liteApi(apiKey);
  //console.log(apiKey, "apiKey");
  const bodyData = {
    offerId: rateId,
    usePaymentSdk: true,
  };

  // Conditionally add the voucherCode if it exists in the request body
  if (voucherCode) {
    bodyData.voucherCode = voucherCode;
  }

  try {
    // Call the SDK's prebook method and handle the response
    sdk
      .preBook(bodyData)
      .then((response) => {
        res.json({ success: response }); // Send response back to the client
      })
      .catch((err) => {
        console.error("Error:", err); // Print the error if any
        res.status(500).json({ error: "Internal Server Error" }); // Send error response
      });
  } catch (err) {
    console.error(" Prebook error:", err); // Handle errors related to SDK usage
    res.status(500).json({ error: "Internal Server Error" }); // Send error response
  }
});

app.get("/api/book", (req, res) => {
  console.log(req.query);
  const { prebookId, guestFirstName, guestLastName, guestEmail, transactionId } =
    req.query;

  const sdk = liteApi(apiKey);

	// Prepare the booking data
  const bodyData = {
    holder: {
      firstName: guestFirstName,
      lastName: guestLastName,
      email: guestEmail,
    },
    payment: {
      method: "TRANSACTION_ID",
      transactionId: transactionId,
    },
    prebookId: prebookId,
    guests: [
      {
        occupancyNumber: 1,
        remarks: "",
        firstName: guestFirstName,
        lastName: guestLastName,
        email: guestEmail,
      },
    ],
  };

  console.log(bodyData);

  sdk
    .book(bodyData)
    .then(async (data) => {
      if (!data || data.error) {
        throw new Error(
          "Error in booking data: " + (data.error ? data.error.message : "Unknown error")
        );
      }

      // Send booking confirmation email
      try {
        const emailHtml = `
          <h1>Booking Confirmation</h1>
          <p>Thank you for booking with AureaVibe!</p>
          <p><strong>Booking ID:</strong> ${data.data.bookingId}</p>
          <p><strong>Hotel:</strong> ${data.data.hotel.name}</p>
          <p><strong>Check-in:</strong> ${data.data.checkin}</p>
          <p><strong>Check-out:</strong> ${data.data.checkout}</p>
          <p><strong>Status:</strong> ${data.data.status}</p>
          <p>If you have any questions, reply to this email or contact our support team.</p>
        `;
        await sendBookingConfirmation(
          guestEmail,
          'Your Hotel Booking Confirmation',
          emailHtml
        );
        console.log('Booking confirmation email sent to', guestEmail);
      } catch (emailErr) {
        console.error('Failed to send booking confirmation email:', emailErr);
      }

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h1 {
                    color: #333;
                }
                .booking-details, .room-details, .policy-details {
                    margin-bottom: 20px;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .header {
                    font-weight: bold;
                    color: #444;
                }
            </style>
        </head>
        <body>
            <h1>Booking Confirmation</h1>
            <div class="booking-details">
                <div class="header">Booking Information:</div>
                <p>Booking ID: ${data.data.bookingId}</p>
                <p>Supplier Name: ${data.data.supplierBookingName} (${data.data.supplier})</p>
                <p>Status: ${data.data.status}</p>
                <p>Check-in: ${data.data.checkin}</p>
                <p>Check-out: ${data.data.checkout}</p>
                <p>Hotel: ${data.data.hotel.name} (ID: ${data.data.hotel.hotelId})</p>
            </div>

            <div class="room-details">
                <div class="header">Room Details:</div>
                <p>Room Type: ${data.data.bookedRooms[0].roomType.name}</p>
                <p>Rate (Total): $${data.data.bookedRooms[0].rate.retailRate.total.amount} ${
                data.data.bookedRooms[0].rate.retailRate.total.currency
              }</p>
                <p>Occupancy: ${data.data.bookedRooms[0].adults} Adult(s), ${
                data.data.bookedRooms[0].children
              } Child(ren)</p>
                <p>Guest Name: ${data.data.bookedRooms[0].firstName} ${
                data.data.bookedRooms[0].lastName
              }</p>
            </div>
        <div class="policy-details">
            <div class="header">Cancellation Policy:</div>
            <p>Cancel By: ${
              data.data.cancellationPolicies &&
              data.data.cancellationPolicies.cancelPolicyInfos &&
              data.data.cancellationPolicies.cancelPolicyInfos[0]
                ? data.data.cancellationPolicies.cancelPolicyInfos[0].cancelTime
                : "Not specified"
            }</p>
            <p>Cancellation Fee: ${
              data.data.cancellationPolicies &&
              data.data.cancellationPolicies.cancelPolicyInfos &&
              data.data.cancellationPolicies.cancelPolicyInfos[0]
                ? `$${data.data.cancellationPolicies.cancelPolicyInfos[0].amount}`
                : "Not specified"
            }</p>
            <p>Remarks: ${data.data.remarks || "No additional remarks."}</p>
        </div>

            <a href="/"><button>Back to Hotels</button></a>
        </body>
        </html>
      `);
    })
    .catch((err) => {
      console.error("Error during booking:", err);
      res.status(500).send(`Failed to book: ${err.message}`);
    });
});

// Serve sitemap.xml with correct content type
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, '../client/sitemap.xml'));
});

// New Chatbot API endpoint
app.post("/api/chatbot/converse", async (req, res) => {
  const { message, history = [] } = req.body;

  if (!openaiClient) {
    return res.status(500).json({ reply: "Chatbot is not configured (missing API key)." });
  }

  // System prompt to guide the DeepSeek model
  // It instructs the model on its role, required parameters for hotel search,
  // and how/when to use the 'get_hotel_availability' function.
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant for booking hotels. Your goal is to gather necessary information (city, countryCode, check-in date, check-out date, and number of adults) from the user to search for hotels. If any of these details are missing, ask the user for them. Once you have all details, use the 'get_hotel_availability' function. Do not make up information if the user asks for something you don't know; instead, say you don't know or ask them to clarify. Dates should be in YYYY-MM-DD format."
    },
    ...history, // Spread previous messages
    { role: "user", content: message }
  ];

  // Define the tool(s) that the DeepSeek model can request to call.
  // 'get_hotel_availability' allows the model to ask our server to fetch hotel data.
  const tools = [
    {
      type: "function",
      function: {
        name: "get_hotel_availability",
        description: "Get hotel availability and rates based on user criteria.",
        parameters: {
          type: "object",
          properties: {
            city: { type: "string", description: "The city for the hotel search, e.g., London" },
            countryCode: { type: "string", description: "The ISO-2 country code for the city, e.g., GB for United Kingdom. Infer this if possible from the city or ask the user." },
            checkin: { type: "string", description: "Check-in date in YYYY-MM-DD format." },
            checkout: { type: "string", description: "Check-out date in YYYY-MM-DD format." },
            adults: { type: "integer", description: "Number of adults." }
          },
          required: ["city", "countryCode", "checkin", "checkout", "adults"]
        }
      }
    }
  ];

  try {
    console.log("Sending to DeepSeek:", JSON.stringify(messages, null, 2));
    // First call to DeepSeek: send conversation history and user message,
    // allowing the model to either respond directly or request a tool call.
    const deepSeekResponse = await openaiClient.chat.completions.create({
      model: "deepseek-chat", // Or "deepseek-reasoner"
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = deepSeekResponse.choices[0].message;
    console.log("Received from DeepSeek:", JSON.stringify(responseMessage, null, 2));

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      if (toolCall.function.name === "get_hotel_availability") {
        // DeepSeek requested to call our 'get_hotel_availability' function.
        // Extract arguments provided by DeepSeek.
        const args = JSON.parse(toolCall.function.arguments);
        console.log("DeepSeek requested tool call: get_hotel_availability with args:", args);

        // Call our internal LITE API hotel search function.
        const hotelResults = await fetchHotelsAndRates(args);

        // Add DeepSeek's message (requesting tool call) to history
        messages.push(responseMessage);

        if (hotelResults.rates && hotelResults.rates.length > 0) {
          let hotelSummaryText = "Okay, I found some hotels for you:\n";
          hotelResults.rates.slice(0, 3).forEach(rate => {
             hotelSummaryText += `- ${rate.hotel.name} (ID: ${rate.hotel.id})\n`;
          });
          if (hotelResults.rates.length > 3) {
             hotelSummaryText += "And a few more. Ask for details on any hotel by its ID or name if you're interested!\n";
          }

          messages.push({
             role: "tool",
             tool_call_id: toolCall.id,
             name: toolCall.function.name,
             // Send summary for DeepSeek to use in its response, not the full hotel data
             content: JSON.stringify(hotelResults.rates.slice(0,3).map(r => ({id: r.hotel.id, name: r.hotel.name, city: r.hotel.city, country: r.hotel.countryCode })))
          });

          // Send the tool's execution results back to DeepSeek.
          // This allows DeepSeek to formulate a natural language response based on the hotel data found (or not found).
          const followupResponse = await openaiClient.chat.completions.create({
              model: "deepseek-chat",
              messages: messages,
          });
          console.log("DeepSeek followup response:", JSON.stringify(followupResponse.choices[0].message, null, 2));
          // Add DeepSeek's final response to history for the next turn
          // The final reply to the client comes from this follow-up response.
          messages.push(followupResponse.choices[0].message);
          res.json({ reply: followupResponse.choices[0].message.content, hotel_data: hotelResults.rates, is_hotel_list: true, history: messages });

        } else {
          messages.push({
             role: "tool",
             tool_call_id: toolCall.id,
             name: toolCall.function.name,
             content: JSON.stringify({error: "No hotels found for the given criteria. You could try different dates or a different city."})
          });
          const followupResponse = await openaiClient.chat.completions.create({
              model: "deepseek-chat",
              messages: messages,
          });
          console.log("DeepSeek followup (no hotels):", JSON.stringify(followupResponse.choices[0].message, null, 2));
          // Add DeepSeek's final response to history for the next turn
          messages.push(followupResponse.choices[0].message);
          res.json({ reply: followupResponse.choices[0].message.content, is_hotel_list: false, history: messages });
        }
      } else {
        // Unexpected tool called
        console.warn("DeepSeek called an unexpected tool:", toolCall.function.name);
        messages.push(responseMessage); // Add DeepSeek's message
        // Fallback to a simple response without tool processing
        res.json({ reply: "An unexpected tool was called by the assistant.", is_hotel_list: false, history: messages });
      }
    } else {
      // No tool call, just a regular message from DeepSeek
      messages.push(responseMessage);
      res.json({ reply: responseMessage.content, is_hotel_list: false, history: messages });
    }
  } catch (error) {
    console.error("Error in /api/chatbot/converse:", error);
    if (error.response) {
      console.error("DeepSeek API Error Response Status:", error.status);
      console.error("DeepSeek API Error Response Headers:", error.headers);
      console.error("DeepSeek API Error Response Data:", error.error); // OpenAI Node SDK nests error details here
      res.status(error.status || 500).json({ error: "Error calling DeepSeek API", details: error.error });
    } else {
      res.status(500).json({ error: "Internal server error while processing chat", details: error.message });
    }
  }
});

// Blog generation API endpoint
app.post("/api/generate-blog", async (req, res) => {
  try {
    await generateAllArticles();
    res.json({ success: true, message: "All blog articles and sitemap generated successfully" });
  } catch (error) {
    console.error("Error generating blog articles:", error);
    res.status(500).json({ 
      error: "Failed to generate blog articles", 
      details: error.message 
    });
  }
});

/**
 * API endpoint to fetch hotel reviews from LITE API.
 * Expects a 'hotelId' query parameter.
 */
app.get("/api/hotel-reviews", async (req, res) => {
    const { hotelId } = req.query;
    console.log(`Fetching reviews for hotelId: ${hotelId}`);

    if (!hotelId) {
        return res.status(400).json({ error: "hotelId is required" });
    }

    const currentApiKey = process.env.PROD_API_KEY; // Using currentApiKey to avoid conflict with global apiKey
    if (!currentApiKey) {
        console.error("LITE_API_KEY (PROD_API_KEY) missing for reviews endpoint");
        return res.status(500).json({ error: "API key not configured on server." });
    }
    const sdk = liteApi(currentApiKey);

    try {
        // Assuming the sdk.getHotelReviews(hotelId, limit) maps to GET /data/reviews
        // Fetch up to 20 reviews.
        const reviewsResponse = await sdk.getHotelReviews(hotelId, 20);

        if (!reviewsResponse || !reviewsResponse.data) {
            console.warn(`No reviews found or invalid response for hotelId: ${hotelId}`, reviewsResponse);
            return res.json({ data: [] }); // Send empty array if no reviews
        }
        res.json({ data: reviewsResponse.data });
    } catch (error) {
        console.error(`Error fetching reviews for hotelId ${hotelId}:`, error);
        // Check if the error is from the LiteAPI SDK due to "No Content" or similar
        if (error.response && error.response.status === 204) {
             console.warn(`No reviews found (204 No Content) for hotelId: ${hotelId}`);
             return res.json({ data: [] }); // Send empty array if no reviews
        }
        res.status(500).json({ error: "Failed to fetch hotel reviews", details: error.message });
    }
});

// Blog posts API endpoint
app.get("/api/blog-posts", (req, res) => {
  try {
    const blogDir = path.join(__dirname, '../client/blog');
    const files = fs.readdirSync(blogDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    res.json(htmlFiles);
  } catch (error) {
    console.error("Error reading blog posts:", error);
    res.status(500).json({ 
      error: "Failed to read blog posts", 
      details: error.message 
    });
  }
});

// Serve static pretty URLs for footer pages
const staticPages = [
  'about', 'careers', 'press', 'blog', 'investors',
  'help', 'faq', 'contact', 'safety', 'cancellation', 'payment',
  'privacy', 'terms', 'cookies', 'accessibility'
];
staticPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, '../client', `${page}.html`));
  });
});

// Catch-all route for SPA - THIS MUST BE LAST for client-side routing to work
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Export the app for Vercel
module.exports = app;

// Start the server if we're not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Static files are being served from: ${path.join(__dirname, '../client')}`);
  });
}

// Generate blog posts for hotel locations
app.post('/api/generate-hotel-locations', async (req, res) => {
    console.log('Starting hotel location blog generation...');

    const locations = [
        'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
        // ... existing locations ...
    ];

    try {
        // Process cities in chunks of 10 for parallel processing
        const chunkSize = 10;
        for (let i = 0; i < locations.length; i += chunkSize) {
            const chunk = locations.slice(i, i + chunkSize);
            console.log(`Processing chunk ${i/chunkSize + 1} of ${Math.ceil(locations.length/chunkSize)}`);
            
            await Promise.all(chunk.map(async (location) => {
                console.log(`Generating article for: Hotels near ${location}`);
                
                const prompt = `Write a concise blog post about hotels in ${location}. Include:
1. Popular hotel districts
2. Average prices
3. Types of hotels
4. Nearby attractions
5. Transportation options
6. Best times to visit
7. Tips for finding deals

Format in HTML with headings and lists.`;

                const response = await openaiClient.chat.completions.create({
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.5,
                    max_tokens: 1000
                });

                const content = response.choices[0].message.content;
                const fileName = `hotels-near-${location.toLowerCase().replace(/,?\s+/g, '-')}.html`;
                
                const htmlContent = generateHTML({
                    title: `Hotels Near ${location}`,
                    slug: `hotels-near-${location.toLowerCase().replace(/,?\s+/g, '-')}`,
                    keywords: ['hotels', location, 'travel']
                }, content);

                fs.writeFileSync(path.join(__dirname, '../client/blog', fileName), htmlContent);
                console.log(`Saved article: ${fileName}`);
            }));
        }

        res.json({ message: 'Hotel location blog posts generated successfully' });
    } catch (error) {
        console.error('Error generating hotel location blog posts:', error);
        res.status(500).json({ error: 'Failed to generate hotel location blog posts' });
    }
});
