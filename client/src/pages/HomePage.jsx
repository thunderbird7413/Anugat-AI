import React from "react";
import { motion } from "framer-motion";
import Button from "../components/Button";
import { Bot, Upload, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
    {
        icon: <Bot className="text-blue-500 w-8 h-8" />,
        title: "Smart Chatbot",
        description: "Converse with an intelligent AI assistant trained on your data.",
    },
    {
        icon: <Upload className="text-green-500 w-8 h-8" />,
        title: "Content Upload",
        description: "Upload documents, media, and structured data with ease.",
    },
    {
        icon: <Settings2 className="text-purple-500 w-8 h-8" />,
        title: "Smart Folder Managament",
        description: "Manage your folders and files in a quick and efficient manner.",
    },
];

export default function HomePage() {
    return (
        <div
            style={{
                background: "radial-gradient(circle at top, #ffffff, #f5f5f5)", // Lighter gradient
                minHeight: "100vh",
                padding: "2rem",
                color: "#333", // Darker text for readability
                fontFamily: "'Segoe UI', sans-serif",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{ textAlign: "center", marginBottom: "3rem" }}
            >
                <h1 style={{ fontSize: "3rem", fontWeight: "bold", letterSpacing: "1px", color: "#222" }}>
                    Welcome to Anugat AI
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#555" }}>
                    Your intelligent assistant for content and knowledge management.
                </p>
                <Button
                    style={{
                        marginTop: "1.5rem",
                        backgroundColor: "#1976d2",
                        color: "black",
                        padding: "0.75rem 2rem",
                        fontSize: "1rem",
                        borderRadius: "2rem",
                        boxShadow: "0 0 10px #1976d2",
                    }}
                    component={Link}
                    to="/dashboard"
                >
                    <Link to="/dashboard" style={{textDecoration :"none", color: "white"}}>
                    Get Started
                    </Link>
                </Button>
            </motion.div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1.5rem",
                    maxWidth: "1000px",
                    margin: "0 auto",
                }}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                    >
                        <div
                            style={{
                                background: "#ffffff", // Lighter background for cards
                                border: "1px solid #ddd", // Lighter border
                                borderRadius: "1rem",
                                padding: "1.5rem",
                                textAlign: "center",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Subtle shadow for light theme
                            }}
                        >
                            <div>
                                <div style={{ marginBottom: "1rem" }}>{feature.icon}</div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#333" }}>
                                    {feature.title}
                                </h2>
                                <p style={{ color: "#555", marginTop: "0.5rem" }}>{feature.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
