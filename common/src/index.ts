 
import z from "zod"

export const signupInput  = z.object({
    email: z.string().email(),
    password: z.string().min(3),
    name: z.string().optional()
})


export const signinInput  = z.object({
    email: z.string().email(),
    password: z.string().min(3),
   
})


export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
 
})

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.any()
})


export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>
export type  UpdateBlogInput = z.infer<typeof updateBlogInput>