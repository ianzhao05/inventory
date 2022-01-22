import { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useSnackbar } from "notistack";
import { Button } from "@mui/material";
import { useState } from "react";

const Clear: NextPage = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  return (
    <Layout title="Reset Quantities">
      <p>Reset all product quantities to 0? This action cannot be undone.</p>
      <Button
        variant="contained"
        size="large"
        color="error"
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true);
          const response = await fetch("/api/products/clear", {
            method: "POST",
            credentials: "include",
          });
          setSubmitting(false);
          if (response.ok) {
            close();
            enqueueSnackbar("Product quantities reset", {
              variant: "success",
            });
            router.push("/");
          }
        }}
      >
        Reset Quantities
      </Button>
    </Layout>
  );
};

export default Clear;
