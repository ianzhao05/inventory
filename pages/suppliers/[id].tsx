import { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import { verifySsr } from "../../lib/password";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { getSupplier, SupplierWithProducts } from "../../lib/ssrQueries";
import ProductTable from "../../components/ProductTable";
import { useForm } from "react-hook-form";
import { Edit as EditIcon } from "@mui/icons-material";

const SupplierPage: NextPage<{
  supplier: SupplierWithProducts | null;
}> = ({ supplier }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>({
    defaultValues: { name: supplier?.name },
  });

  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  const [deleting, setDeleting] = useState(false);

  return (
    <Layout
      title={supplier ? `Supplier "${supplier.name}"` : "Supplier Not Found"}
    >
      {supplier ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom component="div">
              Products from This Supplier
            </Typography>
            <ProductTable
              products={supplier.products}
              button={{
                type: "link",
                icon: EditIcon,
                action: (id) => `/product/${id}`,
              }}
            />
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom component="div">
              Edit Supplier
            </Typography>
            <form
              onSubmit={handleSubmit(async (data) => {
                const response = await fetch(`/api/suppliers/${supplier.id}`, {
                  method: "PUT",
                  credentials: "include",
                  body: JSON.stringify(data),
                  headers: { "Content-Type": "application/json" },
                });
                const { field, message } = await response.json();
                if (!response.ok) {
                  if (field && message) {
                    setError(field, { message });
                  }
                } else {
                  enqueueSnackbar("Supplier updated", {
                    variant: "success",
                  });
                  router.push("/suppliers");
                }
              })}
            >
              <TextField
                {...register("name", {
                  required: true,
                  validate: (value) => !!value.trim() || "Required",
                })}
                required
                label="Name"
                error={!!errors.name}
                helperText={errors?.name?.message}
              />
              <Button
                type="submit"
                sx={{ display: "block", mt: 2 }}
                variant="contained"
                disabled={isSubmitting}
              >
                Save Supplier
              </Button>
            </form>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setOpen(true);
            }}
          >
            Delete Supplier
          </Button>
          <Dialog open={open} onClose={close}>
            <DialogContent>
              <DialogContentText>
                Delete this supplier? Products will be kept.
              </DialogContentText>
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
                      `/api/suppliers/${supplier.id}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                      }
                    );
                    setDeleting(false);
                    if (response.ok) {
                      close();
                      enqueueSnackbar("Supplier deleted", {
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
        "Supplier not found"
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
  let supplier: SupplierWithProducts | null;
  if (typeof idStr !== "string") {
    supplier = null;
  } else {
    const id = parseInt(idStr);
    if (isNaN(id)) {
      supplier = null;
    } else {
      supplier = await getSupplier(id);
    }
  }
  return {
    props: {
      supplier,
    },
  };
};

export default SupplierPage;
