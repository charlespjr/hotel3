const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const liteApi = require("liteapi-node-sdk");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { sendBookingConfirmation } = require('./email');

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: "*",
  })
);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

const prod_apiKey = process.env.PROD_API_KEY;
const sandbox_apiKey = process.env.SAND_API_KEY;

// Log API keys (without showing full values)
console.log("API Keys configured:", {
  sandbox: sandbox_apiKey ? "Present" : "Missing",
  production: prod_apiKey ? "Present" : "Missing"
});

app.use(bodyParser.json());

app.get("/search-hotels", async (req, res) => {
  console.log("Search endpoint hit");
  const { checkin, checkout, adults, city, countryCode, environment } = req.query;
  console.log("Search parameters:", { checkin, checkout, adults, city, countryCode, environment });
  
  const apiKey = environment == "sandbox" ? sandbox_apiKey : prod_apiKey;
  
  if (!apiKey) {
    console.error("API key missing for environment:", environment);
    return res.status(500).json({ 
      error: "API key not configured. Please set up your SAND_API_KEY and PROD_API_KEY in the .env file" 
    });
  }

  const sdk = liteApi(apiKey);

  try {
    console.log("Searching hotels with params:", { countryCode, city });
    const response = await sdk.getHotels(countryCode, city, 0, 10);
    console.log("Hotel search response:", JSON.stringify(response, null, 2));
    
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid hotel response:", response);
      return res.status(500).json({ 
        error: "Invalid response from hotel search API",
        details: response 
      });
    }

    const data = response.data;
    if (data.length === 0) {
      console.log("No hotels found for the given criteria");
      return res.json({ rates: [] });
    }

    const hotelIds = data.map((hotel) => hotel.id);
    console.log("Found hotel IDs:", hotelIds);
    
    const ratesResponse = await sdk.getFullRates({
      hotelIds: hotelIds,
      occupancies: [{ adults: parseInt(adults, 10) }],
      currency: "USD",
      guestNationality: "US",
      checkin: checkin,
      checkout: checkout,
    });

    console.log("Rates response:", JSON.stringify(ratesResponse, null, 2));

    if (!ratesResponse || !ratesResponse.data) {
      console.error("Invalid rates response:", ratesResponse);
      return res.status(500).json({ 
        error: "Invalid response from rates API",
        details: ratesResponse 
      });
    }

    const rates = ratesResponse.data;
    rates.forEach((rate) => {
      rate.hotel = data.find((hotel) => hotel.id === rate.hotelId);
    });

    res.json({ rates });
  } catch (error) {
    console.error("Error searching for hotels:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

app.get("/search-rates", async (req, res) => {
  console.log("Rate endpoint hit");
  const { checkin, checkout, adults, hotelId, environment } = req.query;
  const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
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

app.post("/prebook", async (req, res) => {
  //console.log(req.body);
  const { rateId, environment, voucherCode } = req.body;
  const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
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

app.get("/book", (req, res) => {
  console.log(req.query);
  const { prebookId, guestFirstName, guestLastName, guestEmail, transactionId, environment } =
    req.query;

  const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
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

// Serve the client-side application
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
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

const startServer = () => {
  const ports = [3000, 3001, 3002, 3003];
  
  const tryPort = (index) => {
    if (index >= ports.length) {
      console.error('No available ports found');
      process.exit(1);
      return;
    }
    
    const port = ports[index];
    const server = app.listen(port)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying next port...`);
          server.close();
          tryPort(index + 1);
        } else {
          console.error('Server error:', err);
        }
      })
      .on('listening', () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Open http://localhost:${port} in your browser`);
        console.log(`Static files are being served from: ${path.join(__dirname, '../client')}`);
      });
  };

  tryPort(0);
};

startServer();
