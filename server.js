/***
 * 1) random topics
 * 2) rag with web search
 * 3) get response from mail and edit the response and redraft
 * 4) auto post to linkedin
 * 5) security
 */

// 1. Load our packages
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
// const nodemailer = require('nodemailer')
const cron = require("node-cron");
const cors = require("cors");

// 2. Load our secret keys from .env file
dotenv.config();

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// 3. Create the server app
const app = express();
app.use(express.json()); // This lets our server understand JSON data
app.use(
  cors({
    origin: [
      "http://localhost:3000", // for local development
      "https://your-vercel-app.vercel.app", // your production frontend
    ],
  }),
);

// Fetch latest news for a given topic
async function fetchNews(topic) {
  const response = await axios.get("https://gnews.io/api/v4/search", {
    params: {
      q: topic,
      lang: "en",
      max: 5,
      apikey: process.env.GNEWS_API_KEY,
    },
  });

  const articles = response.data.articles;
  if (!articles || articles.length === 0) return "";

  // Extract just the title and description of each article
  const newsSummary = articles
    .map((a, i) => `${i + 1}. ${a.title} — ${a.description}`)
    .join("\n");

  return newsSummary;
}

async function generatePost(topic, hint, newsContext) {
  const newsSection = newsContext
    ? `\n\nHere are some recent news headlines about this topic for context:\n${newsContext}\n\nUse these to make the post feel current and relevant.`
    : "";

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Write a witty, casual LinkedIn post about "${topic}". ${hint ? "Angle: " + hint : ""}${newsSection} Keep it under 250 words. 
          It should be catchy and punchy. It should help me get get maximum views in linkedin.`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.choices[0].message.content;
}

// 4. Define our first "route" — a URL endpoint
app.post("/generate-post", async (req, res) => {
  const { topic, hint } = req.body;
  console.log("Received request for topic:", topic);

  try {
    const post = await generatePost(topic, hint);
    res.json({ post });
  } catch (error) {
    console.error("Error calling Groq:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/send-draft", async (req, res) => {
  const { post, topic } = req.body;
  console.log("Received draft request for topic:", topic);

  try {
    console.log("Attempting to send email via Resend...");
    const result = await resend.emails.send({
      from: "LinkedIn Agent <onboarding@resend.dev>",
      to: process.env.GMAIL_USER,
      subject: `📝 LinkedIn Draft Ready — ${topic}`,
      text: `Hey Sidhant! Here's your weekly LinkedIn post draft:\n\n${post}\n\n---\nHappy with it? Go ahead and post it on LinkedIn! ✅`,
    });
    console.log("Resend result:", JSON.stringify(result));
    res.json({ success: true, message: "Draft sent to your email!" });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Runs every Monday at 9:00 AM
cron.schedule("30 1 * * 0", async () => {
  console.log("⏰ Scheduler triggered! Generating weekly LinkedIn post...");

  // TO this (random topic)
  const topics = [
    {
      topic: "Angular",
      hint: "Share something new, practical or exciting in the Angular ecosystem",
    },
    {
      topic: "AI and frontend tech",
      hint: "Share a fresh insight or finding about AI trends and tools. Mainatain a motivational tone",
    },
    {
      topic: "Leadership and tech emergence",
      hint: "Share a lesson or observation about leading teams in a fast changing tech world. Maintain your professional motivational tone",
    },
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const topic = randomTopic.topic;
  const hint = randomTopic.hint;

  try {
    // Step 1 - Generate the post
    // Step 1 - Fetch latest news for the topic
    const newsContext = await fetchNews(topic);
    console.log(`📰 Fetched news for topic: ${topic}`);

    // Step 2 - Generate the post with news context
    const post = await generatePost(topic, hint, newsContext);
    console.log("✅ Post generated successfully!");

    // // Step 2 - Send it to your email
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.GMAIL_APP_PASSWORD
    //   },
    //   family: 4
    // })

    // const mailOptions = {
    //   from: process.env.GMAIL_USER,
    //   to: process.env.GMAIL_USER,
    //   subject: `📝 LinkedIn Draft Ready — ${topic}`,
    //   text: `Hey Sidhant! Here's your weekly LinkedIn post draft:\n\n${post}\n\n---\nHappy with it? Go ahead and post it on LinkedIn! ✅`
    // }

    // await transporter.sendMail(mailOptions)
    // console.log('📧 Weekly draft emailed successfully!')

    await resend.emails.send({
      from: "LinkedIn Agent <onboarding@resend.dev>",
      to: process.env.GMAIL_USER,
      subject: `📝 LinkedIn Draft Ready — ${topic}`,
      text: `Hey Sidhant! Here's your weekly LinkedIn post draft:\n\n${post}\n\n---\nHappy with it? Go ahead and post it on LinkedIn! ✅`,
    });
  } catch (error) {
    console.error("❌ Scheduler error:", error.message);
  }
});

// 8. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
