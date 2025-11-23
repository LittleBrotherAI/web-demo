<script setup lang="ts">
interface MonitoringResult {
  status: 'pending' | 'completed' | 'failed'
  consistency_language?: number
  consistency_semantics?: number
  consistency_nli?: string
  similarity?: number
  understandability?: number
  error?: string
  completedAt?: string
}

const { result } = defineProps<{
  result: MonitoringResult | null
}>()

const open = ref(true)

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return 'i-lucide-loader-circle'
    case 'completed':
      return 'i-lucide-shield-check'
    case 'failed':
      return 'i-lucide-alert-triangle'
    default:
      return 'i-lucide-shield'
  }
}

function formatScore(value?: number) {
  if (value === undefined) return 'N/A'
  return `${Math.round(value * 100)}%`
}

function getScoreColor(value?: number) {
  if (value === undefined) return 'neutral'
  if (value >= 0.7) return 'success'
  if (value >= 0.4) return 'warning'
  return 'error'
}

function getNLIColor(nli?: string) {
  switch (nli) {
    case 'entailment':
      return 'success'
    case 'neutral':
      return 'warning'
    case 'contradiction':
      return 'error'
    default:
      return 'neutral'
  }
}

function getNLIIcon(nli?: string) {
  switch (nli) {
    case 'entailment':
      return 'i-lucide-check-circle'
    case 'neutral':
      return 'i-lucide-minus-circle'
    case 'contradiction':
      return 'i-lucide-x-circle'
    default:
      return 'i-lucide-circle'
  }
}

// Computed property to detect issues based on metrics
const detectedIssues = computed(() => {
  if (!result || result.status !== 'completed') return []

  const issues: Array<{ type: 'warning' | 'error' | 'info', message: string }> = []

  // Check consistency_language
  if (result.consistency_language !== undefined && result.consistency_language < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low language consistency (${formatScore(result.consistency_language)}): Answer may not align with reasoning language patterns`
    })
  }

  // Check consistency_semantics
  if (result.consistency_semantics !== undefined && result.consistency_semantics < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low semantic consistency (${formatScore(result.consistency_semantics)}): Answer meaning may differ from reasoning`
    })
  }

  // Check NLI for contradiction
  if (result.consistency_nli === 'contradiction') {
    issues.push({
      type: 'error',
      message: 'NLI detected contradiction: Answer directly contradicts the reasoning provided'
    })
  } else if (result.consistency_nli === 'neutral') {
    issues.push({
      type: 'info',
      message: 'NLI is neutral: Answer is not clearly entailed by the reasoning'
    })
  }

  // Check similarity
  if (result.similarity !== undefined && result.similarity < 0.4) {
    issues.push({
      type: 'warning',
      message: `Low similarity (${formatScore(result.similarity)}): Answer content significantly differs from reasoning`
    })
  }

  // Check understandability
  if (result.understandability !== undefined && result.understandability < 0.6) {
    issues.push({
      type: 'warning',
      message: `Low understandability (${formatScore(result.understandability)}): Reasoning may be unclear or poorly structured`
    })
  }

  return issues
})

const hasAllMetrics = computed(() => {
  if (!result || result.status !== 'completed') return false
  return result.consistency_language !== undefined
    && result.consistency_semantics !== undefined
    && result.consistency_nli !== undefined
    && result.similarity !== undefined
    && result.understandability !== undefined
})
</script>

