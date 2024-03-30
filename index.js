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

console.log(process.env.APP_KEY);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);

export const twitterClient = client.readWrite


async function NewTweeT() {
   try {
     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
     const AI_PROMPT = prompt[Math.floor(Math.random() * 10) + 1];
     const res = await model.generateContent(
       AI_PROMPT +
         "write in simple and short english below 250 character Twitter currently allows a maximum of 250 characters per tweet. This includes all text, spaces, punctuation, and mentions (@ usernames) but excludes media links shortened by Twitter (using t.co)"
     );
     const content = res.response;
     const textCotent = content.text().replace(/\*/g, "");
     if (textCotent.length > 280) {
       console.error("Tweet text is too long:", textCotent.length);
     } else {
       const twitterResponse = await twitterClient.v2.tweet({
         text: textCotent,
       });
     }
     console.log("tweet is done!!!");
} catch (err) {
    console.error(err);
    console.log("Found some error!!")
   }
    
}
cron.schedule("*/30 * * * *",()=>{
    NewTweeT(),
    console.log("corn is working");
});

