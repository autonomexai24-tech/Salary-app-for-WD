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
    // Auto-attach auth token if available
    const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const res = await fetch(url, {
      headers: { ...authHeaders, ...options.headers },
      ...options,
    });

    const json = await res.json();

    if (!res.ok) {
      // Handle errors properly (log response)
      console.error("API Error Response:", json);
      // Build a user-friendly message that includes field-level Zod errors
      let message = json?.message || "Something went wrong";
      if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
        const details = json.errors
          .map((e: any) => e.field ? `${e.field}: ${e.message}` : e.message)
          .join(", ");
        message = `${message} — ${details}`;
      }
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
    // Send previousCompany so backend can auto-create employer
    previousCompany: payload.previousCompany?.trim() || undefined,
  };

  return request("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getEmployees(
  page = 1,
  limit = 100
): Promise<any> {
  return request(`/employees?page=${page}&limit=${limit}`);
}

// ─── Salary API calls ────────────────────────────────────────

export async function createSalary(payload: Record<string, any>) {
  const data = {
    employeeId: payload.employees,
    month: Number(payload.month),
    year: Number(payload.year),
    workingDays: Number(payload.workingDays) || 0,
    workingHours: Number(payload.workingHours) || 0,
    basicSalary: Number(payload.basicSalary) || 0,
    incentive: Number(payload.incentive) || 0,
    bonus: Number(payload.bonus) || 0,
    taDa: Number(payload.tada) || 0,
    arrears: Number(payload.arrears) || 0,
    otHours: Number(payload.otHours) || 0,
    leavesTaken: Number(payload.leavesTaken) || 0,
    minusMinutes: Number(payload.minusMinutesRupees) || 0,
    extraFine: Number(payload.extraFine) || 0,
    professionalTax: Number(payload.professionalTax) || 0,
    emi: Number(payload.emi) || 0,
    advanceTaken: Number(payload.advanceTaken) || 0,
    advanceDeducted: Number(payload.advanceDeducted) || 0,
    additionalAdvance: Number(payload.additionalAdvance) || 0,
    advanceRemaining: Number(payload.advanceRemaining) || 0,
  };

  return request("/salary", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Company API calls (Singleton) ───────────────────────────

export async function getCompany(): Promise<any> {
  return request("/company");
}

export async function upsertCompany(payload: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
}): Promise<any> {
  return request("/company", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadLogo(file: File): Promise<any> {
  let baseUrl = API.endsWith('/') ? API.slice(0, -1) : API;
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }
  const formData = new FormData();
  formData.append("logo", file);

  const res = await fetch(`${baseUrl}/company/logo`, {
    method: "POST",
    body: formData,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Logo upload failed");
  }
  return json;
}

// ─── Employer API calls ──────────────────────────────────────

export async function getEmployers(page = 1, limit = 50): Promise<any> {
  return request(`/employers?page=${page}&limit=${limit}`);
}

export async function createEmployer(payload: {
  name: string;
  address?: string;
  phone?: string;
}): Promise<any> {
  return request("/employers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployer(
  id: string,
  payload: { name: string; address?: string; phone?: string }
): Promise<any> {
  return request(`/employers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployer(id: string): Promise<any> {
  return request(`/employers/${id}`, {
    method: "DELETE",
  });
}
