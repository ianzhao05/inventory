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

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid product ID" });
  }
  if (req.method === "GET") {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product does not exist" });
    }
  } else if (req.method === "PUT") {
  } else if (req.method === "DELETE") {
  } else {
    res
      .setHeader("Allow", "GET, PUT, DELETE")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
