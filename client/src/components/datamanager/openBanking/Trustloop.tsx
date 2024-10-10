import { Box, Divider, Grid, TextField, Typography } from '@mui/material';
import React from 'react';

const TrustLoop = (props: { data: any }) => {
    const { data } = props;

    const formatNumber = (number: number,currencySymbol: string = '£') => {
        if (number == null) return '';
        // return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${currencySymbol}${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };
    
    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant='h4'>TrustLoop</Typography>
            <Divider></Divider>
            <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }}>
                <Grid item xs={12}>
                    <Typography variant='h5'>Income</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Average Income from paychecks over the last 6 months. (Arithmetic mean)' value={formatNumber(data.fields?.income_summary?.AvgLast6MonthPaycheck/100)} />
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Last month’s income from paychecks' value={`income: ${formatNumber(data.fields?.income_summary?.LastPaycheckIncome?.amount_sum/100)}, month: ${data.fields?.income_summary?.LastPaycheckIncome.month}`} />
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Total Count of Merchant: “Returned” & Code: “IssuedDirectDebits” (3 months)' value={formatNumber(data.fields?.income_summary?.Returned?.ReturnsCountLast3months)} />
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Total Sum of Merchant: “Returned” & Code: “IssuedDirectDebits” (3 months)' value={formatNumber(data.fields?.income_summary?.Returned?.ReturnsSumLast3months)} />
                </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }}>
                <Grid item xs={12}>
                    <Typography variant='h5'>Gambling</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Gambling spend over last 6 months as a % of net income. (Arithmetic Mean)' value={formatNumber(data.fields?.expenditure?.Entertainment?.GamblingOver6MonthComparingToAllIncome,'')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Gambling spend over last 6 months as a % of paycheck income. (Arithmetic Mean)' value={formatNumber(data.fields?.expenditure?.Entertainment?.GamblingOver6MonthComparingToPaycheckIncome,'')} />
                </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }}>
                <Grid item xs={12}>
                    <Typography variant='h5'>Transfers</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Transfers as a % of Paycheck Income - Average over 6 months' value={formatNumber(data.fields?.affordability?.TransfersSummary?.TransferPerPaychecks6Months,'')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='Transfers as a % of Paycheck Income - Average over 3 months' value={formatNumber(data.fields?.affordability?.TransfersSummary?.TransferPerPaychecks3Months,'')} />
                </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }}>
                <Grid item xs={12}>
                    <Typography variant='h5'>Overdraft</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='% of days spent in overdraft over the last 3 months' value={formatNumber(data.fields?.behaviours?.overdraft_days_pcf_3_months,'')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField type='string' disabled fullWidth label='% of days spent in overdraft over the last 6 months' value={formatNumber(data.fields?.behaviours?.overdraft_days_pcf_6_months,'')} />
                </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }}>
                <Grid item xs={12}>
                    <Typography variant='h5'>Overview</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Days In Range' value={data.fields?.Overview?.DaysInRange} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Earliest Date' value={formatDate(data.fields?.Overview?.EarliestDate)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Last Date' value={formatDate(data.fields?.Overview?.LastDate)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Current Balance' value={formatNumber(data.fields?.Overview?.CurrentBalance/100)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Is Overdraft Now' value={data.fields?.Overview?.IsOverdraftNow} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Last Overdraft Date' value={formatDate(data.fields?.Overview?.LastOverdraftDate)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Overdraft Days Qty' value={data.fields?.Overview?.OverdraftDaysQty} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Overdraft Days Pct' value={formatNumber(data.fields?.Overview?.OverdraftDaysPct,'')} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Average Loan Repayment' value={formatNumber(data.fields?.Overview?.AvgLoanRepayment)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Average Monthly Mean' value={formatNumber(data.fields?.Overview?.AvgMonthlyMean/100)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Average Monthly Mean (3 Months)' value={formatNumber(data.fields?.Overview?.AvgMonthlyMean3Months/100)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Count Of Repayment (3 Months)' value={formatNumber(data.fields?.Overview?.CountOfRepaymentLast3Month)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField type='string' disabled label='Count Of Credits less than 1000 GBP' value={formatNumber(data.fields?.Overview?.CountOfCreditsLess1000Gbp)} />
                </Grid>
            </Grid>
            <Divider></Divider>
        </Box>
    );
}

export default TrustLoop;
