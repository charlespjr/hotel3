// Initialize the SDK with your API key

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

	console.log("Search parameters:", { checkin, checkout, adults, city, countryCode });

	try {
		// Make a request to your backend server
		const response = await fetch(
			`${API_URL}/api/search-hotels?checkin=${checkin}&checkout=${checkout}&adults=${adults}&city=${city}&countryCode=${countryCode}`
		);
		
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to fetch hotels');
		}

		const data = await response.json();
		console.log("Received data:", data);

		if (!data.rates || data.rates.length === 0) {
			hotelsDiv.innerHTML = "<p>No hotels found for the given criteria.</p>";
			document.getElementById("loader").style.display = "none";
			return;
		}

		displayRatesAndHotels(data.rates);
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
		const minRate = rate.roomTypes.reduce((min, current) => {
			const minAmount = min.rates[0].retailRate.total[0].amount;
			const currentAmount = current.rates[0].retailRate.total[0].amount;
			return minAmount < currentAmount ? min : current;
		});
		console.log();

		const hotelElement = document.createElement("div");
		hotelElement.innerHTML = `
		<div class='card-container'>
		<div class='card'>
			<div class='flex items-start'>
				<div class='card-image'>
					<img
						src='${rate.hotel.main_photo}'
						alt='hotel'
					/>
				</div>
				<div class='flex-between-end w-full'>
					<div>
						<h4 class='card-title'>${minRate.rates[0].name}</h4>
						<h3 class='card-id'>Hotel Name : ${rate.hotel.name}</h3>
						<p class='featues'>
							Max Occupancy ∙ <span>${minRate.rates[0].maxOccupancy}</span> Adult Count
							∙ <span>${minRate.rates[0].adultCount}</span> Child Count ∙
							<span>${minRate.rates[0].childCount}</span>
							Board Type ∙ <span>${minRate.rates[0].boardType}</span> Board Name ∙
							<span> ${minRate.rates[0].boardName}</span>
						</p>
						<p class='red flex items-center'>
							<span>
								${minRate.rates[0].cancellationPolicies.refundableTag == "NRFN"
				? "Non refundable"
				: "Refundable"
			}
							</span>
						</p>
					</div>
					<p class='flex flex-col mb-0'>
    					<span class=${minRate.rates[0].retailRate.total[0].amount}></span>
   						<span class=${minRate.rates[0].retailRate.suggestedSellingPrice[0].amount}></span>
   						<button class='price-btn' onclick="proceedToBooking('${minRate.offerId}')">
       						 <s>${minRate.rates[0].retailRate.suggestedSellingPrice[0].amount} ${minRate.rates[0].retailRate.suggestedSellingPrice[0].currency}</s>
        					BOOK NOW ${minRate.rates[0].retailRate.total[0].amount} ${minRate.rates[0].retailRate.total[0].currency}
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

async function proceedToBooking(rateId) {
	console.log("Proceeding to booking for hotel ID:", rateId);

	// Clear existing HTML and display the loader
	const hotelsDiv = document.getElementById("hotels");
	const loader = document.getElementById("loader");
	hotelsDiv.innerHTML = "";
	loader.style.display = "block";

	// Create and append the form dynamically
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
          <label>
            Voucher Code (Optional)
            <input type="text" name="voucher" placeholder="Enter voucher code if you have one">
          </label>
        </div>

        <input type="submit" value="Proceed to Payment">
      </form>
    </div>
  `;
	hotelsDiv.innerHTML = formHtml;
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
			// Include additional guest details in the payment processing request
			const bodyData = {
				rateId
			};

			// Add voucher if it exists
			if (voucher) {
				bodyData.voucherCode = voucher;
			}
			console.log(bodyData);

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
				currency: prebookData.success.data.currency,
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