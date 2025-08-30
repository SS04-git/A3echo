"use client";
import { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  ListGroup,
  InputGroup,
  Form,
  Button,
  Badge,
  Image,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import supabase from './api/supabase';
import {
  getChats,
  getChatDetails,
  getMessagesForChat,
  sendMessage,
  getMessageById,
} from "./api/chat";
import Link from "next/link";
import "./Chat.css";

// Helper function outside useEffect
const formatChats = (chats) => {
  return chats.map((c) => ({
    id: c.chat_id,
    name: c.participant?.name || "Chat",
    lastMsg: c.last_message_preview || "No messages yet",
    avatar: c.participant?.avatar || "/default-avatar.jpg",
    status: c.participant?.status || "offline",
  }));
};

export default function ChatPage({ username: initialUsername, selectedContact }) {
  const navigate = useNavigate();

  // Supabase auth
  const [currentUserId, setCurrentUserId] = useState(null);
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

  // Chats & messages
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(selectedContact || null);
  const [allMessages, setAllMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Pagination state for messages
  const [messagePage, setMessagePage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const chatEndRef = useRef(null);

  // Sidebar / dropdown UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Get current user
  useEffect(() => {
  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching Supabase user:", error);
      return;
    }
    if (user) {
      console.log("Auth user ID:", user.id, "Metadata:", user.user_metadata);
      setCurrentUserId(user.id);
      setUser(user); 
      setUsername(user.user_metadata?.username || "Unknown User");
      setUserAvatar(user.user_metadata?.avatar || "/default-avatar.jpg"); 
    } else {
      console.warn("No user found in session");
    }
  };
  getUser();
}, []);

  // Fetch all chats for this user
useEffect(() => {
  if (!currentUserId) return;
  const fetchChats = async () => {
    try {
      setContacts([]); // Clear contacts
      const chats = await getChats(currentUserId);
      console.log("Chats received in Chat.jsx:", JSON.stringify(chats, null, 2)); // Log chats data
      const formatted = formatChats(chats);
      console.log("Formatted contacts in Chat.jsx:", JSON.stringify(formatted, null, 2)); // Log formatted data
      setContacts(formatted);
      if (activeChat) {
        const updatedActiveChat = formatted.find((c) => c.id === activeChat.id.toString()) || formatted[0];
        if (updatedActiveChat) setActiveChat(updatedActiveChat);
      } else if (formatted.length > 0) {
        setActiveChat(formatted[0]);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };
  fetchChats();
}, [currentUserId]);

  // If a contact is selected externally
  useEffect(() => {
    if (selectedContact) setActiveChat(selectedContact);
  }, [selectedContact]);

  // Fetch messages for active chat with pagination
  useEffect(() => {
    if (!activeChat?.id) return;
    const fetchMessages = async () => {
      try {
        const msgs = await getMessagesForChat(activeChat.id, 0, 50); // Initial fetch with offset 0
        const formatted = msgs.map((msg) => ({
          sender: msg.profiles?.name || msg.sender_id,
          sender_id: msg.sender_id,
          avatar: msg.profiles?.avatar || "/default-avatar.jpg",
          text: msg.body,
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          day: "Today",
        }));
        setAllMessages((prev) => ({
          ...prev,
          [activeChat.id]: formatted,
        }));
        setHasMoreMessages(msgs.length === 50); // Check if more messages exist
        setMessagePage(1); // Reset to page 1 for next fetch
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [activeChat?.id]);

  // Fetch participant details for active chat
useEffect(() => {
  if (!activeChat?.id || !currentUserId) return;

  const fetchChatDetails = async () => {
    try {
      const details = await getChatDetails(activeChat.id, currentUserId);
      console.log("Chat details:", details);

      setActiveChat((prev) => ({
        ...prev,
        name: details.participant?.name || prev?.name,
        avatar: details.participant?.avatar || prev?.avatar,
        status: details.participant?.status || prev?.status,
      }));
    } catch (err) {
      console.error("Error fetching chat details:", err);
    }
  };

  fetchChatDetails();
}, [activeChat?.id, currentUserId]);

  // Real-time message subscription
useEffect(() => {
  if (!activeChat?.id) return;

  const interval = setInterval(async () => {
    try {
      const msgs = await getMessagesForChat(activeChat.id, 0, 50);
      const formatted = msgs.map((msg) => ({
        sender: msg.profiles?.name || msg.sender_id,
        sender_id: msg.sender_id,
        avatar: msg.profiles?.avatar || "/default-avatar.jpg",
        text: msg.body,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        day: "Today",
      }));
      setAllMessages((prev) => ({
        ...prev,
        [activeChat.id]: formatted,
      }));
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, 3000); // poll every 3s

  return () => clearInterval(interval);
}, [activeChat?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, activeChat]);

  // Load more messages on scroll
  const loadMoreMessages = async () => {
    if (!activeChat?.id || !hasMoreMessages) return;
    try {
      const newMessages = await getMessagesForChat(activeChat.id, messagePage * 50, 50);
      if (newMessages.length < 50) setHasMoreMessages(false);
      setAllMessages((prev) => ({
        ...prev,
        [activeChat.id]: [...newMessages.map((msg) => ({
          sender: msg.profiles?.name || msg.sender_id,
          sender_id: msg.sender_id,
          avatar: msg.profiles?.avatar || "/default-avatar.jpg",
          text: msg.body,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          day: "Today",
        })), ...(prev[activeChat.id] || [])], 
      }));
      setMessagePage((prev) => prev + 1);
    } catch (err) {
      console.error("Error loading more messages:", err);
    }
  };

  // Trigger loadMoreMessages on scroll
  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");
    if (!messagesContainer) return;
    const handleScroll = () => {
      if (messagesContainer.scrollTop === 0 && hasMoreMessages) {
        loadMoreMessages();
      }
    };
    messagesContainer.addEventListener("scroll", handleScroll);
    return () => messagesContainer.removeEventListener("scroll", handleScroll);
  }, [activeChat?.id, hasMoreMessages]);

 // Handle send message
const handleSend = async () => {
  if (!newMessage.trim() || !activeChat?.id || !currentUserId) {
    console.error("Missing required fields:", {
      newMessage,
      activeChat,
      currentUserId,
    });
    return;
  }
  try {
    console.log("Sending message:", {
      chatId: activeChat.id,
      senderId: currentUserId,
      body: newMessage,
    });

    // Optimistically add message to local state
    const newMsgObj = {
      sender: username || "Me",
      sender_id: currentUserId,
      avatar: userAvatar || "/default-avatar.jpg",
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      day: "Today",
    };

    setAllMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsgObj],
    }));

    // Actually send to Supabase
    await sendMessage(activeChat.id, currentUserId, newMessage);

    setNewMessage("");
    setIsTyping(false);
  } catch (err) {
    console.error("Error sending message:", err.message || "No error details", {
      chatId: activeChat.id,
      senderId: currentUserId,
      body: newMessage,
    });
  }
};

const handleTyping = (e) => {
  setNewMessage(e.target.value);
  setIsTyping(e.target.value.length > 0);
};

  // Current chat messages
  const currentMessages = activeChat?.id ? allMessages[activeChat.id] || [] : [];

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "online" && contact.status === "online") ||
      (selectedFilter === "offline" && contact.status === "offline");
    return matchesSearch && matchesFilter;
  });

  // Replace "Me" placeholder if username updates
  useEffect(() => {
    if (!username) return;
    setAllMessages((prev) => {
      const updated = {};
      for (let chatId in prev) {
        updated[chatId] = prev[chatId].map((msg) =>
          msg.sender_id === currentUserId ? { ...msg, sender: username } : msg
        );
      }
      return updated;
    });
  }, [username]);

  // Navigation helpers
  const handleProfileNavigation = () => navigate("/profile");
  const handleLogout = () => {
    supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Container fluid style={{ height: "100vh", padding: 0 }}>
      {/* Top App Bar */}
      <div style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        height: "80px",
        background: "linear-gradient(90deg, #0d6efd, #0056b3)", 
        color: "#fff", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0 24px 24px 24px",
        zIndex: 1000, 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
      }}> 
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}> 
          <img src="https://img.icons8.com/ios-filled/50/ffffff/chat--v1.png" alt="Echo Logo" 
            style={{ width: "32px", height: "32px" }} /> 
          <h5 style={{ margin: 0, fontWeight: "800", fontSize: "22px", letterSpacing: "1px" }}> 
            Echo 
          </h5> 
        </div> 
        <span style={{ fontSize: "15px", fontStyle: "italic", opacity: 0.9 }}> 
          Say it. Share it. Echo it. 
        </span> 
      </div>

      <Row style={{ height: "calc(100vh - 87px)", margin: 0 }}>
        
