"use client";

import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import {
  Box,
  TextField,
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
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

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

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("error");
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    employeeId: "",
    employeeType: "FULL_TIME",
    phoneNo: "",
    departmentCode: "",
    departmentName: "",
    role: "ADMIN",
  });
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [hackAlertOpen, setHackAlertOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    // Check user permissions from localStorage
    const checkPermissions = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userPermission = user.permission?.find(
            (p: any) => p.resource === "user"
          );
          setHasWritePermission(userPermission?.permission === "write");
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
      }
    };

    checkPermissions();

    // Add global click listener to detect hack attempts
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button[data-permission-required="write"]');

      if (button && !hasWritePermission) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setHackAlertOpen(true);
      }
    };

    // Capture phase to intercept before React handlers
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [hasWritePermission]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Get token from localStorage
        const userData = localStorage.getItem('user');
        const parsedUser = userData ? JSON.parse(userData) : null;
        const token = parsedUser?.accessToken || parsedUser?.token || '';

        console.log('🔑 Retrieved token for users API:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

        // Call Next.js API route (which proxies to backend)
        const response = await fetch("/api/users", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const apiResponse = await response.json();

        // Transform API response to match the expected User type
        if (apiResponse.success && apiResponse.data) {
          // Assuming API returns users in apiResponse.data.users or apiResponse.data
          const usersData = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse.data.users || [];
          setUsers(usersData);
        } else {
          setUsers([]);
        }
      } catch (err) {
        setToastMessage(
          err instanceof Error ? err.message : "An error occurred"
        );
        setToastSeverity('error');
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

  // Filter functions for DataTable
  const filterFunctions = useMemo(() => {
    const filters: ((data: User[]) => User[])[] = [];

    // Employee type filter
    if (employeeTypeFilter !== "all") {
      filters.push((data) =>
        data.filter((user) => user.employeeType === employeeTypeFilter)
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filters.push((data) =>
        data.filter((user) => user.departmentName === departmentFilter)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filters.push((data) =>
        data.filter((user) => user.status === statusFilter)
      );
    }

    return filters;
  }, [employeeTypeFilter, departmentFilter, statusFilter]);

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

  // Column configuration for DataTable
  const columns: Column<User>[] = useMemo(
    () => [
      {
        id: "employeeId",
        label: "Employee ID",
        field: "employeeId",
        sortable: true,
        minWidth: 120,
      },
      {
        id: "displayName",
        label: "Name",
        field: "displayName",
        sortable: true,
        minWidth: 150,
      },
      {
        id: "email",
        label: "Email",
        field: "email",
        sortable: true,
        minWidth: 200,
      },
      {
        id: "employeeType",
        label: "Type",
        field: "employeeType",
        sortable: true,
        minWidth: 120,
        render: (user) => (
          <Chip
            label={user.employeeType.replace("_", " ")}
            color={getEmployeeTypeColor(user.employeeType) as any}
            size="small"
          />
        ),
      },
      {
        id: "role",
        label: "Role",
        field: "role",
        sortable: true,
        minWidth: 120,
      },
      {
        id: "departmentName",
        label: "Department",
        field: "departmentName",
        sortable: true,
        minWidth: 150,
      },
      {
        id: "phoneNo",
        label: "Phone",
        field: "phoneNo",
        minWidth: 130,
      },
      {
        id: "status",
        label: "Status",
        field: "status",
        sortable: true,
        minWidth: 100,
        render: (user) => (
          <Chip
            label={user.status}
            color={user.status === "ACTIVE" ? "success" : "default"}
            size="small"
          />
        ),
      },
    ],
    []
  );

  const handleOpenModal = (user: User) => {
    // Hack detection: verify permission before opening modal
    if (!hasWritePermission) {
      setHackAlertOpen(true);
      return;
    }
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdateLoading(true);

      // Get token from localStorage
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.accessToken || parsedUser?.token || '';

      // Call Next.js API route to update user
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: selectedUser.username,
          displayName: selectedUser.displayName,
          employeeId: selectedUser.employeeId,
          employeeType: selectedUser.employeeType,
          phoneNo: selectedUser.phoneNo,
          departmentCode: selectedUser.departmentCode,
          departmentName: selectedUser.departmentName,
          role: selectedUser.role,
        }),
      });

      const apiResponse = await response.json();

      if (!response.ok) {
        throw new Error(apiResponse.message || 'Failed to update user');
      }

      // Show success message
      setToastMessage('User updated successfully');
      setToastSeverity('success');
      setToastOpen(true);

      // Refresh user list
      const listResponse = await fetch("/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData.success && listData.data) {
          const usersData = Array.isArray(listData.data) ? listData.data : listData.data.users || [];
          setUsers(usersData);
        }
      }

      // Close modal
      handleCloseModal();
    } catch (err) {
      setToastMessage(
        err instanceof Error ? err.message : "Failed to update user"
      );
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseHackAlert = () => {
    setHackAlertOpen(false);
  };

  const handleOpenAddModal = () => {
    if (!hasWritePermission) {
      setHackAlertOpen(true);
      return;
    }
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewUser({
      username: "",
      displayName: "",
      employeeId: "",
      employeeType: "FULL_TIME",
      phoneNo: "",
      departmentCode: "",
      departmentName: "",
      role: "ADMIN",
    });
  };

  const handleCreateUser = async () => {
    try {
      setCreateLoading(true);

      // Get token from localStorage
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.accessToken || parsedUser?.token || '';

      // Call Next.js API route to create user
      const response = await fetch("/api/users", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const apiResponse = await response.json();

      if (!response.ok) {
        throw new Error(apiResponse.message || 'Failed to create user');
      }

      // Show success message
      setToastMessage('User created successfully');
      setToastSeverity('success');
      setToastOpen(true);

      // Refresh user list
      const listResponse = await fetch("/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData.success && listData.data) {
          const usersData = Array.isArray(listData.data) ? listData.data : listData.data.users || [];
          setUsers(usersData);
        }
      }

      // Close modal
      handleCloseAddModal();
    } catch (err) {
      setToastMessage(
        err instanceof Error ? err.message : "Failed to create user"
      );
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setCreateLoading(false);
    }
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
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={hackAlertOpen}
        autoHideDuration={6000}
        onClose={handleCloseHackAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseHackAlert}
          severity="warning"
          sx={{ width: "100%" }}
        >
          We caught your hack!
        </Alert>
      </Snackbar>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Users Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            disabled={!hasWritePermission}
          >
            Add User
          </Button>
        </Box>

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

        {/* Generic DataTable */}
        <DataTable
          data={users}
          columns={columns}
          keyField="id"
          searchQuery={searchQuery}
          searchFields={[
            "displayName",
            "email",
            "username",
            "employeeId",
            "role",
          ]}
          filterFunctions={filterFunctions}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          actions={(user) => (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                handleOpenModal(user);
              }}
              size="small"
              disabled={!hasWritePermission}
              startIcon={<EditIcon />}
              data-permission-required="write"
              sx={{
                pointerEvents: 'auto !important',
                cursor: !hasWritePermission ? 'not-allowed' : 'pointer'
              }}
            >
              Edit
            </Button>
          )}
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
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                </Stack>
              </Stack>
            )}

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3 }}
              justifyContent="flex-end"
            >
              <Button variant="outlined" onClick={handleCloseModal} disabled={updateLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveUser}
                disabled={updateLoading}
              >
                {updateLoading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Add User Modal */}
        <Modal
          open={openAddModal}
          onClose={handleCloseAddModal}
          aria-labelledby="add-user-modal"
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
                Add New User
              </Typography>
              <IconButton onClick={handleCloseAddModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={newUser.displayName}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      displayName: e.target.value,
                    })
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={newUser.employeeId}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      employeeId: e.target.value,
                    })
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newUser.phoneNo}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      phoneNo: e.target.value,
                    })
                  }
                  required
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Employee Type</InputLabel>
                  <Select
                    value={newUser.employeeType}
                    label="Employee Type"
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
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
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Role"
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="ELSE">Else</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Department Code"
                  value={newUser.departmentCode}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      departmentCode: e.target.value,
                    })
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Department Name"
                  value={newUser.departmentName}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      departmentName: e.target.value,
                    })
                  }
                  required
                />
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3 }}
              justifyContent="flex-end"
            >
              <Button variant="outlined" onClick={handleCloseAddModal} disabled={createLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateUser}
                disabled={createLoading}
              >
                {createLoading ? <CircularProgress size={24} /> : 'Create User'}
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </MainLayout>
  );
};

export default Users;
