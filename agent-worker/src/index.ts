import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { cors } from 'hono/cors';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

app.use(cors())

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

export default app