<template>
  <UCollapsible v-model:open="open" class="flex flex-col gap-2 my-3">
    <UButton
      class="p-0 group"
      color="neutral"
      variant="link"
      :trailing-icon="result ? 'i-lucide-chevron-down' : undefined"
      :ui="{
        trailingIcon: result ? 'group-data-[state=open]:rotate-180 transition-transform duration-200' : 'hidden'
      }"
    >
      <template #leading>
        <UIcon
          :name="getStatusIcon(result?.status || 'pending')"
          :class="result?.status === 'pending' ? 'animate-spin' : ''"
        />
      </template>
      <span>{{ result?.status === 'pending' ? 'Monitoring...' : 'Monitor Results' }}</span>
    </UButton>

    <template #content>
      <div v-if="!result" class="text-sm text-muted">
        No monitoring data available
      </div>

      <!-- Pending State -->
      <div v-else-if="result.status === 'pending'" class="flex flex-col gap-2">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-loader-circle" class="animate-spin" />
          <span>Analyzing response with Chain-of-Thought monitoring...</span>
        </div>
      </div>

      <!-- Failed State -->
      <div v-else-if="result.status === 'failed'" class="flex flex-col gap-2">
        <UAlert
          icon="i-lucide-alert-triangle"
          color="error"
          variant="soft"
          :title="result.error || 'Monitoring failed'"
          description="Unable to complete monitoring analysis"
        />
      </div>

      <!-- Completed State -->
      <div v-else-if="result.status === 'completed'" class="flex flex-col gap-3">
        <!-- Progressive Loading Indicator -->
        <div v-if="!hasAllMetrics" class="flex items-center gap-2 text-xs text-muted">
          <UIcon name="i-lucide-loader-circle" class="animate-spin h-3 w-3" />
          <span>Loading additional metrics...</span>
        </div>

        <!-- Consistency Metrics -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Consistency Checks</span>
          <div class="grid grid-cols-2 gap-3">
            <!-- Language Consistency -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Language</span>
                <span class="text-sm font-semibold">{{ formatScore(result.consistency_language) }}</span>
              </div>
              <UProgress
                :value="(result.consistency_language || 0) * 100"
                :color="getScoreColor(result.consistency_language)"
                size="xs"
              />
            </div>

            <!-- Semantic Consistency -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Semantics</span>
                <span class="text-sm font-semibold">{{ formatScore(result.consistency_semantics) }}</span>
              </div>
              <UProgress
                :value="(result.consistency_semantics || 0) * 100"
                :color="getScoreColor(result.consistency_semantics)"
                size="xs"
              />
            </div>
          </div>

          <!-- NLI Result -->
          <div v-if="result.consistency_nli" class="flex items-center gap-2 p-3 rounded-md bg-elevated border border-accented">
            <UIcon :name="getNLIIcon(result.consistency_nli)" :class="`text-${getNLIColor(result.consistency_nli)}`" />
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-medium">Natural Language Inference</span>
              <span class="text-xs text-muted capitalize">{{ result.consistency_nli }}</span>
            </div>
          </div>
        </div>

        <!-- Quality Metrics -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Quality Metrics</span>
          <div class="grid grid-cols-2 gap-3">
            <!-- Similarity -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Similarity</span>
                <span class="text-sm font-semibold">{{ formatScore(result.similarity) }}</span>
              </div>
              <UProgress
                :value="(result.similarity || 0) * 100"
                :color="getScoreColor(result.similarity)"
                size="xs"
              />
            </div>

            <!-- Understandability -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Clarity</span>
                <span class="text-sm font-semibold">{{ formatScore(result.understandability) }}</span>
              </div>
              <UProgress
                :value="(result.understandability || 0) * 100"
                :color="getScoreColor(result.understandability)"
                size="xs"
              />
            </div>
          </div>
        </div>

        <!-- Issues -->
        <div v-if="detectedIssues.length > 0" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Detected Issues</span>
          <div class="flex flex-col gap-1.5">
            <UAlert
              v-for="(issue, index) in detectedIssues"
              :key="index"
              :icon="issue.type === 'error' ? 'i-lucide-circle-x' : issue.type === 'warning' ? 'i-lucide-triangle-alert' : 'i-lucide-info'"
              :color="issue.type === 'error' ? 'error' : issue.type === 'warning' ? 'warning' : 'primary'"
              variant="soft"
              :description="issue.message"
              :ui="{ description: 'text-xs' }"
            />
          </div>
        </div>

        <!-- Success Message (no issues) -->
        <div v-else-if="hasAllMetrics" class="flex items-center gap-2 text-sm text-success">
          <UIcon name="i-lucide-check-circle" />
          <span>No issues detected</span>
        </div>

        <!-- Timestamp -->
        <div v-if="result.completedAt" class="text-xs text-muted">
          Completed {{ new Date(result.completedAt).toLocaleTimeString() }}
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
