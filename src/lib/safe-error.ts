// Server-side helper to log internal errors and throw a safe generic message
// to prevent leaking database internals (table/constraint/RLS details) to clients.
export function safeThrow(error: unknown, context: string, userMessage = "Something went wrong. Please try again."): never {
  console.error(`[${context}]`, error);
  throw new Error(userMessage);
}