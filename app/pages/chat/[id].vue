<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import ProseStreamPre from '../../components/prose/PreStream.vue'

const components = {
  pre: ProseStreamPre as unknown as DefineComponent
}

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { model } = useModels()

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found', fatal: true })
}

const input = ref('')

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    body: {
      model: model.value
    }
  }),
  onData: (dataPart) => {
    if (dataPart.type === 'data-chat-title') {
      refreshNuxtData('chats')
    }
  },
  onError(error) {
    const { message } = typeof error.message === 'string' && error.message[0] === '{' ? JSON.parse(error.message) : error
    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

function handleSubmit(e: Event) {
  e.preventDefault()
  if (input.value.trim()) {
    chat.sendMessage({
      text: input.value
    })
    input.value = ''
  }
}

const copied = ref(false)

function copy(e: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}

// Monitoring data for the latest assistant message
interface ConsistencyResult {
  is_consistent: boolean
  confidence: number
  explanation: string
}

const latestMonitoringResult = ref<{
  messageId?: string
  language?: number | null
  semantics?: number | null
  entailment?: string | null
  surprisal?: number | null
  reproducibility?: number | null
  legibility_score?: number | null
  coverage_score?: number | null
  adversarial?: number | null
  consistency?: ConsistencyResult | null
} | null>(null)

const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
const pollingStartTime = ref<number | null>(null)
const POLLING_TIMEOUT = 60000 // 60 seconds

// Get the latest assistant message ID
const latestAssistantMessageId = computed(() => {
  const assistantMessages = chat.messages.filter(m => m.role === 'assistant')
  if (assistantMessages.length === 0) return null
  const latestMessage = assistantMessages[assistantMessages.length - 1]
  return latestMessage?.id || null
})

// Poll for monitoring results
async function pollMonitoringResults(messageId: string) {
  try {
    const result = await $fetch<{
      language: number | null
      semantics: number | null
      entailment: string | null
      surprisal: number | null
      reproducibility: number | null
      legibility_score: number | null
      coverage_score: number | null
      adversarial: number | null
      consistency: ConsistencyResult | null
    }>(`/api/monitor/${messageId}`)

    if (result) {
      latestMonitoringResult.value = {
        messageId,
        language: result.language,
        semantics: result.semantics,
        entailment: result.entailment,
        surprisal: result.surprisal,
        reproducibility: result.reproducibility,
        legibility_score: result.legibility_score,
        coverage_score: result.coverage_score,
        adversarial: result.adversarial,
        consistency: result.consistency
      }
    }
  } catch (error) {
    console.error('Failed to fetch monitoring results:', error)
    // Keep existing result or set to null on error
    if (!latestMonitoringResult.value) {
      latestMonitoringResult.value = {
        messageId,
        language: null,
        semantics: null,
        entailment: null,
        surprisal: null,
        reproducibility: null,
        legibility_score: null,
        coverage_score: null,
        adversarial: null,
        consistency: null
      }
    }
  }
}

// Start polling for the latest message
function startPolling(messageId: string) {
  // Stop any existing polling
  stopPolling()

  // Set initial state (pending - all monitors null)
  latestMonitoringResult.value = {
    messageId,
    language: null,
    semantics: null,
    entailment: null,
    surprisal: null,
    reproducibility: null,
    legibility_score: null,
    coverage_score: null,
    adversarial: null,
    consistency: null
  }

  // Set start time
  pollingStartTime.value = Date.now()

  // Poll immediately
  pollMonitoringResults(messageId)

  // Then poll every 3 seconds
  pollingInterval.value = setInterval(() => {
    const elapsed = Date.now() - (pollingStartTime.value || 0)

    // Stop polling after 60 seconds
    if (elapsed >= POLLING_TIMEOUT) {
      console.log('Polling timeout reached (60s)')
      stopPolling()
      return
    }

    pollMonitoringResults(messageId)
  }, 3000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
  pollingStartTime.value = null
}

// Watch for changes in the latest assistant message
watch(latestAssistantMessageId, (newMessageId, oldMessageId) => {
  if (newMessageId && newMessageId !== oldMessageId) {
    // New message arrived, start polling
    startPolling(newMessageId)
  }
})

// Watch for chat status changes
watch(() => chat.status, (status) => {
  if (status === 'streaming') {
    // Show pending while streaming
    const messageId = latestAssistantMessageId.value
    if (messageId) {
      latestMonitoringResult.value = {
        messageId,
        language: null,
        semantics: null,
        entailment: null,
        surprisal: null,
        reproducibility: null,
        legibility_score: null,
        coverage_score: null,
        adversarial: null,
        consistency: null
      }
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopPolling()
})

onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardPanel id="chat" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <DashboardNavbar />
      </template>

      <template #body>
        <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
          <SessionWarningBanner class="lg:pt-(--ui-header-height)" />

          <UChatMessages
            should-auto-scroll
            :messages="chat.messages"
            :status="chat.status"
            :assistant="chat.status !== 'streaming' ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] } : { actions: [] }"
            :spacing-offset="160"
            class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
          >
            <template #content="{ message }">
              <div class="*:first:mt-0 *:last:mb-0">
                <template v-for="(part, index) in message.parts" :key="`${message.id}-${part.type}-${index}${'state' in part ? `-${part.state}` : ''}`">
                  <Reasoning
                    v-if="part.type === 'reasoning'"
                    :text="part.text"
                    :is-streaming="part.state !== 'done'"
                  />
                  <MDCCached
                    v-else-if="part.type === 'text'"
                    :value="part.text"
                    :cache-key="`${message.id}-${index}`"
                    :components="components"
                    :parser-options="{ highlight: false }"
                    class="*:first:mt-0 *:last:mb-0"
                  />
                  <ToolWeather
                    v-else-if="part.type === 'tool-weather'"
                    :invocation="(part as WeatherUIToolInvocation)"
                  />
                  <ToolChart
                    v-else-if="part.type === 'tool-chart'"
                    :invocation="(part as ChartUIToolInvocation)"
                  />
                </template>
              </div>
            </template>
          </UChatMessages>

          <UChatPrompt
            v-model="input"
            :error="chat.error"
            variant="subtle"
            class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
            @submit="handleSubmit"
          >
            <template #footer>
              <ModelSelect v-model="model" />

              <UChatPromptSubmit
                :status="chat.status"
                color="neutral"
                @stop="chat.stop()"
                @reload="chat.regenerate()"
              />
            </template>
          </UChatPrompt>
        </UContainer>
      </template>
    </UDashboardPanel>

    <MonitoringSidebar
      :result="latestMonitoringResult"
      :message-id="latestMonitoringResult?.messageId"
    />
  </UDashboardGroup>
</template>
