import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import useApi from '../../hooks/useApi';
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import ConfigureIntegration from './ConfigureIntegration';
import MButton from '../common/Mbutton';
import Router from 'next/router';
import { Badge, Grid, Stack } from '@mui/material';
import { Integration } from '../../interfaces/IIntegration';

export default function IntegrationSetup() {

    const { enqueueSnackbar } = useSnackbar();
    const [getIntegrations, createIntegration, updateIntegration, deleteIntegration] = useApi<Integration>();

    const [connectIntegrationApi] = useApi<any>();

    const [integrations, setIntegrations] = React.useState<Integration[]>([]);
    
    const [availableIntegrations, setAvailableIntegrations] = React.useState<Integration[]>([]);

    const [integration, setIntegration] = React.useState<Integration>();

    useEffect(() => {
        getIntegrations(`api/integration/all/`).then((response) => {
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, {
                    variant: "error",
                });
            } else {
                if (response.data.integrations)
                setIntegrations(response.data.integrations);
                if (response.data.availableIntegrations)
                    setAvailableIntegrations(response.data.availableIntegrations)
            }
        });
    }, [integration]);

    const configureIntegration = (input: Integration) => {
        setIntegration(input)
    }

    const createUpdateIntegrationConfiguration = (input: Integration) => {
        if (input.id) {
            updateIntegration(`api/integration/${input.id}`, input).then((response) => {
                if (response.data.errors) {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                } else {
                    enqueueSnackbar('Updated successfully', {
                        variant: "success",
                    });
                    setIntegration(undefined);
                    connectIntegration(input)
                }
            });
        }
        else {
            createIntegration(`api/integration/new`, input).then((response) => {

                if (response.data.errors) {
                    
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                } else {
                    
                    enqueueSnackbar('Configured successfully', {
                        variant: "success",
                    });
                    setIntegration(undefined);
                    connectIntegration(input)
                }
            });
        }
    }

    const activateIntegrationConfiguration = (input: Integration) => {
        if (input.id) {
            updateIntegration(`api/integration/${input.id}`, input).then((response) => {
                if (response.data.errors) {
                    
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                } else {
                    setIntegration(input);
                }
                connectIntegration(input)
            });
        }
    }

    const deactivateIntegrationConfiguration = (input: Integration) => {
        
        if (input.id) {
            deleteIntegration(`api/integration`, input.id).then((response) => {
                if (response.data.errors) {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                } else {
                    enqueueSnackbar('Deactivated successfully', {
                        variant: "success",
                    });
                    input.isActive = false;
                }
            });
        }
    }

    const connectIntegration = (input: Integration) => {
        if (input.id) {
            connectIntegrationApi(`api/integration/connect?name=${input.name}`).then((response) => {
                if (response.data.errors) {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                }
                else if (response.data.redirectURL) {

                    Router.replace(response.data.redirectURL)
                }
                else if (response.data) {

                    if (response.data === 'Failed') {

                        enqueueSnackbar('Failed to connect', {
                            variant: "error",
                        });
                    } else {
                        enqueueSnackbar('Connected Successfully', {
                            variant: "success",
                        });
                    }
                }
            });
        }
    }

    return (
        <>
            <Grid sx={{ flexGrow: 1 }} container spacing={2}>
                {integrations && integrations.map(item => (
                    <Grid item key={`grid${item.name}`}>
                        <Card sx={{ maxWidth: 345 }} key={item.name}>
                            <CardContent>
                                <Badge color={item.isActive ? "success" : "error"} variant="dot" overlap="circular">
                                    <div style={{ position: 'absolute', top: 0 }}></div>
                                </Badge>
                                <Stack direction={'row'} sx={{ alignItems: 'center' }} spacing={2}>
                                    {item.logo && <img height="40" src={item.logo} />}
                                    <Typography gutterBottom variant="h5" component="div">
                                        {item.name}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {item.isActive && <MButton size="small" variant='contained' onClick={() => activateIntegrationConfiguration(item)}>Activate & Connect</MButton>}
                                {!item.isActive && <MButton size="small" onClick={() => configureIntegration(item)}>Edit & Reconnect</MButton>}
                                {item.isActive && <MButton size="small" onClick={() => deactivateIntegrationConfiguration(item)}>Deactivate</MButton>}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {availableIntegrations && availableIntegrations.map(item => (
                    <Grid item key={`grid${item.name}`}>
                        <Card sx={{ maxWidth: 345 }} key={item.name}>
                            <CardContent>
                                <Stack direction={'row'} sx={{ alignItems: 'center' }} spacing={2}>
                                    {item.logo && <img height="40" src={item.logo} />}
                                    <Typography gutterBottom variant="h5" component="div">
                                        {item.name}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <MButton size="small" variant='contained' onClick={() => configureIntegration(item)}>Configure</MButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {integration && <ConfigureIntegration key={integration.name} integration={integration} setIntegration={setIntegration} updateIntegration={createUpdateIntegrationConfiguration}></ConfigureIntegration>}
            </Grid>
        </>
    );
}