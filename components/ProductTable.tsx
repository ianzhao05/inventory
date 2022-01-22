import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Product } from "../lib/ssrQueries";
import formatPrice from "../lib/formatPrice";

const ProductTable = ({
  products,
  showManufacturer = false,
  showSupplier = false,
  showSign = false,
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
}) => (
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
            {(!showSign || product.quantity <= 0 ? "" : "+") + product.quantity}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default ProductTable;
