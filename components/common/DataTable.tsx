"use client";

import React, { useState, useMemo, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Box,
  Typography,
} from "@mui/material";

// Generic type for data items
export type DataItem = Record<string, any>;

// Column configuration
export interface Column<T extends DataItem> {
  id: string;
  label: string;
  field?: keyof T;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  minWidth?: number;
  render?: (row: T) => ReactNode;
}

// Filter configuration
export interface Filter<T extends DataItem> {
  id: string;
  label: string;
  apply: (data: T[], value: any) => T[];
}

// DataTable props
export interface DataTableProps<T extends DataItem> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  filters?: ReactNode;
  searchQuery?: string;
  searchFields?: (keyof T)[];
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  filterFunctions?: ((data: T[]) => T[])[];
}

export function DataTable<T extends DataItem>({
  data,
  columns,
  keyField,
  title,
  filters,
  searchQuery = "",
  searchFields = [],
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  onRowClick,
  actions,
  filterFunctions = [],
}: DataTableProps<T>) {
  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof T | "">("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // Handle sort
  const handleSort = (columnId: keyof T) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  // Apply search filter
  const searchFilteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data;

    return data.filter((row) =>
      searchFields.some((field) => {
        const value = row[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, searchFields]);

  // Apply custom filter functions
  const customFilteredData = useMemo(() => {
    return filterFunctions.reduce(
      (filtered, filterFn) => filterFn(filtered),
      searchFilteredData
    );
  }, [searchFilteredData, filterFunctions]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!orderBy) return customFilteredData;

    return [...customFilteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === "asc" ? 1 : -1;
      if (bValue == null) return order === "asc" ? -1 : 1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [customFilteredData, orderBy, order]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {title && (
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
      )}

      {filters && <Box sx={{ mb: 3 }}>{filters}</Box>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable && column.field ? (
                    <TableSortLabel
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : "asc"}
                      onClick={() => handleSort(column.field as keyof T)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  align="center"
                >
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={String(row[keyField])}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"}>
                      {column.render
                        ? column.render(row)
                        : column.field
                        ? String(row[column.field] ?? "")
                        : ""}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
