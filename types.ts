
export interface QRField {
  id: string;
  key: string;
  value: string;
}

export interface SuggestionResponse {
  fields: { key: string; value: string; description: string }[];
  explanation: string;
}