{/* Thick Vertical Strip */}
<div
  style={{
    position: "fixed",
    top: "50px",
    left: 0,
    height: "calc(100% - 50px)",
    width: "70px",
    background: "linear-gradient(180deg, #0d6efd, #0056b3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    zIndex: 1200,
  }}
>
  {/* Top Section (Hamburger + Chat) */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    }}
  >
    {/* Hamburger */}
    <Button
      variant="light"
      style={{
        width: "40px",
        height: "40px",
        padding: 0,
        border: "none",
        backgroundColor: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
      }}
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      <i className="bi bi-list" style={{ fontSize: "24px", color: "#fff" }}></i>
    </Button>

    {/* Chat Icon */}
    <Link href="/chat" style={{ textDecoration: "none" }}>
      <i className="bi bi-chat-dots" style={{ fontSize: "24px", color: "#fff" }}></i>
    </Link>
  </div>

  {/* Bottom section with Settings and Profile */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
    }}
  >
    {/* Settings */}
    <div style={{ position: "relative" }} className="dropdown-container">
      <Button
        variant="light"
        style={{
          width: "40px",
          height: "40px",
          padding: 0,
          border: "none",
          backgroundColor: "transparent",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
        }}
        onClick={() => {
          setSettingsOpen(!settingsOpen);
          setProfileOpen(false);
        }}
      >
        <i className="bi bi-gear" style={{ fontSize: "22px", color: "#fff" }}></i>
      </Button>

      {/* Settings dropdown */}
      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            left: "80px",
            bottom: "70px",
            width: "180px",
            backgroundColor: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1300,
          }}
        >
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderBottom: "1px solid #f1f3f4",
              }}
            >
              <i className="bi bi-bell me-2"></i>Notifications
            </div>
            <div
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderBottom: "1px solid #f1f3f4",
              }}
            >
              <i className="bi bi-shield-lock me-2"></i>Privacy
            </div>
            <div style={{ padding: "8px 16px", fontSize: "14px" }}>
              <i className="bi bi-palette me-2"></i>Theme
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Profile */}
    <div style={{ position: "relative" }} className="dropdown-container">
      <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    cursor: "pointer",
  }}
  onClick={() => {
    setProfileOpen(!profileOpen);
    setSettingsOpen(false);
  }}
