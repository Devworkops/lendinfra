import * as React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Toolbar,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectElement, SwitchElement, TextFieldElement } from "react-hook-form-mui";
import { useForm } from "react-hook-form";
import useFormHelper from "../../hooks/useFormHelper";
import CloseIcon from '@mui/icons-material/Close';
import EditSaveForm from "../common/EditSaveForm";
import { Integration } from "../../interfaces/IIntegration";
import palleteNew from '../../config/theme/palette';

export default function ConfigureIntegration(props: {
  integration: Integration;
  setIntegration: React.Dispatch<React.SetStateAction<Integration | undefined>>;
  updateIntegration: any
}) {

  const { integration } = props
  const formContext = useForm<Integration>({
    defaultValues: integration,
  });

  const [parseError] = useFormHelper();

  const onSubmit = (data: Integration) => {
    props.updateIntegration(data);
  };

  const [isEditMode, setEditMode] = React.useState<boolean>(true);

  return (
    <>
      <Dialog open={props.integration != undefined}>
        <DialogTitle sx={{ padding: '8px 0px', color: palleteNew.primary.main }}>
          <Toolbar sx={{ padding: '0px' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Configure {props.integration.name} Integration
            </Typography>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => props.setIntegration(undefined)}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxWidth: "500px", minWidth: "300px" }}>
            <EditSaveForm title='' formContext={formContext} handleSubmit={onSubmit} isEditMode={isEditMode} setEditMode={setEditMode}>
              <Grid container spacing={2} >
                {props.integration && props.integration.metaFields && props.integration.metaFields.map((item, index) => (
                  item.isVisible ?
                    <Grid item xs={12} md={12} key={`grid[${index}].key`}>
                      {item.type == 'boolean' ?
                        <SwitchElement
                          labelPlacement="start"
                          key={`metaFields[${index}].key`}
                          label={item.label}
                          name={`metaFields[${index}].value`}
                          sx={{ margin: '0px' }}
                        />
                        :
                        <>
                          <InputLabel key={`inputlabel[${index}].key`} sx={{ padding: '5px 0px' }}>{item.label}</InputLabel>
                          {item.key != 'environment' ?
                            <TextFieldElement
                              required
                              key={`metaFields[${index}].key`}
                              name={`metaFields[${index}].value`}
                              size="small"
                              placeholder={item.label}
                              fullWidth
                              type={item.type == 'password' ? 'password' : 'string'}
                              parseError={parseError}
                              disabled={!item.isEditable}
                            /> :
                            <SelectElement
                              hiddenLabel={true}
                              id={`metaFields[${index}].key`}
                              key={`metaFields[${index}].key`}
                              name={`metaFields[${index}].value`}
                              value={item.value}
                              valueKey="id"
                              labelKey="label"
                              disabled={!item.isEditable}
                              options={[
                                {
                                  id: 'sandbox',
                                  label: 'Sandbox'
                                },
                                {
                                  id: 'production',
                                  label: 'Production'
                                }
                              ]}
                            >
                            </SelectElement>
                          }
                        </>
                      }
                    </Grid> : <></>
                ))}
              </Grid>
            </EditSaveForm>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}