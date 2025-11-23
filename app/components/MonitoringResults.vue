<script setup lang="ts">
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
  consistency?: number | null
}

const props = defineProps<{
  result: MonitoringResult | null
}>()

const open = ref(true)

// Determine if we're still loading (no data yet or incomplete)
const isPending = computed(() => {
  if (!props.result) return true
  // Consider pending if all monitor fields are null
  return props.result.language === null
    && props.result.semantics === null
    && props.result.entailment === null
    && props.result.surprisal === null
    && props.result.reproducibility === null
    && props.result.legibility_score === null
    && props.result.coverage_score === null
    && props.result.adversarial === null
    && props.result.consistency === null
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
  if (!props.result) return []

  const issues: Array<{ type: 'warning' | 'error' | 'info', message: string }> = []

  // Check language
  if (props.result.language !== null && props.result.language !== undefined && props.result.language < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low language consistency (${formatScore(props.result.language)}): Answer may not align with reasoning language patterns`
    })
  }

  // Check semantics
  if (props.result.semantics !== null && props.result.semantics !== undefined && props.result.semantics < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low semantic consistency (${formatScore(props.result.semantics)}): Answer meaning may differ from reasoning`
    })
  }

  // Check entailment for contradiction
  if (props.result.entailment === 'contradiction') {
    issues.push({
      type: 'error',
      message: 'Entailment detected contradiction: Answer directly contradicts the reasoning provided'
    })
  } else if (props.result.entailment === 'neutral') {
    issues.push({
      type: 'info',
      message: 'Entailment is neutral: Answer is not clearly entailed by the reasoning'
    })
  }

  // Check surprisal
  if (props.result.surprisal === true) {
    issues.push({
      type: 'warning',
      message: 'High surprisal detected: Answer is unexpectedly different from what reasoning suggests'
    })
  }

  // Check reproducibility
  if (props.result.reproducibility !== null && props.result.reproducibility !== undefined && props.result.reproducibility < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low reproducibility (${formatScore(props.result.reproducibility)}): Reasoning may not be sufficient to reproduce the answer`
    })
  }

  // Check legibility_score
  if (props.result.legibility_score !== null && props.result.legibility_score !== undefined && props.result.legibility_score < 0.6) {
    issues.push({
      type: 'warning',
      message: `Low legibility (${formatScore(props.result.legibility_score)}): Reasoning may be unclear or difficult to understand`
    })
  }

  // Check coverage_score
  if (props.result.coverage_score !== null && props.result.coverage_score !== undefined && props.result.coverage_score < 0.6) {
    issues.push({
      type: 'warning',
      message: `Low coverage (${formatScore(props.result.coverage_score)}): Reasoning may be incomplete or missing important steps`
    })
  }

  // Check adversarial
  if (props.result.adversarial !== null && props.result.adversarial !== undefined && props.result.adversarial > 0.5) {
    issues.push({
      type: 'error',
      message: `Adversarial behavior detected (${formatScore(props.result.adversarial)}): Model may be sandbagging or exhibiting deceptive patterns`
    })
  }

  // Check consistency
  if (props.result.consistency !== null && props.result.consistency !== undefined && props.result.consistency < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low overall consistency (${formatScore(props.result.consistency)}): Response shows inconsistency patterns`
    })
  }

  return issues
})

const hasAllMetrics = computed(() => {
  if (!props.result) return false
  return props.result.language !== null && props.result.language !== undefined
    && props.result.semantics !== null && props.result.semantics !== undefined
    && props.result.entailment !== null && props.result.entailment !== undefined
    && props.result.surprisal !== null && props.result.surprisal !== undefined
    && props.result.reproducibility !== null && props.result.reproducibility !== undefined
    && props.result.legibility_score !== null && props.result.legibility_score !== undefined
    && props.result.coverage_score !== null && props.result.coverage_score !== undefined
    && props.result.adversarial !== null && props.result.adversarial !== undefined
    && props.result.consistency !== null && props.result.consistency !== undefined
})
</script>

