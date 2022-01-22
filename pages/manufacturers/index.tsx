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
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  getManufacturers,
  ManufacturerWithProducts,
} from "../../lib/ssrQueries";
import ProductTable from "../../components/ProductTable";
import Link from "next/link";

const Row = ({ manufacturer }: { manufacturer: ManufacturerWithProducts }) => {
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
          {manufacturer.name}
        </TableCell>
        <TableCell>{manufacturer.products.length}</TableCell>
        <TableCell>
          <Link href={`/manufacturers/${manufacturer.id}`} passHref>
            <IconButton component="a">
              <EditIcon />
            </IconButton>
          </Link>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Products
              </Typography>
              <ProductTable products={manufacturer.products} showSupplier />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Manufacturers: NextPage<{
  manufacturers: ManufacturerWithProducts[];
}> = ({ manufacturers }) => {
  return (
    <Layout title="Manufacturers">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Manufacturer Name</TableCell>
              <TableCell>Product Count</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manufacturers.map((manufacturer) => (
              <Row key={manufacturer.id} manufacturer={manufacturer} />
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
  return { props: { manufacturers: await getManufacturers() } };
};

export default Manufacturers;
