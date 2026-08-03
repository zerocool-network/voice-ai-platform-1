import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogActions } from '@/Components/catalyst/dialog';
import { Button } from '@/Components/catalyst/button';
import { SESSION_EXPIRED_EVENT } from '@/lib/sessionExpiry';

export default function SessionExpiredDialog() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleExpired = () => setOpen(true);

        window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);

        return () => {
            window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
        };
    }, []);

    return (
        <Dialog open={open} onClose={() => setOpen(false)} size="sm">
            <DialogTitle>Session expired</DialogTitle>
            <DialogDescription>
                Your session has expired due to inactivity. Reload the page to continue
                working securely.
            </DialogDescription>
            <DialogActions>
                <Button outline onClick={() => setOpen(false)}>
                    Dismiss
                </Button>
                <Button onClick={() => window.location.reload()}>
                    Reload now
                </Button>
            </DialogActions>
        </Dialog>
    );
}
