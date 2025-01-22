import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Typography, toggleButtonClasses } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanTable from "../MarxanTable";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const USER_ROLES = ["User", "ReadOnly", "Admin"];

const UsersDialog = ({
  open,
  loading,
  changeRole,
  deleteUser,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const userState = useSelector((state) => state.user);


  useEffect(() => {
    if (!open) {
      setSearchText("");
      setSelectedUser(null);
    }
  }, [open]);

  const handleRoleChange = (user, newRole) => {
    changeRole(user, newRole);
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.user);
      setSelectedUser(null);
    }
  };

  const handleRowClick = (row) => {
    setSelectedUser(row.original);
  };

  const sortDate = (a, b) => {
    const dateA = new Date(
      a.slice(6, 8),
      a.slice(3, 5) - 1,
      a.slice(0, 2),
      a.slice(9, 11),
      a.slice(12, 14),
      a.slice(15, 17)
    );
    const dateB = new Date(
      b.slice(6, 8),
      b.slice(3, 5) - 1,
      b.slice(0, 2),
      b.slice(9, 11),
      b.slice(12, 14),
      b.slice(15, 17)
    );
    return dateA - dateB;
  };

  const closeDialog = () => dispatch(toggleButtonClasses({ dialogName: "usersDialogOpen", isOpen: false }))

  return (
    <Dialog open={open} onClose={closeDialog} maxWidth="lg" fullWidth>
      <DialogTitle>Users</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body1">Search:</Typography>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search users"
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
          />
        </Box>
        {userState.users && userState.users.length > 0 && (
          <MarxanTable
            data={userState.users}
            selectedUser={selectedUser}
            searchColumns={["user", "NAME", "EMAIL", "ROLE"]}
            searchText={searchText}
            columns={[
              { Header: "User", accessor: "user", width: 90 },
              { Header: "Name", accessor: "NAME", width: 173 },
              { Header: "Email", accessor: "EMAIL", width: 135 },
              {
                Header: "Role",
                accessor: "ROLE",
                width: 180,
                Cell: ({ row }) => (
                  row.original.user === "guest" ? (
                    <Typography>ReadOnly</Typography>
                  ) : (
                    <Select
                      value={row.original.ROLE}
                      onChange={(e) =>
                        handleRoleChange(row.original.user, e.target.value)
                      }
                      sx={{ width: 130, fontSize: "12px" }}
                    >
                      {USER_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  )
                ),
              },
              {
                Header: "Date",
                accessor: "CREATEDATE",
                width: 115,
                sortMethod: sortDate,
              },
            ]}
            onRowClick={handleRowClick}
            getTrProps={(row) => ({
              style: {
                backgroundColor:
                  row.original.user ===
                    (selectedUser && selectedUser.user)
                    ? "aliceblue"
                    : "",
              },
            })}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<FontAwesomeIcon icon={faTrashAlt} />}
          disabled={
            !selectedUser ||
            loading ||
            userState.user === selectedUser.user ||
            selectedUser.user === "guest"
          }
          onClick={handleDelete}
        >
          Delete User
        </Button>
        <Button onClick={closeDialog} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsersDialog;
