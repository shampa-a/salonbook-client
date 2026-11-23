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
    const response = await fetch(
      `${API_URL}/api/v1/auth/me`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Unable to verify your account.");
    }

    const result: AuthUserResponse = await response.json();

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
        return "/login";
    }
  } catch (error) {
    console.error("Dashboard redirect error:", error);
    return "/login";
  }
}