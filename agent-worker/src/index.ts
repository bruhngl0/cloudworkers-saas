import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cors } from "hono/cors";
import { HfInference } from "@huggingface/inference";
import { CategoryUpdateHandler } from "./durableObjects"; // ✅ Import Durable Object

export { CategoryUpdateHandler }; // ✅ Ensure it's exported for Cloudflare Workers

// Initialize Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    payload: Queue;
    HUGGING_FACE_KEY: string;
    CATEGORY_UPDATES: DurableObjectNamespace; // ✅ Durable Object Binding
    DURABLE_OBJECT_ID: string;
  };
}>();

// Function to analyze quote using Hugging Face
async function analyzeQuote(text: string, env: any) {
  console.log("🔄 Analyzing quote:", text);

  try {
    const hf = new HfInference(env.HUGGING_FACE_KEY);
    const result = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: text,
      parameters: {
        candidate_labels: [
          "Finance",
          "Education",
          "Business",
          "Science",
          "Politics",
          "Sports",
          "Code Snippet",
          "YouTube Link",
        ],
      },
    });

    console.log("✅ HuggingFace Response:", JSON.stringify(result, null, 2));

    if (Array.isArray(result) && result.length > 0) {
      const firstResult = result[0];
      const scores = firstResult.scores as number[];
      const labels = firstResult.labels as string[];
      const maxScoreIndex = scores.indexOf(Math.max(...scores));
      const category = labels[maxScoreIndex];
      return category;
    }

    return "Uncategorized";
  } catch (error) {
    console.error("❌ Classification Error:", error);
    return "Uncategorized";
  }
}

// ✅ Queue Consumer Worker
export default {
  async queue(batch: MessageBatch<any>, env: any, ctx: ExecutionContext) {
    const prisma = new PrismaClient({
      datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      for (const message of batch.messages) {
        const messageData = message.body;
        console.log("📩 Processing quote:", {
          id: messageData.id,
          text: messageData.selectedText,
        });

        // ✅ AI Categorization
        const category = await analyzeQuote(messageData.selectedText, env);
        console.log("🏷️ Category assigned:", category);

        // ✅ Update Database with the new category
        await prisma.quote.update({
          where: { id: messageData.id },
          data: { category: category.toLowerCase() },
        });

        console.log("✅ Database updated for quote:", messageData.id);

        // ✅ Notify WebSocket Clients via Durable Object
        try {
          const durableObjectId = env.CATEGORY_UPDATES.idFromName(
            env.DURABLE_OBJECT_ID
          );
          const durableObjectStub = env.CATEGORY_UPDATES.get(durableObjectId);

          // 🔥 Send category update via WebSocket
          await durableObjectStub.fetch("https://fake-url/", {
            method: "POST",
            body: JSON.stringify({
              id: messageData.id,
              category,
            }),
          });

          console.log("📡 WebSocket update sent:", {
            id: messageData.id,
            category,
          });
        } catch (wsError) {
          console.error("⚠️ Error sending WebSocket update:", wsError);
        }
      }
    } catch (error) {
      console.error("❌ Queue processing error:", error);
    } finally {
      await prisma.$disconnect();
    }
  },
};
