export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Robust response handler to avoid "Unexpected token '<'..." errors.
 * Ensures that the response is JSON before attempting to parse it.
 */
export async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    // Check for authentication failure (401 Unauthorized)
    if (response.status === 401 && typeof window !== "undefined") {
      console.warn("   [API] Authentication failed (401). Clearing session...");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // Prevent internal recursion if we're already on login page
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login?message=Session expired. Please login again.";
      }
    }

    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } else {
      const text = await response.text();
      console.error("Non-JSON Error Response:", text.substring(0, 500));
      throw new Error(`Server returned an error (${response.status}). Check console for details.`);
    }
  }

  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  
  return null;
}
