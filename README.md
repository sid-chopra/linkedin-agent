# 🤖 LinkedIn Post Agent

An automated AI-powered agent that generates weekly LinkedIn posts in your personal voice, emails them to you for review, and is built to evolve into a fully hands-free posting pipeline.

---

## 💡 What It Does

- Automatically generates a LinkedIn post every **Tuesday at 10:00 AM**
- Randomly picks from **3 topic themes** — Angular, AI & Emerging Tech, Leadership & Tech
- Emails the draft straight to your inbox for review
- Built with a simple Node.js backend — easy to extend and deploy

---

## 🧠 How It Works

```
Cron Scheduler (Tuesday 10AM)
        ↓
Random Topic Picker
        ↓
Groq API (llama-3.1-8b-instant) — generates the post
        ↓
Nodemailer + Gmail — emails the draft to you
        ↓
You review, tweak, and post on LinkedIn ✅
```

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js |
| Server | Express.js |
| AI Model | Groq API (llama-3.1-8b-instant) |
| Scheduler | node-cron |
| Email | Nodemailer + Gmail App Password |
| HTTP Client | Axios |
| Config | dotenv |

---

## 📁 Project Structure

```
linkedin-agent/
├── server.js         # Main server — routes + scheduler
├── .env              # Secret keys (never commit this!)
├── .gitignore        # Ignores .env and node_modules
├── package.json      # Project dependencies
└── README.md         # You're reading this!
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/linkedin-agent.git
cd linkedin-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your `.env` file

Create a `.env` file in the root folder:

```
GROQ_API_KEY=your_groq_api_key
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
PORT=3000
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

### 4. Run the server

```bash
node server.js
```

---

## 🔑 Getting Your API Keys

### Groq API Key
- Sign up at [console.groq.com](https://console.groq.com)
- Go to **API Keys** → Create a new key
- Free tier is more than enough

### Gmail App Password
- Go to [myaccount.google.com/security](https://myaccount.google.com/security)
- Enable **2-Step Verification**
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Create a new app password — copy the 16 characters **without spaces**

---

## 📬 API Endpoints

### `POST /generate-post`
Generates a LinkedIn post for a given topic.

**Request Body:**
```json
{
  "topic": "Angular performance tips",
  "hint": "Focus on practical advice for large apps"
}
```

**Response:**
```json
{
  "post": "Generated LinkedIn post text here..."
}
```

---

### `POST /send-draft`
Emails a post draft to your Gmail.

**Request Body:**
```json
{
  "topic": "Angular performance tips",
  "post": "Your post text here..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft sent to your email!"
}
```

---

## ⏰ Scheduler

The agent auto-runs every **Tuesday at 10:00 AM** and:
1. Randomly picks one of your 3 topic themes
2. Generates a post using Groq
3. Emails it to you

**Topic themes:**
- 🅰️ Angular — ecosystem updates and practical tips
- 🤖 AI & Emerging Tech — trends, tools, and findings
- 🧭 Leadership & Tech Emergence — insights on leading teams in a fast-changing world

To change the schedule, update the cron string in `server.js`:
```javascript
cron.schedule('0 10 * * 2', ...) // Tuesday at 10AM
```

---

## 🗺️ Roadmap

- [x] `/generate-post` route
- [x] `/send-draft` route
- [x] Weekly cron scheduler
- [x] Random topic picker
- [ ] RAG with NewsAPI for fresh, current content
- [ ] Gmail reply watcher — reply to approve
- [ ] Auto-post to LinkedIn via API
- [ ] Simple frontend dashboard UI

---

## 👤 Author

**Sidhant**
Technical Lead — Frontend & AI Tooling
[LinkedIn](https://linkedin.com/in/yourprofile)

---

## 📄 License

MIT — feel free to fork and build on top of this!