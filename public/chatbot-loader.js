document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("loadChatbotBtn");
  if (!btn) return;

  // Button styles
  btn.style.cssText = `
    padding: 12px;
    background: #6b46c1;
    color: white;
    border: none;
    border-radius: 50%;
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999;
    cursor: pointer;
    font-size: 24px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Use inline SVG instead of <ion-icon>
  btn.innerHTML = `
<svg width="32" height="32" viewBox="0 0 24 24" fill="white" class="chat-icon-bounce" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 21l1.65-4.95A9 9 0 1 1 12 21a9.05 9.05 0 0 1-4.95-1.65L2 21z" fill="currentColor"/>
</svg>

<style>
.chat-icon-bounce {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.15); }
}
</style>
  `;

  // Hover effect
  btn.addEventListener("mouseenter", function () {
    btn.style.filter = "brightness(90%)";
  });
  btn.addEventListener("mouseleave", function () {
    btn.style.filter = "brightness(100%)";
  });

  // Chatbot loader
  btn.addEventListener("click", function () {
    // console.log("Button clicked");
    if (!window.ChatBotLoaded) {
      // console.log("ChatBot not loaded yet, loading now...");
      const script = document.createElement("script");
      //   script.src = "http://localhost:3000/chatbot-embed.js";
      script.src =
        "https://nimble-cheesecake-e7f6c4.netlify.app/chatbot-embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // console.log("ChatBot already loaded.");
    }
  });
});
