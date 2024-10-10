import { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Transaction } from "../../interfaces/ITransaction";
import { Box, Button, Container, Link, Pagination, TableCell } from "@mui/material";
import CrudMaterialTable, { ColumnData } from "../common/CrudMaterialTable";
import { TableCellRenderer } from "react-virtualized";
import React from "react";
import { DataRecord } from "../../interfaces/IDataRecord";
import AddEditDataRecord from "../datamanager/AddEditData";
import TransactionDetails from "./TransactionDetails";

export interface TransactionsProps {
    companyId: string | undefined;
    contractId: string | undefined;
}

interface TransactionsObject { transaction: Transaction }

export default function Transactions( {companyId, contractId}: TransactionsProps) {
    const { auth } = useAuth()
    const [getTransactions, createTransactions , ,] = useApi()
    const [selectedData, setSelectedData] = React.useState<DataRecord>()
    const [isOpen, setIsOpen] = React.useState<string | undefined>('List')
    const [selectedObject, setSelectedObject] = React.useState('')

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        
        const fetchTransactions = async () => {
            try {
                const response = await getTransactions(`api/contract/transaction?companyId=${companyId}&contractId=${contractId}`);
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        
        fetchTransactions();
    }, [contractId]); 

    const IdRenderer: TableCellRenderer = ({ rowData,rowIndex }) => {
        // setChecked(selectTransactions.includes(rowData.id));
        return (
          <TableCell><Link
            component="button"
            variant="body2"
            onClick={() => {
              setIsOpen('View')
              setSelectedData(rowData);
              setSelectedObject(rowData.objectName)
            }}
          >
            {'TAN '+(rowIndex + 1)}
            {/* {rowData.recordId} */}
          </Link>
          </TableCell>
        )
      }
    
      const createdFieldsRenderer: TableCellRenderer = ({ rowData, dataKey }) => {
        switch (dataKey) {
          case 'TransactionType':
            return (
              <TableCell>{rowData.fields.Type}</TableCell>)
          case 'createdby':
            return (
              <TableCell>{auth?.email}</TableCell>)
          case 'createdat':
            return (
              <TableCell>{rowData.createdAt}</TableCell>)
          case 'type':
            return (
              <TableCell>{rowData.objectName}</TableCell>)
          case 'MoneyIn':
            return (
              <TableCell>{rowData.fields.MoneyIn}</TableCell>)
          case 'TransactionAmount':
            return (
              <TableCell>{rowData.fields.Type == "Withdrawal" ? "-"+rowData.fields.MoneyOut : (rowData.fields.Type == "Deposit" ? "+"+rowData.fields.MoneyIn :(rowData.fields.Type == "Interest" ? rowData.fields.Interest : '') )}</TableCell>)
          case 'Interest':
            return (
              <TableCell>{rowData.fields.Interest}</TableCell>)
          case 'InterestBalance':
            return (
              <TableCell>{rowData.fields.InterestBalance ? (rowData.fields.InterestBalance > 0 ? rowData.fields.InterestBalance :''):rowData.fields.Interest>0?rowData.fields.Interest:''}</TableCell>)
          case 'EndingBalance':
            return (
              <TableCell>{rowData.fields.EndingBalance}</TableCell>)
          case 'BalanceIncludingInterest':
            return (
              <TableCell>{rowData.fields.BalanceIncludingInterest}</TableCell>)
          case 'facilityAvailable':
            return (
              <TableCell>{parseFloat(rowData.fields.FacilityAvailable).toFixed(2).replace(/\.00$/, "")}</TableCell>)
          case 'principleOutstanding':
            return (
              <TableCell>{parseFloat(rowData.fields.TotalOutstanding).toFixed(2).replace(/\.00$/, "")}</TableCell>)
        }
      }    
    
  const columns: ColumnData[] = [
    {
      dataKey: 'recordId',
      label: 'Id',
      width: 175,
      cellRenderer: IdRenderer
    },
    /* {
      dataKey: 'MoneyIn',
      label: 'MoneyIn',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'MoneyOut',
      label: 'MoneyOut',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'Interest',
      label: 'Interest',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'BalanceIncludingInterest',
      label: 'Total Outstanding',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },*/
    {
      dataKey: 'createdat',
      label: 'Date',
      width: 200,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'TransactionType',
      label: 'Transaction Type',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'TransactionAmount',
      label: 'Transaction Amount',
      width: 120,
      cellRenderer: createdFieldsRenderer
    }, 
    {
      dataKey: 'principleOutstanding',
      label: 'Principle Outstanding',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },
    {
      dataKey: 'InterestBalance',
      label: 'Interest Balance',
      width: 120,
      cellRenderer: createdFieldsRenderer
    },
    /* {
      dataKey: 'EndingBalance',
      label: 'Principle Outstanding',
      width: 120,
      cellRenderer: createdFieldsRenderer
    }, */
    {
      dataKey: 'facilityAvailable',
      label: 'Facility Balance',
      width: 165,
      cellRenderer: createdFieldsRenderer
    },
   /*  {
      dataKey: 'createdby',
      label: 'Created By',
      width: 200,
      cellRenderer: createdFieldsRenderer
    }, */
    
  ]

  const hanldeNewTransaction = () =>{
    setIsOpen('New')
  }

    return <>
        {isOpen && isOpen !== 'List' ? (
          <TransactionDetails 
          data={isOpen !== 'New' ? selectedData : undefined} 
          open={isOpen} 
          setOpen={setIsOpen}
          objectName={"Transaction"} 
          />
          )
        :
        <>
          <Button variant="contained" onClick={hanldeNewTransaction}>New Transaction</Button>
          {transactions && transactions.length > 0
          ?
          <Container>
            <Box sx={{ flexGrow: 'auto' }}>
                <CrudMaterialTable
                key={transactions.length}
                tableRows={transactions}
                setTableRows={setTransactions}
                columns={columns}
                isReadOnly={true}
                tableHeight="calc(80vh - 140px)"
                ></CrudMaterialTable>
            </Box>
          </Container>
        :<>
        <br />
        <>No record found</></>}
        </>
      }
    </>
}