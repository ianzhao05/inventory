import type { NextApiRequest, NextApiResponse } from "next";
import { verify } from "../../../lib/password";
import prisma from "../../../lib/prisma";

type Body = { id: number; quantity: number }[];

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
    const body = (req.body as Body).reduce((prev, curr) => {
      const existing = prev.find((p) => curr.id === p.id);
      if (existing) {
        existing.quantity += curr.quantity;
      } else {
        prev.push(curr);
      }
      return prev;
    }, [] as Body);
    try {
      const products = await prisma.product.findMany({
        where: { id: { in: body.map(({ id }) => id) } },
        select: { id: true, quantity: true },
      });
      for (const [index, { id, quantity }] of body.entries()) {
        const existing = products.find((p) => id === p.id)?.quantity;
        if (existing === undefined) {
          const e: any = new Error("Invalid product ID");
          e.name = "QuantityError";
          e.index = index;
          throw e;
        } else if (existing + quantity < 0) {
          const e: any = new Error("Not enough stock");
          e.name = "QuantityError";
          e.index = index;
          throw e;
        }
      }
      for (const { id, quantity } of body) {
        const action = quantity > 0 ? "increment" : "decrement";
        await prisma.product.update({
          data: {
            quantity: {
              [action]: Math.abs(quantity),
            },
          },
          where: {
            id,
          },
        });
      }
      const updateEvent = await prisma.updateEvent.create({
        data: {
          products: {
            create: body.map(({ id, quantity }) => ({
              quantity,
              product: { connect: { id } },
            })),
          },
        },
      });
      res.status(200).json(updateEvent);
    } catch (err) {
      const e = err as any;
      if (e.name === "QuantityError") {
        res.status(400).json({ message: e.message, index: e.index });
      } else {
        res.status(500).json({ message: `An error occurred: ${e.message}` });
      }
    }
  } else {
    res
      .setHeader("Allow", "POST")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
