const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AdminOwner {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  blocked: boolean;
  createdAt?: string;
}

export interface SalonApplication {
  _id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    country: string;
    city: string;
    state?: string;
    area: string;
    street?: string;
    postalCode?: string;
  };
  status: "pending" | "approved" | "rejected" | "suspended";
  isPublished: boolean;
  rejectionReason?: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  owner: AdminOwner | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApplicationListResponse {
  success: boolean;
  data: {
    applications: SalonApplication[];
    pagination: Pagination;
  };
  message?: string;
}

export interface ApplicationDetailsResponse {
  success: boolean;
  data: {
    application: SalonApplication;
    owner: AdminOwner | null;
  };
  message?: string;
}

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}

async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}/api/v1/admin${endpoint}`,
    {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  const result = await response.json().catch(() => null) as
    | (T & ApiErrorResponse)
    | null;

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Request failed with status ${response.status}`
    );
  }

  if (!result) {
    throw new Error("Invalid server response");
  }

  return result;
}

// Get applications
export async function getApplications(
  status: "pending" | "approved" | "rejected" | "suspended" | "all" = "pending",
  page = 1,
  limit = 20
) {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  });

  return adminFetch<ApplicationListResponse>(
    `/salons/applications?${params}`
  );
}

// Get application details
export async function getApplicationDetails(id: string) {
  return adminFetch<ApplicationDetailsResponse>(
    `/salons/applications/${encodeURIComponent(id)}`
  );
}

// Approve application
export async function approveApplication(id: string) {
  return adminFetch<{
    success: boolean;
    data: SalonApplication;
    message?: string;
  }>(
    `/salons/applications/${encodeURIComponent(id)}/approve`,
    {
      method: "PATCH",
    }
  );
}

// Reject application
export async function rejectApplication(
  id: string,
  reason: string
) {
  return adminFetch<{
    success: boolean;
    data: SalonApplication;
    message?: string;
  }>(
    `/salons/applications/${encodeURIComponent(id)}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }
  );
}