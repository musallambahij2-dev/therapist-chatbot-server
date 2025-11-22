// index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Simple health-check route (optional)
app.get("/", (req, res) => {
  res.send("Therapist chatbot backend is running.");
});

// Create OpenAI client using API key from environment (set on Render)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper: ask OpenAI for a therapist-style reply
async function getTherapistReply(userMessage) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a kind, supportive therapist-style chatbot for teenagers. " +
          "Use simple, gentle language. Ask helpful questions. " +
          "Do NOT give medical or medication advice. " +
          "If things sound serious or unsafe, encourage the user to talk to a trusted adult or professional."
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });

  // Safely extract the text from the response
  const text =
    response.output?.[0]?.content?.[0]?.text?.value ||
    "I'm here and listening. Can you tell me a bit more about how you feel?";

  return text;
}

// ✅ GET endpoint for App Lab (works with startWebRequest(url, callback))
app.get("/therapist", async (req, res) => {
  try {
    // message comes from the query string: ?message=hello
    const userMessage = (req.query.message || "").toString().slice(0, 1000);

    const reply = await getTherapistReply(userMessage);
    res.json({ reply: reply });
  } catch (err) {
    console.error("Error in GET /therapist:", err);
    res.status(500).json({
      reply:
        "Sorry, something went wrong on my side. Please try again later or talk to a trusted adult."
    });
  }
});

// (Optional) POST endpoint if you ever need it from other clients
app.post("/therapist", async (req, res) => {
  try {
    const userMessage = (req.body.message || "").toString().slice(0, 1000);

    const reply = await getTherapistReply(userMessage);
    res.json({ reply: reply });
  } catch (err) {
    console.error("Error in POST /therapist:", err);
    res.status(500).json({
      reply:
        "Sorry, something went wrong on my side. Please try again later or talk to a trusted adult."
    });
  }
});

// Start the server (Render sets PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Therapist chatbot server running on port " + PORT);
});
