import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cors } from 'hono/cors';
import { Bindings } from 'hono/types';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    payload: Queue
  }
}>()

app.use("/*",cors())

const prismaConnect = (dbUrl : string)=>{
  const prisma = new PrismaClient({
    datasourceUrl: dbUrl
  }).$extends(withAccelerate())

  return prisma
}

app.get('/', async (c) => {
  const prisma = prismaConnect(c.env.DATABASE_URL);
  
  try {
    const response = await prisma.quote.findMany({});
    return c.json({
      message: "Data fetched successfully",
      data: response,
    });
  } catch (error) {
    return c.json({
      message: "Error fetching data",
    }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, env: string, ctx: ExecutionContext) {
    const prisma = prismaConnect((env as any).DATABASE_URL);
    
    try {
      // Convert batch messages to array for easier understanding
      const messages = batch.messages;
      
      // Loop through each message one by one
      for (let i = 0; i < messages.length; i++) {
        // Get the current message's body
        const messageData = messages[i].body;
        
        // Log what we received
        console.log('Processing message number:', i + 1);
        console.log('Message data:', messageData);
        
        // Update the quote in database
        await prisma.quote.update({
          where: { 
            id: messageData.id 
          },
          data: { 
            category: "finance"
          }
        });
        
        // Log success
        console.log(`Updated quote ${messageData.id} to finance category`);
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}
