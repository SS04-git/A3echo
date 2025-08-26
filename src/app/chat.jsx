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

export default function ChatPage({ username, selectedContact, onNavigateToProfile }) {
  const [contacts] = useState([
    { id: 1, name: "Alice", lastMsg: "See you soon!", status: "online", avatar: "/alice.jpg" },
    { id: 2, name: "Nancy", lastMsg: "Got it, thanks!", status: "offline", avatar: "/nancy.jpg" },
    { id: 3, name: "Nirmala", lastMsg: "Typing...", status: "online", avatar: "/nemo.jpg" },
  ]);

  const [activeChat, setActiveChat] = useState(selectedContact || contacts[0] || {});
  
  useEffect(() => {
    if (selectedContact) {
      setActiveChat(selectedContact);
    }
  }, [selectedContact]);

  const [allMessages, setAllMessages] = useState({
    1: [ // Alice's messages
      { sender: "Alice", text: "Hey! How are you?", time: "10:00 AM", day: "Today" },
      { sender: "Me", text: "I'm good, thanks! How about you?", time: "10:02 AM", day: "Today" },
      { sender: "Alice", text: "Great! Are we still on for lunch tomorrow?", time: "10:05 AM", day: "Today" },
      { sender: "Me", text: "Absolutely! See you at 12:30", time: "10:07 AM", day: "Today" },
    ],
    2: [ // Nancy's messages
      { sender: "Nancy", text: "Did you finish the project report?", time: "9:30 AM", day: "Today" },
      { sender: "Me", text: "Almost done! Will send it by end of day", time: "9:32 AM", day: "Today" },
      { sender: "Nancy", text: "Got it, thanks!", time: "9:35 AM", day: "Today" },
      { sender: "Me", text: "No problem at all", time: "9:36 AM", day: "Today" },
    ],
    3: [ // Nirmala's messages
      { sender: "Nirmala", text: "Want to join our game night this Friday?", time: "2:15 PM", day: "Yesterday" },
      { sender: "Me", text: "That sounds fun! What games are you playing?", time: "2:20 PM", day: "Yesterday" },
      { sender: "Nirmala", text: "Board games and some video games. Starts at 7 PM", time: "2:22 PM", day: "Yesterday" },
      { sender: "Me", text: "Count me in! Should I bring anything?", time: "2:25 PM", day: "Yesterday" },
      { sender: "Nirmala", text: "Maybe some snacks if you can", time: "2:27 PM", day: "Yesterday" },
    ],
  });

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Handle profile navigation
  const handleProfileNavigation = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      // Fallback for direct URL navigation
      window.location.href = '/profile';
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear any stored data if needed
    localStorage.removeItem('username');
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setSettingsOpen(false);
        setProfileOpen(false);
        setFilterOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, activeChat]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      sender: username,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      day: "Today",
    };
    
    setAllMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));
    
    setNewMessage("");
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Get current messages for active chat
  const currentMessages = allMessages[activeChat.id] || [];
  
  // Filter contacts based on search query and selected filter
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "online" && contact.status === "online") ||
                         (selectedFilter === "offline" && contact.status === "offline");
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (!username) return;
    setAllMessages(prev => {
      const updated = {};
      for (let chatId in prev) {
        updated[chatId] = prev[chatId].map(msg =>
          msg.sender === "Me" ? { ...msg, sender: username } : msg
        );
      }
      return updated;
    });
  }, [username]);

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

  {/* Bottom section with Settings and Profile */}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
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
                borderBottom: "1px solid #f1f3f4"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <i className="bi bi-bell me-2"></i>Notifications
            </div>
            <div 
              style={{ 
                padding: "8px 16px", 
                fontSize: "14px",
                borderBottom: "1px solid #f1f3f4"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <i className="bi bi-shield-lock me-2"></i>Privacy
            </div>
            <div 
              style={{ 
                padding: "8px 16px", 
                fontSize: "14px"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
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
      src="/sara img.png"  
      roundedCircle 
      width={40} 
      height={40} 
    /> 
  </div> 
   
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
        {icon: "bi-person-lines-fill", text: "View Profile", border: true, onClick: () => window.navigateToProfile()},
        { icon: "bi-clock-history", text: "Status", border: true },
        { icon: "bi-box-arrow-right", text: "Logout", color: "#dc3545",  onClick: () => window.location.href = '/'}
      ].map((item, i) => (
        <div key={i}
          style={{  
            padding: "8px 16px",  
            fontSize: "14px", 
            ...(item.border && { borderBottom: "1px solid #f1f3f4" }),
            ...(item.color && { color: item.color })
          }} 
          onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"} 
          onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"} 
          onClick={item.onClick}
        > 
          <i className={`bi ${item.icon} me-2`}></i>{item.text}
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
    borderTopLeftRadius: "20px", // Add this line
    display: "flex",
    flexDirection: "column",
    zIndex: 1100,
  }}
>
  
    <div style={{ paddingTop: "20px",fontWeight: "600", color: "#0d6efd" }}>
    Welcome, {username} !!!
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
                    width: "40px",
                    backgroundColor: filterOpen ? "#e9ecef" : "#fff",
                    borderColor: filterOpen ? "#adb5bd" : "#ced4da",
                    color: "#495057"
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
    <small 
      style={{ color: c.id === activeChat.id ? "#fff" : "#6c757d" }}
    >
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
    height: "calc(100vh - 55px)", // full space below top bar
    display: "flex",
    flexDirection: "column",
    marginLeft: sidebarOpen ? "350px" : "70px",
    transition: "margin-left 0.3s ease",
    backgroundColor: "#f8f9fa",
    backgroundImage: "url('/patternbg.jpg')",
    backgroundColor: "rgba(255,255,255,0.75)", // makes it lighter
    backgroundBlendMode: "lighten", // try "overlay", "screen", etc.
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
    borderTopLeftRadius: sidebarOpen ? "0px" : "20px", // ✅ only one definition
    display: "flex",
    alignItems: "center",
    minHeight: "60px",
    zIndex: 1000,
  }}
>

            <Image src={activeChat.avatar} roundedCircle width={36} height={36} style={{ marginRight: "8px" }} />
            <div>
              <h6 style={{ margin: 0 }}>{activeChat.name}</h6>
              <small className="text-muted">
                {activeChat.status === "online" ? "Online" : "Last seen recently"}
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
    paddingTop: "170px",
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
    const isMe = msg.sender === username;
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
            src={activeChat.avatar}
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
            src="/sara img.png"
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
            <InputGroup>
              <Form.Control
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={{ fontSize: "14px", height: "40px" }}
              />
              <Button variant="outline-secondary" style={{ width: "44px", height: "40px", padding: 0 }}>
                <i className="bi bi-paperclip"></i>
              </Button>
              <Button variant="outline-secondary" style={{ width: "44px", height: "40px", padding: 0 }}>
                <i className="bi bi-camera"></i>
              </Button>
              <Button
                variant="primary"
                style={{ width: "44px", height: "40px", padding: 0 }}
                onClick={handleSend}
              >
                <i className="bi bi-send"></i>
              </Button>
            </InputGroup>
          </div>
        </div>
      </Row>
    </Container>
  );
}