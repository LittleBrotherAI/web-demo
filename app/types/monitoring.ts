/**
 * Monitoring types for AI response analysis
 * Shared across components to avoid duplication
 */

export interface ConsistencyResult {
  is_consistent: boolean
  confidence: number
  explanation: string
}

export interface MonitoringResult {
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
}
