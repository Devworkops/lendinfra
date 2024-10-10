import * as React from "react";
import { RoleOptions, SignUpArgs, UserType } from "../../interfaces/IUser";
import AddUser from "./AddUser";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import CrudMaterialTable, {
  ColumnData,
  TableCell,
} from "../common/CrudMaterialTable";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { TableCellRenderer } from "react-virtualized";
import palleteNew from "../../config/theme/palette";
import {
  MenuItem,
  Select,
  Box,
  Button,
  Paper,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
interface ParentCompProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createRow: (item: { [key: string]: any }) => void;
}

const ParentComp: React.FC<ParentCompProps> = (props) => {
  const { open, setOpen, createRow } = props;
  return (
    <AddUser open={open} setOpen={setOpen} createRow={createRow}></AddUser>
  );
};
export default function ManageUser() {
  const { auth } = useAuth();

  const [open, setOpen] = React.useState(false);

  const [getUser, createUser, updateUser, deleteUser] = useApi<UserType>();

  const [users, setUsers] = React.useState<UserType[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getUser(`api/user/all/${auth?.companyId}`).then((response) => {
      if (response.data.errors) {
        enqueueSnackbar(response.data.errors[0].message, {
          variant: "error",
        });
      } else setUsers(response.data);
    });
  }, []);

  const handleEditCell = (e: any, rowId: string, dataKey: string) => {
    const newUsers = users.map((row: UserType) =>
      row.id === rowId ? { ...row, [dataKey]: e.target.value } : { ...row }
    );
    setUsers(newUsers);
  };

  const statusCellRenderer: TableCellRenderer = ({ cellData }) => {
    return (
      <TableCell isOpen={false}>
        {cellData ? (
          <Button
            size="small"
            sx={{ color: palleteNew.success.main, fontWeight: 800 }}
          >
            Active
          </Button>
        ) : (
          <Button
            size="small"
            sx={{ color: palleteNew.error.main, fontWeight: 800 }}
          >
            InActive
          </Button>
        )}
      </TableCell>
    );
  };
  const userRolesCellRenderer: TableCellRenderer = ({
    rowData,
    cellData,
    dataKey,
  }) => {
    return (
      <TableCell isOpen={false}>
        {auth?.roles === RoleOptions.admin && rowData.isEdit ? (
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            variant="standard"
            value={cellData}
            label="roles"
            onChange={(e) => handleEditCell(e, rowData.id, dataKey)}
          >
            <MenuItem value={RoleOptions.admin}>Admin</MenuItem>
            <MenuItem value={RoleOptions.operator}>Operator</MenuItem>
          </Select>
        ) : (
          cellData
        )}
      </TableCell>
    );
  };
  const columns: ColumnData[] = [
    {
      dataKey: "firstName",
      label: "First Name",
      width: 200,
    },
    {
      dataKey: "lastName",
      label: "Last Name",
      width: 200,
    },
    {
      dataKey: "email",
      label: "Email",
      width: 280,
    },
    {
      dataKey: "roles",
      label: "Role",
      width: 150,
      cellRenderer: userRolesCellRenderer,
    },
    {
      dataKey: "isActive",
      label: "Status",
      width: 180,
      cellRenderer: statusCellRenderer,
    },
    {
      dataKey: "disableAndEditAction",
      label: "Actions",
      width: 130,
    },
  ];

  // Create new User
  const createNewUser = async (item: { [key: string]: any }) => {
    const data = { ...item } as SignUpArgs;
    const body = {
      id: "",
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      username: data.firstName,
      isActive: true,
      roles: data.roles,
      company: auth?.companyId,
      timeZone: "",
    } as UserType;
    const result = await createUser("api/user/new?isResetPwd=true", body);
    if (result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: "error",
      });
      return;
    } else {
      const x = await getUser(`api/user/all/${auth?.companyId}`).then(
        (response) => {
          setUsers(response.data);
          setOpen(false);
          enqueueSnackbar("Created New User Successfully", {
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
        }
      );
    }
  };

  // Delete Contact
  const deleteUserRecord = async (item: { [key: string]: any }) => {
    const result = await deleteUser("api/user", item.id);

    if (result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: "error",
      });
      return;
    } else {
      const x = await getUser(`api/user/all/${auth?.companyId}`).then(
        (response) => {
          setUsers(response.data);
          setOpen(false);
        }
      );
      enqueueSnackbar("Deleted Successfully", {
        variant: "success",
      });
    }
  };

  // Edit Contact
  const editUser = async (item: { [key: string]: any }) => {
    const body = { ...item } as UserType;
    const userToUpdate = {
      id: body.id,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      roles: body.roles,
      isActive: body.isActive,
      company: auth?.companyId,
      currentUser: auth?.roles,
    };
    const result = await updateUser(`api/user/${item.id}`, userToUpdate);
    if (result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: "error",
      });
      const x = await getUser(`api/user/all/${auth?.companyId}`).then(
        (response) => {
          setUsers(response.data);
          setOpen(false);
        }
      );
      return;
    } else {
      enqueueSnackbar("Updated Successfully", {
        variant: "success",
      });
      return;
    }
  };

  return (
    <>
      <Paper sx={{ m: "auto", overflow: "hidden" }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            position="static"
            color="inherit"
            sx={{ boxShadow: "none", m: 1, ml: 0, paddingBottom: "10px" }}
          >
            <Toolbar sx={{ paddingLeft: "12px !important" }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Users
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ padding: "4px 60px", borderRadius: "40px" }}
                onClick={() => setOpen(true)}
              >
                Add User
              </Button>
            </Toolbar>
          </AppBar>

          {auth?.companyId != null ? (
            <CrudMaterialTable
              key={users.length}
              tableRows={users}
              setTableRows={setUsers}
              columns={columns}
              setOpen={setOpen}
              deleteRow={deleteUserRecord}
              editRow={editUser}
              createButtonComp={
                <ParentComp
                  open={open}
                  setOpen={setOpen}
                  createRow={createNewUser}
                />
              }
            ></CrudMaterialTable>
          ) : (
            <>Add Company</>
          )}
        </Box>
      </Paper>
    </>
  );
}
