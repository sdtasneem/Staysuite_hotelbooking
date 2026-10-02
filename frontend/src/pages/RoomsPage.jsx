import React, { useEffect, useState } from 'react';
import { roomService } from '../services';

function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [checkingAvailability, setCheckingAvailability] =
        useState(false);

    const [error, setError] = useState('');
    const [availabilityError, setAvailabilityError] = useState('');

    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');

    const [availabilityChecked, setAvailabilityChecked] =
        useState(false);

    // ---------------------------------------------------------
    // Load all rooms
    // ---------------------------------------------------------

    const loadRooms = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await roomService.getAllRooms();

            if (response.success) {
                setRooms(response.data || []);
            } else {
                setError('Failed to load rooms');
            }
        } catch (err) {
            console.error('Failed to load rooms:', err);

            setError(
                err.message || 'Failed to load rooms'
            );
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // Load rooms when page opens
    // ---------------------------------------------------------

    useEffect(() => {
        loadRooms();
    }, []);

    // ---------------------------------------------------------
    // Check room availability
    // ---------------------------------------------------------

    const handleCheckAvailability = async (event) => {
        event.preventDefault();

        setAvailabilityError('');
        setAvailableRooms([]);
        setAvailabilityChecked(false);

        if (!checkInDate || !checkOutDate) {
            setAvailabilityError(
                'Please select both check-in and check-out dates.'
            );

            return;
        }

        if (checkInDate >= checkOutDate) {
            setAvailabilityError(
                'Check-in date must be before check-out date.'
            );

            return;
        }

        try {
            setCheckingAvailability(true);

            const response =
                await roomService.getAvailableRooms(
                    checkInDate,
                    checkOutDate
                );

            if (response.success) {
                setAvailableRooms(response.data || []);
                setAvailabilityChecked(true);
            } else {
                setAvailabilityError(
                    response.message ||
                    'Failed to check room availability.'
                );
            }
        } catch (err) {
            console.error(
                'Failed to check room availability:',
                err
            );

            setAvailabilityError(
                err.message ||
                'Failed to check room availability.'
            );
        } finally {
            setCheckingAvailability(false);
        }
    };

    // ---------------------------------------------------------
    // Room status styling
    // ---------------------------------------------------------

    const getRoomStatusStyle = (status) => {
        const normalizedStatus =
            String(status || '').toLowerCase();

        if (
            normalizedStatus === 'available'
        ) {
            return {
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399'
            };
        }

        if (
            normalizedStatus === 'occupied' ||
            normalizedStatus === 'booked'
        ) {
            return {
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171'
            };
        }

        if (
            normalizedStatus === 'maintenance'
        ) {
            return {
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24'
            };
        }

        return {
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa'
        };
    };

    // ---------------------------------------------------------
    // Loading state
    // ---------------------------------------------------------

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingContainer}>
                    <h2>Loading rooms...</h2>

                    <p>
                        Please wait while we fetch room information.
                    </p>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Page
    // ---------------------------------------------------------

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* ===================================================
            PAGE HEADER
        =================================================== */}

                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            Rooms
                        </h1>

                        <p style={styles.subtitle}>
                            View hotel rooms and check room availability
                        </p>
                    </div>

                    <button
                        onClick={loadRooms}
                        style={styles.refreshButton}
                    >
                        Refresh
                    </button>
                </div>

                {/* ===================================================
            ERROR
        =================================================== */}

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {/* ===================================================
            ROOM SUMMARY
        =================================================== */}

                <div style={styles.summaryGrid}>

                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>
                            Total Rooms
                        </div>

                        <div style={styles.summaryValue}>
                            {rooms.length}
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>
                            Available
                        </div>

                        <div style={styles.summaryValue}>
                            {
                                rooms.filter(
                                    (room) =>
                                        String(room.status || '')
                                            .toLowerCase() === 'available'
                                ).length
                            }
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>
                            Occupied
                        </div>

                        <div style={styles.summaryValue}>
                            {
                                rooms.filter(
                                    (room) =>
                                        String(room.status || '')
                                            .toLowerCase() === 'occupied'
                                ).length
                            }
                        </div>
                    </div>

                </div>

                {/* ===================================================
            ALL ROOMS
        =================================================== */}

                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>
                                All Rooms
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Current room information
                            </p>
                        </div>
                    </div>

                    {rooms.length === 0 ? (
                        <div style={styles.emptyState}>
                            <h3>No rooms found</h3>

                            <p>
                                There are currently no rooms available
                                in the database.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>
                                            Room
                                        </th>

                                        <th style={styles.th}>
                                            Floor
                                        </th>

                                        <th style={styles.th}>
                                            Status
                                        </th>

                                        <th style={styles.th}>
                                            Room Type ID
                                        </th>

                                        <th style={styles.th}>
                                            Hotel ID
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rooms.map((room) => (
                                        <tr key={room.id}>

                                            <td style={styles.td}>
                                                <strong>
                                                    {room.room_number}
                                                </strong>
                                            </td>

                                            <td style={styles.td}>
                                                {room.floor ?? 'N/A'}
                                            </td>

                                            <td style={styles.td}>
                                                <span
                                                    style={{
                                                        ...styles.status,
                                                        ...getRoomStatusStyle(
                                                            room.status
                                                        )
                                                    }}
                                                >
                                                    {room.status || 'Unknown'}
                                                </span>
                                            </td>

                                            <td style={styles.td}>
                                                {room.room_type_id || 'N/A'}
                                            </td>

                                            <td style={styles.td}>
                                                {room.hotel_id || 'N/A'}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* ===================================================
            AVAILABILITY SEARCH
        =================================================== */}

                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>
                                Check Room Availability
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Find rooms available for a specific
                                date range
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleCheckAvailability}
                        style={styles.searchForm}
                    >

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Check-in Date
                            </label>

                            <input
                                type="date"
                                value={checkInDate}
                                onChange={(event) =>
                                    setCheckInDate(event.target.value)
                                }
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Check-out Date
                            </label>

                            <input
                                type="date"
                                value={checkOutDate}
                                onChange={(event) =>
                                    setCheckOutDate(event.target.value)
                                }
                                style={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={checkingAvailability}
                            style={styles.searchButton}
                        >
                            {checkingAvailability
                                ? 'Checking...'
                                : 'Check Availability'}
                        </button>

                    </form>

                    {/* Availability error */}

                    {availabilityError && (
                        <div style={styles.errorMessage}>
                            {availabilityError}
                        </div>
                    )}

                    {/* Availability result */}

                    {availabilityChecked && (
                        <div style={styles.availabilityResult}>

                            <div style={styles.availabilityHeader}>
                                <div>
                                    <h3 style={styles.resultTitle}>
                                        Available Rooms
                                    </h3>

                                    <p style={styles.resultSubtitle}>
                                        {checkInDate} → {checkOutDate}
                                    </p>
                                </div>

                                <div style={styles.countBadge}>
                                    {availableRooms.length}{' '}
                                    {availableRooms.length === 1
                                        ? 'room'
                                        : 'rooms'}
                                </div>
                            </div>

                            {availableRooms.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <h3>
                                        No rooms available
                                    </h3>

                                    <p>
                                        No rooms are available for the
                                        selected date range.
                                    </p>
                                </div>
                            ) : (
                                <div style={styles.roomGrid}>
                                    {availableRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            style={styles.roomCard}
                                        >
                                            <div style={styles.roomCardHeader}>
                                                <div>
                                                    <div style={styles.roomNumber}>
                                                        Room {room.room_number}
                                                    </div>

                                                    <div style={styles.floorText}>
                                                        Floor {room.floor}
                                                    </div>
                                                </div>

                                                <span
                                                    style={{
                                                        ...styles.status,
                                                        ...getRoomStatusStyle(
                                                            room.status
                                                        )
                                                    }}
                                                >
                                                    {room.status || 'Available'}
                                                </span>
                                            </div>

                                            <div style={styles.roomDetails}>
                                                <div>
                                                    <span style={styles.detailLabel}>
                                                        Room Type
                                                    </span>

                                                    <span style={styles.detailValue}>
                                                        {room.room_type_id ||
                                                            'N/A'}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span style={styles.detailLabel}>
                                                        Hotel
                                                    </span>

                                                    <span style={styles.detailValue}>
                                                        {room.hotel_id ||
                                                            'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}


// =========================================================
// STYLES
// =========================================================

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

    section: {
        marginTop: '32px'
    },

    sectionHeader: {
        marginBottom: '18px'
    },

    sectionTitle: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 700
    },

    sectionSubtitle: {
        marginTop: '6px',
        color: '#94a3b8',
        fontSize: '14px'
    },

    summaryGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
    },

    summaryCard: {
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '22px'
    },

    summaryLabel: {
        color: '#94a3b8',
        fontSize: '13px',
        marginBottom: '8px'
    },

    summaryValue: {
        fontSize: '28px',
        fontWeight: 700
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
        minWidth: '850px'
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

    status: {
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize'
    },

    searchForm: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        alignItems: 'end',
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '22px'
    },

    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    label: {
        fontSize: '13px',
        color: '#cbd5e1',
        fontWeight: 600
    },

    input: {
        padding: '11px 12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '14px'
    },

    searchButton: {
        padding: '11px 18px',
        borderRadius: '8px',
        border: '1px solid #f59e0b',
        background: '#f59e0b',
        color: '#0b0f17',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '14px'
    },

    availabilityResult: {
        marginTop: '20px',
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '22px'
    },

    availabilityHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },

    resultTitle: {
        margin: 0,
        fontSize: '18px'
    },

    resultSubtitle: {
        marginTop: '6px',
        color: '#94a3b8',
        fontSize: '13px'
    },

    countBadge: {
        padding: '8px 12px',
        borderRadius: '20px',
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa',
        fontSize: '13px',
        fontWeight: 700
    },

    roomGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
    },

    roomCard: {
        background: '#0f172a',
        border: '1px solid #263449',
        borderRadius: '10px',
        padding: '18px'
    },

    roomCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '18px'
    },

    roomNumber: {
        fontSize: '18px',
        fontWeight: 700
    },

    floorText: {
        marginTop: '5px',
        color: '#94a3b8',
        fontSize: '13px'
    },

    roomDetails: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        paddingTop: '14px',
        borderTop: '1px solid #1f2937'
    },

    detailLabel: {
        display: 'block',
        color: '#64748b',
        fontSize: '11px',
        marginBottom: '4px',
        textTransform: 'uppercase'
    },

    detailValue: {
        display: 'block',
        color: '#cbd5e1',
        fontSize: '12px',
        wordBreak: 'break-all'
    },

    errorMessage: {
        padding: '14px 18px',
        marginBottom: '20px',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#f87171'
    },

    emptyState: {
        textAlign: 'center',
        padding: '40px',
        background: '#0f172a',
        borderRadius: '10px',
        color: '#94a3b8'
    },

    loadingContainer: {
        textAlign: 'center',
        paddingTop: '100px'
    }
};

export default RoomsPage;