/*** 
 * 1) random topics
 * 2) rag with web search
 * 3) get response from mail and edit the response and redraft
 * 4) auto post to linkedin
 */


// 1. Load our packages
const express = require('express')
const dotenv = require('dotenv')
const axios = require('axios')
const nodemailer = require('nodemailer')
const cron = require('node-cron')


// 2. Load our secret keys from .env file
dotenv.config()

// 3. Create the server app
const app = express()
app.use(express.json()) // This lets our server understand JSON data

// Reusable function to generate a LinkedIn post
async function generatePost(topic, hint) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Write a witty, casual LinkedIn post about "${topic}". ${hint ? 'Angle: ' + hint : ''} Keep it under 250 words.`
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  return response.data.choices[0].message.content
}

// 4. Define our first "route" — a URL endpoint
app.post('/generate-post', async (req, res) => {
  const { topic, hint } = req.body
  console.log('Received request for topic:', topic)

  try {
    const post = await generatePost(topic, hint)
    res.json({ post })
  } catch (error) {
    console.error('Error calling Groq:', error.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/send-draft', async (req, res) => {

  const { post, topic } = req.body
  console.log('Received draft request for topic:', topic)

  try {
    // 1. Create a mail transporter using your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })

    // 2. Define the email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // sending to yourself
      subject: `📝 LinkedIn Draft Ready — ${topic}`,
      text: `Hey Sidhant! Here's your weekly LinkedIn post draft:\n\n${post}\n\n---\nHappy with it? Go ahead and post it on LinkedIn! ✅`
    }

    // 3. Send the email
    await transporter.sendMail(mailOptions)
    console.log('Draft email sent successfully!')
    res.json({ success: true, message: 'Draft sent to your email!' })

  } catch (error) {
    console.error('Error sending email:', error.message)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

// Runs every Monday at 9:00 AM
cron.schedule('* 9 * * 2', async () => {
  console.log('⏰ Scheduler triggered! Generating weekly LinkedIn post...')

  // TO this (random topic)
  const topics = [
    { topic: 'Angular', hint: 'Share something new, practical or exciting in the Angular ecosystem' },
    { topic: 'AI and frontend tech', hint: 'Share a fresh insight or finding about AI trends and tools. Mainatain a motivational tone' },
    { topic: 'Leadership and tech emergence', hint: 'Share a lesson or observation about leading teams in a fast changing tech world. Maintain your professional motivational tone' }
  ]

  const randomTopic = topics[Math.floor(Math.random() * topics.length)]
  const topic = randomTopic.topic
  const hint = randomTopic.hint

  try {
    // Step 1 - Generate the post
    const post = await generatePost(topic, hint)
    console.log('✅ Post generated successfully!')

    // Step 2 - Send it to your email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `📝 LinkedIn Draft Ready — ${topic}`,
      text: `Hey Sidhant! Here's your weekly LinkedIn post draft:\n\n${post}\n\n---\nHappy with it? Go ahead and post it on LinkedIn! ✅`
    }

    await transporter.sendMail(mailOptions)
    console.log('📧 Weekly draft emailed successfully!')

  } catch (error) {
    console.error('❌ Scheduler error:', error.message)
  }
})

// 8. Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})