"use client";
import React, { useState } from "react";
import { Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./login.css";
import supabase from './api/supabase';

export default function Login({ onUsernameChange }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); 
  const navigate = useNavigate(); 

    const handleAuth = async () => {
    if (username.trim() !== "" && email.trim() !== "" && password.trim() !== "") {
      setIsLoading(true);
      try {
        let result;
        
        if (isSignUp) {
          // Sign up new user
          result = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                username: username
              }
            }
          });

          // If signup successful, create user profile
          if (result.data.user && !result.error) {
            const profileResult = await createUserProfile(result.data.user, username);
            if (profileResult.error) {
              console.error("Failed to create user profile:", profileResult.error);
            }
          }
        } else {
          // Sign in existing user
          result = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
        }

        const { data, error } = result;

        if (error) {
          alert(error.message);
          return;
        }

        if (data.user) {
          //User is authenticated
          console.log("User authenticated:", data.user);
          
          // For login, fetch username from database
          let userDisplayName = username;
          
          if (!isSignUp) {
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('username')
              .eq('id', data.user.id)
              .single();
            
            if (userProfile && !profileError) {
              userDisplayName = userProfile.username;
            } else {
              // Fallback to metadata if profile fetch fails
              userDisplayName = data.user.user_metadata?.username || username;
            }
          }
          
          if (onUsernameChange) {
            onUsernameChange(userDisplayName);
          }

          if (isSignUp) {
            alert("Account created successfully! Please check your email to verify your account.");
          }
          
          navigate("/chat"); 
        }
      } catch (err) {
        console.error("Authentication failed:", err);
        alert("Authentication failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };

  const backgroundImages = [
    { src: "https://cff2.earth.com/uploads/2018/09/11144510/Teens-say-they-prefer-texting-friends-rather-than-talking-in-person.jpg" },
    { src: "https://img.freepik.com/free-photo/co-working-people-working-together_23-2149328349.jpg?semt=ais_hybrid&w=740&q=80" },
    { src: "https://commsroom.co/wp-content/uploads/2023/11/technology-communication-skills.jpg" },
    { src: "https://www.gettingsmart.com/wp-content/uploads/2017/09/Students-Media-Literacy.jpg" }
  ];

  return (
    <>
      <div className="carousel-container">
        <Carousel fade controls={false} indicators={true} interval={2500} pause={false}>
          {backgroundImages.map((image, index) => (
            <Carousel.Item key={index}>
              <img className="d-block w-100" src={image.src} alt={`slide-${index}`} />
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
            <label htmlFor="username" className="form-label">Username</label>
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
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="form-label">Password</label>
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

          <button 
            className="btn btn-primary" 
            onClick={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Login")}
          </button>

          <div className="auth-toggle">
            <p>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button 
                className="btn btn-link p-0" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}