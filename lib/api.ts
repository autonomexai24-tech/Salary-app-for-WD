const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Generic fetch wrapper with error handling.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let baseUrl = API.endsWith('/') ? API.slice(0, -1) : API;
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Log API URL as requested
  console.log("API URL:", url);

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    const json = await res.json();

    if (!res.ok) {
      // Handle errors properly (log response)
      console.error("API Error Response:", json);
      const message =
        json?.message || json?.errors?.[0]?.message || "Something went wrong";
      throw new Error(message);
    }

    return json as T;
  } catch (error) {
    console.error("Fetch request failed:", error);
    throw error;
  }
}

// ─── Department types ────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
  meta: PaginationMeta;
}

export interface DepartmentResponse {
  success: boolean;
  data: Department;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// ─── Department API calls ────────────────────────────────────

export async function getDepartments(
  page = 1,
  limit = 10
): Promise<DepartmentListResponse> {
  return request<DepartmentListResponse>(
    `/departments?page=${page}&limit=${limit}`
  );
}

export async function createDepartment(
  name: string
): Promise<DepartmentResponse> {
  return request<DepartmentResponse>("/departments", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateDepartment(
  id: string,
  name: string
): Promise<DepartmentResponse> {
  return request<DepartmentResponse>(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteDepartment(
  id: string
): Promise<DeleteResponse> {
  return request<DeleteResponse>(`/departments/${id}`, {
    method: "DELETE",
  });
}

// ─── Employee API calls ──────────────────────────────────────

export async function createEmployee(payload: Record<string, any>) {
  // Convert messy frontend strings back to clean data
  const data = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    address: payload.address || undefined,
    dateOfBirth: payload.dob || undefined,
    gender: payload.gender || undefined,
    qualification: payload.qualification || undefined,
    // Safely extract floats out of UI currency strings ("₹ 35,000" -> 35000)
    salary: parseFloat(String(payload.salary).replace(/[^0-9.]/g, "")) || 0,
    previousSalary: payload.previousSalary
      ? parseFloat(String(payload.previousSalary).replace(/[^0-9.]/g, ""))
      : undefined,
    permittedLeaves: payload.permittedLeaves
      ? parseInt(String(payload.permittedLeaves).replace(/[^0-9]/g, ""), 10)
      : undefined,
    // Use the fetched department ID directly
    departmentId: payload.department || undefined,
    department: undefined,
  };

  return request("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
