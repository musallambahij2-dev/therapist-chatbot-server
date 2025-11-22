import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAI client – we’ll set OPENAI_API_KEY in Render later
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint App Lab will call
app.post("/therapist", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a kind, supportive, simple-words therapist-style chatbot for teenagers. " +
            "Use gentle language, ask helpful questions, avoid medical/medication advice, " +
            "and always suggest talking to a trusted adult or professional if things sound serious or unsafe."
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const text =
      response.output[0].content[0].text.value ||
      "I’m here and listening. Can you tell me a bit more about how you feel?";

    res.json({ reply: text });
  } catch (err) {
    console.error("Error in /therapist endpoint:", err);
    res.status(500).json({
      reply:
        "Sorry, something went wrong on my side. Please try again later or talk to a trusted adult."
    });
  }
});

// Local test port; Render will override PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Therapist chatbot server running on port " + PORT);
});
