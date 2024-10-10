import { Box, Container, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { OverviewCard } from "../common/OverviewCard";
import CloudSyncRoundedIcon from '@mui/icons-material/CloudSyncRounded';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import useApi from "../../hooks/useApi";
import React from "react";

interface DataRecordDetailsProps {
  setStatusesArray: React.Dispatch<React.SetStateAction<any[]>>;
}

const DataRecordDetails: React.FC<DataRecordDetailsProps> = ({ setStatusesArray }) => {
    const [ statuses, setStatuses ] = useState<{[key: string]: {total: number, secondary: string}}[]>([]);
    const [ getStatuses,,, ] = useApi();
    useEffect(() => {
      const fetchStatuses = async () => {
        try {
          const response = await getStatuses(`api/datarecords/statuses`);
          const statusArray = response.data.map((statusObj: any) => {
            const [status, data] = Object.entries(statusObj)[0];
            return status;
          });
  
          setStatusesArray(statusArray);  
          setStatuses(response.data)
        } catch (error) {
          console.error("Error fetching statuses:", error);
        }
      };
      fetchStatuses();
    }, []);

    const iconHandler = (status: string) => {
      if(status.includes('In Progress')) {
        return <CloudSyncRoundedIcon></CloudSyncRoundedIcon>;
      } else if(status.includes('Approved')) {
        return <ThumbUpAltIcon></ThumbUpAltIcon>
      } else if(status.includes('Rejected')) {
        return <ThumbDownIcon></ThumbDownIcon>
      } else {
        return <GroupAddIcon></GroupAddIcon>
      }
    }

    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >    
        <Stack direction='row' spacing={4} alignItems='start'>
          {statuses.map((statusObj, index) => {
            const [status, data] = Object.entries(statusObj)[0];
            return <OverviewCard 
              key={index}
              mainHeading={status} 
              data={`${data.total}`} 
              secondaryHeading={data.secondary}
              iconColor="black"
              icon={<>{iconHandler(status)}</>} 
              /> })}
        </Stack>
      </Box>
    </Container>
  )
}
  
export default DataRecordDetails;