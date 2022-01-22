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
import {
  getManufacturer,
  ManufacturerWithProducts,
} from "../../lib/ssrQueries";
import ProductTable from "../../components/ProductTable";
import { useForm } from "react-hook-form";

const ManufacturerPage: NextPage<{
  manufacturer: ManufacturerWithProducts | null;
}> = ({ manufacturer }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>({
    defaultValues: { name: manufacturer?.name },
  });

  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  const [deleting, setDeleting] = useState(false);

  return (
    <Layout
      title={
        manufacturer
          ? `Manufacturer "${manufacturer.name}"`
          : "Manufacturer Not Found"
      }
    >
      {manufacturer ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom component="div">
              Products from This Manufacturer
            </Typography>
            <ProductTable products={manufacturer.products} />
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom component="div">
              Edit Manufacturer
            </Typography>
            <form
              onSubmit={handleSubmit(async (data) => {
                const response = await fetch(
                  `/api/manufacturers/${manufacturer.id}`,
                  {
                    method: "PUT",
                    credentials: "include",
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" },
                  }
                );
                const { field, message } = await response.json();
                if (!response.ok) {
                  if (field && message) {
                    setError(field, { message });
                  }
                } else {
                  enqueueSnackbar("Manufacturer updated", {
                    variant: "success",
                  });
                  router.push("/manufacturers");
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
                Save Manufacturer
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
            Delete Manufacturer
          </Button>
          <Dialog open={open} onClose={close}>
            <DialogContent>
              <DialogContentText>
                Delete this manufacturer? Products will be kept.
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
                      `/api/manufacturers/${manufacturer.id}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                      }
                    );
                    setDeleting(false);
                    if (response.ok) {
                      close();
                      enqueueSnackbar("Manufacturer deleted", {
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
        "Manufacturer not found"
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
  let manufacturer: ManufacturerWithProducts | null;
  if (typeof idStr !== "string") {
    manufacturer = null;
  } else {
    const id = parseInt(idStr);
    if (isNaN(id)) {
      manufacturer = null;
    } else {
      manufacturer = await getManufacturer(id);
    }
  }
  return {
    props: {
      manufacturer,
    },
  };
};

export default ManufacturerPage;
