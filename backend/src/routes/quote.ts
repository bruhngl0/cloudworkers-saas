import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify, jwt } from "hono/jwt";


 export const quoteRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },

    Variables: {
        userId: any;
    }
}>()

quoteRouter.use("/*" , async(c, next)=>{
   const authHeader = c.req.header("Authorization") || "";
    if(!authHeader){
        c.status(400)
        return c.json({message: "haeader is not reaching here correctly"})
    }
   try {
    const user  = await verify(authHeader, c.env.JWT_SECRET)
    if(!user){
     c.status(403) //invalid
    }
    c.set("userId", user.id)
    await next()
   } catch (error) {
     c.status(404)
     return c.json({error: "not logged in"})
   }
  
})



quoteRouter.get("/", async(c)=>{
   const prisma = new PrismaClient({
    datasourceUrl : c.env.DATABASE_URL
   }).$extends(withAccelerate())

   try {
    const userId = c.get("userId")
    const data = await prisma.quote.findFirst({ 
     where: {
         authorId : userId,
     }
    })
 
    c.status(200)
    return c.json({quotes: data})
   } catch (error) {
     return c.json({error: "invalid req"})
   }
  
})


quoteRouter.post("/", async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body =  await c.req.json()
    const authorId = c.get("userId")
    try {
        if(!body){
            c.status(400)
            return c.json({message: "no payload"})
        }

        const result = await prisma.quote.create({
            data: {
                selectedText: body.selectedText,
                authorId: authorId,
            }
        }) 

        c.status(200)
        return c.json({message: "quote added"})
        
    } catch (error) {
        c.status(400)
        c.json({error: "someshithappened"})
    }
})



quoteRouter.get("/bulk" , async(c)=>{
    const primsa = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const data = await primsa.quote.findMany({})
        c.status(200)
        return c.json({data: data})
    } catch (error) {
        c.status(400)
        return c.json({error: "invalid req"})
    }
})















