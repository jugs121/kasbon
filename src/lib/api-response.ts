export type ApiEnvelope<T> = {
  Message: string;
  Data: T;
};

export function ok<T>(Data: T, Message = "Berhasil"): ApiEnvelope<T> {
  return { Message, Data };
}

export function fail(Message: string): ApiEnvelope<null> {
  return { Message, Data: null };
}

export function json<T>(body: ApiEnvelope<T>, status = 200): Response {
  return Response.json(body, { status });
}
