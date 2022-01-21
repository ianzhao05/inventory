import {
  Button,
  InputAdornment,
  TextField,
  Grid,
  Stack,
  Autocomplete,
} from "@mui/material";
import NumberFormat from "react-number-format";
import { forwardRef } from "react";
import { Controller, useForm, UseFormSetError } from "react-hook-form";

export type ProductFormValues = {
  code: string;
  name: string;
  price: string;
  description: string;
  manufacturer: string;
  supplier: string;
};

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
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues,
  });
  const supplier = watch("supplier");
  const PriceTextField = forwardRef<HTMLInputElement>((props, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        label="Price"
        error={!!errors.price}
        helperText={errors?.price?.message}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        {...props}
      />
    );
  });
  PriceTextField.displayName = "PriceTextField";

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
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <NumberFormat
                {...field}
                customInput={PriceTextField}
                thousandSeparator
                isNumericString
                decimalScale={2}
                allowNegative={false}
                isAllowed={({ floatValue }) =>
                  floatValue === undefined || floatValue < 10000
                }
              />
            )}
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
              onChange={(e, data) => {
                setValue("supplier", data ?? "");
              }}
              defaultValue={defaultValues.supplier || undefined}
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
          <Button
            type="submit"
            sx={{ mt: 2 }}
            variant="contained"
            disabled={isSubmitting}
          >
            Save Product
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm;
