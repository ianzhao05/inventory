import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

const Login: NextPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ password: string }>({
    defaultValues: { password: "" },
  });
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Paper elevation={6}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
              Inventory
            </Typography>
            <form
              onSubmit={handleSubmit(async ({ password }) => {
                try {
                  const res = await fetch("/api/auth/login", {
                    method: "post",
                    credentials: "include",
                    body: JSON.stringify({ password }),
                    headers: { "Content-Type": "application/json" },
                  });
                  if (res.status === 200) {
                    router.push("/");
                  } else {
                    const { message } = await res.json();
                    setError("password", { message });
                  }
                } catch {
                  setError("password", { message: "An error has occured" });
                }
              })}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <TextField
                {...register("password", { required: true })}
                required
                label="Password"
                type="password"
                error={!!errors.password}
                helperText={errors?.password?.message}
              />
              <Button type="submit" sx={{ mt: 2 }} variant="contained">
                Submit
              </Button>
            </form>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Login;
