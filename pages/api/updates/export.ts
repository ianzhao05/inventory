import type { NextApiRequest, NextApiResponse } from "next";
import { parseAsync } from "json2csv";
import { verify } from "../../../lib/password";
import prisma from "../../../lib/prisma";
import { endOfMonth, isValid, parse } from "date-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const productId =
    typeof req.query.productId === "string"
      ? parseInt(decodeURIComponent(req.query.productId))
      : null;

  const date =
    typeof req.query.month === "string"
      ? decodeURIComponent(req.query.month)
      : null;

  const start = date ? parse(date, "yyyy-MM", new Date()) : undefined;

  if (productId && isNaN(productId)) {
    res.status(400).json({ message: "Invalid product ID" });
  } else if (start && !isValid(start)) {
    res.status(400).json({ message: "Invalid month" });
  }

  const end = start && endOfMonth(start);

  try {
    verify(req);
  } catch (e) {
    res.status(401).json({ message: (e as any).message });
    return;
  }

  if (req.method === "GET") {
    const updates = await prisma.updateEventsOnProducts.findMany({
      orderBy: { updateEvent: { createdAt: "asc" } },
      where: {
        productId: productId ?? undefined,
        updateEvent: { createdAt: { gte: start, lte: end } },
      },
      select: {
        quantity: true,
        updateEvent: {
          select: { createdAt: true },
        },
        product: {
          select: {
            code: true,
            name: true,
            price: true,
            manufacturer: { select: { name: true } },
            supplier: { select: { name: true } },
          },
        },
      },
    });
    const csv = await parseAsync(updates, {
      fields: [
        { label: "Time", value: "updateEvent.createdAt" },
        { label: "Code", value: "product.code" },
        { label: "Name", value: "product.name" },
        { label: "Manufacturer", value: "product.manufacturer.name" },
        { label: "Supplier", value: "product.supplier.name" },
        { label: "Price", value: "product.price" },
        { label: "Change", value: "quantity" },
      ],
    });
    res
      .setHeader("Content-Type", "text/csv")
      .setHeader("Content-Disposition", "attachment;filename=history.csv")
      .send(csv);
  } else {
    res
      .setHeader("Allow", "GET")
      .status(405)
      .json({ message: "Invalid method" });
  }
}
