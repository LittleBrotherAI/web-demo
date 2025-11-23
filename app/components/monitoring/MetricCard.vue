<script setup lang="ts">
/**
 * Reusable metric card component for displaying monitoring scores
 * Handles both normal metrics (higher is better) and inverted metrics (lower is better)
 */

const props = withDefaults(defineProps<{
  label: string
  score?: number | null
  inverted?: boolean
  description?: string
}>(), {
  inverted: false
})

function formatScore(value?: number | null) {
  if (value === undefined || value === null) return 'N/A'
  return `${Math.round(value * 100)}%`
}

function getScoreColor(value?: number | null) {
  if (value === undefined || value === null) return 'neutral'

  // For inverted metrics (like adversarial), lower is better
  const score = props.inverted ? (1 - value) : value

  if (score >= 0.7) return 'success'
  if (score >= 0.4) return 'warning'
  return 'error'
}

const progressBarClass = computed(() => {
  const color = getScoreColor(props.score)
  return {
    'bg-success': color === 'success',
    'bg-warning': color === 'warning',
    'bg-error': color === 'error',
    'bg-neutral': color === 'neutral'
  }
})

const progressWidth = computed(() => {
  return `${(props.score || 0) * 100}%`
})
</script>

<template>
  <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-muted">{{ label }}</span>
      <UBadge :color="getScoreColor(score)" variant="subtle" size="xs">
        {{ formatScore(score) }}
      </UBadge>
    </div>
    <div class="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        class="h-full transition-all rounded-full"
        :class="progressBarClass"
        :style="{ width: progressWidth }"
      />
    </div>
    <p v-if="description" class="text-xs text-muted">
      {{ description }}
    </p>
  </div>
</template>
