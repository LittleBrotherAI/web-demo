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

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'primary'
    case 'completed':
      return 'success'
    case 'failed':
      return 'error'
    default:
      return 'neutral'
  }
}

function getIssueIcon(type: string) {
  switch (type) {
    case 'error':
      return 'i-lucide-circle-x'
    case 'warning':
      return 'i-lucide-triangle-alert'
    case 'info':
      return 'i-lucide-info'
    default:
      return 'i-lucide-circle'
  }
}

function getIssueColor(type: string) {
  switch (type) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'primary'
    default:
      return 'neutral'
  }
}

function formatPercentage(value?: number) {
  if (value === undefined) return 'N/A'
  return `${Math.round(value * 100)}%`
}
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
        <!-- Metrics -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Coverage Metric -->
          <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-muted">Coverage</span>
              <span class="text-sm font-semibold">{{ formatPercentage(result.coverage) }}</span>
            </div>
            <UProgress
              :value="(result.coverage || 0) * 100"
              :color="(result.coverage || 0) >= 0.7 ? 'success' : (result.coverage || 0) >= 0.4 ? 'warning' : 'error'"
              size="xs"
            />
            <span class="text-xs text-muted">Chain-of-Thought coverage of answer</span>
          </div>

          <!-- Legibility Metric -->
          <div class="flex flex-col gap-1.5 p-3 rounded-md bg-elevated border border-accented">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-muted">Legibility</span>
              <span class="text-sm font-semibold">{{ formatPercentage(result.legibility) }}</span>
            </div>
            <UProgress
              :value="(result.legibility || 0) * 100"
              :color="(result.legibility || 0) >= 0.7 ? 'success' : (result.legibility || 0) >= 0.4 ? 'warning' : 'error'"
              size="xs"
            />
            <span class="text-xs text-muted">Reasoning clarity and structure</span>
          </div>
        </div>

        <!-- Issues -->
        <div v-if="result.issues && result.issues.length > 0" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted uppercase">Detected Issues</span>
          <div class="flex flex-col gap-1.5">
            <UAlert
              v-for="(issue, index) in result.issues"
              :key="index"
              :icon="getIssueIcon(issue.type)"
              :color="getIssueColor(issue.type)"
              variant="soft"
              :description="issue.message"
              :ui="{ description: 'text-xs' }"
            />
          </div>
        </div>

        <!-- Success Message (no issues) -->
        <div v-else class="flex items-center gap-2 text-sm text-success">
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
