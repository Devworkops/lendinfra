import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import throttle from 'lodash/throttle';
import { useSnackbar } from 'notistack';
import useApi from '../../hooks/useApi';
import { DataRecord } from '../../interfaces/IDataRecord';

export default function DataRecordAutoComplete(props: { handleRecordChange: (value: DataRecord) => void, intialValue: DataRecord | null, objectName:string }) {
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<readonly DataRecord[]>([]);
  const [getDataRecords] = useApi<DataRecord>();
  const { enqueueSnackbar } = useSnackbar();

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string },
          callback: (results?: readonly DataRecord[]) => void,
        ) => {
            getDataRecords(`api/datarecord/object/all/${props.objectName}`).then(async (response) => {
            if (response.data.errors) {
              enqueueSnackbar(response.data.errors[0].message, {
                variant: "error",
              });
            } else {
              callback(response.data.records);
            }
          });
        },
        200,
      ),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(props.intialValue ? [props.intialValue] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: readonly DataRecord[]) => {
      if (active) {
        let newOptions: readonly DataRecord[] = [];

        if (props.intialValue) {
          newOptions = [props.intialValue];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [props.intialValue, inputValue, fetch]);

  return (
    <Autocomplete
      id={`${props.objectName}`}
      fullWidth
      getOptionLabel={(option) =>
        option.recordId?option.recordId:option.id+''
      }
      filterOptions={(options, { inputValue }) =>
        options.filter((option) =>
          option.recordId.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={props.intialValue}
      onChange={(_event: any, newValue: DataRecord | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        if (newValue?.id)
          props.handleRecordChange(newValue);
      }}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      sx={{paddingTop:'10px'}}
      renderInput={(params) => (
        <TextField {...params} label='Select Record' fullWidth  sx={{padding:'10px'}}  helperText={"Start typing to find records"} />
      )}
    />
  );
}