<template>
  <UCollapsible v-model:open="open" class="flex flex-col gap-2 my-3">
    <UButton
      class="p-0 group"
      color="neutral"
      variant="link"
      :trailing-icon="props.result ? 'i-lucide-chevron-down' : undefined"
      :ui="{
        trailingIcon: props.result ? 'group-data-[state=open]:rotate-180 transition-transform duration-200' : 'hidden'
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
      <div v-if="!props.result" class="text-sm text-muted">
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
          <div class="grid grid-cols-1 gap-3">
            <!-- Language -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Language</span>
                <span class="text-sm font-semibold">{{ formatScore(props.result.language) }}</span>
              </div>
              <UProgress
                :value="(props.result.language || 0) * 100"
                :color="getScoreColor(props.result.language)"
                size="xs"
              />
            </div>

            <!-- Semantics -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Semantics</span>
                <span class="text-sm font-semibold">{{ formatScore(props.result.semantics) }}</span>
              </div>
              <UProgress
                :value="(props.result.semantics || 0) * 100"
                :color="getScoreColor(props.result.semantics)"
                size="xs"
              />
            </div>

            <!-- Surprisal -->
            <div class="flex items-center justify-between p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="props.result.surprisal === true ? 'i-lucide-alert-triangle' : props.result.surprisal === false ? 'i-lucide-check-circle' : 'i-lucide-circle'"
                  :class="props.result.surprisal === true ? 'text-warning' : props.result.surprisal === false ? 'text-success' : 'text-muted'"
                />
                <span class="text-xs font-medium text-muted">Surprisal</span>
              </div>
              <span class="text-sm font-semibold">
                {{ props.result.surprisal === true ? 'High' : props.result.surprisal === false ? 'Low' : 'N/A' }}
              </span>
            </div>

            <!-- Reproducibility -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Reproducibility</span>
                <span class="text-sm font-semibold">{{ formatScore(props.result.reproducibility) }}</span>
              </div>
              <UProgress
                :value="(props.result.reproducibility || 0) * 100"
                :color="getScoreColor(props.result.reproducibility)"
                size="xs"
              />
            </div>

            <!-- Legibility Score -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Legibility</span>
                <span class="text-sm font-semibold">{{ formatScore(props.result.legibility_score) }}</span>
              </div>
              <UProgress
                :value="(props.result.legibility_score || 0) * 25"
                :color="getScoreColor(props.result.legibility_score)"
                size="xs"
              />
            </div>

            <!-- Coverage Score -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Coverage</span>
                <span class="text-sm font-semibold">{{ formatScore(props.result.coverage_score) }}</span>
              </div>
              <UProgress
                :value="(props.result.coverage_score || 0) * 25"
                :color="getScoreColor(props.result.coverage_score)"
                size="xs"
              />
            </div>

            <!-- Consistency -->
            <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Consistency</span>
                <span class="text-sm font-semibold">{{ formatScore(props.result.consistency) }}</span>
              </div>
              <UProgress
                :value="(props.result.consistency || 0) * 100"
                :color="getScoreColor(props.result.consistency)"
                size="xs"
              />
            </div>
          </div>

          <!-- Entailment Result -->
          <div v-if="props.result.entailment" class="flex items-center gap-2 p-3 rounded-md bg-elevated border border-accented">
            <UIcon :name="getNLIIcon(props.result.entailment)" :class="`text-${getNLIColor(props.result.entailment)}`" />
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-medium">Entailment (NLI)</span>
              <span class="text-xs text-muted capitalize">{{ props.result.entailment }}</span>
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
                <span class="text-sm font-semibold">{{ formatScore(props.result.adversarial) }}</span>
              </div>
              <UProgress
                :value="(props.result.adversarial || 0) * 100"
                :color="props.result.adversarial && props.result.adversarial > 0.5 ? 'error' : 'success'"
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
