import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from '@mui/material';

export const OverviewCard = (props: { mainHeading: string, data: string, secondaryHeading: string, icon?: React.ReactChild | null | undefined, iconColor?: string }) => {
    const { mainHeading, data, secondaryHeading, icon, iconColor } = props;
    return (
        <Card>
            <CardContent>
                <Stack
                    alignItems="flex-start"
                    direction="row"
                    justifyContent="space-between"
                    spacing={3}
                >
                    <Stack spacing={1}>
                        <Typography
                            color="text.secondary"
                            variant="overline"
                        >
                            {mainHeading}
                        </Typography>
                        <Typography variant="h4">
                            {data}
                        </Typography>
                    </Stack>
                    <Avatar
                        sx={{
                            backgroundColor: iconColor ? iconColor : 'error.main',
                            height: 56,
                            width: 56
                        }}
                    >
                        <SvgIcon>
                            {icon}
                        </SvgIcon>
                    </Avatar>
                </Stack>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                    sx={{ mt: 2 }}
                >
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        {secondaryHeading}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};