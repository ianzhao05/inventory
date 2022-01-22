import { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import ProductForm, { ProductFormValues } from "../../components/ProductForm";
import { verifySsr } from "../../lib/password";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { useState } from "react";

const allFieldsString = ({
  code,
  name,
  price,
  manufacturer,
  description,
  supplier,
}: Exclude<ProductWithSupplier, null>): ProductFormValues => ({
  code,
  name,
  price: price ?? "",
  description: description ?? "",
  manufacturer: manufacturer?.name ?? "",
  supplier: supplier?.name ?? "",
});

const Product: NextPage<{
  product: ProductWithSupplier;
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
    <Layout title="Edit Product">
      {product ? (
        <>
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
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 4 }}
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

const getProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      manufacturer: { select: { name: true } },
      supplier: { select: { name: true } },
    },
  });
  return (
    product && {
      ...product,
      price: product.price?.toFixed(2) ?? null,
    }
  );
};
type ProductWithSupplier = Prisma.PromiseReturnType<typeof getProduct>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const { id: idStr } = context.query;
  let product: ProductWithSupplier;
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

export default Product;
