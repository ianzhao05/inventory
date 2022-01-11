import type { NextApiRequest, NextApiResponse } from "next";
import { verify } from "../../../lib/password";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res
    .setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    .setHeader("Pragma", "no-cache")
    .setHeader("Expires", "0");
  if (req.method !== "GET") {
    res
      .setHeader("Allow", "GET")
      .status(405)
      .json({ message: "Invalid method" });
  } else {
    try {
      verify(req);
    } catch {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    res.status(200).end();
  }
}
