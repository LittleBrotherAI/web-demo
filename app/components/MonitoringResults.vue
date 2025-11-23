<script setup lang="ts">
import type { MonitoringResult } from '~/types/monitoring'

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
    && props.result.factcheck === null
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

  // Check entailment
  if (props.result.entailment !== null && props.result.entailment !== undefined && props.result.entailment < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low entailment score (${formatScore(props.result.entailment)}): Answer may not logically follow from the reasoning`
    })
  }

  // Check clarity (monitoring service sends clarity score, not surprisal - high clarity = good)
  if (props.result.surprisal !== null && props.result.surprisal !== undefined && props.result.surprisal < 0.5) {
    issues.push({
      type: 'warning',
      message: `Low clarity (${formatScore(props.result.surprisal)}): Answer is unexpectedly different from what reasoning suggests`
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
  if (props.result.adversarial !== null && props.result.adversarial !== undefined) {
    if (props.result.adversarial.is_adversarial) {
      issues.push({
        type: 'error',
        message: `Adversarial behavior detected (${props.result.adversarial.severity}): ${props.result.adversarial.explanation}`
      })
    }
  }

  // Check consistency
  if (props.result.consistency !== null && props.result.consistency !== undefined) {
    if (!props.result.consistency.is_consistent) {
      issues.push({
        type: 'error',
        message: `Inconsistency detected (confidence: ${formatScore(props.result.consistency.confidence)}): ${props.result.consistency.explanation}`
      })
    } else if (props.result.consistency.confidence < 0.7) {
      issues.push({
        type: 'warning',
        message: `Low consistency confidence (${formatScore(props.result.consistency.confidence)}): ${props.result.consistency.explanation}`
      })
    }
  }

  // Check factcheck
  if (props.result.factcheck !== null && props.result.factcheck !== undefined) {
    if (props.result.factcheck.correctness_score < 0.5) {
      issues.push({
        type: 'error',
        message: `Low factual correctness (${formatScore(props.result.factcheck.correctness_score)}): ${props.result.factcheck.explanation}`
      })
    } else if (props.result.factcheck.correctness_score < 0.7) {
      issues.push({
        type: 'warning',
        message: `Moderate factual correctness (${formatScore(props.result.factcheck.correctness_score)}): ${props.result.factcheck.explanation}`
      })
    }
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
    && props.result.factcheck !== null && props.result.factcheck !== undefined
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
            <MonitoringMetricCard
              label="Language"
              :score="props.result.language"
            />

            <MonitoringMetricCard
              label="Semantics"
              :score="props.result.semantics"
            />

            <MonitoringMetricCard
              label="Entailment"
              :score="props.result.entailment"
            />

            <MonitoringMetricCard
              label="Clarity"
              :score="props.result.surprisal"
            />

            <MonitoringMetricCard
              label="Reproducibility"
              :score="props.result.reproducibility"
            />

            <MonitoringMetricCard
              label="Legibility"
              :score="props.result.legibility_score"
            />

            <MonitoringMetricCard
              label="Coverage"
              :score="props.result.coverage_score"
            />

            <!-- Consistency -->
            <div v-if="props.result.consistency" class="flex flex-col gap-2 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Consistency</span>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="props.result.consistency.is_consistent ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
                    :class="props.result.consistency.is_consistent ? 'text-success' : 'text-error'"
                  />
                  <span class="text-sm font-semibold">
                    {{ props.result.consistency.is_consistent ? 'Consistent' : 'Inconsistent' }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted">Confidence</span>
                  <UBadge :color="getScoreColor(props.result.consistency.confidence)" variant="subtle" size="xs">
                    {{ formatScore(props.result.consistency.confidence) }}
                  </UBadge>
                </div>
                <div class="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all rounded-full"
                    :class="{
                      'bg-success': getScoreColor(props.result.consistency.confidence) === 'success',
                      'bg-warning': getScoreColor(props.result.consistency.confidence) === 'warning',
                      'bg-error': getScoreColor(props.result.consistency.confidence) === 'error',
                      'bg-neutral': getScoreColor(props.result.consistency.confidence) === 'neutral'
                    }"
                    :style="{ width: `${(props.result.consistency.confidence || 0) * 100}%` }"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Explanation</span>
                <p class="text-xs leading-relaxed">
                  {{ props.result.consistency.explanation }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Safety Monitor -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Safety Monitor</span>
          <div class="grid grid-cols-1 gap-3">
            <!-- Adversarial Behavior -->
            <div v-if="props.result.adversarial" class="flex flex-col gap-2 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Adversarial Behavior</span>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="props.result.adversarial.is_adversarial ? 'i-lucide-shield-alert' : 'i-lucide-shield-check'"
                    :class="props.result.adversarial.is_adversarial ? 'text-error' : 'text-success'"
                  />
                  <span class="text-sm font-semibold">
                    {{ props.result.adversarial.is_adversarial ? 'Detected' : 'Safe' }}
                  </span>
                </div>
              </div>
              <div v-if="props.result.adversarial.is_adversarial" class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted">Severity</span>
                  <UBadge
                    :color="props.result.adversarial.severity === 'high' ? 'error' : props.result.adversarial.severity === 'medium' ? 'warning' : 'primary'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ props.result.adversarial.severity }}
                  </UBadge>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Explanation</span>
                <p class="text-xs leading-relaxed">
                  {{ props.result.adversarial.explanation }}
                </p>
              </div>
            </div>

            <!-- Fact Check -->
            <div v-if="props.result.factcheck" class="flex flex-col gap-2 p-3 rounded-md bg-elevated border border-accented">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted">Fact Check</span>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="props.result.factcheck.correctness_score >= 0.7 ? 'i-lucide-check-circle-2' : props.result.factcheck.correctness_score >= 0.5 ? 'i-lucide-alert-circle' : 'i-lucide-x-circle'"
                    :class="props.result.factcheck.correctness_score >= 0.7 ? 'text-success' : props.result.factcheck.correctness_score >= 0.5 ? 'text-warning' : 'text-error'"
                  />
                  <span class="text-sm font-semibold">
                    {{ props.result.factcheck.correctness_score >= 0.7 ? 'Verified' : props.result.factcheck.correctness_score >= 0.5 ? 'Uncertain' : 'Incorrect' }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted">Correctness</span>
                  <UBadge :color="getScoreColor(props.result.factcheck.correctness_score)" variant="subtle" size="xs">
                    {{ formatScore(props.result.factcheck.correctness_score) }}
                  </UBadge>
                </div>
                <div class="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all rounded-full"
                    :class="{
                      'bg-success': getScoreColor(props.result.factcheck.correctness_score) === 'success',
                      'bg-warning': getScoreColor(props.result.factcheck.correctness_score) === 'warning',
                      'bg-error': getScoreColor(props.result.factcheck.correctness_score) === 'error',
                      'bg-neutral': getScoreColor(props.result.factcheck.correctness_score) === 'neutral'
                    }"
                    :style="{ width: `${(props.result.factcheck.correctness_score || 0) * 100}%` }"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Explanation</span>
                <p class="text-xs leading-relaxed">
                  {{ props.result.factcheck.explanation }}
                </p>
              </div>
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
