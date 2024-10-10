import { AppBar, Box, Button, Container, TextField, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";
import { enqueueSnackbar } from "notistack";
import { type WebhookEvents } from '../../interfaces/IWebhookEvents'

export default function WebhookSettings() {
    const { auth } = useAuth();
    const [hookUrl, setHookUrl] = React.useState<string>('');
    const [isSaveVisible, setIsSaveVisible] = React.useState(false);
    const [webhookEvents, setWebhookEvents] = React.useState<WebhookEvents[]>([]);
    const [getWebhookSettings, saveWebhookSettings, ,] = useApi<{}>();
    const [getWebhookEvents, , ,] = useApi<{}>();

    React.useEffect(() => {
        if (auth && auth.companyId) {
            getWebhookSettings(`api/webhook/settings?user_id=${auth.id}&company_id=${auth.companyId}`)
            .then((response) => {
                console.log("response----", response)
                if (response.data.errors) {
                    enqueueSnackbar('Something went wrong while fetching webhook settings', { variant: 'error' });
                    setIsSaveVisible(false);
                } else {
                    const fetchedUrl = response.data.webhook;
                    if (fetchedUrl) {
                        setHookUrl(fetchedUrl.url);
                        setIsSaveVisible(false);
                    } else {
                        const baseUrl = window.location.origin;
                        const url = `${baseUrl}/api/webhook/${auth.companyId}`;
                        setHookUrl(url);
                        setIsSaveVisible(true);
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching webhook settings:", error);
                enqueueSnackbar('Error fetching webhook settings', { variant: 'error' });
            });

            getWebhookEvents(`api/webhook/events?company_id=${auth.companyId}`)
            .then((response) => {
                console.log("response----events", response)
                if (response.data.errors) {
                    enqueueSnackbar('Something went wrong while fetching webhook Events', { variant: 'error' });
                } else {
                    setWebhookEvents(response.data.events)                }
            })
            .catch((error) => {
                console.error("Error fetching webhook settings:", error);
                enqueueSnackbar('Error fetching webhook settings', { variant: 'error' });
            });
        }
    }, [auth]);

    const handleSave = () => {
        if (auth && auth.companyId) {
            saveWebhookSettings(`api/webhook/settings?user_id=${auth.id}&company_id=${auth.companyId}`, { url: hookUrl })
                .then((response) => {
                    if (response.data.errors) {
                        enqueueSnackbar('Something went wrong while saving', { variant: 'error' });
                    } else {
                        enqueueSnackbar('Webhook URL saved successfully', { variant: 'success' });
                        setIsSaveVisible(false);
                    }
                })
                .catch((error) => {
                    console.error("Error saving webhook URL:", error);
                    enqueueSnackbar('Error saving webhook URL', { variant: 'error' });
                });
        }
    };

    return (
        <>
        <AppBar position="static" color="inherit" sx={{ boxShadow: 'none', mb: 3 }}>
            <Toolbar sx={{ paddingLeft: '4px !important' }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Webhook Settings
                </Typography>
            </Toolbar>
        </AppBar>
        <TextField
            style={{ width: '50%', marginTop: '16px', marginBottom: '16px' }}
            label="Webhook URL"
            variant="outlined"
            fullWidth
            value={hookUrl}
            onChange={(e) => setHookUrl(e.target.value)}
            sx={{ mt: 2 }}
            disabled={!isSaveVisible}
        />
        {isSaveVisible && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap:'10px' }}>
                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={handleSave}
                >
                    Save
                </Button>
                < Typography variant="body2" sx={{ mt: 1 }}>
                    (Please save your settings to apply the changes).
                </Typography>
            </Box>

        )}
        {webhookEvents && webhookEvents.length > 0 && (
            <>
                <Toolbar sx={{ paddingLeft: '4px !important' }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Webhook Events
                    </Typography>
                </Toolbar>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        mt: 2,
                        maxHeight: '400px',
                        overflowY: 'auto',
                    }}
                >
                {webhookEvents.map((event, index) => (
                    <Box
                        key={index}
                        sx={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: 2,
                            width: 'calc(33.333% - 16px)', // Adjust for gap spacing
                            boxSizing: 'border-box',
                            backgroundColor: '#7dcdc43b'
                        }}
                    >
                        <Typography variant="body2"><strong>Consent ID:</strong> {event.consent_id}</Typography>
                        <Typography variant="body2"><strong>Status:</strong> {event.new_status}</Typography>
                        <Typography variant="body2"><strong>Notification Time:</strong> {event.notification_utc_time}</Typography>
                    </Box>
                ))}
            </Box>
            </>
        )}
        </>
        
    );
}
