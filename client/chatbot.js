/**
 * Client-side JavaScript for the chatbot interface.
 * Handles:
 * - Toggling chat window visibility.
 * - Sending user messages to the backend (/api/chatbot/converse).
 * - Receiving and displaying bot responses, including hotel search results as cards.
 * - Managing conversation history with the backend.
 * - Navigating to the hotel details page.
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggleButton = document.getElementById('chatbot-toggle-button');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotCloseButton = document.getElementById('chatbot-close-button');
    const messagesContainer = document.getElementById('chatbot-messages-container');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSendButton = document.getElementById('chatbot-send-button');

    // Determine API URL (same as app.js)
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '';

    let conversationHistory = [];

    // Function to toggle chatbot window visibility
    if (chatbotToggleButton && chatbotWindow) {
        console.log("Chatbot toggle button and window elements found by JavaScript."); // New log
        chatbotToggleButton.addEventListener('click', () => {
            console.log("Toggle button clicked!"); // New log
            chatbotWindow.classList.toggle('chatbot-hidden');
            console.log("chatbot-window classes after toggle:", chatbotWindow.className); // New log
            if (!chatbotWindow.classList.contains('chatbot-hidden')) {
                // const chatbotInput = document.getElementById('chatbot-input'); // Already defined globally in this scope
                if(chatbotInput) {
                    chatbotInput.focus();
                    console.log("Chat window opened, input focused."); // New log
                } else {
                    console.error("Chatbot input field not found when trying to focus."); // New log
                }
            } else {
                console.log("Chat window closed."); // New log
            }
        });
    } else {
        console.error("Chatbot toggle button or window element NOT found in the DOM. Check IDs in index.html and chatbot.js.");
    }

    if (chatbotCloseButton && chatbotWindow) {
        console.log("Chatbot close button found by JavaScript."); // New log
        chatbotCloseButton.addEventListener('click', () => {
            console.log("Close button clicked!"); // New log
            chatbotWindow.classList.add('chatbot-hidden');
            console.log("chatbot-window classes after close:", chatbotWindow.className); // New log
        });
    } else {
        // This log was already good
        console.error("Chatbot close button NOT found in the DOM.");
    }

    /**
     * Appends a message to the chat window.
     * @param {string} text - The message text.
     * @param {string} sender - 'user', 'bot', 'bot-typing', or 'bot-error'.
     * @param {object} [data=null] - Optional data, used for rendering hotel cards if sender is 'bot'.
     */
    function appendMessage(text, sender, data = null) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        if (sender === 'bot-typing') { // Class for "Thinking..."
            messageDiv.classList.add('bot-typing-message');
        }
        if (sender === 'bot-error') { // Class for error messages
            messageDiv.classList.add('bot-error-message');
        }

        // Sanitize text before setting as innerHTML if it might contain HTML
        // For simple text, innerText is safer. If rendering hotel cards, we need innerHTML.
        // If the bot's response includes hotel data, render it as cards.
        if (sender === 'bot' && data && data.is_hotel_list && data.hotel_data && data.hotel_data.length > 0) {
            let htmlContent = `<p>${text}</p>`; // The bot's textual reply
            htmlContent += "<div class='hotel-cards-container'>";
            data.hotel_data.slice(0, 5).forEach(hotelRate => { // Display up to 5 hotels
                const hotel = hotelRate.hotel;
                if (hotel) {
                    let checkin = '';
                    let checkout = '';
                    let adults = '1'; // Default to 1 adult

                    // Attempt to get checkin, checkout, adults from conversation history for the "View Details" link.
                    // This relies on the backend returning history that includes DeepSeek's tool call with arguments.
                    // A more robust client-side state management for these params could be a future enhancement.
                    if(conversationHistory && conversationHistory.length > 0){
                        const lastToolCallMsg = conversationHistory.filter(m => m.role === 'assistant' && m.tool_calls && m.tool_calls[0] && m.tool_calls[0].function && m.tool_calls[0].function.name === 'get_hotel_availability').pop();
                        if(lastToolCallMsg && lastToolCallMsg.tool_calls[0].function.arguments){
                            try {
                                const args = JSON.parse(lastToolCallMsg.tool_calls[0].function.arguments);
                                checkin = args.checkin || '';
                                checkout = args.checkout || '';
                                adults = args.adults || '1';
                            } catch (e) { console.error("Error parsing tool call arguments for details link:", e); }
                        }
                    }

                    htmlContent += `
                        <div class="hotel-card">
                            <h4>${hotel.name} (ID: ${hotel.id})</h4>
                            <p>City: ${hotel.city || 'N/A'}</p>
                            <button class="view-details-button"
                                    data-hotel-id="${hotel.id}"
                                    data-checkin="${checkin}"
                                    data-checkout="${checkout}"
                                    data-adults="${adults}">View Details</button>
                        </div>`;
                }
            });
            htmlContent += "</div>";
            messageDiv.innerHTML = htmlContent;
        } else {
            messageDiv.innerText = text;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add event listeners to newly added "View Details" buttons
        /*
        if (sender === 'bot' && data && data.is_hotel_list && data.hotel_data) {
            const viewDetailsButtons = messageDiv.querySelectorAll('.view-details-button');
            viewDetailsButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const hotelId = event.target.dataset.hotelId;
                    const btnCheckin = event.target.dataset.checkin;
                    const btnCheckout = event.target.dataset.checkout;
                    const btnAdults = event.target.dataset.adults;

                    console.log(\`View Details clicked for hotelId: \${hotelId}, checkin: \${btnCheckin}, checkout: \${btnCheckout}, adults: \${btnAdults}\`); // Debug log

                    if (hotelId) {
                        if (btnCheckin && btnCheckout && btnAdults && btnCheckin !== 'undefined' && btnCheckout !== 'undefined' && btnAdults !== 'undefined' && btnCheckin !== '' && btnCheckout !== '' && btnAdults !== '') {
                            // All parameters from button's data attributes are valid
                            window.location.href = \`details.html?hotelId=\${hotelId}&checkin=\${btnCheckin}&checkout=\${btnCheckout}&adults=\${btnAdults}\`;
                        } else {
                            // Attempt to get from main page form fields as a fallback
                            console.log("Attempting to get params from main page form for details link.");
                            const mainPageCheckinElem = document.getElementById('checkin');
                            const mainPageCheckoutElem = document.getElementById('checkout');
                            const mainPageAdultsElem = document.getElementById('adults');

                            const mainPageCheckin = mainPageCheckinElem ? mainPageCheckinElem.value : '';
                            const mainPageCheckout = mainPageCheckoutElem ? mainPageCheckoutElem.value : '';
                            const mainPageAdults = mainPageAdultsElem ? mainPageAdultsElem.value : '1';

                            if (mainPageCheckin && mainPageCheckout && mainPageAdults) {
                                console.log(\`Using main page form params: \${mainPageCheckin}, \${mainPageCheckout}, \${mainPageAdults}\`);
                                window.location.href = \`details.html?hotelId=\${hotelId}&checkin=\${mainPageCheckin}&checkout=\${mainPageCheckout}&adults=\${mainPageAdults}\`;
                            } else {
                                // Final fallback: navigate with only hotelId
                                console.warn("Could not determine all search parameters (dates, adults) to view details. Navigating with Hotel ID only.");
                                alert("Could not fully determine search parameters (dates, adults) from the conversation. You might need to re-enter them on the details page. Navigating with Hotel ID only.");
                                window.location.href = \`details.html?hotelId=\${hotelId}\`;
                            }
                        }
                    } else {
                        console.error("View Details clicked, but hotelId is missing from button data.");
                    }
                });
            });
        }
        */
    }

    /**
     * Handles sending the user's message to the backend and processing the response.
     */
    async function sendMessage() {
        const messageText = chatbotInput.value.trim();
        if (!messageText) return;

        appendMessage(messageText, 'user');

        chatbotInput.value = '';
        chatbotInput.disabled = true;
        chatbotSendButton.disabled = true;
        appendMessage("Thinking...", 'bot-typing');

        try {
            // Send the user's message and the current conversation history to the backend.
            // The backend will manage the definitive conversation history including system prompts and tool interactions.
            const response = await fetch(\`\${API_URL}/api/chatbot/converse\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, history: conversationHistory })
            });

            const typingMessage = messagesContainer.querySelector('.bot-typing-message');
            if (typingMessage) typingMessage.remove();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || \`HTTP error! status: \${response.status}\`);
            }

            const data = await response.json();

            appendMessage(data.reply, 'bot', { hotel_data: data.hotel_data, is_hotel_list: data.is_hotel_list });

            // Update client-side conversation history with the full history from the server.
            // This ensures context is maintained correctly for subsequent calls to DeepSeek.
            if (data.history) {
                conversationHistory = data.history;
            } else {
                // This fallback is not ideal as it won't accurately reflect tool calls.
                conversationHistory.push({ role: 'user', content: messageText });
                conversationHistory.push({ role: 'assistant', content: data.reply });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Ensure "Thinking..." is removed on error too
            const typingMessageOnError = messagesContainer.querySelector('.bot-typing-message');
            if (typingMessageOnError) typingMessageOnError.remove();

            appendMessage(\`Error: \${error.message}\`, 'bot-error');
        } finally {
            chatbotInput.disabled = false;
            chatbotSendButton.disabled = false;
            chatbotInput.focus();
        }
    }

    if (chatbotSendButton) {
        chatbotSendButton.addEventListener('click', sendMessage);
    }

    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Optional: Initial greeting
    // appendMessage("Hello! How can I help you find the perfect hotel today?", 'bot');
    // conversationHistory.push({ role: 'assistant', content: "Hello! How can I help you find the perfect hotel today?" });
});
