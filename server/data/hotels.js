const hotels = [
    {
        id: "lp3803c",
        name: "EAST WEST HOTEL",
        hotelDescription: "Central Location: Situated in the heart of Casablanca, EAST WEST HOTEL offers convenience and comfort for your stay. Explore the city with ease from our prime location.",
        checkinCheckoutTimes: {
            checkout: "11:30 AM",
            checkin: "02:00 PM",
            checkinStart: "02:00 PM",
            checkinEnd: "12:00 AM"
        },
        hotelImages: [
            {
                url: "https://snaphotelapi.com/hotels/hd/406127505.jpg",
                caption: "hotel building",
                order: 1,
                defaultImage: false
            }
        ],
        country: "ma",
        city: "Casablanca",
        starRating: 3,
        location: {
            latitude: 33.59265,
            longitude: -7.63004
        },
        address: "10 Avenue Hassan Souktani quartier Gauthier",
        hotelFacilities: [
            "WiFi available",
            "Free WiFi",
            "Non-smoking rooms",
            "Air conditioning"
        ],
        facilities: [
            {
                facilityId: 47,
                name: "WiFi available"
            },
            {
                facilityId: 107,
                name: "Free WiFi"
            }
        ],
        rating: 7.7,
        reviewCount: 250
    },
    {
        id: "us-fairfax-1",
        name: "Fairfax Inn & Suites",
        hotelDescription: "Modern comfort in the heart of Fairfax. Our hotel offers spacious rooms, excellent amenities, and easy access to local attractions.",
        checkinCheckoutTimes: {
            checkout: "11:00 AM",
            checkin: "03:00 PM",
            checkinStart: "03:00 PM",
            checkinEnd: "11:00 PM"
        },
        hotelImages: [
            {
                url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80",
                caption: "hotel exterior",
                order: 1,
                defaultImage: true
            }
        ],
        country: "us",
        city: "Fairfax",
        starRating: 4,
        location: {
            latitude: 38.8462,
            longitude: -77.3064
        },
        address: "123 Main Street, Fairfax, VA 22030",
        hotelFacilities: [
            "Free WiFi",
            "Swimming Pool",
            "Fitness Center",
            "Business Center",
            "Free Parking",
            "Air conditioning"
        ],
        facilities: [
            {
                facilityId: 107,
                name: "Free WiFi"
            },
            {
                facilityId: 201,
                name: "Swimming Pool"
            }
        ],
        rating: 8.5,
        reviewCount: 428
    },
    {
        id: "us-fairfax-2",
        name: "Comfort Suites Fairfax",
        hotelDescription: "Experience luxury and comfort at our modern hotel in Fairfax. Perfect for both business and leisure travelers.",
        checkinCheckoutTimes: {
            checkout: "12:00 PM",
            checkin: "04:00 PM",
            checkinStart: "04:00 PM",
            checkinEnd: "12:00 AM"
        },
        hotelImages: [
            {
                url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80",
                caption: "hotel room",
                order: 1,
                defaultImage: true
            }
        ],
        country: "us",
        city: "Fairfax",
        starRating: 4,
        location: {
            latitude: 38.8512,
            longitude: -77.3074
        },
        address: "456 Oak Street, Fairfax, VA 22030",
        hotelFacilities: [
            "Free WiFi",
            "Restaurant",
            "Room Service",
            "Meeting Rooms",
            "Free Breakfast",
            "Air conditioning"
        ],
        facilities: [
            {
                facilityId: 107,
                name: "Free WiFi"
            },
            {
                facilityId: 301,
                name: "Restaurant"
            }
        ],
        rating: 8.8,
        reviewCount: 356
    }
];

module.exports = hotels; 