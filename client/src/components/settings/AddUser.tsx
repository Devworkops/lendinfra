import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Grid,
  Typography,
  Toolbar,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { RoleOptions, SignUpArgs } from "../../interfaces/IUser";
import {
  FormContainer,
  TextFieldElement,
  AutocompleteElement,
  SelectElement,
} from "react-hook-form-mui";
import { useForm } from "react-hook-form";
import useFormHelper from "../../hooks/useFormHelper";
import CloseIcon from "@mui/icons-material/Close";
import palleteNew from "../../config/theme/palette";

export default function AddUser(props: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createRow: (item: { [key: string]: any }) => void;
}) {
  const formContext = useForm<SignUpArgs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "password",
      roles: [RoleOptions.admin],
    },
  });

  const [parseError] = useFormHelper();

  const onSubmit = (data: SignUpArgs) => {
    props.createRow(data);
  };

  return (
    <>
      <Dialog open={props.open}>
        <DialogTitle
          sx={{ padding: "8px 0px", color: palleteNew.primary.main }}
        >
          <Toolbar sx={{ padding: "0px" }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Add User
            </Typography>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => props.setOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxWidth: "500px", minWidth: "300px" }}>
            <FormContainer formContext={formContext} onSuccess={onSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ padding: "5px 0px" }}>Email</InputLabel>
                  <TextFieldElement
                    required
                    type="email"
                    name={"email"}
                    size="small"
                    placeholder="Email"
                    fullWidth
                    parseError={parseError}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ padding: "5px 0px" }}>Role</InputLabel>
                  <SelectElement
                    name={"roles"}
                    valueKey="id"
                    labelKey="label"
                    options={[
                      {
                        id: RoleOptions.admin,
                        label: "Admin",
                      },
                      {
                        id: RoleOptions.operator,
                        label: "Operator",
                      },
                    ]}
                    size="small"
                    fullWidth
                    placeholder="Select Role"
                  />
                </Grid>
                <br />
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ padding: "5px 0px" }}>
                    First Name
                  </InputLabel>
                  <TextFieldElement
                    name={"firstName"}
                    size="small"
                    placeholder="First Name"
                    fullWidth
                    parseError={parseError}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ padding: "5px 0px" }}>Last Name</InputLabel>
                  <TextFieldElement
                    name={"lastName"}
                    size="small"
                    placeholder="Last Name"
                    fullWidth
                    parseError={parseError}
                  />
                </Grid>
                <br />
                <Grid item xs={6} sx={{ textAlign: "center" }}>
                  <Button
                    sx={{ padding: "6px 90px", borderRadius: "40px" }}
                    onClick={() => props.setOpen(false)}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "center" }}>
                  <Button
                    sx={{ padding: "6px 90px", borderRadius: "40px" }}
                    variant="contained"
                    type={"submit"}
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </FormContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
