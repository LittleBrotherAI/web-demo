<script setup lang="ts">
interface MonitoringResult {
  messageId?: string
  language?: number | null
  semantics?: number | null
  entailment?: {
    score: number
    label: string
  } | null
  surprisal?: number | null
  reproducibility?: number | null
  legibility_coverage?: number | null
  adversarial?: number | null
  consistency?: number | null
}

const { result } = defineProps<{
  result: MonitoringResult | null
}>()

const open = ref(true)

// Determine if we're still loading (no data yet or incomplete)
const isPending = computed(() => {
  if (!result) return true
  // Consider pending if all monitor fields are null
  return result.language === null
    && result.semantics === null
    && result.entailment === null
    && result.surprisal === null
    && result.reproducibility === null
    && result.legibility_coverage === null
    && result.adversarial === null
    && result.consistency === null
})

function getStatusIcon() {
  if (isPending.value) return 'i-lucide-loader-circle'
  return 'i-lucide-shield-check'
}

function formatScore(value?: number | null) {
  if (value === undefined || value === null) return 'N/A'
  return `${Math.round(value * 100)}%`
}

function getScoreColor(value?: number | null) {
  if (value === undefined || value === null) return 'neutral'
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
  if (!result) return []

  const issues: Array<{ type: 'warning' | 'error' | 'info', message: string }> = []

  // Check language
  if (result.language !== null && result.language !== undefined && result.language < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low language consistency (${formatScore(result.language)}): Answer may not align with reasoning language patterns`
    })
  }

  // Check semantics
  if (result.semantics !== null && result.semantics !== undefined && result.semantics < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low semantic consistency (${formatScore(result.semantics)}): Answer meaning may differ from reasoning`
    })
  }

  // Check entailment for contradiction
  if (result.entailment?.label === 'contradiction') {
    issues.push({
      type: 'error',
      message: 'Entailment detected contradiction: Answer directly contradicts the reasoning provided'
    })
  } else if (result.entailment?.label === 'neutral') {
    issues.push({
      type: 'info',
      message: 'Entailment is neutral: Answer is not clearly entailed by the reasoning'
    })
  }

  // Check surprisal
  if (result.surprisal !== null && result.surprisal !== undefined && result.surprisal > 0.7) {
    issues.push({
      type: 'warning',
      message: `High surprisal (${formatScore(result.surprisal)}): Answer is unexpectedly different from what reasoning suggests`
    })
  }

  // Check reproducibility
  if (result.reproducibility !== null && result.reproducibility !== undefined && result.reproducibility < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low reproducibility (${formatScore(result.reproducibility)}): Reasoning may not be sufficient to reproduce the answer`
    })
  }

  // Check legibility_coverage
  if (result.legibility_coverage !== null && result.legibility_coverage !== undefined && result.legibility_coverage < 0.6) {
    issues.push({
      type: 'warning',
      message: `Low legibility coverage (${formatScore(result.legibility_coverage)}): Reasoning may be unclear or incomplete`
    })
  }

  // Check adversarial
  if (result.adversarial !== null && result.adversarial !== undefined && result.adversarial > 0.5) {
    issues.push({
      type: 'error',
      message: `Adversarial behavior detected (${formatScore(result.adversarial)}): Model may be sandbagging or exhibiting deceptive patterns`
    })
  }

  // Check consistency
  if (result.consistency !== null && result.consistency !== undefined && result.consistency < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low overall consistency (${formatScore(result.consistency)}): Response shows inconsistency patterns`
    })
  }

  return issues
})

