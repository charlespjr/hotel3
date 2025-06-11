// Initialize the SDK with your API key
const API_KEY = 'test-api-key-123'; // This should match what's expected by the server

// Get the base URL for API calls
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

async function searchHotels() {
	document.getElementById("loader").style.display = "block";

	// Clear previous hotel elements
	const hotelsDiv = document.getElementById("hotels");
	hotelsDiv.innerHTML = "";

	console.log("Searching for hotels...");
	const checkin = document.getElementById("checkin").value;
	const checkout = document.getElementById("checkout").value;
	const adults = document.getElementById("adults").value;
	const city = document.getElementById("city").value;
	const countryCode = document.getElementById("countryCode").value;

	// Validate country and city
	if (!countryCode || !city) {
		hotelsDiv.innerHTML = "<p class='error'>Please select both country and city.</p>";
		document.getElementById("loader").style.display = "none";
		return;
	}

	console.log("Search parameters:", { checkin, checkout, adults, city, countryCode });

	try {
		// Make a request to your backend server
		const response = await fetch(
			`${API_URL}/api/data/hotels?country=${countryCode}&city=${city}`,
			{
				headers: {
					'X-API-Key': API_KEY
				}
			}
		);
		
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to fetch hotels');
		}

		const hotels = await response.json();
		console.log("Received data:", hotels);

		if (!hotels || hotels.length === 0) {
			hotelsDiv.innerHTML = "<p>No hotels found for the given criteria.</p>";
			document.getElementById("loader").style.display = "none";
			return;
		}

		// Get rates for each hotel
		const ratesPromises = hotels.map(async (hotel) => {
			const ratesResponse = await fetch(`${API_URL}/api/hotels/rates`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': API_KEY
				},
				body: JSON.stringify({
					hotelId: hotel.id,
					checkin,
					checkout,
					currency: 'USD',
					adults: parseInt(adults),
					children: 0
				})
			});
			
			if (!ratesResponse.ok) {
				throw new Error('Failed to fetch rates');
			}
			
			const rateData = await ratesResponse.json();
			return {
				hotel,
				...rateData
			};
		});

		const rates = await Promise.all(ratesPromises);
		displayRatesAndHotels(rates);
	} catch (error) {
		console.error("Error fetching hotels:", error);
		hotelsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
	} finally {
		document.getElementById("loader").style.display = "none";
	}
}

function displayRatesAndHotels(rates) {
	const hotelsDiv = document.getElementById("hotels");

	rates.forEach((rate) => {
		const hotel = rate.hotel;
		const room = rate.rooms[0]; // Get the first room rate

		const hotelElement = document.createElement("div");
		hotelElement.innerHTML = `
		<div class='card-container'>
		<div class='card'>
			<div class='flex items-start'>
				<div class='card-image'>
					<img
						src='${hotel.hotelImages[0]?.url || 'https://via.placeholder.com/300x200'}'
						alt='hotel'
					/>
				</div>
				<div class='flex-between-end w-full'>
					<div>
						<h3 class='card-title'>${hotel.name}</h3>
						<p class='hotel-address'>Address: ${hotel.address || 'N/A'}, ${hotel.city || 'N/A'}, ${hotel.country || 'N/A'}</p>
						<p class='hotel-description'>Description: ${hotel.hotelDescription || 'No description available.'}</p>
						<p class='featues'>
							Facilities: ${hotel.hotelFacilities.join(', ')}
						</p>
						<h4 class='card-id'>Room Type: ${room.roomName}</h4>
						<p class='red flex items-center'>
							<span>
								${room.cancellationPolicy}
							</span>
						</p>
					</div>
					<p class='flex flex-col mb-0'>
						<button class='price-btn' onclick="proceedToBooking('${room.roomId}', '${hotel.id}')">
							${room.price} ${room.currency}
							BOOK NOW 
						</button>
					</p>
				</div>
			</div>
		</div>
	</div>
        `;

		hotelsDiv.appendChild(hotelElement);
	});
}

