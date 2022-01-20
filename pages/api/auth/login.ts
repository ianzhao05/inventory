import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { PASSWORD } from "../../../lib/password";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    message: string;
  }>
) {
  if (req.method !== "POST") {
    res
      .setHeader("Allow", "POST")
      .status(405)
      .json({ message: "Invalid method" });
  } else if (!req.body.password) {
    res.status(400).json({ message: "Invalid request" });
  } else if (req.body.password !== PASSWORD) {
    res.status(401).json({ message: "Incorrect password" });
  } else {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", jwt.sign({}, PASSWORD), {
        httpOnly: true,
        path: "/",
      })
    );
    res.status(200).end();
  }
}
