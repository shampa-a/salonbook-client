const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "customer" | "salonOwner" | "admin";
    blocked: boolean;
  };
  message?: string;
}

export async function getDashboardPath(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/me`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    console.log("Auth API status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Auth API response:", errorText);

      throw new Error(
        `Authentication verification failed (${response.status})`,
      );
    }

    const result: AuthUserResponse = await response.json();

    console.log("Auth API user:", result.user);

    if (!result.success || !result.user) {
      throw new Error("User information not available.");
    }

    if (result.user.blocked) {
      throw new Error("Your account has been blocked.");
    }

    switch (result.user.role) {
      case "admin":
        return "/admin/dashboard";

      case "salonOwner":
        return "/salon/dashboard";

      case "customer":
        return "/customer/dashboard";

      default:
        throw new Error("Invalid user role.");
    }
  } catch (error) {
    console.error("Dashboard redirect error:", error);

    return "/login";
  }
}