async function proceedToBooking(rateId, hotelId) {
	console.log("Proceeding to booking for hotel ID:", rateId);

	// Clear existing HTML and display the loader
	const hotelsDiv = document.getElementById("hotels");
	const loader = document.getElementById("loader");
	hotelsDiv.innerHTML = "";
	loader.style.display = "block";

	try {
		// Create prebook session
		const prebookResponse = await fetch(`${API_URL}/api/rates/prebook`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': API_KEY
			},
			body: JSON.stringify({
				rateId,
				voucherCode: document.getElementById("voucher")?.value
			})
		});

		if (!prebookResponse.ok) {
			const errorData = await prebookResponse.json();
			throw new Error(errorData.error || 'Failed to create prebook session');
		}

		const prebookData = await prebookResponse.json();
		console.log("Prebook successful!", prebookData.success.data);

		// Display payment info
		const paymentData = {
			currency: prebookData.success.data.currency,
			price: prebookData.success.data.price,
			voucherTotalAmount: prebookData.success.data.voucherTotalAmount
		};
		displayPaymentInfo(paymentData);

		// Create and append the booking form
		const formHtml = `
			<div class="booking-form-container">
				<h2>Complete Your Booking</h2>
				<form id="bookingForm" class="booking-form">
					<div class="form-section">
						<div class="form-section-title">
							<i class="fas fa-user"></i> Guest Information
						</div>
						<label>
							First Name
							<input type="text" name="guestFirstName" required placeholder="Enter your first name">
						</label>
						<label>
							Last Name
							<input type="text" name="guestLastName" required placeholder="Enter your last name">
						</label>
						<label>
							Email Address
							<input type="email" name="guestEmail" required placeholder="Enter your email">
						</label>
					</div>

					<div class="form-section">
						<div class="form-section-title">
							<i class="fas fa-credit-card"></i> Payment Details
						</div>
						<label>
							Cardholder Name
							<input type="text" name="holderName" required placeholder="Name on card">
						</label>
					</div>

					<input type="submit" value="Complete Booking">
				</form>
			</div>
		`;
		hotelsDiv.insertAdjacentHTML('beforeend', formHtml);
		loader.style.display = "none";

		// Add event listener to handle form submission
		document.getElementById("bookingForm").addEventListener("submit", async function (event) {
			event.preventDefault();
			loader.style.display = "block";

			const formData = new FormData(event.target);
			const guestInfo = {
				firstName: formData.get('guestFirstName'),
				lastName: formData.get('guestLastName'),
				email: formData.get('guestEmail'),
				holderName: formData.get('holderName')
			};

			try {
				// Complete the booking
				const bookingResponse = await fetch(`${API_URL}/api/rates/book`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': API_KEY
					},
					body: JSON.stringify({
						transactionId: prebookData.success.data.transactionId,
						guestInfo
					})
				});

				if (!bookingResponse.ok) {
					const errorData = await bookingResponse.json();
					throw new Error(errorData.error || 'Failed to complete booking');
				}

				const bookingData = await bookingResponse.json();
				console.log("Booking successful!", bookingData.success.data);

				// Display success message
				hotelsDiv.innerHTML = `
					<div class="success-message">
						<h2>Booking Confirmed!</h2>
						<p>Your booking ID is: ${bookingData.success.data.bookingId}</p>
						<p>Status: ${bookingData.success.data.status}</p>
						<p>Total Amount: ${bookingData.success.data.totalAmount} ${bookingData.success.data.currency}</p>
					</div>
				`;
			} catch (error) {
				console.error("Error completing booking:", error);
				hotelsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
			} finally {
				loader.style.display = "none";
			}
		});
	} catch (error) {
		console.error("Error in booking process:", error);
		hotelsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
		loader.style.display = "none";
	}
}

function displayHotelDetails(hotelInfo, rateInfo) {
	const hotelsDiv = document.getElementById("hotels");
	const hotelDetailsHtml = `
		<div class="hotel-details-container">
			<h2>${hotelInfo.name}</h2>
			<img src="${hotelInfo.main_photo}" alt="${hotelInfo.name}" class="hotel-main-photo"/>
			<p><strong>Address:</strong> ${hotelInfo.address.street}, ${hotelInfo.address.city}, ${hotelInfo.address.country}</p>
			<p><strong>Description:</strong> ${hotelInfo.description}</p>
			<h3>Available Room Types:</h3>
			<div class="room-types-grid">
				${rateInfo.map(room => `
					<div class="room-card">
						<h4>${room[0].rateName}</h4>
						<p>Board: ${room[0].board}</p>
						<p>Refundable: ${room[0].refundableTag === "RFN" ? "Yes" : "No"}</p>
						<p>Price: ${room[0].retailRate} ${room[0].currency}</p>
					</div>
				`).join('')}
			</div>
		</div>
	`;
	hotelsDiv.innerHTML = hotelDetailsHtml;
}

function displayPaymentInfo(data) {
	console.log("display payment data function called)")
	const paymentDiv = document.getElementById('hotels');
	if (!paymentDiv) {
		console.error('paymentInfo div not found');
		return;
	}
	// Destructure the necessary data from the object
	const { price, currency, voucherTotalAmount } = data;

	// Create content for the div
	let content = `<div class="payment-info-container">
		<div class="secure-label"><i class='fa-solid fa-lock'></i> Secure Payment</div>
		<div class="amount">${price} ${currency}</div>`;

	// Check if voucherTotalAmount is available and add it to the content
	if (voucherTotalAmount && voucherTotalAmount > 0) {
		content += `<div class="voucher">Voucher Total Amount: ${voucherTotalAmount} ${currency}</div>`;
	}

	// Add payment methods
	content += `
		<div class="payment-methods">
			<i class="fab fa-cc-visa"></i>
			<i class="fab fa-cc-mastercard"></i>
			<i class="fab fa-cc-amex"></i>
			<i class="fab fa-cc-paypal"></i>
		</div>
		<div class="trust-badges">
			<span><i class="fas fa-shield-alt"></i> Secure Checkout</span>
			<span><i class="fas fa-lock"></i> SSL Encrypted</span>
			<span><i class="fas fa-check-circle"></i> Verified Payment</span>
		</div>
	</div>`;

	// Update the div's content
	paymentDiv.innerHTML = content;
}