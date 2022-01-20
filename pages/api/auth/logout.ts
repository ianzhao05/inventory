import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

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
  } else {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      })
    );
    res.status(200).end();
  }
}
