
export interface Email {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
}
