import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("roti-dukaan-auth");
      const accessToken = raw ? JSON.parse(raw)?.state?.accessToken : null;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  updatedAt: string;
}

export interface NotificationListResult {
  items: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

interface RawNotification {
  id: string;
  channel: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const normalize = (n: RawNotification): AppNotification => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.body,
  isRead: n.read,
  createdAt: n.createdAt,
});

export const notificationsApi = {
  list: async (page = 1, limit = 10): Promise<NotificationListResult> => {
    const { data } = await api.get<{
      items: RawNotification[];
      total: number;
      unreadCount: number;
      page: number;
      limit: number;
    }>("/notifications", { params: { page, limit } });
    return {
      items: data.items.map(normalize),
      total: data.total,
      unreadCount: data.unreadCount,
      page: data.page,
      limit: data.limit,
    };
  },

  markRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await api.post("/notifications/read-all");
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await api.get<NotificationPreferences>("/notifications/preferences");
    return data;
  },

  updatePreferences: async (
    prefs: Partial<Omit<NotificationPreferences, "userId" | "updatedAt">>
  ): Promise<NotificationPreferences> => {
    const { data } = await api.put<NotificationPreferences>(
      "/notifications/preferences",
      prefs
    );
    return data;
  },
};
