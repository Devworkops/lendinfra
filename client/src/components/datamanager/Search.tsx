import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import useApi from '../../hooks/useApi';
import { enqueueSnackbar } from 'notistack';

const Search = (props: { objectName: string, setData: any }) => {
    const { objectName, setData } = props;
    const [query, setQuery] = useState('');
    const [getData,,,] = useApi();

    const handleSearch = async () => {
        try {
            const response = await getData(`api/datarecords/search/${objectName}/${query}`);
            if(response.status ===200) {
                if(Array.isArray(response.data)) {
                    if(response.data.length > 0) {
                        enqueueSnackbar('Records Updated', {variant: 'success'})
                        setData(response.data);
                    }
                    else 
                        enqueueSnackbar('No Record Found', {variant: 'warning'})
                } else {
                    enqueueSnackbar(response.data.message, {variant: 'info'})
                }
            }
        } catch (error) {
            enqueueSnackbar('Error Occured', {variant: 'error'})
            console.error('Error fetching search results:', error);
        }
    };

    const handleSetQuerry = (event: any) => {
        setQuery(event.target.value);
        console.log(event.target.value);
    }

    return (
        <Box display="flex" alignItems="center" gap={2}>
            <TextField 
                label="Search" 
                variant="outlined" 
                value={query} 
                onChange={handleSetQuerry} 
            />
            <Button variant="contained" disabled={query===''} color="primary" onClick={handleSearch}>
                Search
            </Button>
        </Box>
    );
};

export default Search;
