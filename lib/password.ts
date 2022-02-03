import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";

export const PASSWORD = process.env.PASSWORD || "1234";

export const verify = (req: NextApiRequest) => {
  if (!req.headers.cookie) {
    throw new Error("Not authenticated");
  }
  const { token } = cookie.parse(req.headers.cookie);
  if (!token) {
    throw new Error("Not authenticated");
  }
  jwt.verify(token, PASSWORD);
};

export const verifySsr = ({ token }: Record<string, string>) => {
  if (!token) {
    throw new Error("Not authenticated");
  }
  jwt.verify(token, PASSWORD);
};
