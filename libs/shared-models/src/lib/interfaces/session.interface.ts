export interface Session {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    buildingId?: string;
  };
}
