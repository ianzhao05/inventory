import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AddBox as AddBoxIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  DocumentScanner as ScanIcon,
  Factory as FactoryIcon,
  RotateLeft as ResetIcon,
} from "@mui/icons-material";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const drawerWidth = 240;

const Layout = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const titleCut = title.length > 50 ? title.slice(0, 50) + "..." : title;

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div>
          <List>
            <ListItem disablePadding>
              <Link href="/" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <InventoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Inventory" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <Link href="/manufacturers" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <FactoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manufacturers" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <Link href="/suppliers" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Suppliers" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <Link href="/history" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Update History" />
                </ListItemButton>
              </Link>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <Link href="/new" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <AddBoxIcon />
                  </ListItemIcon>
                  <ListItemText primary="New Product" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <Link href="/scan" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <ScanIcon />
                  </ListItemIcon>
                  <ListItemText primary="Update Quantities" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <Link href="/clear" passHref>
                <ListItemButton component="a">
                  <ListItemIcon>
                    <ResetIcon />
                  </ListItemIcon>
                  <ListItemText primary="Reset Quantities" />
                </ListItemButton>
              </Link>
            </ListItem>
          </List>
        </div>
        <div>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={async () => {
                  await fetch("/api/auth/logout", {
                    method: "post",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                  });
                  router.push("/login");
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </div>
      </Box>
    </>
  );

  return (
    <>
      <Head>
        <title>{titleCut}</title>
      </Head>
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {titleCut}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
