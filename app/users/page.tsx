"use client";

import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Stack,
  IconButton,
  Modal,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

type User = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  employeeId: string;
  employeeType: string;
  phoneNo: string;
  departmentCode: string;
  departmentName: string;
  status: string;
  role: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

type SortField = keyof User;
type SortOrder = "asc" | "desc";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("displayName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setToastMessage(err instanceof Error ? err.message : "An error occurred");
        setToastOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  // Get unique values for filters
  const employeeTypes = useMemo(
    () => Array.from(new Set(users.map((user) => user.employeeType))),
    [users]
  );
  const departments = useMemo(
    () => Array.from(new Set(users.map((user) => user.departmentName))),
    [users]
  );

  // Filter and sort logic
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEmployeeType =
        employeeTypeFilter === "all" ||
        user.employeeType === employeeTypeFilter;

      const matchesDepartment =
        departmentFilter === "all" || user.departmentName === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return (
        matchesSearch &&
        matchesEmployeeType &&
        matchesDepartment &&
        matchesStatus
      );
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    users,
    searchQuery,
    employeeTypeFilter,
    departmentFilter,
    statusFilter,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = filteredAndSortedUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getEmployeeTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "success";
      case "PART_TIME":
        return "info";
      case "CONTRACTOR":
        return "warning";
      case "INTERN":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = () => {
    // Handle save logic here
    console.log("Saving user:", selectedUser);
    handleCloseModal();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainLayout>
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseToast} severity="error" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>

      {/* Filters and Search */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Search"
          placeholder="Search by name, email, username, employee ID, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
        />

        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Employee Type</InputLabel>
            <Select
              value={employeeTypeFilter}
              label="Employee Type"
              onChange={(e) => setEmployeeTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              {employeeTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
      </Typography>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === "employeeId"}
                  direction={sortField === "employeeId" ? sortOrder : "asc"}
                  onClick={() => handleSort("employeeId")}
                >
                  Employee ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "displayName"}
                  direction={sortField === "displayName" ? sortOrder : "asc"}
                  onClick={() => handleSort("displayName")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "email"}
                  direction={sortField === "email" ? sortOrder : "asc"}
                  onClick={() => handleSort("email")}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "employeeType"}
                  direction={sortField === "employeeType" ? sortOrder : "asc"}
                  onClick={() => handleSort("employeeType")}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "role"}
                  direction={sortField === "role" ? sortOrder : "asc"}
                  onClick={() => handleSort("role")}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "departmentName"}
                  direction={sortField === "departmentName" ? sortOrder : "asc"}
                  onClick={() => handleSort("departmentName")}
                >
                  Department
                </TableSortLabel>
              </TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "status"}
                  direction={sortField === "status" ? sortOrder : "asc"}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.employeeId}</TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.employeeType.replace("_", " ")}
                    color={getEmployeeTypeColor(user.employeeType) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.departmentName}</TableCell>
                <TableCell>{user.phoneNo}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === "ACTIVE" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenModal(user)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredAndSortedUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit User Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="edit-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600 },
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h2">
              Edit User
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={selectedUser.displayName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      displayName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      username: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={selectedUser.employeeId}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      employeeId: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={selectedUser.phoneNo}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phoneNo: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee Type</InputLabel>
                  <Select
                    value={selectedUser.employeeType}
                    label="Employee Type"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        employeeType: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="FULL_TIME">Full Time</MenuItem>
                    <MenuItem value="PART_TIME">Part Time</MenuItem>
                    <MenuItem value="CONTRACTOR">Contractor</MenuItem>
                    <MenuItem value="INTERN">Intern</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedUser.role}
                    label="Role"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        role: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Developer">Developer</MenuItem>
                    <MenuItem value="Designer">Designer</MenuItem>
                    <MenuItem value="Analyst">Analyst</MenuItem>
                    <MenuItem value="Team Lead">Team Lead</MenuItem>
                    <MenuItem value="Specialist">Specialist</MenuItem>
                    <MenuItem value="Coordinator">Coordinator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department Name"
                  value={selectedUser.departmentName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      departmentName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department Code"
                  value={selectedUser.departmentCode}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      departmentCode: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedUser.status}
                    label="Status"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        status: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
            justifyContent="flex-end"
          >
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveUser}>
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
    </MainLayout>
  );
};

export default Users;
