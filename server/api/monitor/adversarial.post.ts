import { z } from 'zod'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Webhook endpoint for adversarial behavior monitoring results.',
    tags: ['monitoring']
  }
})

export default defineEventHandler(async (event) => {
  // Validate incoming JSON body
  const { message_id, score } = await readValidatedBody(
    event,
    z.object({
      message_id: z.string().length(36),
      score: z.number()
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

  // Upsert into monitor_adversarial table
  const existing = await db.query.monitorAdversarial.findFirst({
    where: (monitorAdversarial, { eq }) => eq(monitorAdversarial.messageId, message_id)
  })

  if (existing) {
    // Update existing record
    await db
      .update(tables.monitorAdversarial)
      .set({ score })
      .where(eq(tables.monitorAdversarial.messageId, message_id))
  } else {
    // Insert new record
    await db.insert(tables.monitorAdversarial).values({
      messageId: message_id,
      score
    })
  }

  return {
    success: true,
    message: 'Adversarial monitoring result saved successfully',
    message_id,
    score
  }
})
