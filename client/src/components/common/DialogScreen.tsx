import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';
import { Divider } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: '4px'
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
    '& .MuiStepIcon-root': {
        color: "#28b848"
    },
    '& .MuiStepIcon-root.Mui-active': {
        color: "white",
        fill: "#1B2F33"
    }
}));

const DialogScreen = ({ open, onClose, title, subTitle, children, width, customHeight }: { open: boolean, onClose: any, title: string, subTitle: string, children: any, width: string, customHeight: string }) => {
    return (
        <BootstrapDialog
            onClose={onClose}
            aria-labelledby="mobile-dialog-title"
            open={open}
            sx={{ marginTop: '10px', marginRight: '10px', marginLeft: '10px', marginBottom: '10px', borderRadius: '0.5rem', height: customHeight }}
            PaperProps={{ sx: { borderRadius: "5px" } }}
            fullWidth={width === 'full' ? true : false}
            fullScreen={width !== 'full' ? true : false}
        >
            <DialogTitle sx={{ m: 0, p: 2,textAlign: 'center' }} id="mobile-dialog-title">
                {title}
                <Typography sx={{ color: (theme) => theme.palette.grey[500] }} variant='h5' >{subTitle}</Typography>
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    width: '40px',
                    position: 'absolute',
                    right: 10,
                    top: 5,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <Divider />
            <DialogContent>
                {children}
            </DialogContent>
        </BootstrapDialog>
    );
}

export default DialogScreen