>
  <Image
    src={userAvatar} 
    roundedCircle
    width={40}
    height={40}
  />
</div>

      {/* Profile dropdown */}
      {profileOpen && (
        <div
          style={{
            position: "fixed",
            left: "80px",
            bottom: "20px",
            width: "180px",
            backgroundColor: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1300,
            cursor: "pointer",
          }}
        >
          <div style={{ padding: "8px 0" }}>
            {[
              { icon: "bi-person-lines-fill", text: "View Profile", border: true, onClick: handleProfileNavigation },
              { icon: "bi-clock-history", text: "Status", border: true },
              { icon: "bi-box-arrow-right", text: "Logout", color: "#dc3545", onClick: handleLogout },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  ...(item.border && { borderBottom: "1px solid #f1f3f4" }),
                  ...(item.color && { color: item.color }),
                }}
                onClick={item.onClick}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>

{/* Sidebar */}
        <div
          style={{
            position: "fixed",
            top: "50px",
            left: sidebarOpen ? "70px" : "-280px",
            height: "calc(100% - 50px)",
            width: "280px",
            transition: "left 0.3s ease",
            overflow: "hidden",
            backgroundColor: "#fff",
            borderRight: "1px solid #dee2e6",
            borderTopLeftRadius: "20px", 
            display: "flex",
            flexDirection: "column",
            zIndex: 1100,
          }}
        >
          <div style={{ paddingTop: "20px", fontWeight: "600", color: "#0d6efd" }}>
            Welcome, {username}!!!
          </div>
          <div style={{ padding: "8px" }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: "14px" }}
              />
              <div style={{ position: "relative" }} className="dropdown-container">
                <Button
                  variant="outline-secondary"
                  style={{
                    height: "100%",              
                    borderTopLeftRadius: "0",    
                    borderBottomLeftRadius: "0",
                    backgroundColor: filterOpen ? "#e9ecef" : "#fff",
                    borderColor: filterOpen ? "#adb5bd" : "#ced4da",
                    color: "#495057",
                  }}
                  onClick={() => {
                    setFilterOpen(!filterOpen);
                    setSettingsOpen(false);
                    setProfileOpen(false);
                  }}
                >
                  <i className="bi bi-funnel" style={{ color: "#495057" }}></i>
                </Button>

                {filterOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "45px",
                      width: "200px",
                      backgroundColor: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 1300,
                    }}
                  >
                    <div style={{ padding: "8px 0" }}>
                      <div 
                        style={{ 
                          padding: "8px 16px", 
                          fontSize: "14px",
                          backgroundColor: selectedFilter === "all" ? "#e3f2fd" : "transparent",
                          fontWeight: selectedFilter === "all" ? "600" : "400"
                        }}
                        onClick={() => {
                          setSelectedFilter("all");
                          setFilterOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          if (selectedFilter !== "all") e.target.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedFilter !== "all") e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <i className="bi bi-list me-2"></i>All Chats
                      </div>
                      <div 
                        style={{ 
                          padding: "8px 16px", 
                          cursor: "pointer",
                          fontSize: "14px",
                          backgroundColor: selectedFilter === "online" ? "#e8f5e8" : "transparent",
                          fontWeight: selectedFilter === "online" ? "600" : "400"
                        }}
                        onClick={() => {
                          setSelectedFilter("online");
                          setFilterOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          if (selectedFilter !== "online") e.target.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedFilter !== "online") e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <i className="bi bi-circle-fill me-2" style={{ color: "#28a745", fontSize: "8px" }}></i>Online
                      </div>
                      <div 
                        style={{ 
                          padding: "8px 16px", 
                          cursor: "pointer",
                          fontSize: "14px",
                          backgroundColor: selectedFilter === "offline" ? "#f3f4f6" : "transparent",
                          fontWeight: selectedFilter === "offline" ? "600" : "400"
                        }}
                        onClick={() => {
                          setSelectedFilter("offline");
                          setFilterOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          if (selectedFilter !== "offline") e.target.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedFilter !== "offline") e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <i className="bi bi-circle-fill me-2" style={{ color: "#6c757d", fontSize: "8px" }}></i>Offline
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </InputGroup>
          </div>
          <div style={{ flexGrow: 1, overflow: "auto" }}>
            <ListGroup variant="flush">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((c) => (
                  <ListGroup.Item
                    key={c.id}
                    action
                    active={c.id === activeChat.id}
                    onClick={() => setActiveChat(c)}
                    style={{ display: "flex", alignItems: "center", padding: "8px" }}
                  >
                    <Image src={c.avatar} roundedCircle width={40} height={40} style={{ marginRight: "8px" }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "600", color: c.id === activeChat.id ? "#fff" : "#000" }}>
                          {c.name}
                        </span>
                        <Badge bg={c.status === "online" ? "success" : "secondary"} pill>
                          {c.status}
                        </Badge>
                      </div>
                      <small style={{ color: c.id === activeChat.id ? "#fff" : "#6c757d" }}>
                        {c.lastMsg} 
                      </small>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
                  <i className="bi bi-search" style={{ fontSize: "24px", marginBottom: "8px" }}></i>
                  <div style={{ fontSize: "14px" }}>No chats found</div>
                  <small>Try a different search term or filter</small>
                </div>
              )}
            </ListGroup>
          </div>
        </div>

{/* Chat Window */}
<div
  style={{
    position: "relative",
    width: sidebarOpen ? "calc(100vw - 350px)" : "calc(100vw - 70px)",
    height: "calc(100vh - 55px)", 
    display: "flex",
    flexDirection: "column",
    marginLeft: sidebarOpen ? "350px" : "70px",
    transition: "margin-left 0.3s ease",
    backgroundColor: "rgba(255,255,255,0.75)",
    backgroundImage: "url('/patternbg.jpg')",
    backgroundBlendMode: "lighten",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>

{/* Chat Header */}
<div
  style={{
    position: "fixed",
    top: "50px",
    left: sidebarOpen ? "350px" : "70px",
    right: 0,
    transition: "left 0.3s ease",
    padding: "12px 16px",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#fff",
    borderTopLeftRadius: sidebarOpen ? "0px" : "20px", 
    display: "flex",
    alignItems: "center",
    minHeight: "60px",
    zIndex: 1000,
  }}
>
  <Image
    src={activeChat?.avatar || "/default-avatar.png"}
    roundedCircle
    width={36}
    height={36}
    style={{ marginRight: "8px" }}
  />
  <div>
    <h6 style={{ margin: 0 }}>
      {activeChat?.name || "Select a chat"}
    </h6>
    <small className="text-muted">
      {activeChat?.status === "online" ? "Online" : "Last seen recently"}
    </small>
  </div>
</div>

{/* Messages */}
<div 
  className="messages-container"
  style={{ 
    flexGrow: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "12px 16px",
    paddingTop: "calc(60px + 12px)",
    paddingBottom: "72px",         
    marginBottom: "0",
    borderBottom: "none",
    minHeight: 0,
  }}
>
  {/* Day Badge */}
  <div style={{ textAlign: "center", marginBottom: "12px" }}>
    <span
      className="badge"
      style={{
        backgroundColor: "#d6d8db",
        color: "#495057",
        fontWeight: "500",
        padding: "6px 12px",
        borderRadius: "12px",
      }}
    >
      {currentMessages.length > 0 ? currentMessages[0].day : "Today"}
    </span>
  </div>
  {/* Messages */}
 {currentMessages.map((msg, index) => {
  const isMe = msg.sender === "Me" || msg.sender === username;
  return (
    <div
      key={index}
      style={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        marginBottom: "10px",
        alignItems: "flex-end",
      }}
    >
      {!isMe && (
        <Image
          src={msg.avatar || "/default-avatar.jpg"}
          roundedCircle
          width={32}
          height={32}
          style={{ marginRight: "8px", flexShrink: 0 }}
        />
      )}
      <div
        style={{
          maxWidth: "70%",
          padding: "10px 16px",
          borderRadius: "20px",
          background: isMe
            ? "linear-gradient(135deg, #4dabf7, #0d6efd)"
            : "#fff",
          color: isMe ? "#fff" : "#000",
          boxShadow: isMe
            ? "0 3px 8px rgba(13,110,253,0.3)"
            : "0 1px 3px rgba(0,0,0,0.12)",
          position: "relative",
          fontSize: "14px",
          lineHeight: "1.4",
          transition: "all 0.2s ease",
        }}
      >
        {!isMe && (
          <small
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {msg.sender}
          </small>
        )}
        <span>{msg.text}</span>
        <div
          style={{
            fontSize: "11px",
            textAlign: "right",
            marginTop: "6px",
            color: isMe ? "rgba(255,255,255,0.8)" : "#6c757d",
          }}
        >
          {msg.time}
        </div>
      </div>
        {isMe && (
          <Image
            // src="/sara img.png"
            src={msg.avatar || "/default-avatar.jpg"}
            roundedCircle
            width={32}
            height={32}
            style={{ marginLeft: "8px", flexShrink: 0 }}
          />
        )}
      </div>
    );
  })}
  {isTyping && (
    <div
      style={{
        fontSize: "12px",
        fontStyle: "italic",
        color: "#6c757d",
        marginLeft: "8px",
      }}
    >
      Typing...
    </div>
  )}
  <div ref={chatEndRef} />
</div>

          {/* Input Area */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: sidebarOpen ? "350px" : "70px",
              right: 0,
              transition: "left 0.3s ease",
              padding: "8px 16px",
              borderTop: "1px solid #dee2e6",
              backgroundColor: "#fff",
              height: "60px",
              display: "flex",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            {activeChat?.id && currentUserId ? (
  <InputGroup className="mt-2">
    <Form.Control
      type="text"
      placeholder="Type a message..."
      value={newMessage}
      onChange={handleTyping}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
      disabled={!activeChat?.id || !currentUserId}
      style={{ fontSize: "14px", height: "40px" }}
    />
    <Button
      variant="outline-secondary"
      style={{ width: "44px", height: "40px", padding: 0 }}
    >
      <i className="bi bi-paperclip"></i>
    </Button>
    <Button
      variant="outline-secondary"
      style={{ width: "44px", height: "40px", padding: 0 }}
    >
      <i className="bi bi-camera"></i>
    </Button>
    <Button
      variant="primary"
      style={{ width: "44px", height: "40px", padding: 0 }}
      onClick={handleSend}
      disabled={!newMessage.trim()}
    >
      <i className="bi bi-send"></i>
    </Button>
  </InputGroup>
) : (
  <div className="text-muted p-2">
    Select a chat to start messaging...
  </div>
)}

          </div>
        </div>
      </Row>
    </Container>
  );
}