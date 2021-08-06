const fastify = require("fastify")({ logger: true })
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

fastify.get(`/api`, async () => {
  return { up: true }
})

fastify.get(`/api/seed`, async (req, res) => {
  const seedUser = {
    email: "jane@prisma.io",
    name: "Jane",
    posts: {
      create: [
        {
          title:
            "Comparing Database Types: How Database Types Evolved to Meet Different Needs",
          content:
            "https://www.prisma.io/blog/comparison-of-database-models-1iz9u29nwn37/",
          published: true,
        },
        {
          title: "Analysing Sleep Patterns: The Quantified Self",
          content: "https://quantifiedself.com/get-started/",
          published: true,
        },
      ],
    },
  }

  try {
    await prisma.post.deleteMany({
      where: {
        author: {
          email: "jane@prisma.io",
        },
      },
    })
    await prisma.user.deleteMany({
      where: {
        email: "jane@prisma.io",
      },
    })

    const result = await prisma.user.create({
      data: seedUser,
    })
    return result
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

fastify.get(`/api/post/:id`, async (req) => {
  const { id } = req.params
  const post = await prisma.post.findUnique({ where: { id: parseInt(id) } })
  return post
})

fastify.get("/api/feed", async () => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  return posts
})

fastify.listen(process.env.PORT || 3000, process.env.HOST || "::", (err) => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
