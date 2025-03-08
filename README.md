# Let's Vent



## The Let's vent Chatbot Emotional Support Chatbot with CBT Techniques
A friendly chatbot that listens to user feelings, detects sentiment, and responds with structured prompts inspired by Cognitive Behavioral Therapy (CBT). The bot is not a substitute for professional mental health care—it’s more like a supportive friend that uses evidence-based conversation techniques.

## Table of Contents
- Overview
- Key Features
- How It Works
- Project Structure
- Usage
- Structured Prompting & CBT
- Disclaimer
- Contributing


## Overview
This project aims to provide a welcoming environment where users can openly express their emotions. The chatbot detects the sentiment of user inputs and offers gentle, structured prompts to help reframe negative thoughts and encourage healthier thinking patterns.

## Key Features
 - Sentiment Analysis: Identifies whether the user’s statements are sad, anxious, angry, or neutral/happy.
 - CBT-Inspired Prompts: Offers suggestions or questions to challenge unhelpful thoughts (e.g., “What evidence do you have that this thought is true?”).
 - Session Tracking: (Optional) Remembers previous conversations to provide more personalized responses.
 - Voice & Text Support: (Optional) Uses speech-to-text and text-to-speech capabilities to make interaction more natural.
 - Secure Data Storage: (Optional) Leverages blockchain or a secure database to store interactions, ensuring privacy.

## How It Works
 - User Input: The user types (or speaks) a statement about how they’re feeling.
 - Sentiment Detection: The chatbot analyzes the text to determine the emotional tone (e.g., sadness, worry, frustration).
 - Structured Response: Based on the sentiment, the agent uses CBT-inspired techniques to craft a supportive, reflective reply.
For example: If the user says, “I feel like a failure,” the chatbot might respond by asking, “Could you tell me about a time you were successful, even if it was small?”
 0 Follow-Up Questions: The chatbot continues with open-ended prompts to guide the user toward reframing negative thoughts.
 - User Reflection: The conversation continues as the user shares more, with the chatbot providing empathy, validation, and gentle guidance.


This application's logic is written in [Rust](https://internetcomputer.org/docs/current/developer-docs/backend/rust/).

### Project structure

The `/backend` folder contains the Rust smart contract:

- `Cargo.toml`, which defines the crate that will form the backend
- `lib.rs`, which contains the actual smart contract, and exports its interface

The `/frontend` folder contains web assets for the application's user interface. The user interface is written using the React framework.

