import { Dialog, DialogContent, Box, Button } from '@mui/material'
import useFormHelper from '../../hooks/useFormHelper'

export default function ConfirmDeleteModal({
    modalOpen,
    handleClose,
    onSubmit
}: {
    modalOpen: boolean
    handleClose: any
    onSubmit: any
}) {
    const [parseError] = useFormHelper()

    const handleSubmit = async () => {
        onSubmit()
        handleClose()
    }
    return (
        <Dialog open={modalOpen} >
            <DialogContent>
                <Box sx={{ maxWidth: '500px', minWidth: '400px', fontSize: '1.2rem', fontWeight: 'bold' }} justifyContent="flex-end">
                    Are you sure you want to delete this field?
                </Box>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button style={{ border: '1px solid #039485' }} onClick={() => handleSubmit()}>Confirm</Button>
                    <Button style={{ border: '1px solid #039485', marginLeft: '1rem' }} onClick={() => handleClose()}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
