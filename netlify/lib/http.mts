/** Success envelope expected by src/services/apiClient.ts */
export function ok<T>(data: T, extra: Record<string, unknown> = {}): Response {
  return Response.json({ success: true, data, timestamp: new Date().toISOString(), ...extra });
}

export function fail(message: string, status = 500): Response {
  return Response.json({ success: false, error: message }, { status });
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
