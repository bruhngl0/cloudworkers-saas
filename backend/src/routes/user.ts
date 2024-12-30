import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge"; 
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwt, sign } from "hono/jwt";
import { signupInput,  signinInput, } from "@bruhngl/medium-saas"; 

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>()





//initializing handlers ----

// POST SIGNUP HANDLER
userRouter.post("/signup" , async(c)=>{
    const prisma = new PrismaClient({
      datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())
    
    const body = await c.req.json()
    const  {success} =   signupInput.safeParse(body)
        
    if(!success){
      c.status(403)
      c.json({message: "invalid credentials"})
    }
    try {
     
      const user =   await prisma.user.create({
        data:{
          email: body.email,
          password: body.password
        }
       })

       const token = await sign({id: user.id}, c.env.JWT_SECRET)
       c.status(200)
       return c.json({"token" : token})
    } catch (error) {
      return c.json({ "messsage" : "no token generated"
      })
    }
  })
  
  
  
  //POST SIGNIN HANDLER
userRouter.post("/signin" , async(c)=>{
    const prisma = new PrismaClient({
      datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())
  
    const body = await c.req.json()
    const {success} = signinInput.safeParse(body)

    if(!success){
      c.status(403)
      c.json({message: "invalid credentials"})
    }

    try {
      const user = await prisma.user.findUnique({
        where:{
          email: body.email,
          password: body.password
        }
      }) 
       
      if(!user){
        c.status(403)
        return c.json({error : "wrong credentials"})
      }
  
      const jwtToken = await sign({id: user.id} , c.env.JWT_SECRET)
      c.status(200)
      return c.json({
        "token" : jwtToken
      })
  
  
    } catch (error) {
       return c.status(400)
    }
  })
  