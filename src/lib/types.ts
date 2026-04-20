export type EventType = "candidates" | "range";

export type EventRecord = {
  id: string;
  slug: string;
  admin_token: string;
  title: string;
  description: string | null;
  type: EventType;
  candidate_dates: string[] | null;
  range_start: string | null;
  range_end: string | null;
  creator_name: string | null;
  created_at: string;
};

export type ResponseRecord = {
  id: string;
  event_id: string;
  respondent_name: string;
  cannot_attend_dates: string[];
  created_at: string;
  updated_at: string;
};

export type EventPublic = Omit<EventRecord, "admin_token">;

export type CreateEventInput =
  | {
      type: "candidates";
      title: string;
      description?: string;
      creator_name?: string;
      candidate_dates: string[];
    }
  | {
      type: "range";
      title: string;
      description?: string;
      creator_name?: string;
      range_start: string;
      range_end: string;
    };
