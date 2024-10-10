import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataRecord } from '../../interfaces/IDataRecord';
import { add, format } from 'date-fns';

export interface CreditReportsProps {
    open: string | undefined
    report: string
    data: DataRecord | undefined
}
const CreditReport = (props: CreditReportsProps) => {

    const [expandedRow, setExpandedRow] = React.useState<number[]>([]);
    const [isExpanded, setExpanded] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<string>('none');

    const { data, report, open } = props
    const summary = (data?.fields?.creditReport.summary) ? (data?.fields?.creditReport.summary) : getSummaryData(data);
    const creditScore = data?.fields?.creditReport.creditScore;
    const financialAccountSummary = (data?.fields?.creditReport.financialAccountSummary) ? (data?.fields?.creditReport.financialAccountSummary) : getFinancialAccountSummary(data);
    const correctionAndDisputeNotices = (data?.fields?.creditReport.correctionAndDisputeNotices) ? (data?.fields?.creditReport.correctionAndDisputeNotices) : getCorrectionAndDisputeNotices(data);
    const publicInformation = data?.fields?.creditReport.publicInformation;
    const judgments = (data?.fields?.creditReport?.judgments?.totalactiveamount) ? (data?.fields?.creditReport.judgments) : getJudgmentData(data);
    const electoralRoll = data?.fields?.creditReport.electoralRoll;
    const searches = (data?.fields?.creditReport.searches) ? (data?.fields?.creditReport.searches) : getSearchData(data);
    const linksAssociatesAliases = data?.fields?.creditReport.linksAssociatesAliases;
    const NoticeOfCorrection = data?.fields?.creditReport.NoticeOfCorrection;
    const bankruptciesInsolvencies = data?.fields?.creditReport.bankruptciesInsolvencies;
    const countryCourtJudgments = data?.fields?.creditReport.countryCourtJudgments;
    const searchHistory = data?.fields?.creditReport.searchHistory;
    const addressLink = data?.fields?.creditReport.addressLink;
    const associateLinks = data?.fields?.creditReport.associateLinks;
    const aliasesLinks = data?.fields?.creditReport.aliasesLinks;
    const financialAccounts = data?.fields?.creditReport.financialAccounts;
    const cifasWarnings = data?.fields?.creditReport.cifasWarnings;
    const cellStyle = { border: '1px solid #ddd' };

    let serialNumber = 1;

    function getSummaryData(data: any) {
        let summary = data?.fields?.creditReport.response['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditrequest[0].applicant[0]

        if (!summary) return null;

        const nameObj = summary?.name?.[0] || {};
        const fullName = `${nameObj?.title?.[0] || ''} ${nameObj?.forename?.[0] || ''} ${nameObj?.surname?.[0] || ''}`.trim();

        return {
            type: 'Individual Report',
            fullName,
            dob: summary?.dob?.[0] || '',
            address: summary?.address?.[0]?.street1?.[0] || ''
        };
    }
    function getSearchData(data: any) {
        let searches = data?.fields?.creditReport.response['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].searches[0] || ''

        if (!searches) return null;

        const totalSearches3Months = searches.totalsearches3months[0] ? Number(searches.totalsearches3months[0]) : 0
        const totalSearches12Months = searches.totalsearches12months[0] ? Number(searches.totalsearches3months[0]) : 0
        const totalHomeCreditSearches3Months = searches.totalhomecreditsearches3months[0] ? Number(searches.totalhomecreditsearches3months[0]) : 0

        return {
            totalSearches3Months,
            totalSearches12Months,
            totalHomeCreditSearches3Months,
        };
    }

    function getCorrectionAndDisputeNotices(data: any) {
        let correctionAndDisputeNotices = data?.fields?.creditReport.response['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].notices[0] || ''

        if (!correctionAndDisputeNotices) return null;
        const nocFlag = correctionAndDisputeNotices.nocflag[0] ? Number(correctionAndDisputeNotices.nocflag[0]) : 0;
        const totalDisputes = correctionAndDisputeNotices.totaldisputes[0] ? Number(correctionAndDisputeNotices.totaldisputes[0]) : 0;

        return {
            nocFlag,
            totalDisputes,
        };
    }

    function getJudgmentData(data: any) {
        let judgments = data?.fields?.creditReport.response['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].judgments[0] || ''

        if (!judgments) return null;

        const totalActive = judgments.totalactive[0] ? Number(judgments.totalactive[0]) : 0;
        const totalSatisfied = judgments.totalsatisfied[0] ? Number(judgments.totalsatisfied[0]) : 0;
        const totalActiveAmount = (judgments.totalactiveamount?.[0]) ? Number(judgments.totalactiveamount?.[0]) : 0;
        return {
            totalActive,
            totalSatisfied,
            totalActiveAmount,
        };
    }

    function getFinancialAccountSummary(data: any) {
        let financialAccountSummary = data?.fields?.creditReport.response['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].share[0];

        const totalFinancialAccounts = Number(financialAccountSummary.totalactiveaccs?.[0]) || 0;
        const wrostPaymentIn12Months = financialAccountSummary.worsepaystatus12months?.[0] || '';
        const wrostPaymentIn36Months = financialAccountSummary.worsepaystatus36months?.[0] || '';
        const defaultsInLast36Months = Number(financialAccountSummary.totaldefaults36months?.[0]) || 0;
        return {
            totalFinancialAccounts,
            wrostPaymentIn12Months,
            wrostPaymentIn36Months,
            defaultsInLast36Months
        }
    }

    function checkAndDisplayStatus(status: string) {
        switch (status) {
            case 'N':
                return 'N(Normal)';
            case 'D':
                return 'D(Default)';
            case 'S':
                return 'S (Settled)';
            case 'Q':
                return 'Q (Delinquent)';
            default:
                return 'NA';
        }
    }

    function displayProvider(code: string = '') {
        switch (code) {
            case 'FN':
                return 'Finance House';
            case 'BK':
                return 'Bank';
            case 'TC':
                return 'Telecommunications Supplier';
            case 'CC':
                return 'Credit Card Company';
            case 'RT':
                return 'Retailer';
            default:
                return 'NA';
        }
    }

    const handleExpandClick = (index: number) => {
        setExpandedRow(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleExpandAll = () => {
        const allIndexes = financialAccounts.financialAccounts.map((_: any, index: number) => index);
        setExpandedRow(allIndexes);
    };

    const handleCollapseAll = () => {
        setExpandedRow([]);
    };

    const handleAccordionToggle = (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded);
    };

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        setSortField(event.target.value as string);
    };

    const sortData = (data: any[], field: string) => {
        return data.slice().sort((a, b) => {
            if (field === 'none') return 0;

            let aValue: string | number = '';
            let bValue: string | number = '';

            if (['provider'].includes(field)) {
                aValue = a.supplierdetails[0].suppliertypecode ?? '';
                bValue = b.supplierdetails[0].suppliertypecode ?? '';
            } else {
                aValue = a.accdetails[0][field] ?? '';
                bValue = b.accdetails[0][field] ?? '';
            }

            if (['dateupdated', 'accstartdate'].includes(field)) {
                aValue = a.accdetails[0][field] ? new Date(a.accdetails[0][field]).getTime() : 0;
                bValue = b.accdetails[0][field] ? new Date(b.accdetails[0][field]).getTime() : 0;
            }

            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
            return 0;
        });
    };

    const sortedFinancialAccounts = sortData(financialAccounts?.financialAccounts || [], sortField);

    const getEndDate = (startdate: string, duration: string) => {
        const startDateObj = new Date(startdate);
        const months = parseInt(duration.replace('P', '').replace('M', ''), 10);
        const endDateObj = add(startDateObj, { months });
        return format(endDateObj, 'yyyy-MM-dd');
    };

    return (
        <div style={{ width: '100%' }}>
            <Accordion defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="credit-report-content"
                    id="credit-report-header"
                >
                    <Typography variant="h6" color="#039485">Credit Report</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {/* Summary */}
                    {summary && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="summary-content"
                            id="summary-header"
                        >
                            <Typography variant="h6" color="#039485">Summary</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6} >
                                    <TextField label="Report Type" disabled={open == 'View'} value={summary?.type || "Individual"} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Date of Report" disabled={open == 'View'} value={data?.fields?.creditReport.lastSyncedDate} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Name" disabled={open == 'View'} value={summary.fullName} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Address" disabled={open == 'View'} value={summary.address} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="DOB" disabled={open == 'View'} value={summary.dob} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Credit Scroe */}
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Credit Score</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="Credit Score(Value)" disabled={open == 'View'} value={creditScore} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* Financial Accounts */}
                    {financialAccountSummary && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Financial Account Information</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="No of Financial Accounts" disabled={open == 'View'} value={financialAccountSummary.totalFinancialAccounts} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Worst Payment Status in Last 12 Months" disabled={open == 'View'} value={financialAccountSummary.wrostPaymentIn12Months} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="No of Defaults in Last 36 Months" disabled={open == 'View'} value={financialAccountSummary.defaultsInLast36Months} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Worst Payment Status in Last 36 Months" disabled={open == 'View'} value={financialAccountSummary.wrostPaymentIn36Months} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Correction and Notices */}
                    {correctionAndDisputeNotices && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Number of Correction and Notice of Disputes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="Number of Notices of Correction" disabled={open == 'View'} value={correctionAndDisputeNotices.nocFlag} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Number of Notices of Disputes" disabled={open == 'View'} value={correctionAndDisputeNotices.totalDisputes} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Public Information */}
                    {(publicInformation || judgments) && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Public Information</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                {publicInformation && <Grid item xs={6}>
                                    <TextField label="Number of Insolvencies" disabled={open == 'View'} value={publicInformation?.currentlyInsolvent} fullWidth size="small" />
                                </Grid>}
                                <Grid item xs={6}>
                                    <TextField label="Number of Country Court Judgements" disabled={open == 'View'} value={`Active=${judgments.totalActive},Satisfied=${judgments.totalSatisfied}, CCJ Amount=${judgments.totalActiveAmount}`} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Electoral Roll */}
                    {electoralRoll && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Electoral Roll</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="Number of Address" disabled={open == 'View'} value={electoralRoll?.totalAddress} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Search History */}
                    {searches && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Search History</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="Searches in the last 12 Months" disabled={open == 'View'} value={searches.totalSearches12Months} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Third Party Searches in last 12 Months" disabled={open == 'View'} value="0" fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Links, Associates and Aliases */}
                    {linksAssociatesAliases && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">Links, Associates and Aliases</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="Address Links" disabled={open == 'View'} value={linksAssociatesAliases.addressLink} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Associates" disabled={open == 'View'} value={linksAssociatesAliases.associates} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Aliases" disabled={open == 'View'} value={linksAssociatesAliases.aliases} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* CIFAS Warnings */}
                    {cifasWarnings && <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-account-content"
                            id="financial-account-header"
                        >
                            <Typography variant="h6" color="#039485">CIFAS Warnings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columnSpacing={12} rowSpacing={4} xs={8}>
                                <Grid item xs={6}>
                                    <TextField label="Total CIFAS Warnings" disabled={open == 'View'} value={cifasWarnings.cifasWarning} fullWidth size="small" />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Electoral Roll */}
                    {electoralRoll && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-accounts-content"
                            id="financial-accounts-header"
                        >
                            <Typography variant="h6" color="#039485">Electoral Roll</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle} >S.No.</TableCell>
                                            <TableCell style={cellStyle}>Name</TableCell>
                                            <TableCell style={cellStyle}>Address</TableCell>
                                            <TableCell style={cellStyle}>Start Date</TableCell>
                                            <TableCell style={cellStyle}>End Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {electoralRoll && electoralRoll?.electoralRoll != '' && electoralRoll?.electoralRoll.length > 0 &&
                                        <TableBody>
                                            {electoralRoll.electoralRoll.map((item: any, index: number) => {
                                                const address = item?.address[0]._ || '';
                                                return (
                                                    <>
                                                        {item?.resident && item?.resident.map((i: any, resIndex: number) => (
                                                            <>
                                                                <TableRow key={serialNumber} style={{ backgroundColor: (serialNumber % 2 === 0) ? '#d4f3f099' : ''}}>
                                                                    <TableCell style={cellStyle}>{serialNumber++}</TableCell>
                                                                    <TableCell style={cellStyle}>{i.name}</TableCell>
                                                                    <TableCell style={cellStyle}>{address}</TableCell>
                                                                    <TableCell style={cellStyle}>{i.startdate}</TableCell>
                                                                    <TableCell style={cellStyle}>{getEndDate(i.startdate[0], i.duration[0])}</TableCell>
                                                                </TableRow>
                                                            </>
                                                        ))}
                                                    </>
                                                )
                                            })}
                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Notice of Correction*/}
                    {NoticeOfCorrection && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="notice-correction-content"
                            id="notice-correction-header"
                        >
                            <Typography variant="h6" color="#039485">Notice of Correction</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Date Raised</TableCell>
                                            <TableCell style={cellStyle}>NOC Text</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {NoticeOfCorrection && NoticeOfCorrection.correctionNotice != '' &&
                                        <TableBody>

                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Bankruptcies/Insolvencies*/}
                    {bankruptciesInsolvencies && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="bankruptcies-insolvencies-content"
                            id="bankruptcies-insolvencies-header"
                        >
                            <Typography variant="h6" color="#039485">Bankruptcies/Insolvencies</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Case Reference</TableCell>
                                            <TableCell style={cellStyle}>Case Year</TableCell>
                                            <TableCell style={cellStyle}>Order Date</TableCell>
                                            <TableCell style={cellStyle}>Court</TableCell>
                                            <TableCell style={cellStyle}>Status</TableCell>
                                            <TableCell style={cellStyle}>Discharge Date</TableCell>
                                            <TableCell style={cellStyle}>Order Type</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {bankruptciesInsolvencies && bankruptciesInsolvencies.bankruptciesInsolvencies != '' &&
                                        <TableBody>

                                        </TableBody>
                                    }

                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* County Court Judgements*/}
                    {countryCourtJudgments && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="county-court-Judgements-content"
                            id="county-court-Judgements-header"
                        >
                            <Typography variant="h6" color="#039485">County Court Judgements</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Amount</TableCell>
                                            <TableCell style={cellStyle}>Case Number</TableCell>
                                            <TableCell style={cellStyle}>Judgement Date</TableCell>
                                            <TableCell style={cellStyle}>Court</TableCell>
                                            <TableCell style={cellStyle}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {countryCourtJudgments && countryCourtJudgments.courtJudgments != '' &&
                                        <TableBody>
                                            {countryCourtJudgments?.courtJudgments.map((item: any, index: number) => {
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell style={cellStyle}>{index + 1}</TableCell>
                                                        <TableCell style={cellStyle}>{item.amount[0]}</TableCell>
                                                        <TableCell style={cellStyle}>{item.casenumber[0]}</TableCell>
                                                        <TableCell style={cellStyle}>{item.judgmentdate[0]}</TableCell>
                                                        <TableCell style={cellStyle}>{item.courtname[0]}</TableCell>
                                                        <TableCell style={cellStyle}>{item.status[0]}</TableCell>
                                                    </TableRow>
                                                )
                                            })
                                            }
                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Search History*/}
                    {searchHistory && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="search-history-content"
                            id="search-history-Judgements-header"
                        >
                            <Typography variant="h6" color="#039485">Search History</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Organization</TableCell>
                                            <TableCell style={cellStyle}>Search Unit Type</TableCell>
                                            <TableCell style={cellStyle}>Name</TableCell>
                                            <TableCell style={cellStyle}>DOB</TableCell>
                                            <TableCell style={cellStyle}>Address</TableCell>
                                            <TableCell style={cellStyle}>Search Date</TableCell>
                                            <TableCell style={cellStyle}>Search Purpose</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {searchHistory && searchHistory?.searchHistoryArray != '' &&
                                        <TableBody>
                                            {searchHistory?.searchHistoryArray.map((item: any, index: number) => {
                                                return (
                                                    <TableRow key={index} style={{ backgroundColor: (index % 2 === 0) ? '' : '#d4f3f099'}}>
                                                        <TableCell style={cellStyle}>{index + 1}</TableCell>
                                                        <TableCell style={cellStyle}></TableCell>
                                                        <TableCell style={cellStyle}></TableCell>
                                                        <TableCell style={cellStyle}>{item.name}</TableCell>
                                                        <TableCell style={cellStyle}>{item.dob}</TableCell>
                                                        <TableCell style={cellStyle}>{item.address[0]._}</TableCell>
                                                        <TableCell style={cellStyle}>{item.searchdate[0].split('T')[0]}</TableCell>
                                                        <TableCell style={cellStyle}>{item.searchpurpose}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Address Links*/}
                    {addressLink && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="address-links-content"
                            id="address-links-header"
                        >
                            <Typography variant="h6" color="#039485">Address Links</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Address</TableCell>
                                            <TableCell style={cellStyle}>Source</TableCell>
                                            <TableCell style={cellStyle}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {addressLink && addressLink.addressLinks != '' &&
                                        <TableBody>
                                            {addressLink.addressLinks.map((item: any, index: number) => {
                                                return (
                                                    <TableRow key={index} style={{ backgroundColor: (index % 2 === 0) ? '' : '#d4f3f099'}}>
                                                        <TableCell style={cellStyle}>{index + 1}</TableCell>
                                                        <TableCell style={cellStyle}>{item._}</TableCell>
                                                        <TableCell style={cellStyle}></TableCell>
                                                        <TableCell style={cellStyle}>{data?.fields?.creditReport.lastSyncedDate}</TableCell>
                                                    </TableRow>
                                                )
                                            })

                                            }
                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Associates*/}
                    {associateLinks && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="associates-content"
                            id="associates-header"
                        >
                            <Typography variant="h6" color="#039485">Associates</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Name of Associate</TableCell>
                                            <TableCell style={cellStyle}>Source</TableCell>
                                            <TableCell style={cellStyle}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {associateLinks && associateLinks.associateLinks != '' &&
                                        <TableBody>
                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Aliases Links*/}
                    {aliasesLinks && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="aliases-links-content"
                            id="aliases-links-header"
                        >
                            <Typography variant="h6" color="#039485">Aliases Links</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Names Linked</TableCell>
                                            <TableCell style={cellStyle}>Source</TableCell>
                                            <TableCell style={cellStyle}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* CIFAS Warnings*/}
                    {cifasWarnings && cifasWarnings > 0 && <Accordion >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="CIFAS-warnings-content"
                            id="CIFAS-warnings-header"
                        >
                            <Typography variant="h6" color="#039485">CIFAS Warnings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Name</TableCell>
                                            <TableCell style={cellStyle}>DOB</TableCell>
                                            <TableCell style={cellStyle}>Address</TableCell>
                                            <TableCell style={cellStyle}>Filing Member</TableCell>
                                            <TableCell style={cellStyle}>Fraud Category</TableCell>
                                            <TableCell style={cellStyle}>Filing Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}

                    {/* Financial Accounts*/}
                    {financialAccounts && <Accordion onChange={handleAccordionToggle} >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="financial-accounts-content"
                            id="financial-accounts-header"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <Typography variant="h6" color="#039485">
                                    Financial Accounts
                                </Typography>
                            </div>
                        </AccordionSummary>
                        {isExpanded &&
                            <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'end', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <p>Sort By:</p>
                                    <Select value={sortField} onChange={handleSortChange} className='sortBy'>
                                        <MenuItem value="none">None</MenuItem>
                                        <MenuItem value="acctypecode">Account Type</MenuItem>
                                        <MenuItem value="status">Account Status</MenuItem>
                                        <MenuItem value="balance">Account Current Balance</MenuItem>
                                        <MenuItem value="dateupdated">Date Updated</MenuItem>
                                        <MenuItem value="accstartdate">Account Start Date</MenuItem>
                                        <MenuItem value="provider">Provider</MenuItem>
                                    </Select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button onClick={handleExpandAll} variant="outlined">
                                        Expand All
                                    </Button>
                                    <Button onClick={handleCollapseAll} variant="outlined">
                                        Collapse All
                                    </Button>
                                </div>
                            </div>
                        }

                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table style={{ borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={cellStyle}></TableCell>
                                            <TableCell style={cellStyle}>S.No.</TableCell>
                                            <TableCell style={cellStyle}>Name</TableCell>
                                            <TableCell style={cellStyle}>Address</TableCell>
                                            <TableCell style={cellStyle}>DOB</TableCell>
                                            <TableCell style={cellStyle}>Provider</TableCell>
                                            <TableCell style={cellStyle}>Account Type</TableCell>
                                            <TableCell style={cellStyle}>Account Status</TableCell>
                                            <TableCell style={cellStyle}>Date Updated</TableCell>
                                            <TableCell style={cellStyle}>Account Start Date</TableCell>
                                            <TableCell style={cellStyle}>Account Opening Balance</TableCell>
                                            <TableCell style={cellStyle}>Account Current Balance</TableCell>
                                            <TableCell style={cellStyle}>Limit</TableCell>
                                            <TableCell style={cellStyle}>Regular Payment Amount</TableCell>
                                            <TableCell style={cellStyle}>Repayment Frequency</TableCell>
                                            <TableCell style={cellStyle}>Default</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {financialAccounts && financialAccounts.financialAccounts != '' &&
                                        <TableBody>
                                            {sortedFinancialAccounts && sortedFinancialAccounts?.map((item: any, index: number) => (
                                                <React.Fragment key={index}>
                                                    <TableRow key={index} style={{ backgroundColor: (index % 2 === 0) ? '' : '#d4f3f099'}}>
                                                        <TableCell
                                                            style={cellStyle}
                                                            onClick={() => handleExpandClick(index)}
                                                            sx={{ cursor: 'pointer' }} // Adding cursor pointer for better UX
                                                        >{expandedRow.includes(index) ? '-' : '+'}</TableCell>
                                                        <TableCell style={cellStyle}>{index + 1}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accholderdetails[0].name}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accholderdetails[0].address[0]._.replace(/;+/g, ',')}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accholderdetails[0].dob}</TableCell>
                                                        <TableCell style={cellStyle}>{displayProvider(item.supplierdetails[0].suppliertypecode[0])}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].acctypecode}</TableCell>
                                                        <TableCell style={{ ...cellStyle, fontWeight: '600' }}>
                                                            {checkAndDisplayStatus(item.accdetails[0].status[0])}
                                                        </TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].dateupdated}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].accstartdate}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].openbalance ?? 0}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].balance ?? 0}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].limit ?? 0}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].regpayment ?? 0}</TableCell>
                                                        <TableCell style={cellStyle}>{item.accdetails[0].repayfreqcode}</TableCell>
                                                        <TableCell style={cellStyle}>
                                                            {item.default
                                                                ? `${item.default[0].defdate}, Amount=${item.default[0].origdefbal}`
                                                                : 'No data available'}
                                                        </TableCell>
                                                    </TableRow>
                                                    {expandedRow.includes(index) && item.acchistory && item.acchistory[0]?.ah?.length > 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={16} style={cellStyle}>
                                                                <Table size="small" aria-label="account-history">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell style={cellStyle}>Sr.No.</TableCell>
                                                                            <TableCell style={cellStyle}>Month</TableCell>
                                                                            <TableCell style={cellStyle}>Balance Account</TableCell>
                                                                            <TableCell style={cellStyle}>Limit</TableCell>
                                                                            <TableCell style={cellStyle}>Payment Status Code</TableCell>
                                                                            <TableCell style={cellStyle}>Payment Amount</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {item.acchistory[0].ah.map((nestedItem: any, nestedIndex: number) => (
                                                                            <TableRow key={nestedIndex} style={{ backgroundColor: (nestedIndex % 2 === 0) ? '' : '#d4f3f099'}}>
                                                                                <TableCell style={cellStyle}>{nestedIndex + 1}</TableCell>
                                                                                <TableCell style={cellStyle}>{nestedItem.$.m}</TableCell>
                                                                                <TableCell style={cellStyle}>{nestedItem.$.bal ?? 0}</TableCell>
                                                                                <TableCell style={cellStyle}>{nestedItem.$.limit ?? 0}</TableCell>
                                                                                <TableCell style={cellStyle}>{nestedItem.$.pay ?? 0}</TableCell>
                                                                                <TableCell style={cellStyle}>0</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    }
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>}
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default CreditReport;
