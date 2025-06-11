const express = require('express');
const router = express.Router();

// Import mock data
const hotels = require('../data/hotels');
const reviews = require('../data/reviews');
const countries = require('../data/countries');
const currencies = require('../data/currencies');
const iataCodes = require('../data/iataCodes');

// Middleware to check API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'test-api-key-123') {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

// Apply API key middleware to all routes
router.use(checkApiKey);

// Hotel Data API Endpoints
// GET /data/hotel - Get hotel details
router.get('/data/hotel', (req, res) => {
    const { hotelId } = req.query;
    if (!hotelId) {
        return res.status(400).json({ error: 'hotelId is required' });
    }

    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(hotel);
});

// GET /data/hotels - Get list of hotels
router.get('/data/hotels', (req, res) => {
    const { country, city } = req.query;
    if (!country || !city) {
        return res.status(400).json({ error: 'country and city are required' });
    }

    const filteredHotels = hotels.filter(hotel => 
        hotel.country === country && hotel.city === city
    );

    res.json(filteredHotels);
});

// GET /data/reviews - Get hotel reviews
router.get('/data/reviews', (req, res) => {
    const { hotelId } = req.query;
    if (!hotelId) {
        return res.status(400).json({ error: 'hotelId is required' });
    }

    const hotelReviews = reviews.find(r => r.hotelId === hotelId);
    if (!hotelReviews) {
        return res.status(404).json({ error: 'Reviews not found' });
    }

    res.json(hotelReviews.reviews);
});

// GET /data/cities - Get cities of a country
router.get('/data/cities', (req, res) => {
    const { country } = req.query;
    if (!country) {
        return res.status(400).json({ error: 'country is required' });
    }

    const countryData = countries.find(c => c.id === country);
    if (!countryData) {
        return res.status(404).json({ error: 'Country not found' });
    }

    res.json(countryData.cities);
});

// GET /data/countries - Get list of countries
router.get('/data/countries', (req, res) => {
    res.json(countries);
});

// GET /data/currencies - Get list of currencies
router.get('/data/currencies', (req, res) => {
    res.json(currencies);
});

// GET /data/iataCodes - Get IATA codes
router.get('/data/iataCodes', (req, res) => {
    const { country } = req.query;
    if (!country) {
        return res.status(400).json({ error: 'country is required' });
    }

    const filteredCodes = iataCodes.filter(code => code.country === country);
    res.json(filteredCodes);
});

// Search API Endpoints
// POST /hotels/rates - Get hotel rates
router.post('/hotels/rates', (req, res) => {
    const { hotelId, checkin, checkout, currency, adults, children } = req.body;
    
    // Validate required fields
    if (!hotelId || !checkin || !checkout || !currency || !adults) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock rate data
    const rate = {
        hotelId,
        checkin,
        checkout,
        currency,
        adults,
        children: children || 0,
        rooms: [
            {
                roomId: "room1",
                roomName: "Standard Double Room",
                price: 100,
                currency: currency,
                breakfast: true,
                cancellationPolicy: "Free cancellation until 24 hours before check-in"
            }
        ]
    };

    res.json(rate);
});

// Booking API Endpoints
// POST /rates/prebook - Create checkout session
router.post('/rates/prebook', (req, res) => {
    const { rateId, voucherCode } = req.body;
    
    if (!rateId) {
        return res.status(400).json({ error: 'rateId is required' });
    }

    // Mock prebook response
    res.json({
        success: {
            data: {
                prebookId: "prebook_" + Date.now(),
                transactionId: "trans_" + Date.now(),
                secretKey: "sk_test_" + Math.random().toString(36).substring(7),
                currency: "USD",
                price: 100,
                voucherTotalAmount: voucherCode ? 10 : 0
            }
        }
    });
});

// POST /rates/book - Complete booking
router.post('/rates/book', (req, res) => {
    const { transactionId, guestInfo } = req.body;
    
    if (!transactionId || !guestInfo) {
        return res.status(400).json({ error: 'transactionId and guestInfo are required' });
    }

    // Mock booking response
    res.json({
        success: {
            data: {
                bookingId: "booking_" + Date.now(),
                status: "confirmed",
                guestInfo,
                totalAmount: 100,
                currency: "USD"
            }
        }
    });
});

module.exports = router; 