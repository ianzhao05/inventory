import type { GetServerSideProps, NextPage } from "next";
import Layout from "../components/Layout";
import { verifySsr } from "../lib/password";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import formatPrice from "../lib/formatPrice";

const Row = ({ supplier }: { supplier: SuppliersWithProducts[number] }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {supplier.name}
        </TableCell>
        <TableCell>{supplier.products.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Products
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Manufacturer</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supplier.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell component="th" scope="row">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.manufacturer}</TableCell>
                      <TableCell align="right">
                        {product.price && "$" + formatPrice(product.price)}
                      </TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Suppliers: NextPage<{ suppliers: SuppliersWithProducts }> = ({
  suppliers,
}) => {
  return (
    <Layout title="Suppliers">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Supplier Name</TableCell>
              <TableCell>Product Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <Row key={supplier.id} supplier={supplier} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

const getSuppliers = async () =>
  (
    await prisma.supplier.findMany({
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
  ).map((supplier) => ({
    ...supplier,
    products: supplier.products.map((product) => ({
      ...product,
      price: product.price?.toFixed(2) ?? null,
    })),
  }));
type SuppliersWithProducts = Prisma.PromiseReturnType<typeof getSuppliers>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { suppliers: await getSuppliers() } };
};

export default Suppliers;
