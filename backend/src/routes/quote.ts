import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify, jwt } from "hono/jwt";

export const quoteRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
        QUOTE_DATA: KVNamespace,
        payload: Queue,
    },
    Variables: {
        userId: any;
    }
}>();

//prismaConnect

const prismaConnect = (dbUrl : string) =>{
    const prisma = new PrismaClient({
        datasourceUrl: dbUrl
    }).$extends(withAccelerate())

    return prisma
}




// Authentication middleware
quoteRouter.use("/*", async (c, next) => {
    // Get and validate authorization header
    const authHeader = c.req.header("Authorization");
    if (!authHeader || authHeader.trim() === "") {
        c.status(401);
        return c.json({
            error: "Unauthorized",
            message: "Missing authorization token"
        });
    }

    try {
        // Verify JWT token
        const user = await verify(authHeader, c.env.JWT_SECRET);
        
        if (!user || !user.id) {
            c.status(403);
            return c.json({
                error: "Forbidden",
                message: "Invalid token"
            });
        }

        // Set verified user ID in context and continue
        c.set("userId", user.id);
        await next();

    } catch (error) {
        // Proper error handling with specific status codes
        if (error instanceof Error) {
            c.status(401);
            return c.json({
                error: "Authentication failed",
                message: "Token verification failed"
            });
        }
        
        c.status(500);
        return c.json({
            error: "Internal server error",
            message: "Authentication process failed"
        });
    }
});




// Get user's quotes
quoteRouter.get("/", async (c) => {



    const prisma = prismaConnect(c.env.DATABASE_URL)

    try {
        const userId = c.get("userId");
        if (!userId) {
            c.status(401);
            return c.json({ 
                error: "Unauthorized",
                message: "User ID not found in context" 
            });
        }
        const cacheKey = `quotes:user:${userId}`
        try{ 
       
        const cachedQuotes  = await c.env.QUOTE_DATA.get(cacheKey);
        if (cachedQuotes) {
            return c.json({
                message: "Quotes retrieved from cache",
                quotes: JSON.parse(cachedQuotes)
            });}
        } catch (error) {
            console.error("⚠️ Cache retrieval error:", error);
        }  






        const quotes = await prisma.quote.findMany({
            where: {
                authorId: userId
            },
            orderBy: {
                createdAt: 'desc' // Show newest quotes first
            }
        });

        if (quotes.length === 0) {
            c.status(200); // Using 200 instead of 404 since empty results is not an error
            return c.json({
                message: "No quotes found",
                quotes: []
            });
        }
       await c.env.QUOTE_DATA.put(cacheKey, JSON.stringify(quotes), {expirationTtl: 300});
    
        return c.json({
            message: "Quotes retrieved successfully",
            quotes
        });

    } catch (error) {
        console.error("Error fetching quotes:", error);
        c.status(500);
        return c.json({
            error: "Internal server error",
            message: "Failed to fetch quotes. Please try again later."
        });
    } finally {
        await prisma.$disconnect();
    }
});



// Create new quote
quoteRouter.post("/", async (c) => {


    const prisma = prismaConnect(c.env.DATABASE_URL)
       

    try {
        const body = await c.req.json();
        const authorId = c.get("userId");

        if (!body || !body.selectedText) {
            c.status(400);
            return c.json({
                error: "Bad Request",
                message: "Missing required fields in payload"
            });
        }

        const result = await prisma.quote.create({
            data: {
                selectedText: body.selectedText,
                authorId: authorId,
            }
        });

        //cache invalidation
        await c.env.QUOTE_DATA.delete(`quotes:user:${authorId}`);
        await c.env.QUOTE_DATA.delete(`quotes:bulk`);
        try {
            await c.env.payload.send(body)    
            console.log("mesage pushed to the queue")
        } catch (error) {
            console.error(error)
        }
        
        
        c.status(201); // More appropriate status for resource creation
        return c.json({
            message: "Quote created successfully",
            quote: result
        });
        
        //cache invalidation
       
       
       
    } catch (error) {
        console.error("Error creating quote:", error);
        c.status(500);
        return c.json({
            error: "Internal Server Error", 
            message: "Failed to create quote. Please try again later."
        });
    } finally {
        await prisma.$disconnect();
    }
});



// Get all quotes (bulk)
quoteRouter.get("/bulk", async (c) => {


    const prisma = prismaConnect(c.env.DATABASE_URL)
    

    try {

        //CACHE
        const cacheKey = `quotes:bulk`;
        const cachedQuotes  = await c.env.QUOTE_DATA.get(cacheKey);
        if (cachedQuotes) {
            return c.json({
                message: "Quotes retrieved from cache",
                quotes: JSON.parse(cachedQuotes)
            });
        }

        const quotes = await prisma.quote.findMany({});

        //cache-put
        await c.env.QUOTE_DATA.put(cacheKey, JSON.stringify(quotes), {expirationTtl: 300})
        return c.json({
            message: "Quotes retrieved successfully",
            data: quotes
        });
    } catch (error) {
        console.error("Error fetching bulk quotes:", error);
        c.status(500);
        return c.json({
            error: "Internal Server Error",
            message: "Failed to fetch quotes"
        });
    } finally {
        await prisma.$disconnect();
    }
});


/*AI AGENTS TO BE ADDED IN THE APP------
TITLE GENERATOR-----
SMM automated post generator-----



*/  