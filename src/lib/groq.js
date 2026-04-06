import Groq from "groq-sdk";

export function getGroqClient() {
  const apiKey = localStorage.getItem("user_groq_key");
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
}

export function hasApiKey() {
  return !!localStorage.getItem("user_groq_key");
}

export async function callGroq(messages) {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    });
    return { success: true, content: response.choices[0].message.content };
  } catch (error) {
    if (error.status === 429 && isUsingDefaultKey()) {
      return { success: false, rateLimited: true };
    }
    return { success: false, error: error.message };
  }
}
