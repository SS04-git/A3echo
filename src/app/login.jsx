"use client";
import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import Chat from "./chat";

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
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(13, 110, 253, 0.3); }
          50% { box-shadow: 0 0 40px rgba(13, 110, 253, 0.5); }
        }

        .carousel-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .carousel-item img {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          filter: brightness(0.4) saturate(1.2);
          transition: filter 8s ease;
        }

        .carousel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(13, 110, 253, 0.15) 0%,
            rgba(116, 235, 213, 0.15) 50%,
            rgba(172, 182, 229, 0.15) 100%
          );
        }

        .login-container {
          position: relative;
          z-index: 10;
          backdrop-filter: blur(2px);
          display: flex;
          height: 100vh;
          justify-content: center;
          align-items: center;
        }

        .login-card {
          animation: fadeInUp 1s ease-out;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          width: 420px;
          max-width: 90vw;
          padding: 2rem;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
          text-align: center;
          border-radius: 12px;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #74ebd5, #ACB6E5, #0d6efd);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .login-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.98);
        }

        .echo-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .echo-title img {
          width: 40px;
          height: 40px;
        }

        .echo-title h1 {
          margin: 0;
          font-weight: 800;
          font-size: 40px;
          letter-spacing: 1px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(45deg, #0d6efd, #74ebd5, #ACB6E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tagline {
          font-size: 16px;
          font-style: italic;
          opacity: 0.9;
          color: #6c757d;
          margin-bottom: 2rem;
          animation: fadeInUp 1s ease-out 0.3s both;
        }

        .input-group {
          margin-bottom: 1.5rem;
          position: relative;
          text-align: left;
        }

        .form-label {
          color: #0d6efd;
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: absolute;
          top: -10px;
          left: 12px;
          background-color: rgba(255, 255, 255, 1);
          padding: 2px 8px;
          z-index: 10;
          border-radius: 4px;
        }

        .form-control {
          animation: fadeInUp 1s ease-out 0.6s both;
          transition: all 0.3s ease;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
          background: rgba(255, 255, 255, 1);
        }

        .btn-primary {
          animation: fadeInUp 1s ease-out 0.9s both, glow 2s ease-in-out infinite;
          transition: all 0.3s ease;
          border-radius: 12px;
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          border: none;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: 100%;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(13, 110, 253, 0.4);
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:active {
          transform: translateY(-1px);
        }

        .carousel-control-prev,
        .carousel-control-next {
          opacity: 0;
        }

        .carousel-indicators {
          bottom: 20px;
        }

        .carousel-indicators [data-bs-target] {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 4px;
          background-color: rgba(255, 255, 255, 0.5);
        }

        .carousel-indicators .active {
          background-color: rgba(255, 255, 255, 0.9);
        }
      `}</style>

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