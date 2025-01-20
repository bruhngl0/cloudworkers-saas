
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
        return c.json({blogs: blogs})

    } catch (error) {
        return c.json({error})
    }
   
  })

  blogRouter.get("/myblog", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      const authorId = c.get("userId");
      if (!authorId) {
        c.status(401);
        return c.json({ error: "User ID not found. Unauthorized." });
      }
  
      console.log("Querying blogs for authorId:", authorId);
  
      const data = await prisma.post.findMany({
        where: {
          authorId: authorId,
        },
      });
  
      if (data.length === 0) {
        return c.json({ message: "No blogs found for the user.", blogs: [] });
      }
  
      c.status(200);
      return c.json({ data });
    } catch (error) {
      console.error("Error fetching user's blogs:", error);
      c.status(500);
      return c.json({ error: "Failed to fetch user's blogs." });
    }
  });



  
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


  blogRouter.delete("/:id" , async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate()) 
    const id=  c.req.param("id")
  try {
    const blog = await prisma.post.delete({
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


 
  


