"use client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Chat from "./chat";
import Login from "./login";
import Profile from "./profile";
import "./splash.css"; // splash screen styles

function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 4000);
    const timer2 = setTimeout(() => setSplashVisible(false), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (splashVisible) {
    return (
      <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
        <div className="splash-content">
          <div className="splash-title-wrapper">
            <img
              src="https://img.icons8.com/ios-filled/50/ffffff/chat--v1.png"
              alt="Echo Logo"
            />
            <h1 className="splash-title">Echo</h1>
          </div>
          <span className="splash-tagline">Say it. Share it. Echo it.</span>
        </div>

        <div className="ripple ripple1"></div>
        <div className="ripple ripple2"></div>
        <div className="ripple ripple3"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        {/* fallback route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
