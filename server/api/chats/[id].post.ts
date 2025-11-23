import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  smoothStream,
  stepCountIs,
  streamText
} from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { UIMessage } from 'ai'
import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  // Check if API key exists in session
  if (!session.openRouterApiKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'OpenRouter API key required'
    })
  }

  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string()
    }).parse
  )

  const { model, messages } = await readValidatedBody(
    event,
    z.object({
      model: z.string(),
      messages: z.array(z.custom<UIMessage>())
    }).parse
  )

  // Initialize OpenRouter with user's API key
  const openrouter = createOpenRouter({
    apiKey: session.openRouterApiKey
  })

  const db = useDrizzle()

  const chat = await db.query.chats.findFirst({
    where: (chat, { eq, and }) =>
      and(eq(chat.id, id as string), eq(chat.sessionId, session.id)),
    with: {
      messages: true
    }
  })
  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  if (!chat.title) {
    const { text: title } = await generateText({
      model: openrouter('openai/gpt-4o-mini'),
      system: `You are a title generator for a chat:
          - Generate a short title based on the first user's message
          - The title should be less than 30 characters long
          - The title should be a summary of the user's message
          - Do not use quotes (' or ") or colons (:) or any other punctuation
          - Do not use markdown, just plain text`,
      prompt: JSON.stringify(messages[0])
    })

    await db
      .update(tables.chats)
      .set({ title })
      .where(eq(tables.chats.id, id as string))
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db.insert(tables.messages).values({
      chatId: id as string,
      role: 'user',
      parts: lastMessage.parts
    })
  }

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: openrouter(model),
        system: `You are a knowledgeable and helpful AI assistant. Your goal is to provide clear, accurate, and well-structured responses.

**FORMATTING RULES (CRITICAL):**
- ABSOLUTELY NO MARKDOWN HEADINGS: Never use #, ##, ###, ####, #####, or ######
- NO underline-style headings with === or ---
- Use **bold text** for emphasis and section labels instead
- Examples:
  * Instead of "## Usage", write "**Usage:**" or just "Here's how to use it:"
  * Instead of "# Complete Guide", write "**Complete Guide**" or start directly with content
- Start all responses with content, never with a heading

**RESPONSE QUALITY:**
- Be concise yet comprehensive
- Use examples when helpful
- Break down complex topics into digestible parts
- Maintain a friendly, professional tone`,
        messages: convertToModelMessages(messages),
        providerOptions: {
          openai: {
            reasoningEffort: 'low',
            reasoningSummary: 'detailed'
          },
          google: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingBudget: 2048
            }
          }
        },
        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: {}
      })

      if (!chat.title) {
        writer.write({
          type: 'data-chat-title',
          data: { message: 'Generating title...' },
          transient: true
        })
      }

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true
        })
      )
    },
    onFinish: async ({ messages: finishedMessages }) => {
      // 1. Store assistant message in database and get returned ID
      const savedMessages = await db.insert(tables.messages).values(
        finishedMessages.map(message => ({
          chatId: chat.id,
          role: message.role as 'user' | 'assistant',
          parts: message.parts
        }))
      ).returning()

      // 2. Get the assistant message from both the callback and database
      const modelMessage = finishedMessages.find(m => m.role === 'assistant')
      const assistantDbMessage = savedMessages.find(m => m.role === 'assistant')

      // 3. Get the user prompt from the original messages array (from request body)
      const lastUserMessage = messages[messages.length - 1]
      const userPrompt = lastUserMessage?.role === 'user'
        ? lastUserMessage.parts.filter(part => part.type === 'text').map(part => part.text).join('')
        : ''

      if (modelMessage && assistantDbMessage && userPrompt) {
        const monitoringServiceUrl = process.env.MONITORING_URL

        const modelCot = modelMessage.parts
          .filter(part => part.type === 'reasoning')
          .map(part => part.text)
          .join('\n')

        const modelAnswer = modelMessage.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('\n')

        // 3. Create monitoring record with completed=false
        await db.insert(tables.monitoringResults).values({
          messageId: assistantDbMessage.id,
          chatId: chat.id,
          completed: false
        })

        // 4. Send POST request to monitoring service (fire-and-forget)
        if (monitoringServiceUrl) {
          const requestUrl = getRequestURL(event)
          const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`

          console.log('Triggering monitoring for message:', assistantDbMessage.id)

          $fetch(monitoringServiceUrl, {
            method: 'POST',
            body: {
              prompt: userPrompt,
              reasoning: modelCot,
              answer: modelAnswer,
              message_id: assistantDbMessage.id,
              callback_urls: {
                consistency_language: `${baseUrl}/api/monitor/consistency_language`,
                consistency_semantics: `${baseUrl}/api/monitor/consistency_semantics`,
                consistency_nli: `${baseUrl}/api/monitor/consistency_nli`,
                similarity: `${baseUrl}/api/monitor/similarity`,
                understandability: `${baseUrl}/api/monitor/understandability`
              }
            }
          }).catch((error) => {
            console.error('Failed to trigger monitoring service:', error)
          })
        } else {
          console.warn('MONITORING_URL not configured - skipping monitoring')
        }
      }
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})
