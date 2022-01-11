import { GetServerSideProps, NextPage } from "next";
import { verifySsr } from "../lib/password";
import Layout from "../components/Layout";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Box,
  Button,
  debounce,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import React, { useEffect, useMemo, useState } from "react";
import { Product, Supplier } from "@prisma/client";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";

type ScanFormValues = {
  products: { code: string; quantity: number; action: "add" | "remove" }[];
};

type ProductCache = Record<
  string,
  (Product & { price: string | null; supplier: Supplier | null }) | null
>;

const ProductDetails = ({
  productCache,
  control,
  index,
}: {
  productCache: ProductCache;
  control: Control<ScanFormValues>;
  index: number;
}) => {
  const code = useWatch({ control, name: `products.${index}.code` });
  const product = productCache[code];
  return (
    <Typography
      component="div"
      variant="body2"
      mt={1}
      color={
        product === null
          ? "error.main"
          : product !== undefined
          ? "text.primary"
          : "text.secondary"
      }
    >
      {code === "" ? (
        "Scan or enter product code"
      ) : product === undefined ? (
        "Loading..."
      ) : product === null ? (
        "Product not found"
      ) : (
        <Stack direction="row" spacing={2}>
          <div>
            <span style={{ fontWeight: "bold" }}>Name:</span> {product.name}
          </div>
          {product.supplier && (
            <div>
              <span style={{ fontWeight: "bold" }}>Supplier:</span>{" "}
              {product.supplier.name}
            </div>
          )}
          <div>
            <span style={{ fontWeight: "bold" }}>Quantity</span>:{" "}
            {product.quantity}
          </div>
        </Stack>
      )}
    </Typography>
  );
};

const Scan: NextPage = () => {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ScanFormValues>({
    defaultValues: { products: [{ code: "", action: "add", quantity: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });
  const [productCache, setProductCache] = useState<ProductCache>({});
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    if (code !== "" && !(code in productCache)) {
      const response = await fetch(
        `/api/products?code=${encodeURIComponent(code)}`,
        { credentials: "include" }
      );
      const products = await response.json();
      if (response.ok) {
        setProductCache({ ...productCache, [code]: products[0] ?? null });
      }
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(() => debounce(search, 300), [productCache]);
  useEffect(() => {
    return () => {
      debouncedSearch.clear();
    };
  }, [debouncedSearch]);

  return (
    <Layout title="Update Product Quantities">
      <form
        onSubmit={handleSubmit(async ({ products }) => {
          const body = products.map(({ code, quantity, action }) => ({
            id: productCache[code]?.id,
            quantity: action === "add" ? quantity : -quantity,
          }));
          const response = await fetch("/api/products/scan", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          });
          const { index, message } = await response.json();
          if (!response.ok) {
            if (index !== undefined && message !== undefined) {
              setError(`products.${index as number}.quantity`, { message });
            }
          } else {
            enqueueSnackbar("Product quantities updated", {
              variant: "success",
            });
            router.push("/history");
          }
        })}
      >
        {fields.map((field, index, { length }) => (
          <Paper key={field.id} sx={{ p: 2, mb: 3, display: "flex" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: { md: "space-between" },
                }}
              >
                <Box sx={{ flexBasis: { md: "400px" }, mr: { md: 2 } }}>
                  <TextField
                    {...register(`products.${index}.code`, {
                      required: true,
                      onChange: debouncedSearch,
                      validate: { validCode: (code) => !!productCache[code] },
                    })}
                    fullWidth
                    label={`Product Code ${index + 1}`}
                    error={!!errors.products?.[index]?.code}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  <FormControl
                    sx={{
                      mr: 2,
                      flexBasis: { md: "140px" },
                      my: { xs: 2, md: 0 },
                    }}
                    fullWidth
                  >
                    <InputLabel id={`action-${index}-label`}>Action</InputLabel>
                    <Select
                      {...register(`products.${index}.action`)}
                      labelId={`action-${index}-label`}
                      label="action"
                      defaultValue="add"
                    >
                      <MenuItem value="add">Add</MenuItem>
                      <MenuItem value="remove">Remove</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    {...register(`products.${index}.quantity`, {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Enter a positive integer",
                      },
                      min: { value: 1, message: "Enter a positive integer" },
                      validate: {
                        isNumber: (x) =>
                          Number.isInteger(x) || "Enter a positive integer",
                      },
                    })}
                    label="Quantity"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ flexBasis: { md: "200px" } }}
                    error={!!errors.products?.[index]?.quantity}
                    helperText={errors.products?.[index]?.quantity?.message}
                  />
                </Box>
              </Box>
              <ProductDetails
                productCache={productCache}
                control={control}
                index={index}
              />
            </Box>
            {length > 1 && (
              <Box sx={{ mt: -1, mr: -1, ml: 1 }}>
                <IconButton
                  onClick={() => {
                    remove(index);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            )}
          </Paper>
        ))}
        <Button
          onClick={() => {
            append({ code: "", action: "add", quantity: 0 });
          }}
          variant="outlined"
          sx={{ display: "block", mb: 4 }}
        >
          Add Product
        </Button>
        <Button type="submit" sx={{ display: "block" }} variant="contained">
          Update All Products
        </Button>
      </form>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

export default Scan;
