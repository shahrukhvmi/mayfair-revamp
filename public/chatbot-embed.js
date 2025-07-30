(function () {
  // const allowedOrigins = [
  //   "https://nimble-cheesecake-e7f6c4.netlify.app",
  //   "http://localhost:3000",
  //   "http://chat-embed.test",
  // ];

  // // Soft protection — validate document.referrer
  // const referrer = document.referrer;
  // const isValid = allowedOrigins.some((origin) => referrer.startsWith(origin));

  // if (!isValid) {
  //   console.warn("🚫 Unauthorized domain: ", referrer);
  //   return; // Stop execution, don’t load the chatbot
  // }

  // ✅ Safe to proceed
  if (window.ChatBotLoaded) return;
  window.ChatBotLoaded = true;

  const iframe = document.createElement("iframe");
  iframe.src = "https://nimble-cheesecake-e7f6c4.netlify.app/embed";
  // iframe.src = "http://localhost:3000/embed";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "380px";
  iframe.style.height = "700px";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.style.borderRadius = "0px";
  iframe.id = "myChatBotFrame";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "−";
  // closeBtn.innerHTML = "×";
  closeBtn.style.fontWeight = "700";
  // closeBtn.style.fontFamily = "monospace";
  closeBtn.style.position = "fixed";
  closeBtn.style.bottom = "669px";
  closeBtn.style.right = "37px";
  closeBtn.style.background = "#f9fafb";
  closeBtn.style.color = "#99a1af";
  closeBtn.style.border = "1px solid #f9fafb";
  closeBtn.addEventListener("mouseenter", function () {
    closeBtn.style.borderColor = "#e5e7eb";
  });
  closeBtn.addEventListener("mouseleave", function () {
    closeBtn.style.borderColor = "#f9fafb";
  });
  closeBtn.style.borderRadius = "8px";
  closeBtn.style.width = "45px";
  closeBtn.style.height = "33px";
  closeBtn.style.fontSize = "26px";
  closeBtn.style.zIndex = "10000";
  closeBtn.style.cursor = "pointer";

  closeBtn.onclick = function () {
    iframe.remove();
    closeBtn.remove();
    window.ChatBotLoaded = false;
  };

  document.body.appendChild(iframe);
  setTimeout(() => {
    document.body.appendChild(closeBtn);
  }, 1200);
})();
