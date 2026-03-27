export interface HelpDeskMessage {
  id: string;
  from: "user" | "support";
  text: string;
  createdAt: number;
}

const HELPDESK_KEY = "baji_helpdesk";

function getAll(): Record<string, HelpDeskMessage[]> {
  try {
    const raw = localStorage.getItem(HELPDESK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, HelpDeskMessage[]>): void {
  localStorage.setItem(HELPDESK_KEY, JSON.stringify(data));
}

export function getUserMessages(phone: string): HelpDeskMessage[] {
  const all = getAll();
  return all[phone] || [];
}

export function sendUserMessage(phone: string, text: string): void {
  const all = getAll();
  const msgs = all[phone] || [];
  msgs.push({
    id: `${Date.now()}_${Math.random()}`,
    from: "user",
    text,
    createdAt: Date.now(),
  });
  all[phone] = msgs;
  saveAll(all);
}

export function getAllConversations(): {
  phone: string;
  messages: HelpDeskMessage[];
}[] {
  const all = getAll();
  return Object.entries(all)
    .map(([phone, messages]) => ({ phone, messages }))
    .filter((c) => c.messages.length > 0);
}

export function sendSupportReply(phone: string, text: string): void {
  const all = getAll();
  const msgs = all[phone] || [];
  msgs.push({
    id: `${Date.now()}_${Math.random()}`,
    from: "support",
    text,
    createdAt: Date.now(),
  });
  all[phone] = msgs;
  saveAll(all);
}
