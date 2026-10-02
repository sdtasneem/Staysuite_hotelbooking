import React, { useEffect, useState } from 'react';

import { bookingService } from '../services';

function BookingPage() {
    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);

    const [cancellingId, setCancellingId] = useState(null);

    const [processingId, setProcessingId] = useState(null);

    const [error, setError] = useState('');

    const [message, setMessage] = useState('');

    // Fetch all bookings
    const loadBookings = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await bookingService.getAllBookings();

            if (response.success) {
                setBookings(response.data || []);
            } else {
                setError('Failed to load bookings');
            }
        } catch (err) {
            console.error('Failed to load bookings:', err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    // Load bookings when page opens
    useEffect(() => {
        loadBookings();
    }, []);

    // Cancel booking
    const handleCancelBooking = async (bookingId) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this booking?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(bookingId);
            setError('');
            setMessage('');

            const response = await bookingService.cancelBooking(bookingId);

            if (response.success) {
                setMessage(response.message);

                // Update the booking in the current page
                setBookings((currentBookings) =>
                    currentBookings.map((booking) =>
                        booking.id === bookingId
                            ? {
                                ...booking,
                                booking_status: 'cancelled'
                            }
                            : booking
                    )
                );
            }
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            setError(err.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    // Check-in / Check-out booking
    const handleStayAction = async (bookingId, action) => {
        const actionText = action === 'check-in' ? 'check in' : 'check out';

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this guest?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(bookingId);
            setError('');
            setMessage('');

            const response =
                action === 'check-in'
                    ? await bookingService.checkInBooking(bookingId)
                    : await bookingService.checkOutBooking(bookingId);

            if (response.success) {
                setMessage(response.message);

                setBookings((currentBookings) =>
                    currentBookings.map((booking) =>
                        booking.id === bookingId
                            ? {
                                ...booking,
                                booking_status:
                                    action === 'check-in'
                                        ? 'checked_in'
                                        : 'checked_out',
                                rooms: {
                                    ...booking.rooms,
                                    status:
                                        action === 'check-in'
                                            ? 'occupied'
                                            : 'available'
                                }
                            }
                            : booking
                    )
                );
            }
        } catch (err) {
            console.error(`Failed to ${actionText} booking:`, err);
            setError(
                err.message || `Failed to ${actionText} booking`
            );
        } finally {
            setProcessingId(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingContainer}>
                    <h2>Loading bookings...</h2>
                    <p>Please wait while we fetch the booking data.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Bookings</h1>
                        <p style={styles.subtitle}>
                            Manage hotel reservations and guest bookings
                        </p>
                    </div>

                    <button
                        onClick={loadBookings}
                        style={styles.refreshButton}
                    >
                        Refresh
                    </button>
                </div>

                {/* Success message */}
                {message && (
                    <div style={styles.successMessage}>
                        ✓ {message}
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {/* No bookings */}
                {bookings.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h2>No bookings found</h2>
                        <p>
                            There are currently no bookings to display.
                        </p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Booking</th>
                                    <th style={styles.th}>Guest</th>
                                    <th style={styles.th}>Room</th>
                                    <th style={styles.th}>Check-in</th>
                                    <th style={styles.th}>Check-out</th>
                                    <th style={styles.th}>Guests</th>
                                    <th style={styles.th}>Amount</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookings.map((booking) => {
                                    const isCancelled =
                                        booking.booking_status === 'cancelled';

                                    const isCancelling =
                                        cancellingId === booking.id;

                                    const isProcessing =
                                        processingId === booking.id;

                                    return (
                                        <tr key={booking.id}>
                                            {/* Booking */}
                                            <td style={styles.td}>
                                                <strong>
                                                    {booking.booking_reference ||
                                                        booking.booking_number ||
                                                        booking.id}
                                                </strong>
                                            </td>

                                            {/* Guest */}
                                            <td style={styles.td}>
                                                <div>
                                                    <strong>
                                                        {booking.guests?.full_name ||
                                                            'N/A'}
                                                    </strong>

                                                    {booking.guests?.email && (
                                                        <div
                                                            style={
                                                                styles.secondaryText
                                                            }
                                                        >
                                                            {booking.guests.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Room */}
                                            <td style={styles.td}>
                                                {booking.rooms?.room_number ||
                                                    'N/A'}
                                            </td>

                                            {/* Check-in */}
                                            <td style={styles.td}>
                                                {booking.check_in_date || 'N/A'}
                                            </td>

                                            {/* Check-out */}
                                            <td style={styles.td}>
                                                {booking.check_out_date || 'N/A'}
                                            </td>

                                            {/* Number of guests */}
                                            <td style={styles.td}>
                                                {booking.number_of_guests || 'N/A'}
                                            </td>

                                            {/* Amount */}
                                            <td style={styles.td}>
                                                ₹
                                                {Number(
                                                    booking.total_amount || 0
                                                ).toLocaleString('en-IN')}
                                            </td>

                                            {/* Status */}
                                            <td style={styles.td}>
                                                <span
                                                    style={{
                                                        ...styles.status,
                                                        ...(isCancelled
                                                            ? styles.cancelledStatus
                                                            : styles.activeStatus)
                                                    }}
                                                >
                                                    {booking.booking_status}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td style={styles.td}>
                                                <div
                                                    style={
                                                        styles.actionContainer
                                                    }
                                                >
                                                    {/* Check In */}
                                                    {booking.booking_status ===
                                                        'confirmed' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleStayAction(
                                                                        booking.id,
                                                                        'check-in'
                                                                    )
                                                                }
                                                                disabled={
                                                                    isProcessing
                                                                }
                                                                style={
                                                                    styles.checkInButton
                                                                }
                                                            >
                                                                {isProcessing
                                                                    ? 'Processing...'
                                                                    : 'Check In'}
                                                            </button>
                                                        )}

                                                    {/* Check Out */}
                                                    {booking.booking_status ===
                                                        'checked_in' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleStayAction(
                                                                        booking.id,
                                                                        'check-out'
                                                                    )
                                                                }
                                                                disabled={
                                                                    isProcessing
                                                                }
                                                                style={
                                                                    styles.checkOutButton
                                                                }
                                                            >
                                                                {isProcessing
                                                                    ? 'Processing...'
                                                                    : 'Check Out'}
                                                            </button>
                                                        )}

                                                    {/* Cancel */}
                                                    {!isCancelled &&
                                                        booking.booking_status !==
                                                        'checked_out' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleCancelBooking(
                                                                        booking.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isCancelling ||
                                                                    isProcessing
                                                                }
                                                                style={
                                                                    styles.cancelButton
                                                                }
                                                            >
                                                                {isCancelling
                                                                    ? 'Cancelling...'
                                                                    : 'Cancel'}
                                                            </button>
                                                        )}

                                                    {/* Completed */}
                                                    {booking.booking_status ===
                                                        'checked_out' && (
                                                            <span
                                                                style={
                                                                    styles.disabledText
                                                                }
                                                            >
                                                                Completed
                                                            </span>
                                                        )}

                                                    {/* Cancelled */}
                                                    {isCancelled && (
                                                        <span
                                                            style={
                                                                styles.disabledText
                                                            }
                                                        >
                                                            Cancelled
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0b0f17',
        color: '#ffffff',
        padding: '32px'
    },

    container: {
        maxWidth: '1400px',
        margin: '0 auto'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px'
    },

    title: {
        margin: 0,
        fontSize: '32px',
        fontWeight: 700
    },

    subtitle: {
        marginTop: '8px',
        color: '#94a3b8',
        fontSize: '15px'
    },

    refreshButton: {
        padding: '10px 18px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#1e293b',
        color: '#ffffff',
        cursor: 'pointer',
        fontWeight: 600
    },

    successMessage: {
        padding: '14px 18px',
        marginBottom: '20px',
        borderRadius: '8px',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#34d399'
    },

    errorMessage: {
        padding: '14px 18px',
        marginBottom: '20px',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#f87171'
    },

    loadingContainer: {
        textAlign: 'center',
        paddingTop: '100px'
    },

    emptyState: {
        textAlign: 'center',
        padding: '60px',
        background: '#111827',
        borderRadius: '12px',
        border: '1px solid #1f2937'
    },

    tableContainer: {
        overflowX: 'auto',
        background: '#111827',
        borderRadius: '12px',
        border: '1px solid #1f2937'
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '1100px'
    },

    th: {
        textAlign: 'left',
        padding: '16px',
        background: '#172033',
        color: '#cbd5e1',
        fontSize: '13px',
        fontWeight: 600,
        borderBottom: '1px solid #334155'
    },

    td: {
        padding: '16px',
        borderBottom: '1px solid #1f2937',
        fontSize: '14px',
        color: '#e2e8f0'
    },

    secondaryText: {
        marginTop: '4px',
        color: '#94a3b8',
        fontSize: '12px'
    },

    status: {
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize'
    },

    activeStatus: {
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa'
    },

    cancelledStatus: {
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171'
    },

    actionContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        alignItems: 'flex-start'
    },

    checkInButton: {
        padding: '8px 14px',
        borderRadius: '7px',
        border: '1px solid #22c55e',
        background: 'transparent',
        color: '#4ade80',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px'
    },

    checkOutButton: {
        padding: '8px 14px',
        borderRadius: '7px',
        border: '1px solid #f59e0b',
        background: 'transparent',
        color: '#fbbf24',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px'
    },

    cancelButton: {
        padding: '8px 14px',
        borderRadius: '7px',
        border: '1px solid #ef4444',
        background: 'transparent',
        color: '#f87171',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px'
    },

    disabledText: {
        color: '#64748b',
        fontSize: '13px'
    }
};

export default BookingPage;