import dotenv from "dotenv";
dotenv.config();

const OPEN_ROUTER_API_KEY = import.meta.env.OPEN_ROUTER_API_KEY;
const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

const turkmenChars = /[ÄäŇňÖöŞşÜüÝýŽž]/;
const turkmenWords =
  /\b(salam|sagbol|haýr|gowy|ýagşy|bolýar|näme|bilen|üçin|gerek)\b/i;

const codingKeywords =
  /\b(code|app|function|program|website|api|algorithm|debug|software|develop|create.*app|build.*app|make.*app)\b/i;

const scienceKeywords =
  /\b(chemistry|physics|math|science|equation|formula|theorem|atom|molecule|calculate|solve)\b/i;

const openRouterModels = {
  coding: "deepseek/deepseek-coder",
  general: "google/gemma-2-9b-it:free",
  science: "meta-llama/llama-3.1-8b-instruct:free",
  fallback: "mistralai/mistral-7b-instruct:free",
};

async function callGemini(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.log(`Gemini attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function callOpenRouter(prompt, model, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://your-app.com",
            "X-Title": "AI Router",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!response.ok)
        throw new Error(`OpenRouter API error: ${response.status}`);

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.log(
        `OpenRouter (${model}) attempt ${i + 1} failed:`,
        err.message
      );
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

export default async function engine(prompt) {
  try {
    if (turkmenChars.test(prompt) || turkmenWords.test(prompt)) {
      console.log("Detected Turkmen content, using Gemini...");
      const response = await callGemini(prompt);
      return { model: "gemini", response };
    }

    if (codingKeywords.test(prompt)) {
      console.log("Detected coding request, using OpenRouter coding model...");
      const response = await callOpenRouter(prompt, openRouterModels.coding);
      return { model: "openrouter-coding", response };
    }

    if (scienceKeywords.test(prompt)) {
      console.log("Detected science/math request, fetching dual responses...");
      const [openRouterRes, geminiRes] = await Promise.allSettled([
        callOpenRouter(prompt, openRouterModels.science),
        callGemini(prompt),
      ]);

      return {
        model: "dual",
        responses: {
          openrouter:
            openRouterRes.status === "fulfilled"
              ? openRouterRes.value
              : "Error: " + openRouterRes.reason.message,
          gemini:
            geminiRes.status === "fulfilled"
              ? geminiRes.value
              : "Error: " + geminiRes.reason.message,
        },
      };
    }

    console.log("General request, using Gemini...");
    const response = await callGemini(prompt);
    return { model: "gemini", response };
  } catch (error) {
    console.error("All attempts failed, trying fallback model...");

    try {
      const response = await callOpenRouter(prompt, openRouterModels.fallback);
      return { model: "openrouter-fallback", response };
    } catch (fallbackError) {
      return {
        model: "error",
        response: "All models failed. Please try again later.",
        error: fallbackError.message,
      };
    }
  }
}

// Example usage:
// const result = await engine("Salam, nähili?");
// const result = await engine("Create a todo app in React");
// const result = await engine("Explain quantum physics");
// console.log(result);
