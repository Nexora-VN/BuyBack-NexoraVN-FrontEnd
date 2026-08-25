import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

export interface ExampleItem {
  id: number;
  title: string;
}

export const exampleService = {
  list(params?: { page?: number; limit?: number }) {
    return apiClient.get<ApiResponse<ExampleItem[]>>(API_ENDPOINTS.examples, {
      params,
    });
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<ExampleItem>>(
      `${API_ENDPOINTS.examples}/${id}`,
    );
  },

  testService() {
    return apiClient.get(API_ENDPOINTS.health
    );
  },
};
