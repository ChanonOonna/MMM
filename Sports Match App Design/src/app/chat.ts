import { apiJson } from "./api";

export type RoomType = "match" | "session" | "event";

export interface ChatMessage {
  id: string;
  senderId: string;
  roomType: RoomType;
  roomId: string;
  content: string | null;
  imageUrl: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export function fetchMessages(roomType: RoomType, roomId: string, cursor?: string): Promise<ChatMessage[]> {
  const qs = cursor ? `?cursor=${cursor}` : "";
  return apiJson<ChatMessage[]>(`/chat/${roomType}/${roomId}/messages${qs}`);
}

export function sendMessage(roomType: RoomType, roomId: string, content: string): Promise<ChatMessage> {
  return apiJson<ChatMessage>(`/chat/${roomType}/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function unsendMessage(id: string): Promise<void> {
  return apiJson(`/chat/messages/${id}/unsend`, { method: "POST" });
}
