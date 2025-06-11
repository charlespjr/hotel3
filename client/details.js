// Get the base URL for API calls
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '';

document.addEventListener('DOMContentLoaded', () => {
    // On page load, check for URL parameters (hotelId, checkin, checkout, adults).
    // If hotelId is present, populate input fields and automatically trigger the search.
    // This allows linking directly to this page with pre-filled search criteria (e.g., from chatbot).
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('hotelId');
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');
    const adults = urlParams.get('adults');

    if (hotelId) {
        const hotelIdInput = document.getElementById('hotelId');
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const adultsInput = document.getElementById('adults');

        if (hotelIdInput) hotelIdInput.value = hotelId;
        if (checkinInput && checkin) checkinInput.value = checkin;
        if (checkoutInput && checkout) checkoutInput.value = checkout;
        if (adultsInput && adults) adultsInput.value = adults;

        searchHotelRate(); // Automatically search if hotelId is in URL
    }
    // Any other existing event listeners or init code for details page can go here
});

async function searchHotelRate() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("errorMessage").style.display = "none"; // Hide previous errors
    document.getElementById("hotels").innerHTML = ""; // Clear previous details
    document.getElementById("rates").innerHTML = "";   // Clear previous rates
    const reviewsContainer = document.getElementById("hotel-reviews-container");
    if(reviewsContainer) reviewsContainer.innerHTML = ""; // Clear previous reviews

    console.log("Searching for hotel rates and details...");
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;
    const adults = document.getElementById("adults").value;
    const hotelId = document.getElementById("hotelId").value;

    if (!hotelId) {
         document.getElementById("loader").style.display = "none";
         document.getElementById("errorMessage").textContent = "Hotel ID is required.";
         document.getElementById("errorMessage").style.display = "block";
         return;
    }

    console.log("Checkin:", checkin, "Checkout:", checkout, "Adults", adults, "hotelId", hotelId);

    try {
        // Fetch hotel details and rates
        const detailsResponse = await fetch(
            `${API_URL}/api/search-rates?checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelId=${hotelId}`
        );
        if (!detailsResponse.ok) {
            const errorData = await detailsResponse.json();
            throw new Error(errorData.error || 'Failed to fetch hotel details and rates');
        }
        const detailsData = await detailsResponse.json();
        const hotelInfo = detailsData.hotelInfo;
        const rateInfo = detailsData.rateInfo;

        displayHotelDetails(hotelInfo);
        displayRates(rateInfo);

        // After fetching main hotel details and rates, fetch guest reviews.
        const reviewsResponse = await fetch(`${API_URL}/api/hotel-reviews?hotelId=${hotelId}`);
        if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            displayHotelReviews(reviewsData.data);
        } else {
            console.warn(`Failed to fetch reviews for hotelId: ${hotelId}`);
            if(reviewsContainer) reviewsContainer.innerHTML = "<p>Could not load reviews at this time.</p>";
        }

    } catch (error) {
        console.error("Error fetching hotel data:", error);
        const errorMessageDiv = document.getElementById("errorMessage");
        errorMessageDiv.style.display = "block";
        errorMessageDiv.textContent = error.message || "No availability or error fetching data.";
    } finally {
         document.getElementById("loader").style.display = "none";
    }
}

/**
 * Displays the main hotel information, image gallery, and facilities.
 * @param {object} hotelInfo - The hotel details object from the API.
 */
