import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { verify } from "../../../lib/password";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code =
    typeof req.query.code === "string"
      ? decodeURIComponent(req.query.code)
      : null;
  try {
    verify(req);
  } catch (e) {
    res.status(401).json({ message: (e as any).message });
    return;
  }

  if (req.method === "GET") {
    const products = await prisma.product.findMany({
      where: { code: code ?? undefined },
      include: { supplier: true },
    });
    res.json(products);
  } else if (req.method === "POST") {
    const body = req.body as Prisma.ProductCreateInput & {
      manufacturer?: string;
      supplier?: string;
    };
    try {
      const product = await prisma.product.create({
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
            : undefined,
          supplier: body.supplier
            ? {
                connectOrCreate: {
                  create: { name: body.supplier },
                  where: { name: body.supplier },
                },
              }
            : undefined,
        },
      });
      res.status(201).json(product);
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
  } else {
    res
      .setHeader("Allow", "GET, POST")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
