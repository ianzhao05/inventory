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
    const body = req.body as { id: number; quantity: number }[];
    try {
      const updateEvent = await prisma.$transaction(async () => {
        for (const [index, { id, quantity }] of body.entries()) {
          console.log([index, { id, quantity }]);
          const action = quantity > 0 ? "increment" : "decrement";
          const product = await prisma.product.update({
            data: {
              quantity: {
                [action]: Math.abs(quantity),
              },
            },
            where: {
              id,
            },
            select: { quantity: true },
          });
          if (product.quantity < 0) {
            const e: any = new Error("Not enough stock");
            e.name = "QuantityError";
            e.index = index;
            throw e;
          }
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
        return updateEvent;
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