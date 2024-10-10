import React, { useEffect } from "react";
import moment from 'moment';
import { Box, Typography, Link, Grid, Divider } from '@mui/material';
import { FormContainer } from 'react-hook-form-mui';
import { DataRecord } from "../../interfaces/IDataRecord";
import useFormHelper from '../../hooks/useFormHelper';
import useApi from '../../hooks/useApi';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';
import { Activities } from "../../interfaces/IActivities";
import { useRouter } from "next/router";

export interface Pagination {
    page: number;
    maxPageSize: number;
    totalResults: number;
}

export interface ActivityProps {
    data: DataRecord | undefined;
    open: string | undefined;
    objectName: string | undefined
}

export default function Activity(props: ActivityProps) {
    const { open, data, objectName } = props;
    const router = useRouter();
    const { query } = router;
    const id = query.id;
    const [getActivity, , ,] = useApi<Activities>();
    const [activity, setActivity] = React.useState<Activities[]>([]);
    const [idIdExists, setidIdExists] = React.useState(false);

    const [parseError] = useFormHelper();
    const { enqueueSnackbar } = useSnackbar();
    const { auth } = useAuth();

    const [filterQuery, setFilterQuery] = React.useState({
        reference: 'datarecord',
        referenceId: '',
        recordId: '',
        startDate: '',
        endDate: ''
    });

    const [pagination, setPagination] = React.useState<Pagination>({
        page: 1,
        maxPageSize: 100,
        totalResults: 0
    });

    useEffect(() => {
        if (open === 'View') {
            id ? setidIdExists(true) : setidIdExists(false)
            updateActivity(filterQuery, pagination);
        }
    }, []);

    const updateActivity = async (query: any, pagination: Pagination) => {
        let noteUrl = `api/activity/all/${auth?.companyId}`;
        const { page, maxPageSize } = pagination;
        noteUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`;

        if (query) {
            const { reference, referenceId, recordId, startDate, endDate } = query;
            let filterQuery = `&reference=${reference}&referenceId=${data?.dataModel}&recordId=${data?.id}`;

            if (startDate && endDate) {
                filterQuery += `&startDate=${startDate}&endDate=${endDate}`;
            }

            noteUrl += filterQuery;
        }

        const [Activity] = await Promise.allSettled([getActivity(noteUrl)]);

        if (Activity.status === 'fulfilled') {
            const recordNotes = Activity.value.data;
            if (recordNotes.errors) {
                const [{ message }, ..._] = recordNotes.errors;
                enqueueSnackbar(message, { variant: 'error' });
            } else {
                const { results, totalResults } = recordNotes;
                setActivity(results as Activities[]);
                setPagination({ page, maxPageSize, totalResults });
            }
        }
    };

    return (
        <>
            {open === "View" && (
                <Box sx={{ flexGrow: "auto",maxHeight: '60vh', overflowY: 'auto',padding: 2  }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'underline' }}>
                        Recent Activities
                    </Typography>
                    {activity && activity.length > 0 ? (

                        activity.map((act, index) => (
                            <ul>
                                <li>
                                    <Box key={index} sx={{ mb: 2, position: "relative", display: 'flex', alignItems: 'center'}}>
                                        <Typography variant="body1" component="span" sx={{ display: 'flex' }}>
                                            <div>
                                                {act.activity.includes(",") ? (
                                                    act.activity.split(',').map((item, index) => (
                                                        <span key={index}>
                                                            <span dangerouslySetInnerHTML={{ __html: item.trim() }} />
                                                            <br />
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{fontSize:'0.8rem'}}>{act.activity || "No Activity available"}</span>
                                                )
                                                }
                                                {!idIdExists && <Link href={`/${act.object_type}/${act.record_id}`} sx={{ ml: 1, fontWeight: '600' }}>
                                                    {act?.newDataRecord?.recordId || act?.oldDataRecord?.recordId }
                                                </Link>}
                                            </div>
                                            {act.user && (

                                                <div>
                                                    <Typography variant="body2" sx={{ color: "#2e9586", ml: 1, backgroundColor: "#ade5dec7", padding: '0 10px', marginLeft: "20px",fontSize:'0.7rem' }}>
                                                        {act?.user?.id === '65c242a70d1b64db36057c13' ? 'API WorkFlow' : (act?.user?.firstName + ' ' + act?.user?.lastName || '')}
                                                    </Typography>
                                                </div>
                                            )}
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary" sx={{ position: "absolute", right: 0, top: 0 }}>
                                            {moment.utc(act.createdAt).format("DD/MM/YYYY HH:mm")}
                                        </Typography>
                                        <Divider sx={{ mt: 1, mb: 1 }} />
                                    </Box>
                                </li>
                            </ul>
                        ))
                    ) : (
                        <Typography variant="body1" color="textSecondary">
                            No Activity found.
                        </Typography>
                    )}
                </Box>
            )}
        </>
    );

}
