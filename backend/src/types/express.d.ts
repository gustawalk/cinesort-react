import "express";

export interface RequestUser {
  id: number;
  username: string;
}

declare module "express" {
  interface Request {
    user?: RequestUser;
  }
}

