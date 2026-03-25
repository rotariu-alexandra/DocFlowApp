type MyRequestItem = {
  _id: string;
  title: string;
  description: string;
  department: string;
  requestType: string;
  status: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
};

type FetchMyRequestsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

type FetchMyRequestsResponse = {
  success: boolean;
  data: MyRequestItem[];
  pagination: PaginationData;
};

export async function fetchMyRequests({
  page = 1,
  limit = 5,
  search = "",
  status = "",
}: FetchMyRequestsParams): Promise<FetchMyRequestsResponse> {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    status,
  });

  const res = await fetch(`/api/requests/mine?${query.toString()}`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch my requests");
  }

  return data;
}

export async function deleteMyRequest(id: string) {
  const res = await fetch(`/api/requests/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete request");
  }

  return data;
}