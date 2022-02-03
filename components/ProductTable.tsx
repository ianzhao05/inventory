import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { Product } from "../lib/ssrQueries";
import formatPrice from "../lib/formatPrice";
import Link from "next/link";

const ProductTable = ({
  products,
  showManufacturer = false,
  showSupplier = false,
  showSign = false,
  button,
}: {
  products: (Omit<
    Product,
    | "manufacturer"
    | "supplier"
    | "manufacturerId"
    | "supplierId"
    | "description"
  > &
    Partial<Pick<Product, "manufacturer" | "supplier">>)[];
  showManufacturer?: boolean;
  showSupplier?: boolean;
  showSign?: boolean;
  button?: {
    icon: SvgIconComponent;
    color?:
      | "inherit"
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning"
      | undefined;
  } & (
    | { type: "link"; action: (id: number) => string }
    | { type: "button"; action: (id: number) => void }
  );
}) => {
  const Icon = button?.icon;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width="30%">Name</TableCell>
          <TableCell width="20%">Code</TableCell>
          {showManufacturer && <TableCell width="20%">Manufacturer</TableCell>}
          {showSupplier && <TableCell width="20%">Supplier</TableCell>}
          <TableCell align="right" width="15%">
            Price
          </TableCell>
          <TableCell align="right" width="15%">
            Quantity
          </TableCell>
          {button && <TableCell />}
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell component="th" scope="row">
              {product.name}
            </TableCell>
            <TableCell>{product.code}</TableCell>
            {showManufacturer && (
              <TableCell>{product.manufacturer?.name}</TableCell>
            )}
            {showSupplier && <TableCell>{product.supplier?.name}</TableCell>}
            <TableCell align="right">
              {product.price && "$" + formatPrice(product.price)}
            </TableCell>
            <TableCell align="right">
              {(!showSign || product.quantity <= 0 ? "" : "+") +
                product.quantity}
            </TableCell>
            {button && Icon && (
              <TableCell>
                {button.type === "link" ? (
                  <Link href={button.action(product.id)} passHref>
                    <IconButton size="small" color={button.color} component="a">
                      <Icon />
                    </IconButton>
                  </Link>
                ) : (
                  <IconButton
                    size="small"
                    color={button.color}
                    onClick={() => button.action(product.id)}
                  >
                    <Icon />
                  </IconButton>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
