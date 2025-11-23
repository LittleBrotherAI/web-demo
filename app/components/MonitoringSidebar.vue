<script setup lang="ts">
interface ConsistencyResult {
  is_consistent: boolean
  confidence: number
  explanation: string
}

interface MonitoringResult {
  messageId?: string
  language?: number | null
  semantics?: number | null
  entailment?: string | null
  surprisal?: boolean | null
  reproducibility?: number | null
  legibility_score?: number | null
  coverage_score?: number | null
  adversarial?: number | null
  consistency?: ConsistencyResult | null
}

const props = defineProps<{
  result: MonitoringResult | null
}>()

const open = ref(true)
</script>

<template>
  <UDashboardSidebar
    id="monitoring"
    v-model:open="open"
    :min-size="25"
    :max-size="35"
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
        <MonitoringResults :result="props.result" />

        <!-- Info Card -->
        <UCard
          :ui="{
            body: 'p-3 sm:p-3'
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
            body: 'p-3 sm:p-3'
          }"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-gauge" class="h-4 w-4 text-primary" />
              <span class="text-xs font-semibold">Monitors Guide</span>
            </div>
            <div class="space-y-2.5">
              <div>
                <span class="text-xs font-medium block mb-0.5">Core Monitors</span>
                <div class="space-y-1.5 ml-2">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Language</span>
                    <span class="text-xs text-muted">
                      Detects language switching in model responses
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Semantics</span>
                    <span class="text-xs text-muted">
                      Semantic similarity between reasoning and answer
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Entailment</span>
                    <span class="text-xs text-muted">
                      Verifies answer logically follows from reasoning (NLI)
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Surprisal</span>
                    <span class="text-xs text-muted">
                      Measures how unexpected the answer is given reasoning
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Reproducibility</span>
                    <span class="text-xs text-muted">
                      Tests if reasoning is sufficient to reproduce answer
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Legibility</span>
                    <span class="text-xs text-muted">
                      Measures clarity and understandability of reasoning
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Coverage</span>
                    <span class="text-xs text-muted">
                      Measures completeness of reasoning steps
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Consistency</span>
                    <span class="text-xs text-muted">
                      Judges overall consistency with confidence and explanation
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <span class="text-xs font-medium block mb-0.5">Safety Monitor</span>
                <div class="space-y-1.5 ml-2">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted">Adversarial</span>
                    <span class="text-xs text-muted">
                      Detects sandbagging, deception, and malicious patterns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardSidebar>
</template>
