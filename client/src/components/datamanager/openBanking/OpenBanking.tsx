import React from "react"
import { Box, Button, Container, InputAdornment, Link, TableCell } from "@mui/material"
import CrudMaterialTable, { ColumnData } from "../../common/CrudMaterialTable"
import { useAuth } from "../../../hooks/useAuth";
import useApi from "../../../hooks/useApi"
import { TableCellRenderer } from "react-virtualized"
import { DataRecord } from "../../../interfaces/IDataRecord";
import { DataModel } from "../../../interfaces/IDataModel";
import Details from "../Details";
import TrustLoop from "./Trustloop";
import { FormContainer, SelectElement, useForm } from "react-hook-form-mui";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSnackbar } from "notistack";

interface FormStateObj { ref: { TrustLoop: string; Consent: string}}

export const OpenBanking = (props: { account: DataRecord | undefined, data: DataRecord | undefined}) => {
	const [getConsents, fetchAnalyticsApi, ,] = useApi()
	const [ ,, updateData,] = useApi<DataModel | DataRecord>()
	const [selectedData, setSelectedData] = React.useState<DataRecord>()
	const [ consents, setConsents] = React.useState<DataRecord[]>()
	const [ ,getOrSetConsents,,] = useApi()
	const [isOpen, setIsOpen] = React.useState<string | undefined>('List')
	const [ analyticsData, setAnalyticsData ] = React.useState([]);
	const [ selectedAnalyticsData, setSelectedAnalyticsData ] = React.useState<DataRecord>();
	const [ isEditingField, setIsEditingField ] = React.useState('');
	const { enqueueSnackbar } = useSnackbar()
	const { account, data } = props;
    const originalFieldValuesRef = React.useRef<{ [key: string]: any }>({});

	const formContext = useForm<FormStateObj>({
		defaultValues: {
			ref: {
				TrustLoop: account?.fields['TrustLoop'],
				Consent: account?.fields['Consent']
			}
		}
	});

	// Fetching Analytics Data(Trustloop data after consent is approved)
    React.useEffect(() => {
        const fetchAnalytics = async (accountId: string, companyId: string) => {
            try {
                const { data: analytics } = await fetchAnalyticsApi(`api/datarecord/getAnalytics`, {
                    accountId: accountId,
					companyId: companyId
                });
				setAnalyticsData(analytics)
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            }
        };

        if (account?.id && account?.company) {
            fetchAnalytics(account.id, account.company);
        }
    }, [ account ]);
 
	// Fetching all the consents linked with the account
	React.useEffect(() => {
		const fetchConsents = async (accountId: string) => {
			try { 
				const response = await getConsents(`api/consents/${accountId}`);
				let filteredConsents = response.data;
				if(!filteredConsents) filteredConsents = [];
				setConsents(filteredConsents);
			} catch (error) {
				console.error('Error fetching consents:', error)
			}
		};

		if(account?.id)
			fetchConsents(account.id);
	}, [account?.id]);

	const IdRenderer: TableCellRenderer = ({ rowData }) => {
		return (
			<TableCell><Link
				component="button"
				variant="body2"
				onClick={() => {
					setIsOpen('View')
					setSelectedData(rowData);
					setSelectedAnalyticsData(analyticsData?.find((analytic: any)=> analytic.fields['consent_id'] == rowData?.fields['consent_id']))
				}}
			>
				{rowData.recordId}
			</Link>
			</TableCell>
		)
	}

	const createdFieldsRenderer: TableCellRenderer = ({ rowData, dataKey }) => {
		switch (dataKey) {
			case 'status':
				return (
					<TableCell>{rowData.fields['status']}</TableCell>)
			case 'bank':
				return (
					<TableCell>{rowData.fields['bank']}</TableCell>)
			case 'summary':
				return (
					<a 
					href={rowData.fields['link']}
  					target="_blank"
					rel="noopener noreferrer">Summary</a>)
			case 'createdat':
				return (
					<TableCell>{rowData.createdAt}</TableCell>)
		}
	}    

	const columns: ColumnData[] = [
		{
			dataKey: 'recordId',
			label: 'Id',
			width: 175,
			cellRenderer: IdRenderer 
		},
		{
			dataKey: 'status',
			label: 'Status',
			width: 175,
			cellRenderer: createdFieldsRenderer
		},
		{
			dataKey: 'bank',
			label: 'Bank',
			width: 175,
			cellRenderer: createdFieldsRenderer
		},
		{
			dataKey: 'summary',
			label: 'Summary Link',
			width: 175,
			cellRenderer: createdFieldsRenderer
		},
		{
			dataKey: 'createdat',
			label: 'Created At',
			width: 200,
			cellRenderer: createdFieldsRenderer
		}
	]  

	const handleNewConsent = async () => {
		const { data: consent } = await getOrSetConsents('api/integrations/data', { apiName: 'createConsent', id: account?.id, applicationId: data?.id });
		if(consents && consents.length>0)
			setConsents([consent, ...consents ]);
		else setConsents([consent])
	}

	const handleSubmit = async (formData: FormStateObj) => {
		if (account) {
			const updatedData: DataRecord = {
				...account,
				fields: {
					...account.fields,
					Consent: formData.ref.Consent,
					TrustLoop: formData.ref.TrustLoop
				}
			};
			const result = await updateData(`api/dataRecord/${updatedData.id}`, updatedData);
			if (result && result.data.errors) {
				enqueueSnackbar(result.data.errors[0].message, {
					variant: 'error'
				})
			} else {
				enqueueSnackbar(`${isEditingField} id updated Successfully`, {
					variant: 'success'
				})
			}
		}
	};

	const commonInputProps = (key: string) => ({
        endAdornment: (
            <InputAdornment position="end">
				<>
					{isEditingField === key ? (
						<>
							<SaveIcon
								onClick={async () => {
									handleSubmit(formContext.getValues());
									setIsEditingField('');
								}}
								style={{ cursor: 'pointer', color: 'black' }}
							/>
							&ensp;
							<CancelIcon
								onClick={() => {
									formContext.setValue(
										key ==='TrustLoop' ? `ref.TrustLoop` : `ref.Consent`,
										originalFieldValuesRef.current[key]
									);
									setIsEditingField('');
								}}
								style={{ cursor: 'pointer', color: 'grey' }}
							/>
							&ensp;&ensp;
						</>
					) : (
						<>
							<EditIcon
								onClick={() => {
									originalFieldValuesRef.current[key] = formContext.getValues(
										key ==='TrustLoop' ? `ref.TrustLoop` : `ref.Consent`
									);
									setIsEditingField(key);
								}}
								style={{ cursor: 'pointer', color: '#EAEAEA' }}
							/>
							&ensp;&ensp;
						</>
					)}
				</>
            </InputAdornment>
        ),
    });

	const getRecordsName = (record: DataRecord[] | undefined) => {
        const records: Array<{
            label: string
            id: string
        }> = []
		if(!record || record.length === 0) return [];
        record.forEach(element => {
            records.push({
                label: (element.fields.FirstName) ? element.recordId + ' ' + element.fields.FirstName + ' ' + element.fields.LastName
					: element.recordId, id: element.id
            })
        })
        return records
    }

	const handleConsentRefresh = async () => {
		if(consents && consents.length !== 0 && account && account.id) {
			const consentIds = consents.map((consent: DataRecord) => consent.fields['consent_id']);
			const {data: consentData} = await getOrSetConsents('api/integrations/data', { apiName: 'getandUpdateConsent', id: account.id, consentIds, applicationId: data?.id });
			setConsents(consentData)
		}
	}
	
	const handleTrustloopRefresh = async () => {
		try {
			if(consents && consents.length !== 0 && account && account.id) {
				const consentId = selectedData?.fields['consent_id'];
				if(selectedAnalyticsData) {
					const {data: trustLoopData} = await getOrSetConsents('api/integrations/data', { apiName: 'refetchData', id: account.id, consentIds: [ consentId ] , applicationId: data?.id});
					setSelectedAnalyticsData(trustLoopData)
				} else {
					const {data: trustLoopData } = await getOrSetConsents('api/integrations/data', { apiName: 'getAnalytics', id: account.id, consentIds: [ consentId ], applicationId: data?.id}) 
					setSelectedAnalyticsData(trustLoopData)
				}
				enqueueSnackbar('Trustloop data refreshed successfully', { variant: 'success' });
			}
		} catch (error) {
			enqueueSnackbar('An error occurred while refreshing Trustloop data', { variant: 'error' });
			console.error('handleTrustloopRefresh error:', error);
		}
	}

	return <>
		<FormContainer formContext={formContext} onSuccess={handleSubmit}>
			<SelectElement
				name={'ref.Consent'}
				label='Consent'
                InputProps={{sx: { minWidth: 150 }, ...commonInputProps('Consent')}}
				disabled={isEditingField!== 'Consent'}
				options={getRecordsName(consents)}
			/>
			<br/>
			<br/>
			<SelectElement
				name={'ref.TrustLoop'}
				label='TrustLoop'
                InputProps={{sx: { minWidth: 150 }, ...commonInputProps('TrustLoop')}}
				disabled={isEditingField!== 'TrustLoop'}
				options={getRecordsName(analyticsData)}
			/>
			<br/>
			<br/>
		</FormContainer>
		{isOpen && isOpen !== 'List' ? (
		<>
			<a 
			href={selectedData?.fields['link']}
			target="_blank"
			rel="noopener noreferrer">Summary Link</a>
			<br />
			<br />
			<Details
			data={isOpen !== 'New' ? selectedData : undefined} 
			open={isOpen} 
			setOpen={setIsOpen}
			objectName={"Consent"} 
			/>
			<Button variant="contained" onClick={() => selectedData?.fields['status'] === 'consent-data-shared'? handleTrustloopRefresh() : enqueueSnackbar('Consent not approved.')}>
				{selectedAnalyticsData ? "Refresh Trustloop Data" : "Fetch Trustloop Data"}
			</Button>
			{selectedAnalyticsData 
				? <TrustLoop 
					data={selectedAnalyticsData}
				/>
				: <></>
			}
		</>
		)
		:
		<>
		<Button variant="contained" onClick={handleNewConsent}>New Consent</Button>
		<br />
		<br />
		<Button variant="contained" onClick={handleConsentRefresh}>Refresh Consent Data</Button>
		{consents && consents.length > 0
		?
		<Container>
				<Box sx={{ flexGrow: 'auto' }}>
					<CrudMaterialTable
					key={consents.length}
					tableRows={consents}
					setTableRows={setConsents}
					columns={columns}
					isReadOnly={true}
					tableHeight="calc(80vh - 140px)"
					/>
				</Box>
		</Container>
		:<>
		<br />
		<>No record found</></>}
		</>
	}
	</>
}   