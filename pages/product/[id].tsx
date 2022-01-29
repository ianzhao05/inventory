import { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import ProductForm, { ProductFormValues } from "../../components/ProductForm";
import { verifySsr } from "../../lib/password";
import prisma from "../../lib/prisma";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import { FileDownloadOutlined as FileDownloadIcon } from "@mui/icons-material";
import { useState } from "react";
import {
  getProduct,
  Product,
  ProductWithUpdateEvents,
} from "../../lib/ssrQueries";
import { format, parseISO } from "date-fns";

const allFieldsString = ({
  code,
  name,
  price,
  manufacturer,
  description,
  supplier,
}: NonNullable<Product>): ProductFormValues => ({
  code,
  name,
  price: price ?? "",
  description: description ?? "",
  manufacturer: manufacturer?.name ?? "",
  supplier: supplier?.name ?? "",
});

const ProductPage: NextPage<{
  product: ProductWithUpdateEvents | null;
  manufacturers: string[];
  suppliers: string[];
}> = ({ product, manufacturers, suppliers }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  const [deleting, setDeleting] = useState(false);

  return (
    <Layout title={product ? `Product "${product.name}"` : "Product Not Found"}>
      {product ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom component="div">
              Quantity Updates
            </Typography>
            <Button
              component="a"
              href={`/api/updates/export?productId=${product.id}`}
              download
              variant="outlined"
              size="small"
            >
              <FileDownloadIcon /> Export
            </Button>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="75%">Time</TableCell>
                  <TableCell width="25%" align="right">
                    Change
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.updateEvents.map(({ id, createdAt, quantity }) => (
                  <TableRow key={id}>
                    <TableCell>
                      {format(parseISO(createdAt), "eee, MMM d, y, h:mm a")}
                    </TableCell>
                    <TableCell align="right">
                      {(quantity <= 0 ? "" : "+") + quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="div" sx={{ mb: 2 }}>
              Edit Product
            </Typography>
            <ProductForm
              defaultValues={allFieldsString(product)}
              manufacturerOptions={manufacturers}
              supplierOptions={suppliers}
              onSubmit={(setError) => async (data) => {
                const body = Object.fromEntries(
                  Object.entries(data).map(([key, value]) => [
                    key,
                    value === "" ? null : value,
                  ])
                );
                const response = await fetch(`/api/products/${product.id}`, {
                  method: "PUT",
                  credentials: "include",
                  body: JSON.stringify(body),
                  headers: { "Content-Type": "application/json" },
                });
                const { field, message } = await response.json();
                if (!response.ok) {
                  if (field && message) {
                    setError(field, { message });
                  }
                } else {
                  enqueueSnackbar("Product updated", { variant: "success" });
                  router.push("/");
                }
              }}
            />
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setOpen(true);
            }}
          >
            Delete Product
          </Button>
          <Dialog open={open} onClose={close}>
            <DialogContent>
              <DialogContentText>Delete this product?</DialogContentText>
              <DialogActions>
                <Button onClick={close} disabled={deleting}>
                  No
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    const response = await fetch(
                      `/api/products/${product.id}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                      }
                    );
                    setDeleting(false);
                    if (response.ok) {
                      close();
                      enqueueSnackbar("Product deleted", {
                        variant: "success",
                      });
                      router.push("/");
                    }
                  }}
                >
                  Yes
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        "Product not found"
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const { id: idStr } = context.query;
  let product: ProductWithUpdateEvents | null;
  if (typeof idStr !== "string") {
    product = null;
  } else {
    const id = parseInt(idStr);
    if (isNaN(id)) {
      product = null;
    } else {
      product = await getProduct(id);
    }
  }
  return {
    props: {
      product,
      manufacturers: product
        ? (await prisma.manufacturer.findMany()).map((s) => s.name)
        : [],
      suppliers: product
        ? (await prisma.supplier.findMany()).map((s) => s.name)
        : [],
    },
  };
};

export default ProductPage;
