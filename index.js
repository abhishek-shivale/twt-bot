import { config } from "dotenv";
config();
import { TwitterApi } from "twitter-api-v2";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prompt } from "./prompt.js";
import * as cron from "node-cron";

const client = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API); 

export const twitterClient = client.readWrite;

async function NewTweet() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const AI_PROMPT = prompt[Math.floor(Math.random() * 10) + 1];
    const res = await model.generateContent(
      AI_PROMPT +
        "write in simple and short english below 250 characters. Twitter currently allows a maximum of 250 characters per tweet. This includes all text, spaces, punctuation, and mentions (@ usernames) but excludes media links shortened by Twitter (using t.co)"
    );
    const content = res.response;
    const textContent = content.text().replace(/\*/g, "");

    if (textContent.length > 280) {
      console.error("Tweet text is too long:", textContent.length);
       NewTweet(); 
      return; 
    }

    const twitterResponse = await twitterClient.v2.tweet({
      text: textContent,
    });
    console.log("Tweet posted successfully:", twitterResponse);
  } catch (err) {
    console.error("Error occurred:", err);
    console.log("Retrying tweet generation in 5 seconds...");
    
    await new Promise((resolve) => setTimeout(resolve, 5000)); 
    NewTweet(); 
  } finally {
    console.log("Tweet generation complete (success or error)");
  }
}

cron.schedule("*/45 * * * *", () => {
  NewTweet();
  console.log("Cron job running");
});

