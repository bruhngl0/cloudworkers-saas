import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge"; 
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwt, sign } from "hono/jwt";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { cors } from "hono/cors";
import { quoteRouter } from "./routes/quote";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string ,
    JWT_SECRET: string
  }
}>()


app.use("/*",cors())
app.route("/api/v1/user" , userRouter)
app.route("/api/v1/blog", blogRouter)
app.route("/api/v1/quotes", quoteRouter)



app.get("/", (c)=> {
  const jwtSecret = c.env.JWT_SECRET
  return c.json({"life is gooD" : jwtSecret})
})

app.get("/pepe" , async(c)=> {
  const prisma  = new PrismaClient({
  datasourceUrl : c.env.DATABASE_URL}).$extends(withAccelerate())
  try {
    const data = await prisma.user.findMany()
    if(!data){
     c.status(404)
     c.json({"message" : "invalid request"})
    }
    return c.json(data)
  } catch (error) {
    c.status(403)
    return c.json({"message": "error"})
  }
})


export default app