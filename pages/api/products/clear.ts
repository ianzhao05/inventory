import type { NextApiRequest, NextApiResponse } from "next";
import { verify } from "../../../lib/password";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    verify(req);
  } catch (e) {
    res.status(401).json({ message: (e as any).message });
    return;
  }

  if (req.method === "POST") {
    await prisma.product.updateMany({ data: { quantity: 0 } });
    res.status(200).end();
  } else {
    res
      .setHeader("Allow", "POST")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
