import { Prisma } from "@prisma/client";
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
      include: { manufacturer: true, supplier: true },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product does not exist" });
    }
  } else if (req.method === "PUT") {
    const body = req.body as Prisma.ProductUpdateInput & {
      manufacturer?: string;
      supplier?: string;
    };
    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...body,
          price:
            body.price &&
            new Prisma.Decimal((body.price as string).replace(/,/g, "")),
          manufacturer: body.manufacturer
            ? {
                connectOrCreate: {
                  create: { name: body.manufacturer },
                  where: { name: body.manufacturer },
                },
              }
            : { disconnect: true },
          supplier: body.supplier
            ? {
                connectOrCreate: {
                  create: { name: body.supplier },
                  where: { name: body.supplier },
                },
              }
            : { disconnect: true },
        },
      });
      res.status(200).json(product);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          res.status(400).json({
            field: "code",
            message: "A product already exists with this code",
          });
        }
      } else {
        res.status(500).json({
          message: `An unhandled error occurred: ${(e as any).message}`,
        });
      }
    }
  } else if (req.method === "DELETE") {
    await prisma.product.delete({ where: { id } });
    res.status(200).end();
  } else {
    res
      .setHeader("Allow", "GET, PUT, DELETE")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
