import { env } from "@/constants/env";
import { ApiError } from "@/lib/api/errors";
import type { ApiClientOptions, QueryParamValue } from "@/types/api";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

class ApiClient {
  private readonly baseUrl = env.apiUrl;

  private buildUrl(
    endpoint: string,
    params?: Record<string, QueryParamValue>,
  ): string {
    const isAbsoluteUrl = ABSOLUTE_URL_PATTERN.test(endpoint);
    const browserOrigin =
      typeof window === "undefined" ? undefined : window.location.origin;
    const baseUrl = isAbsoluteUrl
      ? undefined
      : this.baseUrl || browserOrigin;

    if (!isAbsoluteUrl && !baseUrl) {
      throw new ApiError(
        "NEXT_PUBLIC_API_URL is required for server-side API requests.",
        0,
      );
    }

    const url = isAbsoluteUrl
      ? new URL(endpoint)
      : new URL(endpoint, `${baseUrl?.replace(/\/$/, "")}/`);

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    if (!isAbsoluteUrl && !this.baseUrl && browserOrigin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    options: ApiClientOptions = {},
  ): Promise<T> {
    const {
      params,
      timeout = 30_000,
      isFormData = false,
      headers: customHeaders,
      signal: callerSignal,
      ...requestInit
    } = options;
    const url = this.buildUrl(endpoint, params);
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(callerSignal?.reason);

    if (callerSignal?.aborted) {
      abortFromCaller();
    } else {
      callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
    }

    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const headers = new Headers(customHeaders);
    const bodyIsFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const shouldSendFormData = isFormData || bodyIsFormData;
    let requestBody: BodyInit | undefined;

    headers.set("Accept", "application/json");

    if (body !== undefined) {
      if (shouldSendFormData) {
        requestBody = body as BodyInit;
      } else {
        headers.set("Content-Type", "application/json");
        requestBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, {
        ...requestInit,
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
      });
      const data = await this.parseResponse(response);

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : `Request failed with status ${response.status}`;

        throw new ApiError(message, response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timed out or was cancelled.", 408);
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Unknown network error.",
        0,
      );
    } finally {
      clearTimeout(timeoutId);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    }
  }

  get<T>(endpoint: string, options?: ApiClientOptions) {
    return this.request<T>(endpoint, "GET", undefined, options);
  }

  post<T>(endpoint: string, body?: unknown, options?: ApiClientOptions) {
    return this.request<T>(endpoint, "POST", body, options);
  }

  put<T>(endpoint: string, body?: unknown, options?: ApiClientOptions) {
    return this.request<T>(endpoint, "PUT", body, options);
  }

  patch<T>(endpoint: string, body?: unknown, options?: ApiClientOptions) {
    return this.request<T>(endpoint, "PATCH", body, options);
  }

  delete<T>(endpoint: string, options?: ApiClientOptions) {
    return this.request<T>(endpoint, "DELETE", undefined, options);
  }
}

export const apiClient = new ApiClient();
