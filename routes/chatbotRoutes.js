const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * In-memory chat history
 * Keyed by session ID or IP (simple version)
 */
const chatHistoryStore = new Map();

/**
 * System prompt (already scoped & formatted)
 */
const SYSTEM_PROMPT = `
You are Attesta AI, the official in-app assistant for the Attesta platform.

ABOUT ATTESTA:
Attesta is a privacy-first digital identity and verification platform.
It enables identity verification, ZK-proof based checks, and secure APIs
without exposing sensitive user data.

RULES:
- Answer ONLY Attesta, identity, privacy, ZK-proof, verification topics
- Refuse unrelated questions
- Use Markdown formatting (headings, bullets, bold)
- Keep responses concise and app-focused
`;

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    /**
     * Simple session key
     * (Later you can replace with userId / JWT id)
     */
    const sessionId = req.ip;

    if (!chatHistoryStore.has(sessionId)) {
      chatHistoryStore.set(sessionId, [
        { role: "system", content: SYSTEM_PROMPT },
      ]);
    }

    const history = chatHistoryStore.get(sessionId);

    // Add user message
    history.push({ role: "user", content: message });

    // Limit history size (important)
    if (history.length > 12) {
      history.splice(1, history.length - 12); // keep system + last 11
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: history,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I can help with Attesta-related topics only.";

    // Add assistant reply to history
    history.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

module.exports = router;
