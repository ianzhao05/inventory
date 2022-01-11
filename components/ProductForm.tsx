import {
  Button,
  InputAdornment,
  TextField,
  Grid,
  Stack,
  Autocomplete,
} from "@mui/material";
import NumberFormat, { InputAttributes } from "react-number-format";
import { forwardRef } from "react";
import { useForm, UseFormSetError } from "react-hook-form";

export type ProductFormValues = {
  code: string;
  name: string;
  price: string;
  description: string;
  manufacturer: string;
  supplier: string;
};

const NumberFormatCustom = forwardRef<
  NumberFormat<InputAttributes>,
  {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
  }
>(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      decimalScale={2}
      allowNegative={false}
    />
  );
});

const ProductForm = ({
  defaultValues,
  supplierOptions,
  onSubmit,
}: {
  defaultValues: ProductFormValues;
  supplierOptions: string[];
  onSubmit: (
    setError: UseFormSetError<ProductFormValues>
  ) => (values: ProductFormValues) => void;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues,
  });
  const supplier = watch("supplier");
  return (
    <form onSubmit={handleSubmit(onSubmit(setError))}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register("code", { required: true })}
            required
            fullWidth
            label="Product Code"
            error={!!errors.code}
            helperText={errors?.code?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register("name", { required: true })}
            required
            fullWidth
            label="Product Name"
            error={!!errors.name}
            helperText={errors?.name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register("price", {
              validate: (v) =>
                v.split(".")[0].replace(/,/g, "").length <= 4 ||
                "Max price $9,999.99",
            })}
            fullWidth
            label="Price"
            error={!!errors.price}
            helperText={errors?.price?.message}
            InputProps={{
              inputComponent: NumberFormatCustom as any,
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register("description")}
            fullWidth
            multiline
            rows={6}
            label="Description"
            error={!!errors.description}
            helperText={errors?.description?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={2}>
            <TextField
              {...register("manufacturer")}
              fullWidth
              label="Manufacturer"
              error={!!errors.manufacturer}
              helperText={errors?.manufacturer?.message}
            />
            <Autocomplete
              options={supplierOptions}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...register("supplier")}
                  {...params}
                  fullWidth
                  label="Supplier"
                  error={!!errors.supplier}
                  helperText={
                    errors?.supplier?.message ??
                    (supplierOptions.includes(supplier) || supplier === ""
                      ? undefined
                      : `A new supplier "${supplier}" will be created`)
                  }
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" sx={{ mt: 2 }} variant="contained">
            Save Product
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm;
