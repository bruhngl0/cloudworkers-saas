import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cors } from 'hono/cors';
import { Bindings } from 'hono/types';
import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference'

// First fix the Bindings interface
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    payload: Queue,
    HUGGING_FACE_KEY: string  // Match the name in wrangler.json
  }
}>()

// Fix the analyzeQuote function
async function analyzeQuote(text: string, env: any) {
  console.log('🔄 Analyzing quote:', text);
  
  try {
    const hf = new HfInference(env.HUGGING_FACE_KEY);
    const result = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: text,
      parameters: {
        candidate_labels: [
          'Finance', 'Education', 'Business', 
          'Science', 'Politics', 'Sports',
          'code snippet', 'Youtube Link'
        ]
      }
    });

    console.log('✅ HuggingFace Response:', JSON.stringify(result, null, 2));

    // The result is an array, and we want the highest scoring label
    if (Array.isArray(result) && result.length > 0) {
      const firstResult = result[0];
      // Type assertion to handle unknown type
      const scores = firstResult.scores as number[];
      const labels = firstResult.labels as string[];
      const maxScoreIndex = scores.indexOf(Math.max(...scores));
      const category = labels[maxScoreIndex];
      return category;
    }

    return 'Uncategorized';
  } catch (error) {
    console.error('❌ Classification Error:', error);
    return 'Uncategorized';
  }
}

// And in your queue function, update the analyzeQuote call:
// Remove this line completely:
// const category = await analyzeQuote(messageData.selectedText, (env as any).HUGGINGFACE_API_KEY);
//life is good
// Fix the queue function call
export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, env: any, ctx: ExecutionContext) {
    const prisma = new PrismaClient({
      datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    try {
      const messages = batch.messages;
      
      for (let i = 0; i < messages.length; i++) {
        const messageData = messages[i].body;
        console.log('📝 Processing quote:', {
          id: messageData.id,
          text: messageData.selectedText
        });
        
        // Pass the entire env object instead of just the key
        const category = await analyzeQuote(messageData.selectedText, env);
        console.log('🏷️ Category assigned:', category);
        
        await prisma.quote.update({
          where: { id: messageData.id },
          data: { category: category.toLowerCase() }
        });
        
        console.log('✅ Database updated for quote:', messageData.id);
      }
    } catch (error) {
      console.error('❌ Queue error:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}
