
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@bruhngl/medium-saas";


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    },
     
    Variables: {
        userId: any
    }
}>()



//MIDDLEWARE
//take the userid of the user from this middleware

blogRouter.use("/*" , async(c, next)=>{
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


//POST BLOG HANDLER
blogRouter.post("/", async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const body =  await c.req.json()
    const {success} = createBlogInput.safeParse(body)
    if(!success){
        c.status(403)
        c.json({message: "invalid req"})
    }
    const authorId = c.get("userId")
 
    try {
        const blog = await prisma.post.create({
        
            data:{
                title : body.title,
                content : body.content,
                authorId : authorId ,
            }   
        })
        return c.json({ id : blog.id })
    } catch (error) {
        return c.json({error :  "blog not submitted"})
    }
  })
  

  


  //UPDATE BLOG HANDLER
blogRouter.put("/", async (c)=>{
   
    const prisma  = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const body = await c.req.json()
    const {success} = updateBlogInput.safeParse(body)

    if(!success){
        c.status(403)
        c.json({message: "invalid input"})
    }
    try {
        const blog =  await prisma.post.update({
            where:{
                id : body.id
            },
            data:{
                title : body.title,
                content: body.content,
            }    
        })
        c.status(200)
        return c.json({
            id: blog.id
        })
    } catch (error) {
        return c.json({
            error : error
        })
    }
  })



  //pagination

  blogRouter.get("/bulk" , async (c)=>{
    const prisma  = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    try {
        const blogs = await prisma.post.findMany()
        if(!blogs){
            c.status(404)
            return c.json({error : "wrong route"})
        }

        return c.json({blogs: blogs})

    } catch (error) {
        return c.json({error})
    }
   
  })



  
//GET BLOG FROM BLOG ID
blogRouter.get("/:id" , async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate()) 
    const id=  c.req.param("id")
  try {
    const blog = await prisma.post.findFirst({
        where:{
            id: id
        }
    })
    c.status(200)
    return c.json({
        blog
    })
  } catch (error) {
     c.status(403)
     return c.json({
        error
     })
  }

  })




