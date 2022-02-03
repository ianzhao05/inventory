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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { DatePicker } from "@mui/lab";
import {
  FileDownloadOutlined as FileDownloadIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { getUpdateEvents, UpdateEventsWithProducts } from "../lib/ssrQueries";
import ProductTable from "../components/ProductTable";
import { useState } from "react";
import { useRouter } from "next/router";

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

  const [deleteIds, setDeleteIds] = useState<{
    productId: number;
    updateEventId: number;
  } | null>(null);
  const close = () => {
    setDeleteIds(null);
  };
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

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
        ? updateEvents.map(({ id: updateEventId, createdAt, products }) =>
            products.length > 0 ? (
              <Box key={updateEventId} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom component="div">
                  {format(parseISO(createdAt), "eee, MMM d, y, h:mm a")}
                </Typography>
                <ProductTable
                  products={products}
                  showSupplier
                  showSign
                  button={{
                    type: "button",
                    icon: RemoveIcon,
                    color: "error",
                    action: (productId) => {
                      setDeleteIds({ updateEventId, productId });
                    },
                  }}
                />
              </Box>
            ) : null
          )
        : "No records found"}
      <Dialog open={!!deleteIds} onClose={close}>
        <DialogContent>
          <DialogContentText>Delete this update?</DialogContentText>
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
                const response = await fetch("/api/updates", {
                  method: "DELETE",
                  credentials: "include",
                  body: JSON.stringify(deleteIds),
                  headers: { "Content-Type": "application/json" },
                });
                setDeleting(false);
                if (response.ok) {
                  close();
                  router.replace(router.asPath);
                }
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
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
