"use client";
import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import Chat from "./chat";
import "./login.css";

export default function Login({ onUsernameChange, selectedContact }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    if (username.trim() !== "" && password.trim() !== "") {
      setLoggedIn(true);
      if (onUsernameChange) {
        onUsernameChange(username);
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const backgroundImages = [
    {
      src: "https://cff2.earth.com/uploads/2018/09/11144510/Teens-say-they-prefer-texting-friends-rather-than-talking-in-person.jpg"
    },
    {
      src: "https://img.freepik.com/free-photo/co-working-people-working-together_23-2149328349.jpg?semt=ais_hybrid&w=740&q=80"
    },
    {
      src: "https://commsroom.co/wp-content/uploads/2023/11/technology-communication-skills.jpg"
    },
    {
      src: "https://www.gettingsmart.com/wp-content/uploads/2017/09/Students-Media-Literacy.jpg"
    }
  ];

  if (loggedIn) {
    return <Chat username={username} selectedContact={selectedContact} />;
  }

  return (
    <>

      <div className="carousel-container">
        <Carousel
          fade
          controls={false}
          indicators={true}
          interval={2500}
          pause={false}
        >
          {backgroundImages.map((image, index) => (
            <Carousel.Item key={index}>
              <img className="d-block w-100" src={image.src} alt={image.alt} />
              <div className="carousel-overlay"></div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="echo-title">
            <img
              src="https://img.icons8.com/ios-filled/50/0d6efd/chat--v1.png"
              alt="Echo Logo"
            />
            <h1>Echo</h1>
          </div>
          <p className="tagline">Say it. Share it. Echo it.</p>

          <div className="input-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <button className="btn btn-primary" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </>
  );
}