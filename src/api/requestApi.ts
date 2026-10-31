import Constants from "expo-constants";

type ApiResponseShape = {
  success?: boolean;
  message?: string;
};

const getResponseMessage = (responseText: string) => {
  if (!responseText.trim()) {
    return undefined;
  }

  let message: string | undefined;
  try {
    const body: unknown = JSON.parse(responseText);

    if (typeof body === "string") {
      message = body;
    } else if (body && typeof body === "object") {
      const errorBody = body as Record<string, unknown>;

      for (const key of ["message", "detail", "title", "error"]) {
        const value = errorBody[key];

        if (typeof value === "string" && value.trim()) {
          message = value;
          break;
        }
      }

      const errors = errorBody.errors;

      if (!message && errors && typeof errors === "object") {
        const messages = Object.values(errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === "string");

        if (messages.length > 0) {
          message = messages.join("\n");
        }
      }
    }
  } catch {
    message = responseText.trim();
  }

  if (
    !message ||
    message.length > 200 ||
    /\b(server|http|https|status code|exception|stack trace|sql|database|endpoint|api|json|payload|token|request id|bad request|unauthorized|forbidden|internal server|gateway)\b/i.test(
      message,
    )
  ) {
    return undefined;
  }

  return message;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "We couldn't complete that. Please try again.",
) => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback;
  }

  return /\b(server|http|https|status code|exception|stack trace|sql|database|endpoint|api|json|payload|token|request id|bad request|unauthorized|forbidden|internal server|gateway)\b/i.test(
    error.message,
  )
    ? fallback
    : error.message;
};

export const requestApi = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl; //Live
  const localApiBaseUrl = "https://e8ce-128-94-9-47.ngrok-free.app"; //Local
  const xApiKey = Constants.expoConfig?.extra?.xApiKey;

  const url = `${apiBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(xApiKey ? { "x-api-key": xApiKey } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "We couldn't connect. Check your internet connection and try again.",
    );
  }

  let responseText: string;
  try {
    responseText = await response.text();
  } catch {
    throw new Error("We couldn't read the reply. Please try again.");
  }

  if (!response.ok) {
    const friendlyMessage = getResponseMessage(responseText);
    const statusMessage =
      response.status === 400
        ? "Some details are missing or incorrect. Check them and try again."
        : response.status === 401 || response.status === 403
          ? "You can't do that right now. Please try again later."
          : response.status === 404
            ? "We couldn't find what you were looking for. Refresh and try again."
            : response.status === 409
              ? "This has changed since you last checked. Refresh and try again."
              : response.status === 429
                ? "You're doing that a bit too quickly. Wait a moment and try again."
                : response.status >= 500
                  ? "We're having trouble right now. Please try again in a few minutes."
                  : "We couldn't complete that. Please try again.";

    throw new Error(friendlyMessage ?? statusMessage);
  }

  // A 204 response, or another successful empty response, is valid.
  if (!responseText.trim()) {
    return undefined as T;
  }

  let data: unknown;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      "We received an unexpected reply. Please try again in a moment.",
    );
  }

  // Handle APIs that wrap results in { success, message, data }.
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const apiResponse = data as ApiResponseShape;

    if (apiResponse.success === false) {
      throw new Error(
        getResponseMessage(JSON.stringify(apiResponse.message ?? "")) ??
          "We couldn't complete that. Please try again.",
      );
    }
  }

  return data as T;
};
