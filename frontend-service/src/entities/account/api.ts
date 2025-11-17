const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4455";
const ACCOUNT_ENDPOINT = `${API_BASE_URL}/api/private/account`;

interface ErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

const parseError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as ErrorResponse;
    if (data?.message) {
      return data.message;
    }
  } catch {
    // Ignore JSON parse errors and fall back to the status text.
  }
  return response.statusText || "Unexpected error";
};

export const deleteAccount = async (): Promise<void> => {
  const response = await fetch(ACCOUNT_ENDPOINT, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 204) {
    return;
  }

  throw new Error(await parseError(response));
};

