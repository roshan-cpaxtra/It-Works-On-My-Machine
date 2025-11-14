"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CreateUser = () => {
  const router = useRouter();
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "error"
  );
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    employeeId: "",
    employeeType: "FULL_TIME",
    phoneNo: "",
    departmentCode: "",
    departmentName: "",
    role: "Specialist",
    status: "ACTIVE",
  });

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
          const hasPermission = userPermission?.permission === "write";
          setHasWritePermission(hasPermission);

          // Redirect if no permission
          if (!hasPermission) {
            router.push("/users");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
        router.push("/login");
      }
    };

    checkPermissions();
  }, [router]);

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (
        !newUser.username ||
        !newUser.email ||
        !newUser.displayName ||
        !newUser.password ||
        !newUser.employeeId ||
        !newUser.phoneNo ||
        !newUser.departmentCode ||
        !newUser.departmentName
      ) {
        setToastMessage("Please fill in all required fields");
        setToastSeverity("error");
        setToastOpen(true);
        return;
      }

      // Get user info from localStorage for API headers
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userPermission = user?.permission?.find(
        (p: any) => p.resource === "user"
      );

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-permission": userPermission?.permission || "view",
          "x-user-email": user?.email || "unknown",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setToastMessage("User created successfully!");
      setToastSeverity("success");
      setToastOpen(true);

      // Redirect to users page after a short delay
      setTimeout(() => {
        router.push("/users");
      }, 1500);
    } catch (err) {
      setToastMessage(
        err instanceof Error ? err.message : "An error occurred"
      );
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!hasWritePermission) {
    return (
      <MainLayout>
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
      </MainLayout>
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

      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/users")}
            sx={{ mb: 2 }}
          >
            Back to Users
          </Button>
          <Typography variant="h4" gutterBottom>
            Create New User
          </Typography>
        </Box>

        <Paper sx={{ p: 4, maxWidth: 800 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Display Name"
                value={newUser.displayName}
                onChange={(e) =>
                  setNewUser({ ...newUser, displayName: e.target.value })
                }
                required
                placeholder="John Doe"
              />
              <TextField
                fullWidth
                label="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
                placeholder="john.doe"
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
                placeholder="john.doe@example.com"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
                placeholder="Enter password"
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Employee ID"
                value={newUser.employeeId}
                onChange={(e) =>
                  setNewUser({ ...newUser, employeeId: e.target.value })
                }
                required
                placeholder="EMP12345"
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={newUser.phoneNo}
                onChange={(e) =>
                  setNewUser({ ...newUser, phoneNo: e.target.value })
                }
                placeholder="+1234567890"
                required
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Employee Type *</InputLabel>
                <Select
                  value={newUser.employeeType}
                  label="Employee Type *"
                  onChange={(e) =>
                    setNewUser({ ...newUser, employeeType: e.target.value })
                  }
                >
                  <MenuItem value="FULL_TIME">Full Time</MenuItem>
                  <MenuItem value="PART_TIME">Part Time</MenuItem>
                  <MenuItem value="CONTRACTOR">Contractor</MenuItem>
                  <MenuItem value="INTERN">Intern</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role *"
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
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
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Department Name"
                value={newUser.departmentName}
                onChange={(e) =>
                  setNewUser({ ...newUser, departmentName: e.target.value })
                }
                required
                placeholder="Information Technology"
              />
              <TextField
                fullWidth
                label="Department Code"
                value={newUser.departmentCode}
                onChange={(e) =>
                  setNewUser({ ...newUser, departmentCode: e.target.value })
                }
                placeholder="IT"
                required
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Status *</InputLabel>
              <Select
                value={newUser.status}
                label="Status *"
                onChange={(e) =>
                  setNewUser({ ...newUser, status: e.target.value })
                }
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3 }}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                onClick={() => router.push("/users")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateUser}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <PersonAddIcon />
                }
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default CreateUser;
