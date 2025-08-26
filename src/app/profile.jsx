import { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  InputGroup,
  Form,
  Button,
  Badge,
  Image,
} from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

const contacts = [
  { id: 1, name: "Alice", lastMsg: "See you soon!", status: "online", avatar: "/alice.jpg" },
  { id: 2, name: "Nancy", lastMsg: "Got it, thanks!", status: "offline", avatar: "/nancy.jpg" },
  { id: 3, name: "Nirmala", lastMsg: "Typing...", status: "online", avatar: "/nemo.jpg" },
];

export default function Profile({ username, onNavigateToChat, onSelectContact }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(contacts[0] || {});

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

  // Filtering logic
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "online" && contact.status === "online") ||
                         (selectedFilter === "offline" && contact.status === "offline");

    return matchesSearch && matchesFilter;
  });

  // Contact click handler for navigation
  const handleContactClick = (contact) => {
    setActiveChat(contact);
    
    // Navigate back to chat with selected contact
    if (onSelectContact && onNavigateToChat) {
      onSelectContact(contact); // Pass the selected contact to parent
      onNavigateToChat(); // Navigate to chat view
    } else if (onNavigateToChat) {
      onNavigateToChat(contact); // Pass contact directly if onSelectContact doesn't exist
    } else {
      // Fallback navigation - store contact in localStorage and redirect
      localStorage.setItem('selectedContact', JSON.stringify(contact));
      window.location.href = '/chat';
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem('username');
    localStorage.removeItem('selectedContact');
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Handle back to chat (for cancel button)
  const handleBackToChat = () => {
    if (onNavigateToChat) {
      onNavigateToChat();
    } else {
      window.location.href = '/chat';
    }
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
          <img
            src="https://img.icons8.com/ios-filled/50/ffffff/chat--v1.png"
            alt="Echo Logo"
            style={{ width: "32px", height: "32px" }}
          />
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
                        borderBottom: "1px solid #f1f3f4",
                        cursor: "pointer"
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
                        borderBottom: "1px solid #f1f3f4",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      <i className="bi bi-shield-lock me-2"></i>Privacy
                    </div>
                    <div 
                      style={{ 
                        padding: "8px 16px", 
                        fontSize: "14px",
                        cursor: "pointer"
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

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }} className="dropdown-container">
              <div
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  width: "44px", 
                  height: "44px", 
                  cursor: "pointer" 
                }}
                onClick={() => { 
                  setProfileOpen(!profileOpen); 
                  setSettingsOpen(false); 
                }}
              >
                <Image src="/sara img.png" roundedCircle width={40} height={40} />
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
                  }}
                >
                  <div style={{ padding: "8px 0" }}>
                    <div
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        borderBottom: "1px solid #f1f3f4",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      <i className="bi bi-person-lines-fill me-2"></i>View Profile
                    </div>
                    <div
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        borderBottom: "1px solid #f1f3f4",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      <i className="bi bi-clock-history me-2"></i>Status
                    </div>
                    <div
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        color: "#dc3545",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </div>
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
          <div style={{ paddingTop: "20px", fontWeight: "600", color: "#0d6efd", padding: "20px 8px 8px 8px" }}>
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
                      {[
                        { key: "all", icon: "bi-list", text: "All Chats" },
                        { key: "online", icon: "bi-circle-fill", text: "Online", color: "#28a745" },
                        { key: "offline", icon: "bi-circle-fill", text: "Offline", color: "#6c757d" }
                      ].map((filter) => (
                        <div 
                          key={filter.key}
                          style={{ 
                            padding: "8px 16px", 
                            fontSize: "14px",
                            backgroundColor: selectedFilter === filter.key ? "#e3f2fd" : "transparent",
                            fontWeight: selectedFilter === filter.key ? "600" : "400",
                            cursor: "pointer"
                          }}
                          onClick={() => {
                            setSelectedFilter(filter.key);
                            setFilterOpen(false);
                          }}
                          onMouseEnter={(e) => {
                            if (selectedFilter !== filter.key) e.target.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            if (selectedFilter !== filter.key) e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          <i className={`bi ${filter.icon} me-2`} 
                             style={{ color: filter.color, fontSize: filter.icon.includes('circle') ? "8px" : "inherit" }}></i>
                          {filter.text}
                        </div>
                      ))}
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
                    onClick={() => handleContactClick(c)} // This now properly navigates to chat
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      padding: "8px",
                      cursor: "pointer"
                    }}
                  >
                    <Image
                      src={c.avatar}
                      roundedCircle
                      width={40}
                      height={40}
                      style={{ marginRight: "8px" }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span
                          style={{
                            fontWeight: "600",
                            color: c.id === activeChat.id ? "#fff" : "#000",
                          }}
                        >
                          {c.name}
                        </span>
                        <Badge
                          bg={c.status === "online" ? "success" : "secondary"}
                          pill
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <small
                        style={{
                          color: c.id === activeChat.id ? "#fff" : "#6c757d",
                        }}
                      >
                        {c.lastMsg}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#6c757d",
                  }}
                >
                  <i
                    className="bi bi-search"
                    style={{ fontSize: "24px", marginBottom: "8px" }}
                  ></i>
                  <div style={{ fontSize: "14px" }}>No chats found</div>
                  <small>Try a different search term or filter</small>
                </div>
              )}
            </ListGroup>
          </div>
        </div>

        {/* Profile Window */}
        <div
          style={{
            position: "relative",
            width: sidebarOpen ? "calc(100vw - 350px)" : "calc(100vw - 70px)",
            height: "calc(100vh - 55px)",
            marginLeft: sidebarOpen ? "350px" : "70px",
            transition: "margin-left 0.3s ease",
            backgroundColor: "rgba(255,255,255,0.75)",
            backgroundImage: "url('/patternbg.jpg')",
            backgroundBlendMode: "lighten",
            backgroundSize: "cover",
            borderTopLeftRadius: sidebarOpen ? "0px" : "20px",
          }}
        >
          {/* Profile Header */}
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
            <Image src="/sara img.png" roundedCircle width={36} height={36} style={{ marginRight: "8px" }} />
            <div>
              <h6 style={{ margin: 0 }}>Sara Johnson</h6>
              <small className="text-muted">Edit your profile information</small>
            </div>
          </div>

          {/* Profile Content */}
          <div style={{ paddingTop: "80px", paddingBottom: "40px", height: "100%", overflowY: "auto" }}>
            <Container>
              <Row className="justify-content-center">
                <Col md={8} lg={6}>
                  <Card style={{ border: "none", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: "20px" }}>
                    <Card.Body style={{ padding: "40px" }}>
                      
                      {/* Profile Picture Section */}
                      <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <Image 
                            src="/sara img.png" 
                            roundedCircle 
                            width={120} 
                            height={120}
                            style={{ 
                              border: "4px solid #0d6efd",
                              objectFit: "cover"
                            }}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            style={{
                              position: "absolute",
                              bottom: "5px",
                              right: "5px",
                              borderRadius: "50%",
                              width: "35px",
                              height: "35px",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <i className="bi bi-camera" style={{ fontSize: "14px" }}></i>
                          </Button>
                        </div>
                      </div>

                      {/* Profile Information */}
                      <Form>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                                <i className="bi bi-person me-2"></i>First Name
                              </Form.Label>
                              <Form.Control 
                                type="text" 
                                defaultValue="Sara" 
                                style={{ 
                                  borderRadius: "8px",
                                  border: "2px solid #e9ecef",
                                  padding: "12px"
                                }}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                                <i className="bi bi-person me-2"></i>Last Name
                              </Form.Label>
                              <Form.Control 
                                type="text" 
                                defaultValue="Johnson" 
                                style={{ 
                                  borderRadius: "8px",
                                  border: "2px solid #e9ecef",
                                  padding: "12px"
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                            <i className="bi bi-envelope me-2"></i>Email
                          </Form.Label>
                          <Form.Control 
                            type="email" 
                            defaultValue="sara.johnson@email.com" 
                            style={{ 
                              borderRadius: "8px",
                              border: "2px solid #e9ecef",
                              padding: "12px"
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                            <i className="bi bi-telephone me-2"></i>Phone
                          </Form.Label>
                          <Form.Control 
                            type="tel" 
                            defaultValue="+1 (555) 123-4567" 
                            style={{ 
                              borderRadius: "8px",
                              border: "2px solid #e9ecef",
                              padding: "12px"
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                            <i className="bi bi-geo-alt me-2"></i>Location
                          </Form.Label>
                          <Form.Control 
                            type="text" 
                            defaultValue="Chennai, Tamil Nadu, India" 
                            style={{ 
                              borderRadius: "8px",
                              border: "2px solid #e9ecef",
                              padding: "12px"
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                            <i className="bi bi-chat-quote me-2"></i>Bio
                          </Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={3} 
                            defaultValue="Love connecting with people and sharing ideas through Echo!"
                            style={{ 
                              borderRadius: "8px",
                              border: "2px solid #e9ecef",
                              padding: "12px",
                              resize: "vertical"
                            }}
                          />
                        </Form.Group>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                          <Button 
                            variant="primary" 
                            size="lg"
                            style={{ 
                              borderRadius: "8px", 
                              padding: "12px 24px",
                              fontWeight: "600"
                            }}
                          >
                            <i className="bi bi-check-circle me-2"></i>Save Changes
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="lg"
                            style={{ 
                              borderRadius: "8px", 
                              padding: "12px 24px",
                              fontWeight: "600"
                            }}
                            onClick={handleBackToChat}
                          >
                            <i className="bi bi-x-circle me-2"></i>Cancel
                          </Button>
                        </div>
                      </Form>

                    </Card.Body>
                  </Card>

                  {/* Additional Info Cards */}
                  <Row style={{ marginTop: "20px" }}>
                    <Col md={6}>
                      <Card style={{ border: "none", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Card.Body style={{ textAlign: "center", padding: "20px" }}>
                          <i className="bi bi-chat-dots" style={{ fontSize: "24px", color: "#0d6efd", marginBottom: "8px" }}></i>
                          <h6 style={{ margin: 0, color: "#495057" }}>Messages Sent</h6>
                          <h4 style={{ margin: "5px 0 0 0", color: "#0d6efd", fontWeight: "700" }}>1,247</h4>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card style={{ border: "none", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Card.Body style={{ textAlign: "center", padding: "20px" }}>
                          <i className="bi bi-people" style={{ fontSize: "24px", color: "#28a745", marginBottom: "8px" }}></i>
                          <h6 style={{ margin: 0, color: "#495057" }}>Connections</h6>
                          <h4 style={{ margin: "5px 0 0 0", color: "#28a745", fontWeight: "700" }}>89</h4>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                </Col>
              </Row>
            </Container>
          </div>
        </div>

      </Row>
    </Container>
  );
}