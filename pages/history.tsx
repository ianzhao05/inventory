import { GetServerSideProps, NextPage } from "next";
import Layout from "../components/Layout";
import { verifySsr } from "../lib/password";
import { format, parseISO } from "date-fns";
import { Box, Typography } from "@mui/material";
import { getUpdateEvents, UpdateEventsWithProducts } from "../lib/ssrQueries";
import ProductTable from "../components/ProductTable";

const History: NextPage<{ updateEvents: UpdateEventsWithProducts }> = ({
  updateEvents,
}) => {
  return (
    <Layout title="Quantity Update History">
      {updateEvents.length > 0
        ? updateEvents.map(({ id, createdAt, products }) => (
            <Box key={id} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom component="div">
                {format(parseISO(createdAt), "eee, MMM d, y, h:mm a")}
              </Typography>
              <ProductTable products={products} showSupplier showSign />
            </Box>
          ))
        : "No records found"}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    verifySsr(context.req.cookies);
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { updateEvents: await getUpdateEvents() } };
};

export default History;
