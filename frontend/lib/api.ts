export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/**
 * Robust response handler to avoid "Unexpected token '<'..." errors.
 * Ensures that the response is JSON before attempting to parse it.
 */
export async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
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
