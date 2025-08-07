"use client";
import { act, use, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBars,
  FaSignOutAlt,
  FaTrash,
  FaCog,
  FaUser,
  FaMinus,
  FaCommentSlash,
} from "react-icons/fa";
import { FiMessageCircle, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { app_url } from "@/config/constants";
import { pusher_key } from "@/config/constants";
import { pusher_cluster } from "@/config/constants";
import toast, { Toaster } from "react-hot-toast";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";
import { IoChatbubbles, IoChatbubblesOutline } from "react-icons/io5";
import { is } from "date-fns/locale";

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
  // {
  //   label: "Can I change/amend my order?",
  //   message: "Can I change/amend my order?",
  // },
  // {
  //   label: "I need to cancel my order",
  //   message: "I need to cancel my order",
  // },
  {
    label:
      "If I place an order, can I request a specific delivery day? I need to be home.",
    message:
      "If I place an order, can I request a specific delivery day? I need to be home.",
  },
  {
    label: "I received my order after 24hrs – is it still safe to use?",
    message: "I received my order after 24hrs – is it still safe to use?",
  },
  {
    label: "I received Mounjaro/Wegovy after delay – concerned about stability",
    message:
      "I received Mounjaro/Wegovy after delay – concerned about stability",
  },
  {
    label: "I received my order late – unsure about safe use",
    message: "I received my order late – unsure about safe use",
  },
  {
    label:
      "Royal Mail / DPD says I missed the delivery but I was home all day. Can you please redeliver my parcel?",
    message:
      "Royal Mail / DPD says I missed the delivery but I was home all day. Can you please redeliver my parcel?",
  },
  {
    label: "Can i have my order delivered on Saturday?",
    message: "Can i have my order delivered on Saturday?",
  },
  {
    label:
      "I need advice on how to come off the medication when I reach my weight goal",
    message:
      "I need advice on how to come off the medication when I reach my weight goal",
  },
  {
    label: "Do you have any discounts?",
    message: "Do you have any discounts?",
  },
  {
    label: "Can I collect the parcel from the clinic?",
    message: "Can I collect the parcel from the clinic?",
  },
  {
    label:
      "⁠I’m an existing patient. How can I reorder? Do I have to fill consultation again?",
    message:
      "⁠I’m an existing patient. How can I reorder? Do I have to fill consultation again?",
  },
  {
    label: "⁠I’m unable to login into my account.",
    message: "⁠I’m unable to login into my account.",
  },
  {
    label: "I am unable to reset my password",
    message: "I am unable to reset my password",
  },
  {
    label: "⁠I tried placing an order but the payment keeps on failing.",
    message: "⁠I tried placing an order but the payment keeps on failing.",
  },
  {
    label: "I didn’t receive my refund.",
    message: "I didn’t receive my refund.",
  },
  {
    label: "Do you prescribe Ozempic?",
    message: "Do you prescribe Ozempic?",
  },
  {
    label: "Do you do the tablets?",
    message: "Do you do the tablets?",
  },
  {
    label: "Do you ship to Ireland?",
    message: "Do you ship to Ireland?",
  },
  {
    label: "Do you ship to USA/UAE/any country other than UK or Ireland?",
    message: "Do you ship to USA/UAE/any country other than UK or Ireland?",
  },
  {
    label:
      "Can you provide a letter or prescription that I can show at the airport when travelling?",
    message:
      "Can you provide a letter or prescription that I can show at the airport when travelling?",
  },
  {
    label: "I ordered the wrong dose. Can I return or exchange?",
    message: "I ordered the wrong dose. Can I return or exchange?",
  },
  {
    label: "Can I order a higher dose pen and take lower doses form it?",
    message: "Can I order a higher dose pen and take lower doses form it?",
  },
  {
    label: "Can I order a 15mg pen and use it to take 5mg doses?",
    message: "Can I order a 15mg pen and use it to take 5mg doses?",
  },
  // {
  //   label: "What weight loss programs do you offer?",
  //   message: "What weight loss programs do you offer",
  // },
  {
    label: "How can I book a consultation?",
    message: "How can I book a consultation",
  },
  {
    label: "What is the cost of your treatments?",
    message: "What is the cost of your treatments",
  },
  // {
  //   label: "Do you offer GLP-1 injections like Ozempic?",
  //   message: "Do you offer GLP-1 injections like Ozempic",
  // },
  // {
  //   label: "Is the consultation done online or in person?",
  //   message: "Is the consultation done online or in person",
  // },
  // {
  //   label: "Do you offer a refund if the treatment doesn't work?",
  //   message: "Do you offer a refund if the treatment does not work",
  // },
  // {
  //   label: "What are the side effects of weight loss injections?",
  //   message: "What are the side effects of weight loss injections",
  // },
  {
    label: "How soon can I see results?",
    message: "How soon can I see results?",
  },
  // {
  //   label: "Can I speak to a licensed doctor or clinician?",
  //   message: "Can I speak to a licensed doctor or clinician",
  // },
  // {
  //   label: "How do I reorder my medication?",
  //   message: "How do I reorder my medication",
  // },
  // {
  //   label: "What happens during my first consultation?",
  //   message: "What happens during my first consultation",
  // },
  {
    label: "Are your treatments safe and approved?",
    message: "Are your treatments safe and approved",
  },
  // {
  //   label: "How do I cancel or reschedule an appointment?",
  //   message: "How do I cancel or reschedule an appointment",
  // },
  // {
  //   label: "Do I need a prescription before starting?",
  //   message: "Do I need a prescription before starting",
  // },
  // {
  //   label: "How do I check the status of my order?",
  //   message: "How do I check the status of my order",
  // },
  // {
  //   label: "What should I do if I missed my dose?",
  //   message: "What should I do if I missed my dose",
  // },
  // {
  //   label: "How can I track my progress?",
  //   message: "How can I track my progress",
  // },
  // {
  //   label: "Do you provide diet or fitness plans too?",
  //   message: "Do you provide diet or fitness plans too",
  // },
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

export default function ChatComponent({ closeBtn, isWidgetOpen }) {
  const IS_LIVE = true;
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [showEmailExist, setShowEmailExist] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isHumanTalk, setIsHumanTalk] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [feedbackConversationId, setFeedbackConversationId] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showQuick, setShowQuick] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(isWidgetOpen ?? false);
  const [visible, setVisible] = useState(false);
  const [msgToBoth, setMsgToBoth] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  // const [isTabActive, setIsTabActive] = useState(true);
  const [isTabActive, setIsTabActive] = useState(
    typeof window !== "undefined" ? !document.hidden : true
  );
  const [orderIdStatus, setOrderIdStatus] = useState("");
  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);
  const bottomRef = useRef(null);
  const cb = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  };

  //feedback start
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [thanked, setThanked] = useState(false);

  // Your actual chat end logic here
  const performChatEnd = () => {
    // console.log("🔚 Chat officially ended.");
    // You can run API call or emit socket event here
    setRating(0);
    setHover(0);
    setReview("");
    setShowFeedback(false);
    setSubmitted(false);
    setThanked(false);
  };

  const handleEndChatClick = () => {
    setShowFeedback(true);
  };

  const handleSkip = () => {
    setSubmitted(true);
    setTimeout(() => {
      performChatEnd();
    }, 3000);
  };

  const maxChars = 200;
  const isLimitReached = review.length >= maxChars;
  // const starLabels = [
  //   "😡 Terrible",
  //   "😞 Bad",
  //   "🙂 Okay",
  //   "😊 Good",
  //   "🤩 Excellent",
  // ];
  const starLabels = ["😞", "😐", "🙂", "😀", "😍"];

  //feedback end

  const [messages, setMessages] = useState([]);
  const [lastMessageTime, setLastMessageTime] = useState("");

  const [browserInfo, setBrowserInfo] = useState({
    browser: "Unknown",
    version: "Unknown",
  });

  // console.log("next user", user);
  //pusher
  const handleRequestHuman = async () => {
    setLoading(true);
    try {
      const response = await fetch(app_url + "/new-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "waiting",
          email: user?.email || "",
          fname: user?.fname || "",
          lname: user?.lname || "",
          user_id: userDetails?.user_data?.user_id ?? null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const botMsgHumanTalk = {
        sender: "bot",
        text: `Your request were sent to the agent, it may take a minute`,
      };
      setChatHistory((prev) => [...prev, botMsgHumanTalk]);
      const data = await response.json();
      // console.log("New Conversation Created:", data);
      setConversationId(data?.id);
      setFeedbackConversationId(data?.id);
      // console.log("conversationId", conversationId);

      let chatUser = getLocal("chat_user", {});
      chatUser.isHumanTalk = true;
      chatUser.conversationId = data?.id;
      setLocal("chat_user", chatUser);
      setIsHumanTalk(true);
      setLoading(false);
    } catch (error) {
      // console.error("Error creating conversation:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let chatUser = getLocal("chat_user", {});
    if (typeof chatUser !== "object" || chatUser === null) {
      chatUser = {};
    }

    if (typeof chatUser.isHumanTalk === "undefined") {
      chatUser.isHumanTalk = false;
      setLocal("chat_user", chatUser);
    }

    if (typeof chatUser.conversationId === "undefined") {
      chatUser.conversationId = null;
      setLocal("chat_user", chatUser);
    }

    setIsHumanTalk(!!chatUser.isHumanTalk);
    setConversationId(chatUser.conversationId);
    setFeedbackConversationId(chatUser.conversationId);
  }, []);

  const sendMessage = async () => {
    setIsLoadingGlobal(true);
    if (inputMsg.trim() === "") {
      toast.error("Please type something.");
      setIsLoadingGlobal(false);
      return;
    }
    await fetch(app_url + "/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_conversation_id: conversationId,
        sender_type: "user",
        content: inputMsg,
      }),
    });
    setInputMsg("");
    setIsLoadingGlobal(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 10);

    if (!conversationId || !isHumanTalk) return;
    const chatHistory = JSON.parse(
      localStorage.getItem("chat_history") || "[]"
    );

    const chatUser = JSON.parse(localStorage.getItem("chat_user") || "{}");
    let chatAgentId = chatUser.agent_id || agentId;
    // console.log("chatAgentId", chatAgentId);

    // If agent_id not found, try to fetch it
    if (!chatAgentId) {
      await fetchAgentId(); // make sure fetchAgentId sets localStorage and state
      const updatedUser = JSON.parse(localStorage.getItem("chat_user") || "{}");
      chatAgentId = updatedUser.agent_id;
    }

    await sendHistory(conversationId, chatAgentId, chatHistory);
  };

  const fetchAgentId = async () => {
    if (!isHumanTalk || !conversationId) return;
    try {
      const res = await fetch(`${app_url}/get-agent-id/${conversationId}`);
      const data = await res.json();

      // console.log("Agent ID fetched:", data.agent_id);
      if (
        data.agent_id !== null &&
        data.agent_id !== "" &&
        data.agent_id !== undefined
      ) {
        setAgentId(data.agent_id);
      }
      // console.log("Agent ID set:", agentId);

      if (data.agent_id) {
        const existingUser = JSON.parse(
          localStorage.getItem("chat_user") || "{}"
        );
        if (existingUser.agent_id) {
          setAgentId(existingUser.agent_id);
        } else if (
          data.agent_id !== null &&
          data.agent_id !== "" &&
          data.agent_id !== undefined
        ) {
          const updatedUser = {
            ...existingUser,
            agent_id: data.agent_id,
          };
          localStorage.setItem("chat_user", JSON.stringify(updatedUser));
          setAgentId(data.agent_id);
        }
      }
    } catch (error) {
      // console.error("Error fetching agent ID:", error);
    }
  };

  useEffect(() => {
    if (conversationId && !agentId) {
      fetchAgentId();
    }
  }, [conversationId, agentId, isOpen, isHumanTalk]);

  // console.log("Human talk", isHumanTalk);

  if (isHumanTalk) {
    // console.log("function: sendMessage");
  } else {
    // console.log("function: sendBot");
  }

  const deleteChatHistory = async ({ agent_Id, userId }) => {
    if (!agent_Id || !userId) {
      // console.error("Missing agent_Id or userId for deleting chat history.");
      return;
    }

    try {
      const response = await fetch(app_url + "/delete-history", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agent_id: agent_Id,
          user_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("🗑️ Deleted history:", data);
      return data;
    } catch (error) {
      // console.error("❌ Failed to delete history:", error);
      throw error;
    }
  };

  // console.log("conversationId", conversationId);

  function fetchAndSetMessages(
    conversationId,
    lastMessageTime,
    messages,
    setMessages,
    setLastMessageTime
  ) {
    if (loading) return;
    setLoading(true);
    try {
      fetch(
        `${app_url}/messages?chat_conversation_id=${conversationId}&after=${lastMessageTime}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length) {
            if (messages.length !== messages.length + data.length) {
              setMessages([]);
              setMessages((prev) => [...prev, ...data]);
              setLastMessageTime(data[data.length - 1].created_at);
            }
          }
        });
    } catch (err) {
      // console.error(err);
    } finally {
      setLoading(false);
    }
    // console.log("messages", messages);
  }

  function useSmartPolling({
    interval = 3000,
    loading = false,
    onPoll = () => {},
    deps = [],
  }) {
    const cancelledRef = useRef(false);
    const timeoutIdRef = useRef(null);
    const idleCallbackIdRef = useRef(null);

    useEffect(() => {
      const requestIdle =
        typeof window !== "undefined"
          ? window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
          : (cb) => setTimeout(cb, 1);

      const cancelIdle =
        typeof window !== "undefined"
          ? window.cancelIdleCallback || ((id) => clearTimeout(id))
          : (id) => clearTimeout(id);

      cancelledRef.current = false;

      const poll = () => {
        if (
          cancelledRef.current ||
          loading ||
          (typeof document !== "undefined" && document.hidden)
        ) {
          timeoutIdRef.current = setTimeout(poll, interval);
          return;
        }
        idleCallbackIdRef.current = requestIdle(() => {
          if (cancelledRef.current) return;
          onPoll();
        });
        timeoutIdRef.current = setTimeout(poll, interval);
      };
      poll(); // 🏁 Start polling

      return () => {
        cancelledRef.current = true;
        clearTimeout(timeoutIdRef.current);
        cancelIdle(idleCallbackIdRef.current);
      };
    }, deps); // 👈 Use deps to restart polling if needed
  }
  // console.log("divWidth", divWidth);

  useEffect(() => {
    if (!conversationId) return;
    fetch(app_url + `/messages?chat_conversation_id=${conversationId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [...prev, ...data]);
        setLastMessageTime(
          data.length ? data[data.length - 1].created_at : null
        );
      });
  }, [conversationId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [otherTyping]);
  // useEffect(() => {
  //   if (!conversationId) return;

  //   // Only run this on the client
  //   if (typeof window === "undefined") return;

  //   window.Pusher = Pusher;

  //   const echo = new Echo({
  //     broadcaster: "pusher",
  //     key: "a801fe71eb894de6fe58",
  //     cluster: "ap1",
  //     wsHost: window.location.hostname,
  //     wsPort: 6001,
  //     forceTLS: false,
  //     disableStats: true,
  //   });

  //   // Listen on the correct channel
  //   const channel = echo.channel(`chat.${conversationId}`);
  //   const handler = (e) => {
  //     // setMessages((prev) => [...prev, e.message]);
  //     console.log("Message received", e.message);
  //   };
  //   channel.listen("Message", handler);

  //   // Clean up on unmount or when conversationId changes
  //   return () => {
  //     // channel.stopListening("Message", handler);
  //     // echo.leaveChannel(`chat.${conversationId}`);
  //     // echo.disconnect();
  //   };
  // }, [conversationId, setMessages]);

  useEffect(() => {
    if (!conversationId || !isHumanTalk) return;

    // 2. Optional: wait for document to be ready (client-side only)
    if (typeof window === "undefined") return;

    // console.log("🟢 Initializing Echo...");
    window.Pusher = Pusher;
    Pusher.logToConsole = true; // Optional: enable for debugging

    const echo = new Echo({
      broadcaster: "pusher",
      key: pusher_key,
      cluster: pusher_cluster,
      // wsHost: window.location.hostname,
      // wsPort: 6001,
      forceTLS: IS_LIVE ? true : false,
      encrypted: IS_LIVE,
      // authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
      // disableStats: true,
      // If using local websockets:
      // encrypted: false,
      // enabledTransports: ['ws', 'wss'],
    });

    const channel = echo.channel(`chat.${conversationId}`);
    // const channel = echoRef.current.channel(`chat.${conversationId}`);
    const handler = (e) => {
      setMessages((prev) => [...prev, e.message]);
      if (
        e.message.sender_type == "agent" &&
        e.message.content == "The chat has been ended"
      ) {
        let chatUser = getLocal("chat_user", {});
        chatUser.isHumanTalk = false;
        chatUser.conversationId = null;
        chatUser.agent_id = null;
        setLocal("chat_user", chatUser);
        setConversationId("");
        setIsHumanTalk(false);
        setAgentId(null);
        setTimeout(() => {
          setShowFeedback(true);
        }, 200);
        // console.log("The chat has been ended", conversationId, isHumanTalk);
      }
      // console.log("e.message", e.message);
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    channel.listen("Message", handler);
    // Cleanup on unmount: Unbind the event listener
    return () => {
      channel.stopListening("Message", handler);
      // Optional: echo.leave(`chat.${conversationId}`);
      // echoRef.current.leaveChannel(`chat.${conversationId}`);
    };
  }, [conversationId, setMessages]);

  useEffect(() => {
    // 1. Wait until essential state is available
    if (!conversationId || !isHumanTalk) return;

    // 2. Optional: wait for document to be ready (client-side only)
    if (typeof window === "undefined") return;

    // console.log("🟢 Initializing Echo...");

    window.Pusher = Pusher;
    Pusher.logToConsole = true; // Optional: enable for debugging

    const echo = new Echo({
      broadcaster: "pusher",
      key: pusher_key,
      cluster: pusher_cluster,
      // wsHost: window.location.hostname,
      // wsPort: 6001,
      forceTLS: IS_LIVE ? true : false,
      encrypted: IS_LIVE,
      // authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
      // disableStats: true,
      // If using local websockets:
      // encrypted: false,
      // enabledTransports: ['ws', 'wss'],
    });

    const channel = echo.channel(`chat.${conversationId}`);

    channel.listen(".TypingStatusChanged", (e) => {
      if (e.senderType !== "user") {
        setOtherTyping(e.isTyping);
      }
    });

    return () => {
      echo.leave(`chat.${conversationId}`);
    };
  }, [conversationId]);

  //online status
  useEffect(() => {
    if (isHumanTalk) {
      if (typeof document === "undefined") return;

      const handleVisibilityChange = () => {
        setIsTabActive(!document.hidden);
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      setIsTabActive(!document.hidden);

      return () =>
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
    }
  }, [isHumanTalk]);

  useEffect(() => {
    if (isHumanTalk) {
      const updateStatus = async () => {
        try {
          const res = await fetch(app_url + `/user-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              // If you're using Sanctum or need credentials:
              // "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
              is_online: isTabActive,
              chat_conversation_id: conversationId,
              sender_type: "user",
            }),
          });

          if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
          }

          const data = await res.json();
          // console.log("✅ Online status updated:", data);
        } catch (err) {
          // console.error("🔴 Failed to update online status: ", err);
        }
      };

      updateStatus();
    }
    // console.log("isTabActive", isTabActive);
  }, [isTabActive]);

  useEffect(() => {
    if (isHumanTalk) {
      // 1. Wait until essential state is available
      if (!conversationId || !isHumanTalk) return;

      // 2. Optional: wait for document to be ready (client-side only)
      if (typeof window === "undefined") return;

      // console.log("🟢 Initializing Echo...");

      window.Pusher = Pusher;
      Pusher.logToConsole = true; // Optional: enable for debugging

      const echo = new Echo({
        broadcaster: "pusher",
        key: pusher_key,
        cluster: pusher_cluster,
        // wsHost: window.location.hostname,
        // wsPort: 6001,
        forceTLS: IS_LIVE ? true : false,
        encrypted: IS_LIVE,
        // authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
        // disableStats: true,
        // If using local websockets:
        // encrypted: false,
        // enabledTransports: ['ws', 'wss'],
      });

      echo.private("user-status").listen("UserOnlineStatusUpdated", (data) => {
        // console.log("🟢 Status changed:", data);
      });

      return () => echo.leave("user-status");
    }
  }, [isHumanTalk]);

  //end online status
  //chat history
  const sendHistory = async (conversationId, chatAgentId, chatHistory) => {
    if (!conversationId || !chatAgentId || !chatHistory) {
      // console.log("❌ Missing parameters");
      return;
    }
    // console.log("Sending chat history");
    try {
      const response = await fetch(`${app_url}/send-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: conversationId,
          agent_id: chatAgentId,
          history: chatHistory,
        }),
      });

      const data = await response.json();
      // console.log("✅ Chat history sent successfully:", data);
      return data;
    } catch (error) {
      // console.error("❌ Failed to send chat history:", error);
      throw error;
    }
  };

  useEffect(() => {
    // 1. Wait until essential state is available
    if (!conversationId || !isHumanTalk) return;

    // 2. Optional: wait for document to be ready (client-side only)
    if (typeof window === "undefined") return;

    // console.log("🟢 Initializing Echo...");

    window.Pusher = Pusher;
    Pusher.logToConsole = true; // Optional: enable for debugging

    const echo = new Echo({
      broadcaster: "pusher",
      key: pusher_key,
      cluster: pusher_cluster,
      // wsHost: window.location.hostname,
      // wsPort: 6001,
      forceTLS: IS_LIVE ? true : false,
      encrypted: IS_LIVE,
      // authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
      // disableStats: true,
    });

    const userId = conversationId;

    const channel = echo.channel(`user-panel.${userId}`);

    channel.listen(".RequestChatHistory", async (e) => {
      // console.log("📦 History requested:", e);
      // console.log("messages", messages);
      // read chat history from localStorage

      const chatHistory = JSON.parse(
        localStorage.getItem("chat_history") || "[]"
      );

      const chatUser = JSON.parse(localStorage.getItem("chat_user") || "{}");
      const chatAgentId = chatUser.agent_id || agentId;
      // console.log("chatAgentId", chatAgentId);

      // If agent_id not found, try to fetch it
      if (!chatAgentId) {
        await fetchAgentId(); // make sure fetchAgentId sets localStorage and state
        const updatedUser = JSON.parse(
          localStorage.getItem("chat_user") || "{}"
        );
        chatAgentId = updatedUser.agent_id;
      }
      // send history to server
      // fetch(app_url + "/send-history", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Accept: "application/json",
      //   },
      //   body: JSON.stringify({
      //     user_id: conversationId,
      //     // agent_id: 2,
      //     agent_id: chatAgentId,
      //     history: chatHistory,
      //   }),
      // });
      await sendHistory(conversationId, chatAgentId, chatHistory);
    });

    return () => {
      echo.leave(`user-panel.${userId}`);
    };
  }, [conversationId, agentId, isHumanTalk]);

  //end chat history

  // console.log("isOpen", isOpen);

  function syncMessagesToChatHistory(messages) {
    if (!Array.isArray(messages)) return;

    // Map new messages to chat history format
    const mapped = messages
      .map((msg) => {
        if (msg.sender_type === "agent") {
          return {
            sender: "agent",
            name: msg?.agent?.fname || "Agent",
            // name: "Agent",
            text: (msg.content || "").trim(),
            time: msg.created_at,
          };
        }
        if (msg.sender_type === "user") {
          return {
            sender: "user",
            name: "You",
            text: (msg.content || "").trim(),
            time: msg.created_at,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Merge with previous chat history, avoiding duplicates by unique time+text+sender
    setChatHistory((prev) => {
      // Create a Set of unique keys for existing messages
      const existingKeys = new Set(
        prev.map((msg) => `${msg.sender}|${msg.time}|${msg.text}`)
      );
      // Filter out mapped messages that already exist
      const newMessages = mapped.filter(
        (msg) => !existingKeys.has(`${msg.sender}|${msg.time}|${msg.text}`)
      );
      return [...prev, ...newMessages];
    });
  }
  useEffect(() => {
    syncMessagesToChatHistory(messages);
    // console.log("chat history", chatHistory);
  }, [messages]);
  //pusher end

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

  // const [isMaximized, setIsMaximized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(isWidgetOpen ?? false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [divWindow, setDivWindow] = useState(1918);
  const [divHeight, setDivHeight] = useState(0);
  const previousWidthRef = useRef(0);
  const [inputIsFocus, setInputIsFocus] = useState(false);
  const textareaRef = useRef(null);
  const messageSubmitButtonRef = useRef(null);
  const orderIdInputRef = useRef(null);

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
      // console.log("enterFullScreen");
    } else {
      // exitFullScreen();
      // console.log("exitFullScreen");
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

  // console.log(getBrowserAndVersion());
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
      div[disabled] {
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
              // console.warn("Set Previous Width:", previousWidthRef.current);
            }

            previousWidthRef.current = currentWidth;
          } else {
            // console.warn("#div-window not found in DOM");
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
      } ${window.innerWidth <= cb.sm ? "h-[98%]" : "h-[100%]"} rounded-none`;
    if (windowWidth <= 400) return `bottom-4 right-4 w-[94vw] h-[76vh]`;
    if (windowWidth <= 768) return `bottom-4 right-4 w-[90vw] h-[76vh]`;
    if (windowWidth <= 1024) return `bottom-4 right-4 w-[60vw] h-[76vh]`;
    return `bottom-4 right-4 w-[428px] h-[76vh]`;
  };

  useEffect(() => {
    const storedUser = getLocal("chat_user", null);
    setUser(storedUser);
    let orderId =
      getLocal("order_data", { order_id: "" }).order_id ||
      getLocal("cart-storage", { state: {} })?.state?.orderId ||
      "";
    const authUser = getLocal("auth-user-storage", { state: {} })?.state
      ?.authUserDetail;
    if (
      authUser?.email &&
      storedUser?.email &&
      authUser.email === storedUser.email
    ) {
      setOrderId(orderId);
    } else {
      setOrderId(getLocal("order_data", { order_id: "" }).order_id || "");
    }
    // setOrderId(orderId);
    // setOrderId(getLocal("order_data", { order_id: "" }).order_id || "");
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
    if (chatBoxRef.current) {
      setTimeout(() => {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    }
  }, [chatHistory, loading, isOpen]);

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
  }, [user]);
  //useEffect runs on orderId

  useEffect(() => {
    if (!user || !user.email) setShowSidebar(false);
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
        // console.warn("Could not parse signup-storage:", err);
      }
    }
  }, [isOpen]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = { sender: "user", text: inputMsg.trim() };
    if (!isHumanTalk && !msgToBoth) {
      setChatHistory((prev) => [...prev, userMsg]);
    }
    setInputMsg("");
    setLoading(true);

    // Get 2 latest messages from localStorage chat_history: 1st where sender is "user", 2nd where sender is "bot"
    let contextMessages = [];
    try {
      const contextChatHistory = JSON.parse(
        localStorage.getItem("chat_history") || "[]"
      );
      // Find last user message
      const lastUserMsg = [...contextChatHistory]
        .reverse()
        .find((m) => m.sender === "user");
      // Find last bot message
      const lastBotMsg = [...contextChatHistory]
        .reverse()
        .find((m) => m.sender === "bot");

      // Helper to trim message to 220 chars
      const trimMsg = (msg) =>
        msg.length > 220 ? msg.slice(0, 220) + "..." : msg;

      if (lastUserMsg)
        contextMessages.push({
          sender: "user",
          text: trimMsg(lastUserMsg.text || ""),
        });
      if (lastBotMsg)
        contextMessages.push({
          sender: "bot",
          text: trimMsg(lastBotMsg.text || ""),
        });
    } catch {}

    // let contextMessages = [];
    // try {
    //   const contextChatHistory = JSON.parse(
    //     localStorage.getItem("chat_history") || "[]"
    //   );

    //   // Helper to trim message to 220 chars
    //   const trimMsg = (msg) =>
    //     msg.length > 220 ? msg.slice(0, 220) + "..." : msg;

    //   // Find last 2 user messages
    //   const lastUserMsgs = [...contextChatHistory]
    //     .reverse()
    //     .filter((m) => m.sender === "user")
    //     .slice(0, 2)
    //     .map((m) => ({
    //       sender: "user",
    //       text: trimMsg(m.text || ""),
    //     }));

    //   // Find last 2 bot messages
    //   const lastBotMsgs = [...contextChatHistory]
    //     .reverse()
    //     .filter((m) => m.sender === "bot")
    //     .slice(0, 2)
    //     .map((m) => ({
    //       sender: "bot",
    //       text: trimMsg(m.text || ""),
    //     }));

    //   contextMessages = [...lastUserMsgs, ...lastBotMsgs];
    // } catch {}

    try {
      const res = await fetch(app_url + "/consultant-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: inputMsg.trim(),
          context: contextMessages,
          //get 2 latest messages from local storage chathistory 1st where type is user and 2nd where type is bot and send it to the server as context to understand the conversation...
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
        let botMessage = data.message.trim();
        if (botMessage.includes("Rate limit reached")) {
          const errorMessages = [
            "Sorry, our system is busy. Please try again in a moment.",
            "Too many requests. Please wait and try again.",
            "We're experiencing high traffic. Please try again shortly.",
            "Please slow down and try again in a few seconds.",
            "Our assistant is a bit overwhelmed. Try again soon!",
          ];
          botMessage =
            errorMessages[Math.floor(Math.random() * errorMessages.length)];
        }
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: botMessage },
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
      if (isHumanTalk && msgToBoth) {
        setTimeout(() => {
          setChatHistory((prev) => [...prev, botMsg]);
        }, 20);
      } else {
        setChatHistory((prev) => [...prev, botMsg]);
      }
      setShowQuick(!!(user && user.email_exist));
    } catch (err) {
      const errorText = err.message || "Something went wrong.";
      const botMsg = { sender: "bot", text: `<strong>${errorText}</strong>` };
      setChatHistory((prev) => [...prev, botMsg]);
      setOrderId("");
    } finally {
      setLoading(false);
    }
    // adjustTextareaHeight();
    // resetTextareaHeight();

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 10);
  }

  const handleTextareaKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Submit form programmatically
      if (isHumanTalk) {
        sendMessage();
      } else {
        handleSendMessage(e);
      }
    }

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 10);
    // Shift+Enter will insert a new line by default (no need to handle)
  };

  function handleQuickBtn(msg) {
    if (isHumanTalk) {
      setMsgToBoth(true);
    }
    setInputMsg(msg);
    setTimeout(() => {
      if (messageSubmitButtonRef.current && !loading) {
        messageSubmitButtonRef.current.click();
      }
    }, 100);
  }

  function handleFaqBtn(msg) {
    if (isHumanTalk) {
      setMsgToBoth(true);
    }
    setInputMsg(msg);
    setTimeout(() => {
      if (messageSubmitButtonRef.current && !loading) {
        messageSubmitButtonRef.current.click();
      }

      if (divWidth <= cb.sm) {
        setShowSidebar(false);
      }
    }, 100);
  }

  function handleWelcomeBtn(msg) {
    if (isHumanTalk) {
      setMsgToBoth(true);
    }
    setInputMsg(msg);
    setTimeout(() => {
      if (messageSubmitButtonRef.current && !loading) {
        messageSubmitButtonRef.current.click();
      }
    }, 100);
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
    if (isHumanTalk) {
      fetch(`${app_url}/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          chat_conversation_id: conversationId,
          sender_type: "user",
          is_typing: true,
        }),
      });
    }
  };

  const handleBlur = () => {
    setInputIsFocus(false);
    if (inputMsg.trim() === "") {
      resetTextareaHeight();
    }
    if (isHumanTalk) {
      fetch(`${app_url}/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          chat_conversation_id: conversationId,
          sender_type: "user",
          is_typing: false,
        }),
      });
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

    const handleClickOutside = (event) => {
      if (textarea && !textarea.contains(event.target)) {
        resetTextareaHeight();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", adjustTextareaHeight);
      }
      document.removeEventListener("click", handleClickOutside);
    };
  }, [inputMsg]);

  const handleEndChat = async (id) => {
    setLoading(true);
    setFeedbackConversationId(conversationId);
    try {
      const response = await fetch(app_url + "/end-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_conversation_id: id,
        }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      // Optionally parse response: const data = await response.json();
      let chatUser = getLocal("chat_user", {});
      chatUser.isHumanTalk = false;
      chatUser.conversationId = null;
      chatUser.agent_id = null;
      setAgentId(null);
      setConversationId(null);
      setLocal("chat_user", chatUser);
      toast.success("Chat has been ended.");
      const botMsgChatEnd = {
        sender: "bot",
        text: `The chat has been ended`,
      };
      setChatHistory((prev) => [...prev, botMsgChatEnd]);

      await deleteChatHistory({
        agent_Id: agentId,
        userId: conversationId,
      });
      // console.log("chat ended");
    } catch (errors) {
      toast.error("Failed to end chat.");
      // console.error("Failed to accept chat", errors);
      setLoading(false);
    } finally {
      setLoading(false);
    }
    setTimeout(() => {
      setShowFeedback(true);
    }, 200);
  };

  function onClickEandleEndChat() {
    if (
      window.confirm(
        "Are you sure you want to end your session with the agent."
      )
    ) {
      handleEndChat(conversationId);
      setConversationId(null);
      setIsHumanTalk(false);
    }
  }

  function handleClearChat() {
    if (isHumanTalk) {
      if (
        window.confirm(
          "Are you sure you want to clear the chat? This will also end your session with the agent."
        )
      ) {
        handleEndChat(conversationId);
        setConversationId(null);
        setIsHumanTalk(false);
        setChatHistory([]);
        setShowWelcome(true);
      }
    } else {
      if (window.confirm("Are you sure you want to clear the chat?")) {
        setChatHistory([]);
        setShowWelcome(true);
      }
    }
  }

  function handleLogout() {
    if (window.confirm("Are you sure you want to logout and exit?")) {
      if (isHumanTalk) {
        handleEndChat(conversationId);
      }
      setConversationId(null);
      setIsHumanTalk(false);
      setUser({ isHumanTalk: false, conversationId: null });
      // setIsOpen(false);
      setChatHistory([]);
      setOrderId("");
      setUserDetails(null);
      setConversationId(null);
      setIsHumanTalk(false);
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

  // function getQuickBtns() {
  //   if (!user || !user.email || !user.email_exist) return [];
  //   const lowerInput = (inputMsg || "").toLowerCase();
  //   const scored = quickQuestions.map((q) => ({
  //     ...q,
  //     score:
  //       lowerInput.includes(q.message.toLowerCase()) ||
  //       q.message.toLowerCase().includes(lowerInput)
  //         ? 1
  //         : q.label
  //             .toLowerCase()
  //             .split(" ")
  //             .some((word) => lowerInput.includes(word))
  //         ? 0.5
  //         : 0,
  //   }));
  //   scored.sort((a, b) => b.score - a.score);
  //   const topRelevant = scored.slice(0, 2);
  //   const remaining = scored
  //     .slice(2)
  //     .sort(() => 0.5 - Math.random())
  //     .slice(0, 3);
  //   return [...topRelevant, ...remaining];
  // }

  const getQuickBtns = useMemo(() => {
    if (!user || !user.email || !user.email_exist) return [];

    const lowerInput = (inputMsg || "").toLowerCase();

    // Only show if user has typed at least 1 character
    // if (lowerInput.length === 0) return [];

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

    const topRelevant = scored.slice(0, 1);
    const qCount = isMaximized ? 3 : 3;
    const remaining = scored
      .slice(1)
      .sort(() => 0.5 - Math.random())
      .slice(0, qCount);

    return [...topRelevant, ...remaining];
  }, [inputMsg, user?.email, user?.email_exist, quickQuestions]);

  if (!hasMounted) return null;

  function OrderIdFormBotMessage({ message, onSuccess }) {
    const [localOrderId, setLocalOrderId] = useState(orderId || "");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setOrderIdStatus("⏳ Checking order status...");
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
            message: `please process my record data and return me when i ask, this is my order id ${localOrderId} and here is my complete record data based on that order id, please process it.`,
            email,
            order_id: localOrderId,
          }),
        });
        const data = await res.json();
        if (
          data.status === "success" &&
          data.providedOrderId &&
          data.providedOrderId !== ""
        ) {
          setOrderId(data.providedOrderId);
          setLocalOrderId(data.providedOrderId);
          if (orderIdInputRef.current) {
            orderIdInputRef.current.value = data.providedOrderId;
          }
        }
        let botMessage = data.message.trim();
        if (botMessage.includes("Rate limit reached")) {
          const errorMessages = [
            "Sorry, our system is busy. Please try again in a moment.",
            "Too many requests. Please wait and try again.",
            "We're experiencing high traffic. Please try again shortly.",
            "Please slow down and try again in a few seconds.",
            "Our assistant is a bit overwhelmed. Try again soon!",
          ];
          botMessage =
            errorMessages[Math.floor(Math.random() * errorMessages.length)];
        }
        setOrderIdStatus(botMessage ?? "✅ Verified! Now you can continue.");
        setStatus(botMessage ?? "✅ Verified! Now you can continue.");
        if (orderId) {
          localStorage.setItem(
            "order_data",
            JSON.stringify({ order_id: orderId })
          );
          if (onSuccess) onSuccess(orderId, data);
        }
      } catch {
        setOrderIdStatus("❌ Unable to check order status. Please try again.");
        setStatus("❌ Unable to check order status. Please try again.");
      } finally {
        setOrderId(localOrderId);
        setLocalOrderId(localOrderId);
        setLoading(false);

        setTimeout(() => {
          setOrderIdStatus("");
          setStatus("");
          // console.log("Order ID status reset");
        }, 5000);
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
          {message || "To Check Your Details"}
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
          value={localOrderId}
          onChange={(e) => setLocalOrderId(e.target.value)}
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
          className="cursor-pointer bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          style={{
            width: "100%",
            // backgroundColor: "#7f22fe",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
          }}
          disabled={loading || !localOrderId}
        >
          {loading ? "Continue" : "Continue"}
        </button>
        <p
          style={{
            marginTop: 16,
            fontSize: 14,
            // color: "red",
          }}
        >
          {status || orderIdStatus}
        </p>
      </form>
    );
  }

  function talkToHumanButtonResponse() {
    if (isHumanTalk) return null;
    return (
      <button
        disabled={(loading, isHumanTalk)}
        onClick={handleRequestHuman}
        className="px-3 sm:px-4 py-1.5 mt-2 sm:py-2 text-xs sm:text-sm text-gray-500 border bg-gray-50 hover:border-gray-400 border-gray-300 shadow-sm rounded-lg flex items-center gap-1"
        aria-label="Talk To Human"
      >
        <FaUser size={16} />
        <span className={`${divWidth <= cb.sm ? "" : ""}`}>
          {isHumanTalk ? "Talk To Human (Requested)" : "Talk To Human"}
        </span>
      </button>
    );
  }

  const BotComponentMap = {
    OrderIdFormBotMessage: OrderIdFormBotMessage,
    talkToHumanButtonResponse: talkToHumanButtonResponse,
    // Add more components here as needed
  };

  function renderBotStringWithComponent(text) {
    const keyword = "talkToHumanButtonResponse";
    if (typeof text !== "string" || !text.includes(keyword)) {
      // Fallback: just render as plain HTML
      return (
        <div
          className="whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    // Split at keyword; handle multiple occurrences if needed
    const parts = text.split(keyword);
    const TalkToHumanButtonResponse = talkToHumanButtonResponse;
    // Only support first occurrence for now (easy to extend if you want)
    return (
      <>
        {parts[0] && (
          <div
            className="whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: parts[0].trim() }}
          />
        )}
        <TalkToHumanButtonResponse />
        {parts[1] && parts[1].trim() && (
          <div
            className="mt-2 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: parts[1].trim() }}
          />
        )}
      </>
    );
  }

  function handleChatSubmit(e) {
    e.preventDefault();

    // Your flag to decide if message goes to both
    if (isHumanTalk && msgToBoth) {
      // For both human and bot
      sendMessage();
      handleSendMessage(e);
      setMsgToBoth(false);
      return;
    }

    if (isHumanTalk) {
      sendMessage();
    } else {
      handleSendMessage(e);
    }
  }

  const handleFeedbackSubmit = async () => {
    if (rating > 0) {
      try {
        await fetch(app_url + "/chat-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // If authenticated, include Authorization token
          },
          body: JSON.stringify({
            chat_conversation_id: feedbackConversationId, // You must provide this
            rating,
            review,
          }),
        });

        // console.log("📩 Feedback submitted:", { rating, review });

        setSubmitted(true);
        setTimeout(() => {
          setThanked(true);
        }, 0);

        setTimeout(() => {
          performChatEnd();
        }, 2000);
      } catch (error) {
        // console.error("Feedback submission failed:", error);
      }
    }
  };

  // UI
  return (
    <div
      className={`${
        isOpen && isMaximized
          ? "fixed inset-0 flex items-center justify-center bg-opacity-30 bg-white backdrop-blur-sm z-9999"
          : isOpen
          ? "fixed inset-0 flex items-center justify-center z-9999"
          : ""
      }`}
    >
      <Toaster position="bottom-center" />
      {/* Floating Icon */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (window.innerWidth <= cb.sm) {
              setIsMaximized(true);
            }
          }}
          className="fixed flex items-center justify-center text-white rounded-full shadow-lg z-999 bottom-4 right-4 w-14 h-14 bg-violet-600 hover:bg-violet-700 anim-float"
          aria-label="Open Chat"
        >
          {/* <FiMessageCircle size={28} /> */}
          {/* <BsChatDots size={28} /> */}
          <IoChatbubbles size={28} className="anim-flip-wave" />
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
          className={`fixed z-999 border scrollbar-hide border-gray-300 shadow-lg shadow-gray-500 flex flex-col transition-all font-sans ease-in-out duration-300 overflow-hidden ${
            isOpen ? "anim-drop-up" : "anim-drop-in translate-y-[110%]"
          } ${visible ? "translate-y-[110%]" : ""} ${getResponsiveClass()} ${
            window.innerWidth <= cb.sm
              ? ""
              : divWidth <= cb.sm
              ? "rounded-xl"
              : divWidth <= cb.md
              ? "rounded-xl"
              : ""
          } ${
            window.innerWidth <= cb.sm ? "h-[100%] top-0 scale-100" : "h-[80%]"
          } `}
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
                window.innerWidth <= cb.sm ? "h-[98%]" : "h-[100%]"
              } overflow-y-hidden font-sans`}
            >
              {/* Header */}
              <header className="flex items-center justify-between w-full p-4 text-gray-600 bg-white border-b border-gray-200">
                {user && user.email && (
                  <button
                    id="open-faq"
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200  rounded-lg flex items-center gap-1 ${
                      showSidebar ? "border-gray-200" : "border-gray-50"
                    }`}
                    onClick={() => setShowSidebar((s) => !s)}
                    aria-label={
                      showSidebar ? "Close FAQ Sidebar" : "Open FAQ Sidebar"
                    }
                  >
                    <FaBars
                      size={17}
                      style={{
                        transform: showSidebar
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>
                )}
                <div>
                  <div
                    id="chat-controls"
                    className={user && user.email ? "" : "hidden"}
                  >
                    <div className="flex gap-1">
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
                        ref={orderIdInputRef}
                        type="text"
                        placeholder="Order ID"
                        name="order_id"
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-violet-500 border border-gray-200 rounded-lg focus:outline-none placeholder-gray-400 ${
                          orderId ? "" : "hidden"
                        } ${divWidth <= cb.sm ? "w-20" : "w-50"}`}
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />
                      {/* {!isHumanTalk && (
                        <button
                          disabled={loading}
                          onClick={handleRequestHuman}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                          aria-label="Talk To Human"
                        >
                          <FaUser size={16} />{" "}
                          <span
                            className={`${divWidth <= cb.sm ? "hidden" : ""}`}
                          >
                            Talk To Human
                          </span>
                        </button>
                      )} */}
                      {isHumanTalk && (
                        <button
                          disabled={loading}
                          onClick={onClickEandleEndChat}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                          aria-label="End Chat"
                        >
                          <FaCommentSlash size={20} />{" "}
                          <span
                            className={`${divWidth <= cb.sm ? "hidden" : ""}`}
                          >
                            End Chat
                          </span>
                        </button>
                      )}
                      <button
                        disabled={loading}
                        onClick={handleClearChat}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                        aria-label="Clear Chat"
                      >
                        <FaTrash size={16} />{" "}
                        <span
                          className={`${divWidth <= cb.sm ? "hidden" : ""}`}
                        >
                          Clear Chat
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={loading}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                        aria-label="Exit"
                      >
                        <FaSignOutAlt size={18} />{" "}
                        <span
                          className={`${divWidth <= cb.sm ? "hidden" : ""}`}
                        >
                          Exit Chat
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        {window.innerWidth >= cb.sm && (
                          <button
                            onClick={() => {
                              setIsMaximized((prev) => !prev);
                              if (window.innerWidth <= cb.sm) {
                                toggleFullScreen();
                              }
                            }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                            aria-label={isMaximized ? "Minimize" : "Maximize"}
                          >
                            {/* {isMaximized ? "🗕" : "🗖"} */}
                            {isMaximized ? (
                              <FiMinimize2 size={20} />
                            ) : (
                              <FiMaximize2 size={20} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setVisible(true) || // play drop-in animation
                            setTimeout(() => {
                              setIsOpen(false);
                              setVisible(false); // hide after animation
                            }, 200)
                          }
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                          aria-label="Close"
                          disabled={closeBtn}
                        >
                          <FaMinus size={20} />
                          {/* <FiXCircle size={20} /> */}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {!user ||
                  (!user.email && (
                    <>
                      <p className="w-full text-base font-semibold text-left text-gray-500">
                        Welcome To Mayfair Assistant
                      </p>
                      <div className="flex gap-1">
                        {window.innerWidth >= cb.sm && (
                          <button
                            onClick={() => {
                              setIsMaximized((prev) => !prev);
                              if (window.innerWidth <= cb.sm) {
                                toggleFullScreen();
                              }
                            }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                            aria-label={isMaximized ? "Minimize" : "Maximize"}
                          >
                            {/* {isMaximized ? "🗕" : "🗖"} */}
                            {isMaximized ? (
                              <FiMinimize2 size={20} />
                            ) : (
                              <FiMaximize2 size={20} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setVisible(true) || // play drop-in animation
                            setTimeout(() => {
                              setIsOpen(false);
                              setVisible(false); // hide after animation
                            }, 200)
                          }
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                          aria-label="Close"
                          disabled={closeBtn}
                        >
                          {/* <FiXCircle size={20} /> */}
                          <FaMinus size={20} />
                        </button>
                      </div>
                    </>
                  ))}
              </header>

              {/* ✅ End Chat Button */}
              {/* {!showFeedback && (
                <button
                  onClick={handleEndChatClick}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  End Chat
                </button>
              )} */}

              {/* ✅ Feedback UI */}
              {showFeedback && !submitted && (
                <div className="absolute top-0 left-0 flex items-center flex-1 w-full h-full px-4 pb-50 bg-opacity-80 backdrop-blur-sm z-99999">
                  <div className="w-full max-w-md p-6 mx-auto bg-white border border-gray-200 shadow-md max-h-fit rounded-xl animate-slide-fade">
                    <div className="flex items-baseline justify-center gap-1">
                      <p className="transition-transform scale-110 cursor-default hover:scale-120 hover:rotate-3">
                        🤔
                      </p>
                      <h3 className="mb-4 text-lg font-semibold text-center text-gray-700">
                        How was your chat experience?
                      </h3>
                    </div>

                    <div className="flex justify-center gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          className="relative text-2xl transition-transform group hover:scale-105 hover:rotate-0"
                          // title={starLabels[star - 1]} // basic native tooltip
                        >
                          <span
                            className={
                              star <= (hover || rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>

                          {/* Optional custom tooltip below */}
                          <div className="absolute px-2 py-1 text-xs text-white transition -translate-x-1/2 rounded opacity-0 pointer-events-none bg-violet-700 -top-4 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                            {starLabels[star - 1]}
                          </div>
                        </button>
                      ))}
                    </div>

                    <textarea
                      className={`w-full p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-1 ${
                        isLimitReached
                          ? " bg-red-50 focus:ring-red-50"
                          : "focus:ring-violet-500"
                      } ${
                        isLimitReached ? "border-red-200" : "border-gray-200"
                      }`}
                      rows={3}
                      maxLength={maxChars}
                      placeholder="Leave a comment (optional)..."
                      value={review}
                      onChange={(e) =>
                        setReview(e.target.value.slice(0, maxChars))
                      }
                    ></textarea>

                    <div className="w-full h-[1.5px] mb-1 bg-gray-200 rounded-full">
                      <div
                        className={`h-full transition-all rounded-full  ${
                          isLimitReached ? "bg-red-600" : "bg-violet-600"
                        }`}
                        style={{
                          width: `${Math.min(review.length / 2, 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between">
                      <p
                        className={`text-xs text-left cursor-default ${
                          isLimitReached ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        {review.length}/{maxChars}
                      </p>

                      <div className="flex justify-between gap-1">
                        {review.length > 180 && !isLimitReached && (
                          <p className="text-xs text-yellow-600 cursor-default">
                            Almost at the limit
                          </p>
                        )}
                        <div className="text-xs text-left text-gray-400 cursor-default">
                          {starLabels[rating - 1]}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={handleFeedbackSubmit}
                        className={`bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-300 ${
                          rating === 0 ? "cursor-not-allowed" : ""
                        }`}
                        disabled={rating === 0 || isLimitReached || loading}
                      >
                        Submit
                      </button>
                      <button
                        onClick={handleSkip}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Thank you message */}
              {submitted && thanked && (
                <div className="absolute left-0 flex items-center justify-center flex-1 w-full px-4 top-16 z-99999">
                  <div className="p-6 mx-4 mt-6 text-center transition-all ease-in-out border border-gray-200 shadow-xl bg-green-50 rounded-xl">
                    <h3 className="mb-2 text-lg font-semibold">
                      🎉 Thank you for your feedback!
                    </h3>
                    <p className="text-gray-600">
                      We appreciate you taking the time to help us improve.
                    </p>
                  </div>
                </div>
              )}

              {/* User Settings Modal */}
              {showUserSettings && (
                <div className="fixed inset-0 flex items-center justify-center px-4 z-99999 bg-opacity-30 backdrop-blur-sm">
                  <div className="relative w-full max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow-lg shadow-gray-500">
                    <button
                      className={`top-6 right-6 absolute px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
                      onClick={() => setShowUserSettings(false)}
                      aria-label="Close"
                    >
                      <FaMinus size={18} />
                    </button>
                    <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-violet-700">
                      <span>
                        <FaCog />
                      </span>
                      Edit Your Details
                    </h2>
                    <form
                      className="space-y-4 text-gray-700"
                      onSubmit={handleUserSettingsSubmit}
                    >
                      <div>
                        <label className="block mb-1 text-sm text-gray-700 font-base">
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
                        <label className="block mb-1 text-sm text-gray-700 font-base">
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
                        <label className="block mb-1 text-sm text-gray-700 font-base">
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
                      <div className="hidden">
                        <label className="block mb-1 text-sm text-gray-700 font-base">
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
                          disabled={loading}
                          type="button"
                          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg"
                          onClick={() => setShowUserSettings(false)}
                        >
                          Cancel
                        </button>
                        <button
                          disabled={loading}
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
                {user && user.email && (
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
                        window.innerWidth >= cb.sm ? "h-[98%]" : "h-[100%]"
                      }`}
                      id="faq-sidebar"
                    >
                      <div
                        id="user-name"
                        className={`flex items-center justify-between font-semibold text-gray-600 uppercase border-b border-gray-200 pb-3 ${
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
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 border bg-gray-50 hover:border-gray-200 border-gray-50 rounded-lg flex items-center gap-1`}
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
                          <FaCog />
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
                              ? "max-h-[98%]"
                              : "max-h-[100%]"
                          } space-y-2 overflow-y-auto rounded-lg scrollbar-hide ${
                            windowWidth <= cb.sm ? "pb-[16%]" : "pb-[11%]"
                          }`}
                        >
                          {filteredFaqs.length === 0 ? (
                            <p className="px-4 py-2 text-sm text-gray-500">
                              No FAQs found.
                            </p>
                          ) : (
                            filteredFaqs.map((faq) => (
                              <button
                                disabled={loading}
                                key={faq.label}
                                className={`w-full py-2 text-left transition rounded-lg ${
                                  loading
                                    ? "bg-violet-100 text-violet-800"
                                    : "bg-violet-100 hover:bg-violet-200 text-violet-800"
                                } ${
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
                  {!user ||
                    (!user.email && (
                      <form
                        id="email-prompt"
                        className="flex flex-col items-center justify-center flex-1 h-full p-4 space-y-2 overflow-y-auto text-gray-700 bg-white scrollbar-hide sm:p-6 sm:space-y-3"
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
                          className="hidden w-full max-w-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg bg-gray-50 sm:px-4 focus:outline-none"
                        />

                        <button
                          type="submit"
                          className={`flex items-center gap-2 px-4 py-2 mt-2 text-sm text-white transition rounded-lg ${
                            loading
                              ? "bg-violet-600"
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
                    ))}
                  {/* Chat box */}

                  {user && user.email && (
                    <>
                      <div
                        id="chat-box"
                        ref={chatBoxRef}
                        className={`flex-1 transition-all ease-in-out duration-400 relative pt-15 ${
                          window.innerWidth <= cb.sm ? "h-[90vh]" : "h-[100vh]"
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
                            className={`flex h-130 flex-col items-center justify-center px-4 text-center text-gray-700`}
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
                                className={`p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl  ${
                                  loading ? "" : "hover:bg-violet-50"
                                }`}
                                disabled={loading}
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
                                className={`p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl  ${
                                  loading ? "" : "hover:bg-violet-50"
                                }`}
                                disabled={loading}
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
                                className={`p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl  ${
                                  loading ? "" : "hover:bg-violet-50"
                                }`}
                                disabled={loading}
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
                                className={`p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl  ${
                                  loading ? "" : "hover:bg-violet-50"
                                }`}
                                disabled={loading}
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
                                className={`p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl  ${
                                  loading ? "" : "hover:bg-violet-50"
                                }`}
                                disabled={loading}
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
                                className={`p-2 transition bg-white border border-gray-200 shadow-sm cursor-pointer md:p-4 lg:p-4 xl:p-4 2xl:p-4 rounded-xl  ${
                                  loading ? "" : "hover:bg-violet-50"
                                }`}
                                disabled={loading}
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
                          const isAgent = msg.sender === "agent";
                          const isUser = msg.sender === "user";
                          // Format time (e.g., "10:45 AM")
                          const formattedTime = msg.time
                            ? new Date(msg.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "";

                          if (msg.sender === "user") {
                            return (
                              <div key={i} className="flex justify-end">
                                {/* Sender name for agent */}
                                {isAgent && (
                                  <div className="mb-1 text-sm font-semibold text-violet-700">
                                    {msg.name}
                                  </div>
                                )}
                                <div
                                  className={`bg-violet-100 text-gray-700 anim-drop-right border border-violet-200 shadow-inner px-4 py-2 mt-1 rounded-xl rounded-br-none text-shadow-sm text-shadow-gray-100 ${
                                    divWidth <= cb.sm
                                      ? "max-w-[95%]"
                                      : "max-w-[80%]"
                                  }`}
                                >
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: msg.text,
                                    }}
                                  />
                                  {/* {msg.text} */}
                                  <div
                                    className={`text-[10px] mt-1 text-right ${
                                      isUser ? "text-gray-500" : "text-gray-500"
                                    }`}
                                  >
                                    {formattedTime}
                                  </div>
                                </div>
                                {/* Time */}
                              </div>
                            );
                          } else if (BotComponent) {
                            return (
                              <div
                                key={i}
                                className="flex justify-start w-full"
                              >
                                <div
                                  className={`bg-gray-200 text-gray-800 anim-drop-left px-4 py-2 shadow-inner rounded-xl rounded-bl-none text-shadow-sm text-shadow-gray-100 border border-gray-300 ${
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
                              <div
                                key={i}
                                className={`flex ${
                                  isUser ? "justify-end" : "justify-start"
                                } w-full mb-2`}
                              >
                                <div
                                  className={`rounded-xl px-4 py-2 max-w-[80%] min-w-[5%] anim-drop-left shadow-inner rounded-bl-none text-shadow-sm text-shadow-gray-100 border border-gray-300 ${
                                    isUser
                                      ? "bg-violet-100 text-gray-800"
                                      : "bg-gray-200 text-gray-800 border border-gray-200"
                                  }`}
                                  style={{ position: "relative" }}
                                >
                                  {/* Sender name for agent */}
                                  {isAgent && (
                                    <div className="mb-1 text-sm font-semibold text-violet-700">
                                      {msg.name}
                                    </div>
                                  )}
                                  {/* Message text with component replacement */}
                                  {renderBotStringWithComponent(msg.text)}
                                  {/* Time */}
                                  <div
                                    className={`text-[10px] mt-1 text-right ${
                                      isUser ? "text-gray-500" : "text-gray-500"
                                    }`}
                                  >
                                    {formattedTime}
                                  </div>
                                  {/* <div
                                    className="max-h-[0%] h-[0%]"
                                    ref={bottomRef}
                                  /> */}
                                </div>
                              </div>
                            );
                          }
                        })}

                        {otherTyping && (
                          <div className="flex justify-start w-full mb-2">
                            <div className="max-w-xs px-4 py-2 text-sm italic text-gray-600 bg-gray-300 rounded-bl-none anim-drop-left rounded-xl animate-pulse">
                              <span className="">Agent is typing...</span>
                            </div>
                          </div>
                        )}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-2 text-sm italic text-gray-600 bg-gray-300 rounded-bl-none anim-drop-left rounded-xl animate-pulse">
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
                            ? ""
                            : ""
                        }${
                          browserInfo.browser == "Chrome" &&
                          inputIsFocus &&
                          window.innerWidth <= cb.sm
                            ? ""
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
                            {getQuickBtns.map((q) => (
                              <button
                                disabled={loading}
                                key={q.label}
                                className={`py-1 mr-1 rounded-lg quick-btn  ${
                                  loading
                                    ? "bg-violet-100 text-violet-800"
                                    : "bg-violet-100 hover:bg-violet-200 text-violet-800"
                                } ${
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
                          onSubmit={handleChatSubmit}
                          disabled={
                            inputMsg.trim() == "" ||
                            isLoadingGlobal ||
                            !inputMsg
                          }
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
                              disabled={isLoadingGlobal}
                              onKeyDown={handleTextareaKeyDown}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              className="flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl sm:px-4 sm:text-base focus:outline-none focus:ring focus:border-gray-300"
                              placeholder="Type your message..."
                              value={isLoadingGlobal ? "sending..." : inputMsg}
                              onChange={(e) => setInputMsg(e.target.value)}
                              required
                            ></textarea>
                            <button
                              type="submit"
                              id="message-submit"
                              ref={messageSubmitButtonRef}
                              className={`self-end h-auto px-4 py-3 text-sm text-center text-white transition max-h-12 rounded-xl sm:text-base disabled:bg-gray-300 ${
                                loading || isLoadingGlobal
                                  ? "bg-violet-600"
                                  : "bg-violet-600 hover:bg-violet-700"
                              }`}
                              disabled={loading || isLoadingGlobal || !inputMsg}
                            >
                              {loading || isLoadingGlobal ? "Send" : "Send"}
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

      {/* {!isOpen && (
        <button
          className="fixed z-50 flex items-center justify-center text-white rounded-full shadow-lg bottom-4 right-4 w-14 h-14 bg-violet-600 hover:bg-violet-700"
          onClick={() => setIsOpen(true)}
          aria-label="Open Chat"
        >
          <FiMessageCircle size={28} />
        </button>
      )} */}
    </div>
  );
}
