import prisma from "./prisma";
import { Prisma } from "@prisma/client";
import { formatISO } from "date-fns";

export const getProducts = () =>
  prisma.product
    .findMany({
      include: {
        manufacturer: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    })
    .then((products) =>
      products.map((product) => ({
        ...product,
        price: product.price?.toFixed(2) ?? null,
      }))
    );

export const getProduct = (id: number) =>
  prisma.product
    .findUnique({
      where: { id },
      include: {
        manufacturer: { select: { name: true } },
        supplier: { select: { name: true } },
        updateEvents: {
          select: {
            updateEvent: { select: { id: true, createdAt: true } },
            quantity: true,
          },
        },
      },
    })
    .then(
      (product) =>
        product && {
          ...product,
          price: product.price?.toFixed(2) ?? null,
          updateEvents: product.updateEvents.map(
            ({ updateEvent, quantity }) => ({
              id: updateEvent.id,
              createdAt: formatISO(updateEvent.createdAt),
              quantity,
            })
          ),
        }
    );

export type ProductWithUpdateEvents = NonNullable<
  Prisma.PromiseReturnType<typeof getProduct>
>;
export type Product = Omit<ProductWithUpdateEvents, "updateEvents">;

export const getUpdateEvents = () =>
  prisma.updateEvent
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          orderBy: [{ product: { name: "asc" } }],
          select: {
            quantity: true,
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                price: true,
                manufacturer: { select: { name: true } },
                supplier: { select: { name: true } },
              },
            },
          },
        },
      },
    })
    .then((updateEvents) =>
      updateEvents.map((updateEvent) => ({
        ...updateEvent,
        createdAt: formatISO(updateEvent.createdAt),
        products: updateEvent.products.map(({ quantity, product }) => ({
          ...product,
          price: product.price?.toFixed(2) ?? null,
          quantity,
        })),
      }))
    );
export type UpdateEventsWithProducts = Prisma.PromiseReturnType<
  typeof getUpdateEvents
>;

export const getManufacturers = () =>
  prisma.manufacturer
    .findMany({
      orderBy: [{ name: "asc" }],
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
    })
    .then((manufacturers) =>
      manufacturers.map((manufacturer) => ({
        ...manufacturer,
        products: manufacturer.products.map((product) => ({
          ...product,
          price: product.price?.toFixed(2) ?? null,
        })),
      }))
    );

export const getManufacturer = (id: number) =>
  prisma.manufacturer
    .findUnique({
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
    })
    .then(
      (manufacturer) =>
        manufacturer && {
          ...manufacturer,
          products: manufacturer.products.map((product) => ({
            ...product,
            price: product.price?.toFixed(2) ?? null,
          })),
        }
    );
export type ManufacturerWithProducts = NonNullable<
  Prisma.PromiseReturnType<typeof getManufacturer>
>;

export const getSuppliers = () =>
  prisma.supplier
    .findMany({
      orderBy: [{ name: "asc" }],
      include: {
        products: {
          orderBy: [{ name: "asc" }],
          select: {
            id: true,
            code: true,
            name: true,
            manufacturer: true,
            price: true,
            quantity: true,
          },
        },
      },
    })
    .then((suppliers) =>
      suppliers.map((supplier) => ({
        ...supplier,
        products: supplier.products.map((product) => ({
          ...product,
          price: product.price?.toFixed(2) ?? null,
        })),
      }))
    );

export const getSupplier = (id: number) =>
  prisma.supplier
    .findUnique({
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
    })
    .then(
      (supplier) =>
        supplier && {
          ...supplier,
          products: supplier.products.map((product) => ({
            ...product,
            price: product.price?.toFixed(2) ?? null,
          })),
        }
    );
export type SupplierWithProducts = NonNullable<
  Prisma.PromiseReturnType<typeof getSupplier>
>;
