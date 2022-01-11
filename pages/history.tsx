import { Prisma } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import Layout from "../components/Layout";
import { verifySsr } from "../lib/password";
import prisma from "../lib/prisma";
import { format, formatISO, parseISO } from "date-fns";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import formatPrice from "../lib/formatPrice";

const History: NextPage<{ updateEvents: UpdateEventsWithProducts }> = ({
  updateEvents,
}) => {
  return (
    <Layout title="Quantity Update History">
      {updateEvents.length > 0
        ? updateEvents.map(({ id, createdAt, products }) => (
            <Box key={id} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom component="div">
                {format(parseISO(createdAt), "eee, MMM d, y, h:mm a")}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="30%">Name</TableCell>
                    <TableCell width="20%">Code</TableCell>
                    <TableCell width="20%">Supplier</TableCell>
                    <TableCell align="right" width="15%">
                      Price
                    </TableCell>
                    <TableCell align="right" width="15%">
                      Change
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell component="th" scope="row">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.supplier?.name}</TableCell>
                      <TableCell align="right">
                        {product.price && "$" + formatPrice(product.price)}
                      </TableCell>
                      <TableCell align="right">
                        {(product.change <= 0 ? "" : "+") + product.change}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))
        : "No records found"}
    </Layout>
  );
};

const getUpdateEvents = async () =>
  (
    await prisma.updateEvent.findMany({
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
                manufacturer: true,
                price: true,
                supplier: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    })
  ).map((updateEvent) => ({
    ...updateEvent,
    createdAt: formatISO(updateEvent.createdAt),
    products: updateEvent.products.map(({ quantity, product }) => ({
      ...product,
      price: product.price?.toFixed(2) ?? null,
      change: quantity,
    })),
  }));
type UpdateEventsWithProducts = Prisma.PromiseReturnType<
  typeof getUpdateEvents
>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { updateEvents: await getUpdateEvents() } };
};

export default History;
