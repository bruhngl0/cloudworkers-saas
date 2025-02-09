import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('build an ai-agent that takes the data from the queue and performs an ai logic on it')
})

export default app
