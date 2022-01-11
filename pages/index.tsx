import type { GetServerSideProps, NextPage } from "next";
import Layout from "../components/Layout";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  gridClasses,
} from "@mui/x-data-grid";
import { verifySsr } from "../lib/password";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { Box } from "@mui/material";
import formatPrice from "../lib/formatPrice";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 4, minWidth: 200 },
  { field: "code", headerName: "Code", flex: 2, minWidth: 150 },
  {
    field: "supplier",
    headerName: "Supplier",
    valueGetter: (params) => params.row.supplier?.name,
    flex: 2,
    minWidth: 150,
  },
  {
    type: "number",
    field: "price",
    headerName: "Price",
    flex: 1,
    minWidth: 100,
    valueFormatter: ({ value }) => value && "$" + formatPrice(value as string),
  },
  {
    type: "number",
    field: "quantity",
    headerName: "Quantity",
    flex: 1,
    minWidth: 100,
  },
  { field: "manufacturer", headerName: "Manufacturer", hide: true },
  {
    field: "description",
    headerName: "Description",
    hide: true,
    valueFormatter: (params) =>
      params.value && (params.value as string).replace(/\n/g, "\\n"),
  },
];

const exportFields: (keyof ProductsWithSupplier[number])[] = [
  "name",
  "code",
  "price",
  "quantity",
  "supplier",
  "manufacturer",
  "description",
];

const Toolbar = () => (
  <GridToolbarContainer className={gridClasses.toolbarContainer}>
    <GridToolbarExport
      csvOptions={{ fields: exportFields }}
      printOptions={{ disableToolbarButton: true }}
    />
  </GridToolbarContainer>
);

const Home: NextPage<{ products: ProductsWithSupplier }> = ({ products }) => {
  return (
    <Layout title="Inventory">
      <Box sx={{ height: "600px", width: "100%" }}>
        <DataGrid rows={products} columns={columns} components={{ Toolbar }} />
      </Box>
    </Layout>
  );
};

const getProducts = async () =>
  (
    await prisma.product.findMany({
      include: { supplier: { select: { name: true } } },
    })
  ).map((product) => ({
    ...product,
    price: product.price?.toFixed(2) ?? null,
  }));
type ProductsWithSupplier = Prisma.PromiseReturnType<typeof getProducts>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { products: await getProducts() } };
};

export default Home;