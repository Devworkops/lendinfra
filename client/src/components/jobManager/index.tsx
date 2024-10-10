import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import useApi from "../../hooks/useApi";
import { enqueueSnackbar } from "notistack";

export default function CronSettings() {
    
    const [runCronJob, , ,] = useApi<{}>()
    const handleRunCronjob = async () => {
        runCronJob(`api/cronjob/run/calculateInterest`).then((response) => {
            if (response.data.errors) {
              enqueueSnackbar('Someting went wrong', {
                variant: 'error'
              })
            } else {
                enqueueSnackbar('CronJob run successfully', {
                    variant: 'success'
                  }) 
            }
          })
    };

    return (
        <AppBar
            position="static"
            color="inherit"
            sx={{ boxShadow: 'none', mb: 3 }}
        >
            <Toolbar sx={{ paddingLeft: '4px !important' }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    CronJob Manager
                </Typography>
            </Toolbar>
            <div style={{ padding: '16px' , display:'flex', gap:'10px'}}>
                <Typography variant="subtitle1" gutterBottom>
                    Calculate Interest
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleRunCronjob}
                >
                    Run Cronjob
                </Button>
            </div>
        </AppBar>
    );
}
