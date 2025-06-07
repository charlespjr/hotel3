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
    // const chatbotCloseButton = document.getElementById('chatbot-close-button'); // Commented out
    // const messagesContainer = document.getElementById('chatbot-messages-container'); // Commented out
    // const chatbotInput = document.getElementById('chatbot-input'); // Commented out
    // const chatbotSendButton = document.getElementById('chatbot-send-button'); // Commented out

    // const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : ''; // Commented out
    // let conversationHistory = []; // Commented out

    // Function to toggle chatbot window visibility
    if (chatbotToggleButton && chatbotWindow) {
        console.log("Chatbot toggle button and window elements found by JavaScript (Simplified Version).");
        chatbotToggleButton.addEventListener('click', () => {
            console.log("Toggle button clicked! (Simplified Version)");
            chatbotWindow.classList.toggle('chatbot-hidden');
            console.log("chatbot-window classes after toggle (Simplified Version):", chatbotWindow.className);
            // Focusing logic removed as chatbotInput is commented out
        });
    } else {
        console.error("Chatbot toggle button or window element NOT found in the DOM (Simplified Version). Check IDs in index.html and chatbot.js.");
    }

    /*
    // All other functions and event listeners are commented out below

    if (chatbotCloseButton && chatbotWindow) {
        console.log("Chatbot close button found by JavaScript.");
        chatbotCloseButton.addEventListener('click', () => {
            console.log("Close button clicked!");
            chatbotWindow.classList.add('chatbot-hidden');
            console.log("chatbot-window classes after close:", chatbotWindow.className);
        });
    } else {
        console.error("Chatbot close button NOT found in the DOM.");
    }

    function appendMessage(text, sender, data = null) {
        // ... entire function content commented out ...
    }

    async function sendMessage() {
        // ... entire function content commented out ...
    }

    if (chatbotSendButton) {
        // ... event listener commented out ...
    }

    if (chatbotInput) {
        // ... event listener commented out ...
    }

    // Optional: Initial greeting
    // appendMessage("Hello! How can I help you find the perfect hotel today?", 'bot');
    // conversationHistory.push({ role: 'assistant', content: "Hello! How can I help you find the perfect hotel today?" });
    */
});