function displayHotelDetails(hotelInfo) {
    const hotelsDiv = document.getElementById("hotels");
    hotelsDiv.innerHTML = '';

    // Create a photo gallery container
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'hotel-gallery-container';
    
    // Get all available images
    const images = hotelInfo.hotelImages || [];
    const mainImage = images.find(image => image.defaultImage === true)?.url || 
                     (images.length > 0 ? images[0].url : 'https://via.placeholder.com/800x400.png?text=No+Image');

    // Create main image display
    const mainImageContainer = document.createElement('div');
    mainImageContainer.className = 'hotel-main-image';
    mainImageContainer.innerHTML = `
        <img src="${mainImage}" alt="${hotelInfo.name || 'Hotel image'}" class="main-photo">
    `;
    galleryContainer.appendChild(mainImageContainer);

    // Create thumbnail gallery
    if (images.length > 0) {
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'hotel-thumbnails';
        images.slice(0, 8).forEach(img => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            // Use thumbnailUrl for thumbnails if available, otherwise fallback to full url
            const thumbSrc = img.thumbnailUrl || img.url;
            thumb.innerHTML = `<img src="${thumbSrc}" alt="${img.caption || 'Hotel image'}" onclick="updateMainImage('${img.url}')">`;
            thumbnailContainer.appendChild(thumb);
        });
        galleryContainer.appendChild(thumbnailContainer);
    }

    // Create detailed information container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'hotel-details-info';
    detailsContainer.innerHTML = `
        <div class="hotel-header">
            <h2>${hotelInfo.name || 'N/A'}</h2>
            <div class="hotel-rating">
                <span class="stars">${'★'.repeat(hotelInfo.starRating || 0)}${'☆'.repeat(5 - (hotelInfo.starRating || 0))}</span>
                <span class="rating">${hotelInfo.rating || 'N/A'}</span>
                <span class="reviews">(${hotelInfo.reviewCount || 0} reviews)</span>
            </div>
        </div>
        
        <div class="hotel-location">
            <h3>Location</h3>
            <p>${hotelInfo.address || ''}${hotelInfo.city ? `, ${hotelInfo.city}` : ''}${hotelInfo.country ? `, ${hotelInfo.country}` : ''}</p>
            ${hotelInfo.location?.latitude && hotelInfo.location?.longitude ? 
                `<a href="https://www.google.com/maps?q=${hotelInfo.location.latitude},${hotelInfo.location.longitude}" target="_blank" class="map-link">View on Map</a>` : ''}
        </div>

        <div class="hotel-description">
            <h3>About the Hotel</h3>
            <p>${hotelInfo.hotelDescription || hotelInfo.description || 'No description available.'}</p>
        </div>

        ${hotelInfo.hotelImportantInformation ? `
            <div class="hotel-important-information">
                <h3>Important Information</h3>
                <p>${hotelInfo.hotelImportantInformation}</p>
            </div>
        ` : ''}

        ${hotelInfo.checkinCheckoutTimes ? `
            <div class="hotel-checkin-checkout">
                <h3>Check-in & Check-out</h3>
                <p><strong>Check-in:</strong> ${hotelInfo.checkinCheckoutTimes.checkin || 'N/A'}</p>
                <p><strong>Check-out:</strong> ${hotelInfo.checkinCheckoutTimes.checkout || 'N/A'}</p>
            </div>
        ` : ''}

        <div class="hotel-facilities">
            <h3>Facilities & Services</h3>
            <div class="facilities-grid">
                ${(hotelInfo.facilities || hotelInfo.hotelFacilities || []).map(facility => `
                    <div class="facility-item">
                        <span class="facility-icon">✓</span>
                        <span class="facility-name">${typeof facility === 'object' ? facility.name : facility}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        ${hotelInfo.amenities ? `
            <div class="hotel-amenities">
                <h3>Amenities</h3>
                <div class="facilities-grid">
                    ${hotelInfo.amenities.map(amenity => `
                        <div class="facility-item">
                            <span class="facility-icon">✓</span>
                            <span class="facility-name">${amenity}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${hotelInfo.policies ? `
            <div class="hotel-policies">
                <h3>Hotel Policies</h3>
                <div class="policies-content">
                    ${Object.entries(hotelInfo.policies).map(([key, value]) => `
                        <div class="policy-item">
                            <strong>${key}:</strong> ${value}
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    // Add all containers to the main div
    hotelsDiv.appendChild(galleryContainer);
    hotelsDiv.appendChild(detailsContainer);
}

// Add this function to handle thumbnail clicks
function updateMainImage(imageUrl) {
    const mainPhoto = document.querySelector('.main-photo');
    if (mainPhoto) {
        mainPhoto.src = imageUrl;
    }
}

function displayRates(rateInfo) {
    const container = document.getElementById('rates');
    container.innerHTML = ''; // Clear previous content

    if (!rateInfo || rateInfo.length === 0 || (rateInfo.length === 1 && rateInfo[0].length === 0) ) {
        const noRatesMessage = document.createElement('p');
        noRatesMessage.textContent = 'No rates available for the selected dates/criteria.';
        container.appendChild(noRatesMessage);
        return;
    }

    rateInfo.forEach(roomTypeRates => {
        if(Array.isArray(roomTypeRates)) {
            roomTypeRates.forEach(rate => {
                const rateDiv = document.createElement('div');
                rateDiv.className = 'rate-card';

                const rateName = document.createElement('h4');
                rateName.textContent = `Rate Name: ${rate.rateName}`;
                rateDiv.appendChild(rateName);

                const board = document.createElement('p');
                board.textContent = `Board: ${rate.board}`;
                rateDiv.appendChild(board);

                const refundableTag = document.createElement('p');
                refundableTag.textContent = `Refundable: ${rate.refundableTag}`;
                rateDiv.appendChild(refundableTag);

                const originalRate = document.createElement('p');
                originalRate.textContent = `Public Rate: $${rate.originalRate} ${rate.currency || 'USD'}`;
                originalRate.style.textDecoration = "line-through";
                rateDiv.appendChild(originalRate);

                const retailRate = document.createElement('p');
                retailRate.textContent = `Promotional rate: $${rate.retailRate} ${rate.currency || 'USD'}`;
                rateDiv.appendChild(retailRate);

                const bookButton = document.createElement('button');
                bookButton.textContent = 'Book Now';
                bookButton.onclick = function () {
                    proceedToBooking(rate.offerId);
                };
                rateDiv.appendChild(bookButton);

                container.appendChild(rateDiv);
            });
        }
    });
}

/**
 * Displays hotel guest reviews.
 * @param {Array<object>} reviews - Array of review objects from the API.
 */
function displayHotelReviews(reviews) {
    const reviewsContainer = document.getElementById('hotel-reviews-container');
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = ''; // Clear previous reviews

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews available for this hotel yet.</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'hotel-review-item'; // For styling
        // Ensure all fields are checked for existence before trying to access properties
        const headline = review.headline || 'Review';
        const averageScore = review.averageScore ? `${review.averageScore}/10` : 'N/A';
        const name = review.name || 'Anonymous';
        const country = review.country || 'N/A';
        const date = review.date ? new Date(review.date).toLocaleDateString() : 'N/A';
        const pros = review.pros ? `<p><strong>Pros:</strong> ${review.pros}</p>` : '';
        const cons = review.cons ? `<p><strong>Cons:</strong> ${review.cons}</p>` : '';
        // Handle cases where review text might be in headline if pros/cons are empty
        const generalComment = (!review.pros && !review.cons && review.headline && review.text && review.headline === review.text) ? `<p>${review.text}</p>` : review.text && review.text !== review.headline ? `<p>${review.text}</p>` : '';


        reviewDiv.innerHTML = `
            <h4>${headline} (${averageScore})</h4>
            <p class="review-meta">By: ${name} | Country: ${country} | Date: ${date}</p>
            ${pros}
            ${cons}
            ${generalComment}
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}


async function proceedToBooking(rateId) {
    console.log("Proceeding to booking for hotel ID:", rateId);

    // Clear existing HTML and display the loader
    const hotelsDiv = document.getElementById("hotels");
    const ratesDiv = document.getElementById("rates");
    const loader = document.getElementById("loader");
    hotelsDiv.innerHTML = "";
    ratesDiv.innerHTML = "";
    loader.style.display = "block";

    // Create and append the form dynamically
    const formHtml = `
        <form id="bookingForm">
            <input type="hidden" name="prebookId" value="${rateId}">
            <label>Guest First Name:</label>
            <input type="text" name="guestFirstName" required><br>
            <label>Guest Last Name:</label>
            <input type="text" name="guestLastName" required><br>
            <label>Guest Email:</label>
            <input type="email" name="guestEmail" required><br><br>
            <label>Credit Card Holder Name:</label>
            <input type="text" name="holderName" required><br>
			<label>Voucher Code:</label>
            <input type="text" name="voucher"><br>
            <input type="submit" value="Book Now">
        </form>
    `;
    hotelsDiv.innerHTML = formHtml; // Insert the form into the 'hotels' div
    loader.style.display = "none";

    // Add event listener to handle form submission
    document.getElementById("bookingForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        loader.style.display = "block";

        const formData = new FormData(event.target);
        const guestFirstName = formData.get('guestFirstName');
        const guestLastName = formData.get('guestLastName');
        const guestEmail = formData.get('guestEmail');
        const holderName = formData.get('holderName');
        const voucher = formData.get('voucher');

        try {
            const bodyData = {
                rateId
            };

            if (voucher) {
                bodyData.voucherCode = voucher;
            }

            const prebookResponse = await fetch(`${API_URL}/api/prebook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });

            const prebookData = await prebookResponse.json();
            console.log("preboook successful!", prebookData.success.data);
            const paymentData = {
                price: prebookData.success.data.price,
                voucherTotalAmount: prebookData.success.data.voucherTotalAmount
            };
            displayPaymentInfo(paymentData);

            initializePaymentForm(
                prebookData.success.data.secretKey,
                prebookData.success.data.prebookId,
                prebookData.success.data.transactionId,
                guestFirstName,
                guestLastName,
                guestEmail
            );
        } catch (error) {
            console.error("Error in payment processing or booking:", error);
        } finally {
            loader.style.display = "none";
        }
    });
}

function displayPaymentInfo(data) {
	console.log("displaty payment data function called)")
	const paymentDiv = document.getElementById('hotels');
	if (!paymentDiv) {
		console.error('paymentInfo div not found');
		return;
	}
	// Destructure the necessary data from the object
	const { price, currency, voucherTotalAmount } = data;

	// Create content for the div
	let content = `<p>Total Amount: ${Math.round(price)} USD</p>`;

	// Check if voucherTotalAmount is available and add it to the content
	if (voucherTotalAmount && voucherTotalAmount > 0) {
		content += `<p>Voucher Total Amount: ${Math.round(voucherTotalAmount)} USD</p>`;
	}

	// Update the div's content
	paymentDiv.innerHTML = content;
}