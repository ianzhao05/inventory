import { GetServerSideProps, NextPage } from "next";
import Layout from "../components/Layout";
import { verifySsr } from "../lib/password";
import { format, parseISO } from "date-fns";
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/lab";
import { FileDownloadOutlined as FileDownloadIcon } from "@mui/icons-material";
import { getUpdateEvents, UpdateEventsWithProducts } from "../lib/ssrQueries";
import ProductTable from "../components/ProductTable";
import { useState } from "react";

const History: NextPage<{ updateEvents: UpdateEventsWithProducts }> = ({
  updateEvents,
}) => {
  const [value, setValue] = useState<Date | null>(new Date());
  const formatMonth = () => {
    try {
      if (value) {
        return format(value, "yyyy-MM");
      }
    } catch {}
  };
  const month = formatMonth();

  return (
    <Layout title="Quantity Update History">
      <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
        <Button
          component="a"
          href="/api/updates/export"
          download
          variant="outlined"
        >
          <FileDownloadIcon /> Export All
        </Button>
        <Divider orientation="vertical" flexItem />
        <Stack direction="row" spacing={2}>
          <DatePicker
            views={["year", "month"]}
            label="Month"
            minDate={new Date(2021, 0)}
            maxDate={new Date()}
            value={value}
            onChange={setValue}
            renderInput={(props) => (
              <TextField {...props} helperText={null} size="small" />
            )}
          />
          <Button
            component="a"
            href={`/api/updates/export?month=${month}`}
            download
            variant="outlined"
            disabled={!month}
          >
            <FileDownloadIcon /> Export Month
          </Button>
        </Stack>
      </Stack>
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
