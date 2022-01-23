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
    res.status(400).json({ message: "Invalid supplier ID" });
  }
  if (req.method === "GET") {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: [{ name: "asc" }],
          select: {
            id: true,
            code: true,
            name: true,
            supplier: true,
            price: true,
            quantity: true,
          },
        },
      },
    });
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: "Supplier does not exist" });
    }
  } else if (req.method === "PUT") {
    const body = req.body as Pick<Prisma.SupplierUpdateInput, "name">;
    try {
      const supplier = await prisma.supplier.update({
        where: { id },
        data: {
          name: body.name,
        },
      });
      res.status(200).json(supplier);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          res.status(400).json({
            field: "name",
            message: "A supplier already exists with this name",
          });
        }
      } else {
        res.status(500).json({
          message: `An unhandled error occurred: ${(e as any).message}`,
        });
      }
    }
  } else if (req.method === "DELETE") {
    await prisma.supplier.delete({ where: { id } });
    res.status(200).end();
  } else {
    res
      .setHeader("Allow", "GET, PUT, DELETE")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
