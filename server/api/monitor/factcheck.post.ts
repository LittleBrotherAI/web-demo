import { z } from 'zod'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Webhook endpoint for fact checking monitoring results.',
    tags: ['monitoring']
  }
})

export default defineEventHandler(async (event) => {
  // Validate incoming JSON body
  const { message_id, correctness_score, explanation } = await readValidatedBody(
    event,
    z.object({
      message_id: z.string().max(255),
      correctness_score: z.number(),
      explanation: z.string()
    }).parse
  )

  const db = useDrizzle()

  // Check if message exists
  const message = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.id, message_id)
  })

  if (!message) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Message not found for the given message_id'
    })
  }

  // Upsert into monitor_factcheck table
  const existing = await db.query.monitorFactcheck.findFirst({
    where: (monitorFactcheck, { eq }) => eq(monitorFactcheck.messageId, message_id)
  })

  if (existing) {
    // Update existing record
    await db
      .update(tables.monitorFactcheck)
      .set({
        correctness_score,
        explanation
      })
      .where(eq(tables.monitorFactcheck.messageId, message_id))
  } else {
    // Insert new record
    await db.insert(tables.monitorFactcheck).values({
      messageId: message_id,
      correctness_score,
      explanation
    })
  }

  return {
    success: true,
    message: 'Fact checking monitoring result saved successfully',
    message_id,
    correctness_score,
    explanation
  }
})