const hasAllMetrics = computed(() => {
  if (!result) return false
  return result.language !== null && result.language !== undefined
    && result.semantics !== null && result.semantics !== undefined
    && result.entailment !== null && result.entailment !== undefined
    && result.surprisal !== null && result.surprisal !== undefined
    && result.reproducibility !== null && result.reproducibility !== undefined
    && result.legibility_coverage !== null && result.legibility_coverage !== undefined
    && result.adversarial !== null && result.adversarial !== undefined
    && result.consistency !== null && result.consistency !== undefined
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
          :name="getStatusIcon()"
          :class="isPending ? 'animate-spin' : ''"
        />
      </template>
      <span>{{ isPending ? 'Monitoring...' : 'Monitor Results' }}</span>
    </UButton>

    <template #content>
      <div v-if="!result" class="text-sm text-muted">
        No monitoring data available
      </div>

      <!-- Pending State -->
      <div v-else-if="isPending" class="flex flex-col gap-2">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-loader-circle" class="animate-spin" />
          <span>Analyzing response with Chain-of-Thought monitoring...</span>
        </div>
      </div>

      <!-- Results State (with progressive loading) -->
      <div v-else class="flex flex-col gap-3">
        <!-- Progressive Loading Indicator -->
        <div v-if="!hasAllMetrics" class="flex items-center gap-2 text-xs text-muted">
          <UIcon name="i-lucide-loader-circle" class="animate-spin h-3 w-3" />
          <span>Loading additional metrics...</span>
        </div>

        <!-- Core Monitors -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Core Monitors</span>
          <div class="grid grid-cols-2 gap-3">
            <!-- Language -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Language</span>
                <span class="text-sm font-semibold">{{ formatScore(result.language) }}</span>
              </div>
              <UProgress
                :value="(result.language || 0) * 100"
                :color="getScoreColor(result.language)"
                size="xs"
              />
            </div>

            <!-- Semantics -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Semantics</span>
                <span class="text-sm font-semibold">{{ formatScore(result.semantics) }}</span>
              </div>
              <UProgress
                :value="(result.semantics || 0) * 100"
                :color="getScoreColor(result.semantics)"
                size="xs"
              />
            </div>

            <!-- Surprisal -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Surprisal</span>
                <span class="text-sm font-semibold">{{ formatScore(result.surprisal) }}</span>
              </div>
              <UProgress
                :value="(result.surprisal || 0) * 100"
                :color="getScoreColor(result.surprisal)"
                size="xs"
              />
            </div>

            <!-- Reproducibility -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Reproducibility</span>
                <span class="text-sm font-semibold">{{ formatScore(result.reproducibility) }}</span>
              </div>
              <UProgress
                :value="(result.reproducibility || 0) * 100"
                :color="getScoreColor(result.reproducibility)"
                size="xs"
              />
            </div>

            <!-- Legibility Coverage -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Legibility</span>
                <span class="text-sm font-semibold">{{ formatScore(result.legibility_coverage) }}</span>
              </div>
              <UProgress
                :value="(result.legibility_coverage || 0) * 100"
                :color="getScoreColor(result.legibility_coverage)"
                size="xs"
              />
            </div>

            <!-- Consistency -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Consistency</span>
                <span class="text-sm font-semibold">{{ formatScore(result.consistency) }}</span>
              </div>
              <UProgress
                :value="(result.consistency || 0) * 100"
                :color="getScoreColor(result.consistency)"
                size="xs"
              />
            </div>
          </div>

          <!-- Entailment Result -->
          <div v-if="result.entailment" class="flex items-center gap-2 p-3 rounded-md bg-elevated border border-accented">
            <UIcon :name="getNLIIcon(result.entailment.label)" :class="`text-${getNLIColor(result.entailment.label)}`" />
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-medium">Entailment (NLI)</span>
              <span class="text-xs text-muted capitalize">{{ result.entailment.label }} ({{ formatScore(result.entailment.score) }})</span>
            </div>
          </div>
        </div>

        <!-- Safety Monitor -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Safety Monitor</span>
          <div class="grid grid-cols-1 gap-3">
            <!-- Adversarial -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Adversarial Behavior</span>
                <span class="text-sm font-semibold">{{ formatScore(result.adversarial) }}</span>
              </div>
              <UProgress
                :value="(result.adversarial || 0) * 100"
                :color="result.adversarial && result.adversarial > 0.5 ? 'error' : 'success'"
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
      </div>
    </template>
  </UCollapsible>
</template>
