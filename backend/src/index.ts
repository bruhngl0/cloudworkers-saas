import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge"; 
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwt, sign } from "hono/jwt";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { cors } from "hono/cors";
import { quoteRouter } from "./routes/quote";
import { skip } from "@prisma/client/runtime/library";

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


//DB-connection
const prismaConnect = (dbUrl : string)=> {
  const prisma = new PrismaClient({
   datasourceUrl: dbUrl
  }).$extends(withAccelerate());

  return prisma
}




//pagination fn


const pagination = (page: string, limit: string) => {

  const parsedValuePage = parseInt(page, 10)
  const parsedValueLimit = parseInt(limit, 10)

  if(parsedValuePage <1 || parsedValueLimit < 1){
  throw new Error("the page and limit must be postitve integers")
  }
  return ({
    page: parsedValuePage,
    limit: parsedValueLimit,
  })
}



app.get("/", (c)=> {
  const jwtSecret = c.env.JWT_SECRET
  return c.json({"life is good" : jwtSecret})
})









app.get("/pepe" , async(c)=> {

  const prisma = prismaConnect(c.env.DATABASE_URL)
  try {

   const {limit, page} = pagination(c.req.query("page")||"1", c.req.query("limit")||"10")

    

    const data = await prisma.user.findMany({
      take: limit,
      skip: (page -1) * limit,
      orderBy: {createdAt: "desc"}
    }
    )

    const totalUsers = await prisma.user.count()
    const totalPages = Math.ceil(totalUsers/limit)

 
    return c.json({
      data,
      totalUsers,
      totalPages

    })
  } catch (error) {
    c.status(403)
    return c.json({"message": "error"})
  }
})


export default app