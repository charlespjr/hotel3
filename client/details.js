// Get the base URL for API calls
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '';

// document.addEventListener('DOMContentLoaded', () => { // Removed
//     // On page load, check for URL parameters (hotelId, checkin, checkout, adults).
//     // If hotelId is present, populate input fields and automatically trigger the search.
//     // This allows linking directly to this page with pre-filled search criteria (e.g., from chatbot).
//     const urlParams = new URLSearchParams(window.location.search);
//     const hotelId = urlParams.get('hotelId');
//     const checkin = urlParams.get('checkin');
//     const checkout = urlParams.get('checkout');
//     const adults = urlParams.get('adults');

//     if (hotelId) {
//         const hotelIdInput = document.getElementById('hotelId');
//         const checkinInput = document.getElementById('checkin');
//         const checkoutInput = document.getElementById('checkout');
//         const adultsInput = document.getElementById('adults');

//         if (hotelIdInput) hotelIdInput.value = hotelId;
//         if (checkinInput && checkin) checkinInput.value = checkin;
//         if (checkoutInput && checkout) checkoutInput.value = checkout;
//         if (adultsInput && adults) adultsInput.value = adults;

//         searchHotelRate(); // Automatically search if hotelId is in URL
//     }
//     // Any other existing event listeners or init code for details page can go here
// }); // Removed

async function searchHotelRate() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("errorMessage").style.display = "none"; // Hide previous errors
    document.getElementById("hotels").innerHTML = ""; // Clear previous details
    document.getElementById("rates").innerHTML = "";   // Clear previous rates
    // const reviewsContainer = document.getElementById("hotel-reviews-container"); // Removed
    // if(reviewsContainer) reviewsContainer.innerHTML = ""; // Removed

    console.log("Searching for hotel rates and details..."); // Original log was "Searching for hotels..."
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;
    const adults = document.getElementById("adults").value;
    const hotelId = document.getElementById("hotelId").value;

    if (!hotelId) { // Added check for hotelId as it was present in original logic implicitly
         document.getElementById("loader").style.display = "none";
         document.getElementById("errorMessage").textContent = "Hotel ID is required.";
         document.getElementById("errorMessage").style.display = "block";
         return;
    }

    console.log("Checkin:", checkin, "Checkout:", checkout, "Adults", adults, "hotelId", hotelId);

    try {
        // Make a request to your backend server
        const response = await fetch(
            `${API_URL}/api/search-rates?checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelId=${hotelId}`
        );
        // Check if response is ok before parsing JSON
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' })); // Catch if error response itself is not JSON
            throw new Error(errorData.error || `Failed to fetch hotel details and rates. Status: ${response.status}`);
        }
        const data = await response.json();
        const hotelInfo = data.hotelInfo;
        const rateInfo = data.rateInfo;

        displayHotelDetails(hotelInfo);
        displayRates(rateInfo);

        // document.getElementById("loader").style.display = "none"; // Moved to finally block
    } catch (error) {
        console.error("Error fetching hotel data:", error); // Original log was "Error fetching hotels:"
        const errorMessageDiv = document.getElementById("errorMessage");
        errorMessageDiv.style.display = "block";
        errorMessageDiv.textContent = error.message || "No availability or error fetching data."; // Original was "No availability found"
    } finally {
         document.getElementById("loader").style.display = "none";
    }
}

function displayHotelDetails(hotelInfo) {
    const hotelsDiv = document.getElementById("hotels");
    hotelsDiv.innerHTML = ''; // Clear previous content

    const mainImage = hotelInfo.hotelImages && hotelInfo.hotelImages.find(image => image.defaultImage === true)?.url
                      || (hotelInfo.hotelImages && hotelInfo.hotelImages?.[0]?.url)
                      || 'https://via.placeholder.com/300x200.png?text=No+Image';

    const facilitiesArray = hotelInfo.facilities || hotelInfo.hotelFacilities;
    const facilitiesList = facilitiesArray && Array.isArray(facilitiesArray) ? facilitiesArray.slice(0, 10).map(facility =>
        typeof facility === 'object' ? facility.name : facility
    ).join(', ') : 'N/A';

    // Added checks for hotelInfo properties before accessing them
    const hotelName = hotelInfo.name || 'N/A';
    const hotelAddress = hotelInfo.address || 'N/A';
    const hotelDescription = hotelInfo.hotelDescription || 'No description available.';

    const hotelElementHTML = `
      <div class='card-container'>
        <div class='card'>
          <div class='flex items-start'>
            <div class='card-image'>
              <img src='${mainImage}' alt='${hotelName}'>
            </div>
            <div class='flex-between-end w-full'>
              <div>
                <h4 class='card-title'>${hotelName}</h4>
                <h3 class='card-id'>Hotel Address: ${hotelAddress}</h3>
                <p class='features'>${hotelDescription}</p>
                <p class='facilities'>Facilities: ${facilitiesList}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    hotelsDiv.innerHTML = hotelElementHTML;
    // Removed population of #hotel-star-rating, #hotel-overall-rating, etc.
    // Removed image gallery population logic.
}

function displayRates(rateInfo) {
    const container = document.getElementById('rates');
    container.innerHTML = ''; // Clear previous content

    // Ensure rateInfo is not null and is an array before iterating
    if (!rateInfo || !Array.isArray(rateInfo)) {
        console.warn("rateInfo is null, not an array, or undefined. Cannot display rates.");
        const noRatesMessage = document.createElement('p');
        noRatesMessage.textContent = 'Rate information is currently unavailable.';
        container.appendChild(noRatesMessage);
        return;
    }

    if (rateInfo.length === 0 || (rateInfo.length === 1 && (!rateInfo[0] || rateInfo[0].length === 0)) ) {
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
                originalRate.textContent = `Public Rate: $${rate.originalRate}`;
                originalRate.style.textDecoration = "line-through";
                rateDiv.appendChild(originalRate);

                const retailRate = document.createElement('p');
                retailRate.textContent = `Promotional rate: $${rate.retailRate}`;
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

// function displayHotelReviews(reviews) { // Removed
//     // ... content removed ...
// }


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