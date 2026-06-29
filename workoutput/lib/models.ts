// Model routing. Mirrors the monolith's modelForTurn. Free routes Haiku for the working
// loop and Sonnet for the kept artifact; paid routes Sonnet throughout. Confirm the model
// strings against your Anthropic account before launch.

export const MODELS = {
  PRIMARY: process.env.MODEL_PRIMARY || "claude-sonnet-4-6",
  FAST: process.env.MODEL_FAST || "claude-haiku-4-5-20251001",
} as const;

const PAID = new Set(["starter", "pro", "team", "enterprise"]);

export function modelForTurn(
  tier: string | null,
  inferredMode: string,
  workflowType: string,
): string {
  if (tier && PAID.has(tier)) return MODELS.PRIMARY;
  if (workflowType === "draft") return MODELS.PRIMARY;
  if (inferredMode === "Commit" || inferredMode === "CommitOverride") return MODELS.PRIMARY;
  return MODELS.FAST;
}
