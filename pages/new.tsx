import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ProductForm, { ProductFormValues } from "../components/ProductForm";
import { verifySsr } from "../lib/password";
import prisma from "../lib/prisma";
import { useSnackbar } from "notistack";

const defaultValues: ProductFormValues = {
  code: "",
  name: "",
  price: "",
  description: "",
  manufacturer: "",
  supplier: "",
};

const New: NextPage<{ suppliers: string[] }> = ({ suppliers }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Layout title="Initialize New Product">
      <ProductForm
        defaultValues={defaultValues}
        supplierOptions={suppliers}
        onSubmit={(setError) => async (data) => {
          const body = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              value === "" ? null : value,
            ])
          );
          const response = await fetch("/api/products", {
            method: "POST",
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
            enqueueSnackbar("Product created", { variant: "success" });
            router.push("/");
          }
        }}
      />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const suppliers = await prisma.supplier.findMany();
  return { props: { suppliers: suppliers.map((s) => s.name) } };
};

export default New;
