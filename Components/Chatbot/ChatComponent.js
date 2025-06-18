"use client";
import { act, use, useEffect, useRef, useState } from "react";
import { FaBars, FaTimes, FaSignOutAlt, FaTrash } from "react-icons/fa";
import {
  FiMessageCircle,
  FiXCircle,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import { app_url } from "@/config/constants";

const quickQuestions = [
  {
    label: "My Last Consultation",
    message: "Can you show me my previous consultation details?",
  },
  {
    label: "My Order Current Status",
    message: "what is the current status of my order?",
  },
  {
    label: "My Order History",
    message: "Can you show me my complete order history?",
  },
  {
    label: "Order Delivery Info",
    message: "When will my most recent order be delivered?",
  },
  { label: "Order Issues", message: "I need help with issues in my order." },
  {
    label: "Consultation Summary",
    message: "Can you give me a summary of my last consultation?",
  },
  {
    label: "Help with Prescription",
    message: "I need help understanding or changing my prescription.",
  },
  {
    label: "Change Address",
    message: "How do I update or change my shipping address?",
  },
  {
    label: "Contact Clinic",
    message: "How can I directly contact the clinic team?",
  },
  {
    label: "Clinic Opening Times",
    message: "What are the official opening and closing hours of clinic?",
  },
  {
    label: "Last Order Total",
    message: "What was the total cost of my most recent order?",
  },
  { label: "My Orders", message: "Can you summarize my previous order?" },
];

const finalFaqs = [
  {
    label: "Chatbot Guide - How to use?",
    message: "can you provide the guide how to use chatbot",
  },
  {
    label: "What weight loss programs do you offer?",
    message: "What weight loss programs do you offer",
  },
  {
    label: "How can I book a consultation?",
    message: "How can I book a consultation",
  },
  {
    label: "What is the cost of your treatments?",
    message: "What is the cost of your treatments",
  },
  {
    label: "Do you offer GLP-1 injections like Ozempic?",
    message: "Do you offer GLP-1 injections like Ozempic",
  },
  {
    label: "Is the consultation done online or in person?",
    message: "Is the consultation done online or in person",
  },
  {
    label: "Do you offer a refund if the treatment doesn't work?",
    message: "Do you offer a refund if the treatment does not work",
  },
  {
    label: "What are the side effects of weight loss injections?",
    message: "What are the side effects of weight loss injections",
  },
  {
    label: "How soon can I see results?",
    message: "How soon can I see results?",
  },
  {
    label: "Can I speak to a licensed doctor or clinician?",
    message: "Can I speak to a licensed doctor or clinician",
  },
  {
    label: "How do I reorder my medication?",
    message: "How do I reorder my medication",
  },
  {
    label: "What happens during my first consultation?",
    message: "What happens during my first consultation",
  },
  {
    label: "Are your treatments safe and approved?",
    message: "Are your treatments safe and approved",
  },
  {
    label: "How do I cancel or reschedule an appointment?",
    message: "How do I cancel or reschedule an appointment",
  },
  {
    label: "Do I need a prescription before starting?",
    message: "Do I need a prescription before starting",
  },
  {
    label: "How do I check the status of my order?",
    message: "How do I check the status of my order",
  },
  {
    label: "What should I do if I missed my dose?",
    message: "What should I do if I missed my dose",
  },
  {
    label: "How can I track my progress?",
    message: "How can I track my progress",
  },
  {
    label: "Do you provide diet or fitness plans too?",
    message: "Do you provide diet or fitness plans too",
  },
  {
    label: "Can I speak to someone privately about my medical history?",
    message: "Can I speak to someone privately about my medical history",
  },
  {
    label: "How do I contact support for urgent issues?",
    message: "How do I contact support for urgent issues",
  },
];

function getLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}
function setLocal(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export default function ChatComponent() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [showEmailExist, setShowEmailExist] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showQuick, setShowQuick] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({
    browser: "Unknown",
    version: "Unknown",
  });
  const [prefill, setPrefill] = useState({
    fname: "",
    lname: "",
    email: "",
    orderId: "",
  });
  const [userSettings, setUserSettings] = useState({
    fname: "",
    lname: "",
    email: "",
    orderId: "",
  });
  const chatBoxRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [divWindow, setDivWindow] = useState(1918);
  const [divHeight, setDivHeight] = useState(0);
  const previousWidthRef = useRef(0);
  const [inputIsFocus, setInputIsFocus] = useState(false);
  const textareaRef = useRef(null);

  const enterFullScreen = () => {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen(); // Firefox
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(); // Safari and Chrome
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen(); // IE/Edge
    }
  };

  const exitFullScreen = () => {
    if (!document.fullscreenElement) return;

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen(); // Firefox
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Safari and Chrome
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen(); // IE/Edge
    }
  };

  const isFullScreen = () => {
    return (
      !!document.fullscreenElement ||
      !!document.mozFullScreenElement ||
      !!document.webkitFullscreenElement ||
      !!document.msFullscreenElement
    );
  };

  const toggleFullScreen = () => {
    if (!isFullScreen()) {
      // enterFullScreen();
      console.log("enterFullScreen");
    } else {
      // exitFullScreen();
      console.log("exitFullScreen");
    }
  };

  const getBrowserAndVersion = () => {
    const userAgent = navigator.userAgent;
    let browser, version;

    if (userAgent.includes("Chrome") && userAgent.includes("Safari")) {
      browser = "Chrome";
      version = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1];
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
      version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1];
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browser = "Safari";
      version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1];
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
      version = userAgent.match(/Edge\/(\d+\.\d+)/)?.[1];
    } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
      browser = "Internet Explorer";
      version = userAgent.match(/(MSIE \d+\.\d+)/)?.[0];
    } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
      browser = "Opera";
      version = userAgent.match(/OPR\/(\d+\.\d+)/)?.[1];
    } else {
      browser = "Unknown";
      version = "Unknown";
    }

    return { browser, version };
  };

  console.log(getBrowserAndVersion());
  useEffect(() => {
    const { browser, version } = getBrowserAndVersion();
    setBrowserInfo({ browser, version });
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `     
      div::-webkit-scrollbar, body::-webkit-scrollbar {
        display: none; /* Hide scrollbars in Webkit browsers (Chrome, Safari, Edge) */
      }
      div {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      body {
        height: 100%;
      }
      body {
        height: calc(var(--vh, 1vh) * 100);
      }
      textarea {
        resize: vertical; 
        min-height: calc(1.5em * 2);
        max-height: calc(1.5em * 5);
        overflow-y: hidden;
        cursor:text;
      }
      textarea::-webkit-resizer {
        display: none;
      }
      input{
        cursor: text;
      }
      button{
        cursor: pointer;
      }
      button[disabled] {
        cursor: not-allowed;
      }
      a {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  //   custom start
  useEffect(() => {
    const width = window.innerWidth;
    previousWidthRef.current = width;
  }, []);

  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);
  const cb = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  };

  useEffect(() => {
    const div = document.getElementById("div-window");
    if (!div) return;

    setDivWidth(div.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDivWidth(entry.contentRect.width);
      }
    });

    observer.observe(div);

    const handleClick = () => {
      const updatedDiv = document.getElementById("div-window");
      if (updatedDiv) {
        setDivWidth(updatedDiv.offsetWidth);
      }
    };

    document.body.addEventListener("click", handleClick);

    return () => {
      observer.disconnect();
      document.body.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        requestAnimationFrame(() => {
          const div = document.getElementById("div-window");
          if (div) {
            const currentWidth = div.offsetWidth;

            if (previousWidthRef.current !== null) {
              setDivWidth(previousWidthRef.current);
              console.warn("Set Previous Width:", previousWidthRef.current);
            }

            previousWidthRef.current = currentWidth;
          } else {
            console.warn("#div-window not found in DOM");
          }
        });
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [isMaximized]);
  //   custom ends

  useEffect(() => {
    const divWindowwidth = document.getElementById("div-window");
    if (divWindowwidth) {
      setDivWindow(divWindowwidth.clientWidth);
      setDivHeight(divWindowwidth.clientHeight);
    }
  }, [isMaximized, windowWidth]);

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const getResponsiveClass = () => {
    if (isMaximized)
      return `top-0 right-0 ${
        divWidth <= cb.sm
          ? "w-screen"
          : divWidth <= cb.md
          ? "w-screen"
          : "w-screen"
      } ${window.innerWidth <= cb.sm ? "h-[98vh]" : "h-[100vh]"} rounded-none`;
    if (windowWidth <= 400) return `bottom-4 right-4 w-[94vw] h-[76vh]`;
    if (windowWidth <= 768) return `bottom-4 right-4 w-[90vw] h-[76vh]`;
    if (windowWidth <= 1024) return `bottom-4 right-4 w-[60vw] h-[76vh]`;
    return `bottom-4 right-4 w-[428px] h-[76vh]`;
  };

  useEffect(() => {
    const storedUser = getLocal("chat_user", null);
    setUser(storedUser);
    setOrderId(getLocal("order_data", { order_id: "" }).order_id || "");
    setChatHistory(getLocal("chat_history", []));
    const sidebarOpen = getLocal("faqSidebarOpen", false);
    setShowSidebar(storedUser && sidebarOpen);
    // setShowWelcome(!storedUser);
    setShowQuick(!!(storedUser && storedUser.email_exist));
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setLocal("chat_user", user);
  }, [user]);
  useEffect(() => {
    setLocal("order_data", { order_id: orderId });
  }, [orderId]);
  useEffect(() => {
    setLocal("chat_history", chatHistory);
  }, [chatHistory]);
  useEffect(() => {
    setLocal("faqSidebarOpen", showSidebar);
  }, [showSidebar]);

  useEffect(() => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chatHistory, loading]);

  useEffect(() => {
    if (user && user.email_exist) {
      fetch(app_url + "/chat-user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          order_type: "treatment",
          order_id: orderId,
        }),
      })
        .then((res) => res.json())
        .then((data) => setUserDetails(data))
        .catch(() => setUserDetails(null));
    }
  }, [user, orderId]);

  useEffect(() => {
    if (!user) setShowSidebar(false);
    else setShowSidebar(getLocal("faqSidebarOpen", false));
  }, [user]);

  function handleEmailSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const order = e.target.orderId.value.trim();
    if (!email) return alert("Please provide an email to continue.");
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      return alert("Please provide a valid email address.");
    fetch(app_url + "/consultant-chat-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, orderId: order }),
    })
      .then((res) => res.json())
      .then((res) => {
        setUser({ email, email_exist: res.email_exist });
        setChatHistory([]);
        setOrderId(order);
        setShowWelcome(true);
        setShowQuick(res.email_exist);
        setShowEmailExist(!res.email_exist);
      })
      .catch((err) => alert("Verification failed."));
  }

  useEffect(() => {
    const existChatUser = localStorage.getItem("chat_user");
    const signupData = localStorage.getItem("signup-storage");

    if (signupData) {
      try {
        const parsed = JSON.parse(signupData);
        const state = parsed?.state || {};
        const { firstName, lastName, email } = state;

        if (firstName && lastName && email) {
          setPrefill({
            fname: firstName,
            lname: lastName,
            email,
            orderId: localStorage.getItem("order_id") || "",
          });
        }
      } catch (err) {
        console.warn("Could not parse signup-storage:", err);
      }
    }
  }, [isOpen]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = { sender: "user", text: inputMsg.trim() };
    setChatHistory((prev) => [...prev, userMsg]);
    setInputMsg("");
    setLoading(true);

    try {
      const res = await fetch(app_url + "/consultant-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: inputMsg.trim(),
          order_id: orderId || "",
          ...(user || {}),
        }),
      });

      const data = await res.json();

      if (
        data.status === "success" &&
        data.providedOrderId &&
        data.providedOrderId !== ""
      ) {
        setOrderId(data.providedOrderId);
      }
      if (data.message) {
        setOrderId("");
      }

      if (
        data.message &&
        typeof data.message === "string" &&
        data.message.trim()
      ) {
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: data.message.trim() },
        ]);
        setLoading(false);
        return;
      }

      if (data.errors && data.errors.order_id) {
        const errorMsg = data.errors.order_id[0];
        setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
        setLoading(false);
        return;
      }

      const replyText = (
        data.response ||
        data.message ||
        "No response from server."
      )
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      const botMsg = { sender: "bot", text: replyText };
      setChatHistory((prev) => [...prev, botMsg]);
      setShowQuick(!!(user && user.email_exist));
    } catch (err) {
      const errorText = err.message || "Something went wrong.";
      const botMsg = { sender: "bot", text: `<strong>${errorText}</strong>` };
      setChatHistory((prev) => [...prev, botMsg]);
      setOrderId("");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickBtn(msg) {
    setInputMsg(msg);
  }

  function handleFaqBtn(msg) {
    setInputMsg(msg);
    if (divWidth <= cb.sm) {
      setShowSidebar(false);
    }
  }

  function handleWelcomeBtn(msg) {
    setInputMsg(msg);
  }

  function handleUserSettingsSubmit(e) {
    e.preventDefault();

    setUser((prev) => ({
      ...prev,
      email: userSettings.email,
      fname: userSettings.fname,
      lname: userSettings.lname,
    }));
    setOrderId(userSettings.orderId);

    setUserDetails((prev) => ({
      ...prev,
      user_data: {
        ...prev?.user_data,
        fname: userSettings.fname,
        lname: userSettings.lname,
        user_name: `${userSettings.fname} ${userSettings.lname}`,
      },
    }));

    setShowUserSettings(false);
    alert("Your details updated successfully!");
  }

  const handleFocus = () => {
    setInputIsFocus(true);
    adjustTextareaHeight();
  };

  const handleBlur = () => {
    setInputIsFocus(false);
    if (inputMsg.trim() === "") {
      resetTextareaHeight();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const scrollHeight = textarea.scrollHeight;
    const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10);
    if (inputMsg.trim() === "") {
      textarea.style.height = "calc(1.5em * 1)";
      textarea.style.overflowY = "hidden";
    } else {
      if (scrollHeight >= maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = "hidden";
      }
    }
  };

  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "calc(1.5em * 1)";
      textarea.style.overflowY = "hidden";
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.addEventListener("input", adjustTextareaHeight);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", adjustTextareaHeight);
      }
    };
  }, [inputMsg]);

  function handleClearChat() {
    if (window.confirm("Are you sure you want to clear the chat?")) {
      setChatHistory([]);
      setShowWelcome(true);
    }
  }

  function handleLogout() {
    if (window.confirm("Are you sure you want to logout?")) {
      setUser(null);
      setChatHistory([]);
      setOrderId("");
      setUserDetails(null);
      setShowSidebar(false);
      setShowWelcome(false);
      setShowQuick(false);
      setShowEmailExist(false);
      setLocal("order_data", { order_id: "" });
    }
  }

  const filteredFaqs = finalFaqs.filter((f) =>
    f.label.toLowerCase().includes(faqSearch.toLowerCase())
  );

  function getQuickBtns() {
    if (!user || !user.email_exist) return [];
    const lowerInput = (inputMsg || "").toLowerCase();
    const scored = quickQuestions.map((q) => ({
      ...q,
      score:
        lowerInput.includes(q.message.toLowerCase()) ||
        q.message.toLowerCase().includes(lowerInput)
          ? 1
          : q.label
              .toLowerCase()
              .split(" ")
              .some((word) => lowerInput.includes(word))
          ? 0.5
          : 0,
    }));
    scored.sort((a, b) => b.score - a.score);
    const topRelevant = scored.slice(0, 2);
    const remaining = scored
      .slice(2)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [...topRelevant, ...remaining];
  }

  if (!hasMounted) return null;

  function OrderIdFormBotMessage({ message, onSuccess }) {
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus("⏳ Checking order status...");
      setLoading(true);

      let email = "";
      try {
        const chatUser = JSON.parse(localStorage.getItem("chat_user"));
        email = chatUser?.email || "";
      } catch {}

      try {
        const res = await fetch(app_url + "/consultant-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            message: `please process my record data and return me when i ask, this is my order id ${orderId} and here is my complete record data based on that order id, please process it.`,
            email,
            order_id: orderId,
          }),
        });
        const data = await res.json();
        if (
          data.status === "success" &&
          data.providedOrderId &&
          data.providedOrderId !== ""
        ) {
          setOrderId(data.providedOrderId);
        }

        setStatus(data.message ?? "✅ Verified! Now you can continue.");
        if (orderId) {
          localStorage.setItem(
            "order_data",
            JSON.stringify({ order_id: orderId })
          );
          if (onSuccess) onSuccess(orderId, data);
        }
      } catch {
        setStatus("❌ Unable to check order status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        style={{
          padding: 16,
          border: "1px solid #ccc",
          borderRadius: 12,
          background: "#f9f9ff",
          minWidth: 0,
          maxWidth: 350,
          margin: "10px 0px",
          textAlign: "center",
        }}
        className="text-gray-700"
      >
        <h2 style={{ margin: 12, fontSize: 18, color: "#7f22fe" }}>
          {message || "To Check Your Order Details"}
        </h2>
        <label
          htmlFor="order_id_input"
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Enter Your Order ID
        </label>
        <input
          type="text"
          name="order_id"
          id="order_id_input"
          className="text-gray-700 placeholder-gray-400"
          placeholder="e.g. 123456"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 12,
            fontSize: 14,
          }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "#7f22fe",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
          disabled={loading}
        >
          Continue
        </button>
        <p
          style={{
            marginTop: 16,
            fontSize: 14,
            // color: "red",
          }}
        >
          {status}
        </p>
      </form>
    );
  }

  const BotComponentMap = {
    OrderIdFormBotMessage: OrderIdFormBotMessage,
    // Add more components here as needed
  };

  // UI
  return (
    <>
      {/* Floating Icon */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (window.innerWidth <= cb.sm) {
              setIsMaximized(true);
            }
          }}
          className="fixed flex items-center justify-center text-white rounded-full shadow-lg z-999 bottom-4 right-4 w-14 h-14 bg-violet-600 hover:bg-violet-700"
          aria-label="Open Chat"
        >
          <FiMessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        // ${
        //     divWidth <= cb.sm
        //       ? "bg-green-500"
        //       : divWidth <= cb.md
        //       ? "bg-red-500"
        //       : divWidth <= cb.lg
        //       ? "bg-blue-500"
        //       : divWidth <= cb.xl
        //       ? "bg-purple-500"
        //       : divWidth <= cb["2xl"]
        //       ? "bg-orange-500"
        //       : "bg-black"
        //   }
        <div
          className={`fixed z-999 border scrollbar-hide border-gray-300 shadow-xl flex flex-col transition-all font-sans ease-in-out duration-300 overflow-hidden ${getResponsiveClass()} ${
            window.innerWidth <= cb.sm
              ? ""
              : divWidth <= cb.sm
              ? "rounded-xl"
              : divWidth <= cb.md
              ? "rounded-xl"
              : ""
          } ${window.innerWidth <= cb.sm ? "h-[100vh]" : "100vh"} `}
          id="div-window"
          ref={divRef}
        >
          {/* <p className="text-lg font-semibold text-center text-white">
            = {divWidth}px
          </p> */}

          {/* Chat Content */}
          <div className="flex-1 w-full h-full font-sans transition-all duration-300 ease-in-out">
            <div
              className={`flex flex-col w-full ${
                window.innerWidth <= cb.sm ? "h-[98vh]" : "h-screen"
              } overflow-y-hidden font-sans`}
            >
              {/* Header */}
              <header className="flex items-center justify-between w-full p-4 text-gray-600 bg-white border-b border-gray-200">
                {user && (
                  <button
                    id="open-faq"
                    className="z-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1"
                    onClick={() => setShowSidebar((s) => !s)}
                    aria-label={
                      showSidebar ? "Close FAQ Sidebar" : "Open FAQ Sidebar"
                    }
                  >
                    {showSidebar ? <FaTimes /> : <FaBars />}
                  </button>
                )}
                <div>
                  <div id="chat-controls" className={user ? "" : "hidden"}>
                    <div className="flex gap-2">
                      <p
                        id="email-exist"
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-500 ${
                          showEmailExist ? "" : "hidden"
                        }`}
                      >
                        {/* You are not registered yet. */}
                      </p>
                      <input
                        id="order-id"
                        type="text"
                        placeholder="Order ID"
                        name="order_id"
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-violet-500 border border-gray-200 rounded-lg focus:outline-none placeholder-gray-400 ${
                          orderId ? "" : "hidden"
                        } ${divWidth <= cb.sm ? "w-20" : "w-50"}`}
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />

                      <button
                        onClick={handleClearChat}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1"
                        aria-label="Clear Chat"
                      >
                        <FaTrash />{" "}
                        <span
                          className={`${divWidth <= cb.sm ? "hidden" : ""}`}
                        >
                          Clear Chat
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-500 border-red-50 border bg-red-50 hover:border-red-200 rounded-lg flex items-center gap-1"
                        aria-label="Exit"
                      >
                        <FaSignOutAlt />{" "}
                        <span
                          className={`${divWidth <= cb.sm ? "hidden" : ""}`}
                        >
                          Exit
                        </span>
                      </button>
                      <div className="flex items-center gap-2">
                        {window.innerWidth >= cb.sm && (
                          <button
                            onClick={() => {
                              setIsMaximized((prev) => !prev);
                              if (window.innerWidth <= cb.sm) {
                                toggleFullScreen();
                              }
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-violet-500 border-violet-50 border bg-violet-50 hover:border-violet-200 rounded-lg flex items-center gap-1"
                            aria-label={isMaximized ? "Minimize" : "Maximize"}
                          >
                            {/* {isMaximized ? "🗕" : "🗖"} */}
                            {isMaximized ? (
                              <FiMaximize2 size={18} />
                            ) : (
                              <FiMinimize2 size={18} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500"
                          aria-label="Close"
                        >
                          <FiXCircle size={28} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {!user && (
                  <>
                    <p className="w-full text-base font-semibold text-left text-muted">
                      Welcome To Mayfair Assistant
                    </p>
                    <div className="flex gap-2">
                      {window.innerWidth >= cb.sm && (
                        <button
                          onClick={() => {
                            setIsMaximized((prev) => !prev);
                            if (window.innerWidth <= cb.sm) {
                              toggleFullScreen();
                            }
                          }}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-violet-500 border-violet-50 border bg-violet-50 hover:border-violet-200 rounded-lg flex items-center gap-1"
                          aria-label={isMaximized ? "Minimize" : "Maximize"}
                        >
                          {/* {isMaximized ? "🗕" : "🗖"} */}
                          {isMaximized ? (
                            <FiMaximize2 size={18} />
                          ) : (
                            <FiMinimize2 size={18} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-sm text-red-500 hover:text-red-700"
                        aria-label="Close"
                      >
                        <FiXCircle size={28} />
                      </button>
                    </div>
                  </>
                )}
              </header>

              {/* User Settings Modal */}
              {showUserSettings && (
                <div className="fixed inset-0 flex items-center justify-center px-4 z-99999 bg-opacity-30 backdrop-blur-sm">
                  <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <button
                      className="absolute text-gray-400 top-2 right-2 hover:text-gray-700"
                      onClick={() => setShowUserSettings(false)}
                      aria-label="Close"
                    >
                      <FaTimes />
                    </button>
                    <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-violet-700">
                      <span>
                        <svg
                          className="inline w-5 h-5 text-violet-700"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 3.75a.75.75 0 011.5 0v1.09a7.501 7.501 0 013.36 1.39l.77-.77a.75.75 0 111.06 1.06l-.77.77a7.501 7.501 0 011.39 3.36h1.09a.75.75 0 010 1.5h-1.09a7.501 7.501 0 01-1.39 3.36l.77.77a.75.75 0 11-1.06 1.06l-.77-.77a7.501 7.501 0 01-3.36 1.39v1.09a.75.75 0 01-1.5 0v-1.09a7.501 7.501 0 01-3.36-1.39l-.77.77a.75.75 0 11-1.06-1.06l.77-.77a7.501 7.501 0 01-1.39-3.36H3.75a.75.75 0 010-1.5h1.09a7.501 7.501 0 011.39-3.36l-.77-.77a.75.75 0 111.06-1.06l.77.77a7.501 7.501 0 013.36-1.39V3.75z"
                          ></path>
                        </svg>
                      </span>
                      Edit Your Details
                    </h2>
                    <form
                      className="space-y-4 text-gray-700"
                      onSubmit={handleUserSettingsSubmit}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="fname"
                          placeholder="Enter your first name"
                          className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none"
                          value={userSettings.fname}
                          onChange={(e) =>
                            setUserSettings((s) => ({
                              ...s,
                              fname: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lname"
                          placeholder="Enter your last name"
                          className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none"
                          value={userSettings.lname}
                          onChange={(e) =>
                            setUserSettings((s) => ({
                              ...s,
                              lname: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none"
                          value={userSettings.email}
                          onChange={(e) =>
                            setUserSettings((s) => ({
                              ...s,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Order ID
                        </label>
                        <input
                          type="text"
                          name="orderId"
                          placeholder="e.g. 123456"
                          className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none"
                          value={userSettings.orderId}
                          onChange={(e) =>
                            setUserSettings((s) => ({
                              ...s,
                              orderId: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg"
                          onClick={() => setShowUserSettings(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm text-white rounded-lg bg-violet-600 hover:bg-violet-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="flex flex-1">
                {user && (
                  <>
                    <div
                      className={`transition-all duration-400 ease-in-out bg-gray-100  max-w-100 ${
                        showSidebar && divWidth >= cb.sm
                          ? "min-w-100"
                          : "min-w-0"
                      }`}
                    ></div>
                    <aside
                      style={{
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                      className={`${
                        showSidebar ? "left-0" : "left-[-100%]"
                      } bg-white transition-all ease-in-out duration-300 absolute z-100 max-w-100 p-4 border-r border-gray-200 overflow-y-auto scrollbar-hide
                       ${
                         divWidth <= cb.sm
                           ? "w-80"
                           : divWidth <= cb.md
                           ? "w-100"
                           : "w-100"
                       } ${
                        window.innerWidth >= cb.sm ? "h-[98vh]" : "h-[100vh]"
                      }`}
                      id="faq-sidebar"
                    >
                      <div
                        id="user-name"
                        className={`flex items-center justify-between font-semibold text-violet-700 uppercase border-b border-gray-200 pb-4 ${
                          userDetails ? "" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {/* Show fname/lname from chat_user if available, else fallback */}
                          {user?.fname && user?.lname
                            ? `${user.fname} ${user.lname}`
                            : userDetails?.user_data?.user_name || (
                                <p className="text-gray-500">No user found.</p>
                              )}
                          {/* Gear/Settings Icon */}
                        </span>
                        <button
                          className="ml-2 text-gray-400 hover:text-violet-700"
                          aria-label="Edit Your Details"
                          onClick={() => {
                            setUserSettings({
                              fname:
                                user?.fname ||
                                userDetails?.user_data?.fname ||
                                "",
                              lname:
                                user?.lname ||
                                userDetails?.user_data?.lname ||
                                "",
                              email: user?.email || "",
                              orderId: orderId || "",
                            });
                            setShowUserSettings(true);
                          }}
                          type="button"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.25 3.75a.75.75 0 011.5 0v1.09a7.501 7.501 0 013.36 1.39l.77-.77a.75.75 0 111.06 1.06l-.77.77a7.501 7.501 0 011.39 3.36h1.09a.75.75 0 010 1.5h-1.09a7.501 7.501 0 01-1.39 3.36l.77.77a.75.75 0 11-1.06 1.06l-.77-.77a7.501 7.501 0 01-3.36 1.39v1.09a.75.75 0 01-1.5 0v-1.09a7.501 7.501 0 01-3.36-1.39l-.77.77a.75.75 0 11-1.06-1.06l.77-.77a7.501 7.501 0 01-1.39-3.36H3.75a.75.75 0 010-1.5h1.09a7.501 7.501 0 011.39-3.36l-.77-.77a.75.75 0 111.06-1.06l.77.77a7.501 7.501 0 013.36-1.39V3.75z"
                            ></path>
                          </svg>
                        </button>
                      </div>
                      <div
                        className={`my-4 space-y-4 ${
                          userDetails ? "" : "hidden"
                        }`}
                        id="user-details"
                        style={{ display: "none" }}
                      >
                        <div className="grid grid-cols-2 gap-4 px-4">
                          <div className="p-4 text-center bg-gray-100 shadow-sm rounded-xl">
                            <p className="text-sm text-gray-600">
                              Total Orders
                            </p>
                            <p className="text-xl font-bold text-gray-800">
                              {userDetails?.orders_count?.total || 0}
                            </p>
                          </div>
                          <div className="p-4 text-center bg-green-100 shadow-sm rounded-xl">
                            <p className="text-sm text-green-700">Approved</p>
                            <p className="text-xl font-bold text-green-800">
                              {userDetails?.orders_count?.approved || 0}
                            </p>
                          </div>
                          <div className="p-4 text-center bg-red-100 shadow-sm rounded-xl">
                            <p className="text-sm text-red-700">Incomplete</p>
                            <p className="text-xl font-bold text-red-800">
                              {userDetails?.orders_count?.incomplete || 0}
                            </p>
                          </div>
                          <div className="p-4 text-center shadow-sm bg-violet-100 rounded-xl">
                            <p className="text-sm text-violet-700">
                              Processing
                            </p>
                            <p className="text-xl font-bold text-violet-800">
                              {userDetails?.orders_count?.processing || 0}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 mx-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                          <p className="text-sm text-gray-600">Last Order</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {userDetails?.last_tratment ?? "N/A"}
                          </p>
                          <p className="mt-2 text-sm text-gray-600">
                            Last Consultation
                          </p>
                          <p className="font-medium text-blue-700 text-md">
                            {userDetails?.last_order ?? "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-4 font-semibold uppercase border-b border-gray-200 text-violet-700">
                        FAQs
                      </div>
                      <div className="flex flex-col h-full py-4">
                        <input
                          type="text"
                          id="faq-search"
                          className="w-full px-4 py-2 mb-4 text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring"
                          placeholder="Search..."
                          value={faqSearch}
                          onChange={(e) => setFaqSearch(e.target.value)}
                        />
                        <div
                          id="faq-list"
                          className={`${
                            window.innerWidth >= cb.sm
                              ? "max-h-[98vh]"
                              : "max-h-screen"
                          } space-y-2 overflow-y-auto scrollbar-hide`}
                        >
                          {filteredFaqs.length === 0 ? (
                            <p className="px-4 py-2 text-sm text-gray-500">
                              No FAQs found.
                            </p>
                          ) : (
                            filteredFaqs.map((faq) => (
                              <button
                                key={faq.label}
                                className={`w-full py-2 text-left text-violet-800 transition bg-violet-100 rounded-lg hover:bg-violet-200 ${
                                  divWidth <= cb.sm
                                    ? "text-sm px-2"
                                    : divWidth <= cb.md
                                    ? "text-sm"
                                    : "text-md px-4"
                                }`}
                                onClick={() => handleFaqBtn(faq.message)}
                              >
                                {faq.label}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </aside>
                  </>
                )}

                {/* Chat area */}
                <main
                  className="flex-1 overflow-y-auto bg-white scrollbar-hide"
                  style={{
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {/* Email prompt */}
                  {!user && (
                    <form
                      id="email-prompt"
                      className="flex flex-col items-center justify-center flex-1 p-4 space-y-2 overflow-y-auto text-gray-700 bg-white h-100 scrollbar-hide sm:p-6 sm:space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        const fname = e.target.fname.value.trim();
                        const lname = e.target.lname.value.trim();
                        const email = e.target.email.value.trim();
                        const order = e.target.orderId.value.trim();
                        if (!fname || !lname) {
                          alert("Please provide your first and last name.");
                          setLoading(false);
                          return;
                        }
                        if (!email) {
                          alert("Please provide an email to continue.");
                          setLoading(false);
                          return;
                        }
                        if (
                          !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                            email
                          )
                        ) {
                          alert("Please provide a valid email address.");
                          setLoading(false);
                          return;
                        }
                        try {
                          const res = await fetch(
                            app_url + "/consultant-chat-verify",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email, orderId: order }),
                            }
                          );
                          const data = await res.json();
                          setUser({
                            email,
                            email_exist: data.email_exist,
                            fname,
                            lname,
                          });
                          setChatHistory([]);
                          setOrderId(order);
                          setShowWelcome(true);
                          setShowQuick(data.email_exist);
                          setShowEmailExist(!data.email_exist);
                        } catch {
                          alert("Verification failed.");
                        }
                        setLoading(false);
                      }}
                    >
                      <label className="flex items-center gap-2 text-xs text-gray-700 sm:text-sm">
                        <FaSignOutAlt className="text-violet-600" />
                        Please provide your details to continue:
                      </label>

                      <input
                        type="text"
                        name="fname"
                        required
                        placeholder="First Name"
                        defaultValue={prefill?.fname}
                        className="w-full max-w-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg bg-gray-50 sm:px-4 focus:outline-none"
                      />
                      <input
                        type="text"
                        name="lname"
                        required
                        placeholder="Last Name"
                        defaultValue={prefill?.lname}
                        className="w-full max-w-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg bg-gray-50 sm:px-4 focus:outline-none"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        defaultValue={prefill?.email}
                        className="w-full max-w-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg bg-gray-50 sm:px-4 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        name="orderId"
                        placeholder="Order ID (optional)"
                        defaultValue={prefill?.orderId}
                        className="w-full max-w-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg bg-gray-50 sm:px-4 focus:outline-none"
                      />

                      <button
                        type="submit"
                        className={`flex items-center gap-2 px-4 py-2 mt-2 text-sm text-white transition rounded-lg ${
                          loading
                            ? "bg-gray-500"
                            : "bg-violet-600 hover:bg-violet-700"
                        } sm:text-base`}
                        disabled={loading}
                      >
                        <FaSignOutAlt />
                        {loading ? (
                          <span className="flex items-center justify-center w-full">
                            Verifying...
                            <span className="inline-block w-6 h-6 ml-3 border-4 border-white rounded-full border-t-transparent animate-spin"></span>
                          </span>
                        ) : (
                          "Continue"
                        )}
                      </button>
                    </form>
                  )}
                  {/* Chat box */}
                  {user && (
                    <>
                      <div
                        id="chat-box"
                        ref={chatBoxRef}
                        className={`flex-1 transition-all ease-in-out duration-400 relative ${
                          window.innerWidth <= cb.sm ? "h-[98vh]" : "h-[100vh]"
                        } px-3 py-2 space-y-3 overflow-auto scrollbar-hide text-sm bg-gray-100 sm:px-4 sm:text-base ${
                          isMaximized
                            ? // ? "pb-[calc(100vh-47%)]"
                              "pb-[240px]"
                            : `pb-[440px]`
                        } ${showSidebar && divWidth >= cb.sm ? "" : "left-0"}`}
                        style={{ minHeight: 0 }}
                      >
                        {/* Welcome Screen */}
                        {showWelcome && (
                          <div
                            id="welcome-screen"
                            className={`flex h-150 flex-col items-center justify-center px-4 text-center text-gray-700`}
                          >
                            <h1
                              className={`mb-2 ${
                                divWidth <= cb.sm ? "text-sm" : "text-xl"
                              }`}
                            >
                              Welcome to Mayfair Chatbot Assistant
                            </h1>
                            <p className="mb-6 text-sm text-gray-500">
                              How can I help you today?
                            </p>
                            <div
                              className={`grid gap-2 p-2 ${
                                divWidth <= cb.sm
                                  ? "grid-cols-1"
                                  : divWidth <= cb.md
                                  ? "grid-cols-2"
                                  : divWidth <= cb.lg
                                  ? "grid-cols-2"
                                  : "grid-cols-3"
                              }`}
                            >
                              <div
                                data-message="Can you provide the guide how to use chatbot"
                                className="p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl hover:bg-violet-50"
                                onClick={() =>
                                  handleWelcomeBtn(
                                    "Can you provide the guide how to use chatbot"
                                  )
                                }
                              >
                                <h2
                                  className={`mb-1 font-medium ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  🤖 Chatbot Guide
                                </h2>
                                <p
                                  className={`text-gray-700 ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  Learn how to interact with the assistant.
                                </p>
                              </div>
                              <div
                                className="p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl hover:bg-violet-50"
                                data-message="Can you tell me about Wegovy treatment details"
                                onClick={() =>
                                  handleWelcomeBtn(
                                    "Can you tell me about Wegovy treatment details"
                                  )
                                }
                              >
                                <h2
                                  className={`mb-1 font-medium ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  💉 Wegovy (Semaglutide)
                                </h2>
                                <p
                                  className={`text-gray-700 ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  Once-weekly weight loss injection.
                                </p>
                              </div>
                              <div
                                className="p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl hover:bg-violet-50"
                                data-message="What is Mounjaro and how does it work"
                                onClick={() =>
                                  handleWelcomeBtn(
                                    "What is Mounjaro and how does it work"
                                  )
                                }
                              >
                                <h2
                                  className={`mb-1 font-medium ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  💉 Mounjaro (Tirzepatide)
                                </h2>
                                <p
                                  className={`text-gray-700 ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  Weekly injection approved for weight loss.
                                </p>
                              </div>
                              <div
                                className="p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl hover:bg-violet-50"
                                data-message="How can I contact the clinic for support"
                                onClick={() =>
                                  handleWelcomeBtn(
                                    "How can I contact the clinic for support"
                                  )
                                }
                              >
                                <h2
                                  className={`mb-1 font-medium ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  🏥 Contact Clinic
                                </h2>
                                <p
                                  className={`text-gray-700 ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  Reach out to our team for further help.
                                </p>
                              </div>
                              <div
                                className="p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl hover:bg-violet-50"
                                data-message="I’d like to know more about Ozempic treatment"
                                onClick={() =>
                                  handleWelcomeBtn(
                                    "I’d like to know more about Ozempic treatment"
                                  )
                                }
                              >
                                <h2
                                  className={`mb-1 font-medium ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  💉 Ozempic (Semaglutide)
                                </h2>
                                <p
                                  className={`text-gray-700 ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  Used for type-2 diabetes.
                                </p>
                              </div>
                              <div
                                className="p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl hover:bg-violet-50"
                                data-message="Could you explain how Saxenda treatment works"
                                onClick={() =>
                                  handleWelcomeBtn(
                                    "Could you explain how Saxenda treatment works"
                                  )
                                }
                              >
                                <h2
                                  className={`mb-1 font-medium ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  💉 Saxenda (Liraglutide)
                                </h2>
                                <p
                                  className={`text-gray-700 ${
                                    divWidth <= cb.sm ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  Once-daily injection.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Chat bubbles */}
                        {chatHistory.map((msg, i) => {
                          const BotComponent =
                            typeof msg.text === "string" &&
                            BotComponentMap[msg.text.trim()]
                              ? BotComponentMap[msg.text.trim()]
                              : null;

                          if (msg.sender === "user") {
                            return (
                              <div key={i} className="flex justify-end">
                                <div
                                  className={`bg-violet-500 text-white px-4 py-2 rounded-xl text-sm ${
                                    divWidth <= cb.sm
                                      ? "max-w-[95%]"
                                      : "max-w-[80%]"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            );
                          } else if (BotComponent) {
                            return (
                              <div
                                key={i}
                                className="flex justify-start w-full"
                              >
                                <div
                                  className={`bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm ${
                                    divWidth <= cb.sm
                                      ? "max-w-[95%]"
                                      : "max-w-[80%]"
                                  }`}
                                >
                                  <BotComponent />
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div key={i} className="flex justify-start">
                                <div
                                  className={`bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm ${
                                    divWidth <= cb.sm
                                      ? "max-w-[95%]"
                                      : "max-w-[80%]"
                                  }`}
                                  dangerouslySetInnerHTML={{
                                    __html: msg.text,
                                  }}
                                />
                              </div>
                            );
                          }
                        })}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-2 text-sm italic text-gray-600 bg-gray-300 rounded-xl animate-pulse">
                              Typing...
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 z-10 bg-white transition-all ease-in-out duration-400 ${
                          showSidebar && divWidth >= cb.sm
                            ? "left-100"
                            : "left-0"
                        } ${
                          browserInfo.browser == "Safari" &&
                          inputIsFocus &&
                          window.innerWidth <= cb.sm
                            ? "pb-15"
                            : ""
                        }${
                          browserInfo.browser == "Chrome" &&
                          inputIsFocus &&
                          window.innerWidth <= cb.sm
                            ? "pb-15"
                            : ""
                        }`}
                      >
                        {/* Quick questions */}
                        {showQuick && (
                          <div
                            id="quick-questions"
                            className={`flex flex-wrap gap-1 py-2 border-t border-gray-200 ${
                              divWidth <= cb.sm ? "px-4" : "px-3"
                            }`}
                          >
                            {getQuickBtns().map((q) => (
                              <button
                                key={q.label}
                                className={`py-1 mr-1 text-violet-800 bg-violet-200 rounded-lg quick-btn hover:bg-violet-300 ${
                                  divWidth <= cb.sm
                                    ? "text-xs px-2"
                                    : "text-md px-2"
                                }`}
                                onClick={() => handleQuickBtn(q.message)}
                              >
                                {q.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Chat form */}
                        <form
                          id="chat-form"
                          className="flex flex-col w-full gap-2 p-3 px-4 text-gray-700 bg-white border-t border-gray-200 sm:p-4"
                          onSubmit={handleSendMessage}
                        >
                          <div className="flex flex-1 w-full gap-2">
                            <textarea
                              style={{
                                overflowY: "auto",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                              }}
                              ref={textareaRef}
                              name="message"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              rows={1}
                              id="message"
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              className="flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl sm:px-4 sm:text-base focus:outline-none focus:ring focus:border-gray-300"
                              placeholder="Type your message..."
                              value={inputMsg}
                              onChange={(e) => setInputMsg(e.target.value)}
                              required
                            ></textarea>
                            <button
                              type="submit"
                              className="self-end h-auto px-4 py-3 text-sm text-center text-white transition max-h-12 rounded-xl bg-violet-600 sm:text-base hover:bg-violet-700"
                              disabled={loading}
                            >
                              Send
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
                </main>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          className="fixed z-50 flex items-center justify-center text-white rounded-full shadow-lg bottom-4 right-4 w-14 h-14 bg-violet-600 hover:bg-violet-700"
          onClick={() => setIsOpen(true)}
          aria-label="Open Chat"
        >
          <FiMessageCircle size={28} />
        </button>
      )}
    </>
  );
  {
    !isOpen && (
      <button
        className="fixed z-50 flex items-center justify-center text-white rounded-full shadow-lg bottom-4 right-4 w-14 h-14 bg-violet-600 hover:bg-violet-700"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chat"
      >
        <FiMessageCircle size={28} />
      </button>
    );
  }
}
