import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [structuredData, setStructuredData] = useState(null);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Speech to Text</h1>
        <p>Your browser does not support Speech Recognition.</p>
        <p>Please use a modern browser like Google Chrome or Microsoft Edge.</p>
      </div>
    );
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  useEffect(() => {
    recognition.onresult = (event) => {
      const lastTranscript = event.results[event.results.length - 1][0].transcript;
      setTranscript((prev) => prev + " " + lastTranscript);
    };

    recognition.onend = () => {
  console.log("Speech recognition ended.");
  if (isListening) {
    recognition.start(); // Restart if listening is enabled
  }
};


    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognition.stop();
  };

  const storeText = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/store", {
        text: transcript,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error storing text:", error);
    }
  };

  const parseText = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/parse");
      setStructuredData(response.data);
    } catch (error) {
      console.error("Error parsing text:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Pharmacy Speech-to-Structured-Text</h1>
      <div
        style={{
          margin: "20px auto",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "80%",
          padding: "10px",
          minHeight: "100px",
          textAlign: "left",
        }}
      >
        {transcript || "Start speaking to see the text appear here..."}
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={startListening} disabled={isListening}>
          Start Listening
        </button>
        <button onClick={stopListening} disabled={!isListening}>
          Stop Listening
        </button>
        <button onClick={storeText}>Store Text</button>
        <button onClick={parseText}>Parse and Display Data</button>
      </div>
      {message && <p>{message}</p>}
      {structuredData && (
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <h3>Structured Data:</h3>
          <pre>{JSON.stringify(structuredData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
