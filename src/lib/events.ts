const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type ClientEventItem = {
  id: string;
  title: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  status: "active" | "draft" | "inactive";
  bannerUrl?: string | null;
};

type UpcomingEventsResponse<T> = {
  total: number;
  items: T[];
};

export async function getClientEventListings(limit = 50) {
  const safeLimit = Math.min(100, Math.max(1, limit));
  const query = new URLSearchParams({ limit: String(safeLimit) });

  const response = await fetch(`${API_URL}/events/upcoming?${query.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as UpcomingEventsResponse<ClientEventItem>;
  return data.items ?? [];
}
