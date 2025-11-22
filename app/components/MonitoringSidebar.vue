<script setup lang="ts">
interface MonitoringResult {
  status: 'pending' | 'completed' | 'failed'
  coverage?: number
  legibility?: number
  issues?: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
  }>
  error?: string
  completedAt?: string
}

const { result, messageId } = defineProps<{
  result: MonitoringResult | null
  messageId?: string
}>()

const open = ref(true)
</script>

<template>
  <UDashboardSidebar
    id="monitoring"
    v-model:open="open"
    :min-size="18"
    :max-size="25"
    collapsible
    resizable
    position="right"
    class="bg-elevated/50"
  >
    <template #header="{ collapsed }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield" class="h-5 w-5 shrink-0" />
        <span
          v-if="!collapsed"
          class="text-lg font-semibold text-highlighted"
        >
          Monitoring
        </span>
      </div>

      <div v-if="!collapsed" class="flex items-center gap-1.5 ms-auto">
        <UDashboardSidebarCollapse />
      </div>
    </template>

    <template #default="{ collapsed }">
      <div v-if="collapsed" class="flex flex-col gap-1.5">
        <UDashboardSidebarCollapse />
      </div>

      <div v-else class="flex flex-col gap-3">
        <!-- Header Info -->
        <div class="text-sm text-muted">
          Real-time monitoring results for the latest AI response
        </div>

        <!-- Monitoring Results -->
        <MonitoringResults :result="result" />

        <!-- Info Card -->
        <UCard
          :ui="{
            body: { padding: 'p-3 sm:p-3' },
            rounded: 'rounded-lg'
          }"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="h-4 w-4 text-primary" />
              <span class="text-xs font-semibold">About Monitoring</span>
            </div>
            <p class="text-xs text-muted leading-relaxed">
              Little Brother AI analyzes the Chain-of-Thought reasoning to detect:
            </p>
            <ul class="text-xs text-muted space-y-1 ml-4">
              <li class="flex gap-1">
                <span>•</span>
                <span>Sandbagging (intentional underperformance)</span>
              </li>
              <li class="flex gap-1">
                <span>•</span>
                <span>Inconsistencies in reasoning</span>
              </li>
              <li class="flex gap-1">
                <span>•</span>
                <span>Adversarial behavior patterns</span>
              </li>
            </ul>
          </div>
        </UCard>

        <!-- Metrics Legend -->
        <UCard
          :ui="{
            body: { padding: 'p-3 sm:p-3' },
            rounded: 'rounded-lg'
          }"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-gauge" class="h-4 w-4 text-primary" />
              <span class="text-xs font-semibold">Metrics Guide</span>
            </div>
            <div class="space-y-2">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-medium">Coverage</span>
                <span class="text-xs text-muted">
                  How much of the final answer is supported by reasoning steps
                </span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-medium">Legibility</span>
                <span class="text-xs text-muted">
                  Clarity and structure of the reasoning process
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardSidebar>
</template>
