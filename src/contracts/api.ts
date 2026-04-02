export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiErrorDetails = Record<
  string,
  string[] | string | boolean | number | null
>;

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: ApiErrorDetails;
};

export type ApiSuccessEnvelope<TData> = {
  success: true;
  data: TData;
  meta: ApiMeta;
  error: null;
};

export type ApiErrorEnvelope = {
  success: false;
  data: null;
  meta: ApiMeta;
  error: ApiErrorPayload;
};

export type ApiEnvelope<TData> = ApiSuccessEnvelope<TData> | ApiErrorEnvelope;
