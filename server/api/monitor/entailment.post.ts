import { z } from 'zod'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Webhook endpoint for entailment (NLI) monitoring results.',
    tags: ['monitoring']
  }
})

export default defineEventHandler(async (event) => {
  // Validate incoming JSON body
  const { message_id, score } = await readValidatedBody(
    event,
    z.object({
      message_id: z.string().max(255),
      score: z.number().min(0).max(1)
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

  // Upsert into monitor_entailment table
  const existing = await db.query.monitorEntailment.findFirst({
    where: (monitorEntailment, { eq }) => eq(monitorEntailment.messageId, message_id)
  })

  if (existing) {
    // Update existing record
    await db
      .update(tables.monitorEntailment)
      .set({ score })
      .where(eq(tables.monitorEntailment.messageId, message_id))
  } else {
    // Insert new record
    await db.insert(tables.monitorEntailment).values({
      messageId: message_id,
      score
    })
  }
  console.log('good life.')

  return {
    success: true,
    message: 'Entailment monitoring result saved successfully',
    message_id,
    score
  }
})
