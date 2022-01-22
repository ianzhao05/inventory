import type { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import { verifySsr } from "../../lib/password";
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
import { getSuppliers, SupplierWithProducts } from "../../lib/ssrQueries";
import ProductTable from "../../components/ProductTable";

const Row = ({ supplier }: { supplier: SupplierWithProducts }) => {
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
              <ProductTable products={supplier.products} showManufacturer />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Suppliers: NextPage<{ suppliers: SupplierWithProducts[] }> = ({
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { suppliers: await getSuppliers() } };
};

export default Suppliers;
