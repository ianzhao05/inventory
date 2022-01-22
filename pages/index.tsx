import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import Layout from "../components/Layout";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  gridClasses,
} from "@mui/x-data-grid";
import { verifySsr } from "../lib/password";
import { Box, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import formatPrice from "../lib/formatPrice";
import { getProducts, Product } from "../lib/ssrQueries";

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
  {
    field: "manufacturer",
    headerName: "Manufacturer",
    hide: true,
    valueGetter: (params) => params.row.supplier?.name,
  },
  {
    field: "description",
    headerName: "Description",
    hide: true,
    valueFormatter: (params) =>
      params.value && (params.value as string).replace(/\n/g, "\\n"),
  },
  {
    field: "edit",
    headerName: "Edit",
    sortable: false,
    flex: 0.5,
    minWidth: 50,
    renderCell: ({ id }) => (
      <Link href={`/product/${id}`} passHref>
        <IconButton component="a">
          <EditIcon />
        </IconButton>
      </Link>
    ),
  },
];

const exportFields: (keyof Product)[] = [
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

const Home: NextPage<{ products: Product[] }> = ({ products }) => {
  return (
    <Layout title="Inventory">
      <Box sx={{ height: "600px", width: "100%" }}>
        <DataGrid
          rows={products}
          columns={columns}
          components={{ Toolbar }}
          hideFooterSelectedRowCount
          disableColumnSelector
          disableDensitySelector
          disableSelectionOnClick
        />
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { products: await getProducts() } };
};

export default Home;
