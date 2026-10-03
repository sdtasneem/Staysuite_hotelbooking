import React, { useEffect, useState } from 'react';
import { roomService } from '../services';


function RoomsPage() {
    /* =========================================================
       ROOM STATE
       ========================================================= */

    const [rooms, setRooms] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [checkingAvailability, setCheckingAvailability] =
        useState(false);

    const [error, setError] = useState('');
    const [availabilityError, setAvailabilityError] = useState('');
    const [crudError, setCrudError] = useState('');

    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [availabilityChecked, setAvailabilityChecked] =
        useState(false);


    /* =========================================================
       CRUD STATE
       ========================================================= */

    const [showRoomForm, setShowRoomForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [savingRoom, setSavingRoom] = useState(false);
    const [deletingRoomId, setDeletingRoomId] = useState(null);

    const [roomForm, setRoomForm] = useState({
        hotel_id: '',
        room_type_id: '',
        room_number: '',
        floor: 1,
        status: 'available',
        is_smoking: false,
        keycard_code: '',
        notes: ''
    });


    /* =========================================================
       LOAD ALL ROOMS
       ========================================================= */

    const loadRooms = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await roomService.getAllRooms();

            if (response.success) {
                setRooms(response.data || []);
            } else {
                setError(
                    response.message ||
                    'Failed to load rooms'
                );
            }
        } catch (err) {
            console.error('Failed to load rooms:', err);

            setError(
                err.message ||
                'Failed to load rooms'
            );
        } finally {
            setLoading(false);
        }
    };


    /* =========================================================
       LOAD ROOMS WHEN PAGE OPENS
       ========================================================= */

    useEffect(() => {
        loadRooms();
    }, []);


    /* =========================================================
       CHECK ROOM AVAILABILITY
       ========================================================= */

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


    /* =========================================================
       ROOM FORM HANDLERS
       ========================================================= */

    const handleRoomInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setRoomForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const resetRoomForm = () => {
        setRoomForm({
            hotel_id: '',
            room_type_id: '',
            room_number: '',
            floor: 1,
            status: 'available',
            is_smoking: false,
            keycard_code: '',
            notes: ''
        });

        setEditingRoom(null);
        setCrudError('');
    };


    const openAddRoomForm = () => {
        resetRoomForm();
        setShowRoomForm(true);
    };


    const openEditRoomForm = (room) => {
        setCrudError('');

        setEditingRoom(room);

        setRoomForm({
            hotel_id: room.hotel_id || '',
            room_type_id: room.room_type_id || '',
            room_number: room.room_number || '',
            floor: room.floor ?? 1,
            status: room.status || 'available',
            is_smoking: Boolean(room.is_smoking),
            keycard_code: room.keycard_code || '',
            notes: room.notes || ''
        });

        setShowRoomForm(true);
    };


    const closeRoomForm = () => {
        if (savingRoom) {
            return;
        }

        setShowRoomForm(false);
        resetRoomForm();
    };


    /* =========================================================
       CREATE / UPDATE ROOM
       ========================================================= */

    const handleSaveRoom = async (event) => {
        event.preventDefault();

        setCrudError('');

        const hotelId = roomForm.hotel_id.trim();
        const roomTypeId = roomForm.room_type_id.trim();
        const roomNumber = roomForm.room_number.trim();

        if (!hotelId) {
            setCrudError('Hotel ID is required.');
            return;
        }

        if (!roomTypeId) {
            setCrudError('Room Type ID is required.');
            return;
        }

        if (!roomNumber) {
            setCrudError('Room number is required.');
            return;
        }

        const floor = Number(roomForm.floor);

        if (!Number.isInteger(floor) || floor < 1) {
            setCrudError(
                'Floor must be a positive whole number.'
            );
            return;
        }

        const payload = {
            hotel_id: hotelId,
            room_type_id: roomTypeId,
            room_number: roomNumber,
            floor,
            status: roomForm.status,
            is_smoking: roomForm.is_smoking,
            keycard_code:
                roomForm.keycard_code.trim() || null,
            notes:
                roomForm.notes.trim() || null
        };

        try {
            setSavingRoom(true);

            if (editingRoom) {
                await roomService.updateRoom(
                    editingRoom.id,
                    payload
                );
            } else {
                await roomService.createRoom(payload);
            }

            setShowRoomForm(false);
            resetRoomForm();

            await loadRooms();
        } catch (err) {
            console.error(
                'Failed to save room:',
                err
            );

            setCrudError(
                err.message ||
                'Failed to save room.'
            );
        } finally {
            setSavingRoom(false);
        }
    };


    /* =========================================================
       DELETE ROOM
       ========================================================= */

    const handleDeleteRoom = async (room) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete Room ${room.room_number}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingRoomId(room.id);
            setCrudError('');

            await roomService.deleteRoom(room.id);

            await loadRooms();
        } catch (err) {
            console.error(
                'Failed to delete room:',
                err
            );

            setCrudError(
                err.message ||
                'Failed to delete room.'
            );
        } finally {
            setDeletingRoomId(null);
        }
    };


    /* =========================================================
       ROOM STATUS STYLING
       ========================================================= */

    const getRoomStatusStyle = (status) => {
        const normalizedStatus =
            String(status || '').toLowerCase();

        if (normalizedStatus === 'available') {
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

        if (normalizedStatus === 'maintenance') {
            return {
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24'
            };
        }

        if (normalizedStatus === 'cleaning') {
            return {
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa'
            };
        }

        if (normalizedStatus === 'reserved') {
            return {
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc'
            };
        }

        return {
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa'
        };
    };


    /* =========================================================
       LOADING STATE
       ========================================================= */

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


    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            Rooms
                        </h1>

                        <p style={styles.subtitle}>
                            View hotel rooms and check room availability
                        </p>
                    </div>

                    <div style={styles.headerActions}>
                        <button
                            onClick={openAddRoomForm}
                            style={styles.addButton}
                        >
                            + Add Room
                        </button>

                        <button
                            onClick={loadRooms}
                            style={styles.refreshButton}
                        >
                            Refresh
                        </button>
                    </div>
                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {crudError && (
                    <div style={styles.errorMessage}>
                        {crudError}
                    </div>
                )}


                {/* =================================================
                    ROOM FORM
                ================================================= */}

                {showRoomForm && (
                    <section style={styles.formSection}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    {editingRoom
                                        ? 'Edit Room'
                                        : 'Add New Room'}
                                </h2>

                                <p style={styles.sectionSubtitle}>
                                    {editingRoom
                                        ? `Update Room ${editingRoom.room_number}`
                                        : 'Enter the room information below'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRoomForm}
                                disabled={savingRoom}
                                style={styles.closeButton}
                            >
                                Close
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveRoom}
                            style={styles.roomForm}
                        >

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Hotel ID *
                                </label>

                                <input
                                    type="text"
                                    name="hotel_id"
                                    value={roomForm.hotel_id}
                                    onChange={handleRoomInputChange}
                                    placeholder="Enter hotel UUID"
                                    style={styles.input}
                                    disabled={savingRoom}
                                />
                            </div>


                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Room Type ID *
                                </label>

                                <input
                                    type="text"
                                    name="room_type_id"
                                    value={roomForm.room_type_id}
                                    onChange={handleRoomInputChange}
                                    placeholder="Enter room type UUID"
                                    style={styles.input}
                                    disabled={savingRoom}
                                />
                            </div>


                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Room Number *
                                </label>

                                <input
                                    type="text"
                                    name="room_number"
                                    value={roomForm.room_number}
                                    onChange={handleRoomInputChange}
                                    placeholder="Example: 301"
                                    style={styles.input}
                                    disabled={savingRoom}
                                />
                            </div>


                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Floor *
                                </label>

                                <input
                                    type="number"
                                    name="floor"
                                    min="1"
                                    value={roomForm.floor}
                                    onChange={handleRoomInputChange}
                                    style={styles.input}
                                    disabled={savingRoom}
                                />
                            </div>


                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={roomForm.status}
                                    onChange={handleRoomInputChange}
                                    style={styles.input}
                                    disabled={savingRoom}
                                >
                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="occupied">
                                        Occupied
                                    </option>

                                    <option value="maintenance">
                                        Maintenance
                                    </option>

                                    <option value="cleaning">
                                        Cleaning
                                    </option>

                                    <option value="reserved">
                                        Reserved
                                    </option>
                                </select>
                            </div>


                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Keycard Code
                                </label>

                                <input
                                    type="text"
                                    name="keycard_code"
                                    value={roomForm.keycard_code}
                                    onChange={handleRoomInputChange}
                                    placeholder="Optional"
                                    style={styles.input}
                                    disabled={savingRoom}
                                />
                            </div>


                            <div style={styles.inputGroup}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="is_smoking"
                                        checked={roomForm.is_smoking}
                                        onChange={handleRoomInputChange}
                                        disabled={savingRoom}
                                    />

                                    Smoking Room
                                </label>
                            </div>


                            <div
                                style={{
                                    ...styles.inputGroup,
                                    gridColumn: '1 / -1'
                                }}
                            >
                                <label style={styles.label}>
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={roomForm.notes}
                                    onChange={handleRoomInputChange}
                                    placeholder="Optional room notes"
                                    rows="3"
                                    style={styles.textarea}
                                    disabled={savingRoom}
                                />
                            </div>


                            <div style={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={closeRoomForm}
                                    disabled={savingRoom}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingRoom}
                                    style={styles.saveButton}
                                >
                                    {savingRoom
                                        ? 'Saving...'
                                        : editingRoom
                                            ? 'Update Room'
                                            : 'Create Room'}
                                </button>
                            </div>

                        </form>
                    </section>
                )}


                {/* =================================================
                    ROOM SUMMARY
                ================================================= */}

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
                                            .toLowerCase() ===
                                        'available'
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
                                            .toLowerCase() ===
                                        'occupied'
                                ).length
                            }
                        </div>
                    </div>

                </div>


                {/* =================================================
                    ALL ROOMS
                ================================================= */}

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
                            <h3>
                                No rooms found
                            </h3>

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

                                        <th style={styles.th}>
                                            Actions
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
                                                    {room.status ||
                                                        'Unknown'}
                                                </span>

                                            </td>


                                            <td style={styles.td}>
                                                {room.room_type_id ||
                                                    'N/A'}
                                            </td>


                                            <td style={styles.td}>
                                                {room.hotel_id ||
                                                    'N/A'}
                                            </td>


                                            <td style={styles.td}>

                                                <div style={styles.actionButtons}>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditRoomForm(
                                                                room
                                                            )
                                                        }
                                                        style={
                                                            styles.editButton
                                                        }
                                                        disabled={
                                                            deletingRoomId ===
                                                            room.id
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteRoom(
                                                                room
                                                            )
                                                        }
                                                        style={
                                                            styles.deleteButton
                                                        }
                                                        disabled={
                                                            deletingRoomId ===
                                                            room.id
                                                        }
                                                    >
                                                        {deletingRoomId ===
                                                            room.id
                                                            ? 'Deleting...'
                                                            : 'Delete'}
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        </div>

                    )}

                </section>


                {/* =================================================
                    AVAILABILITY SEARCH
                ================================================= */}

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
                                    setCheckInDate(
                                        event.target.value
                                    )
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
                                    setCheckOutDate(
                                        event.target.value
                                    )
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

                                            <div
                                                style={
                                                    styles.roomCardHeader
                                                }
                                            >

                                                <div>

                                                    <div
                                                        style={
                                                            styles.roomNumber
                                                        }
                                                    >
                                                        Room{' '}
                                                        {
                                                            room.room_number
                                                        }
                                                    </div>

                                                    <div
                                                        style={
                                                            styles.floorText
                                                        }
                                                    >
                                                        Floor{' '}
                                                        {room.floor}
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
                                                    {room.status ||
                                                        'Available'}
                                                </span>

                                            </div>


                                            <div
                                                style={
                                                    styles.roomDetails
                                                }
                                            >

                                                <div>

                                                    <span
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        Room Type
                                                    </span>

                                                    <span
                                                        style={
                                                            styles.detailValue
                                                        }
                                                    >
                                                        {
                                                            room.room_type_id
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <span
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        Hotel
                                                    </span>

                                                    <span
                                                        style={
                                                            styles.detailValue
                                                        }
                                                    >
                                                        {
                                                            room.hotel_id
                                                        }
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


/* =========================================================
   STYLES
   ========================================================= */

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
        marginBottom: '28px',
        gap: '20px'
    },


    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
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


    addButton: {
        padding: '10px 18px',
        borderRadius: '8px',
        border: '1px solid #10b981',
        background: '#10b981',
        color: '#052e16',
        cursor: 'pointer',
        fontWeight: 700
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


    closeButton: {
        padding: '9px 16px',
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


    formSection: {
        marginTop: '10px',
        padding: '22px',
        background: '#111827',
        border: '1px solid #334155',
        borderRadius: '12px'
    },


    sectionHeader: {
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
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


    roomForm: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
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


    status: {
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize'
    },


    actionButtons: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },


    editButton: {
        padding: '7px 12px',
        borderRadius: '7px',
        border: '1px solid #3b82f6',
        background: 'rgba(59, 130, 246, 0.12)',
        color: '#60a5fa',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '12px'
    },


    deleteButton: {
        padding: '7px 12px',
        borderRadius: '7px',
        border: '1px solid #ef4444',
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#f87171',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '12px'
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


    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        fontSize: '13px',
        color: '#cbd5e1',
        fontWeight: 600,
        marginTop: '29px',
        cursor: 'pointer'
    },


    input: {
        padding: '11px 12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        width: '100%'
    },


    textarea: {
        padding: '11px 12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: 'inherit'
    },


    formActions: {
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '4px'
    },


    cancelButton: {
        padding: '10px 18px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#1e293b',
        color: '#ffffff',
        cursor: 'pointer',
        fontWeight: 600
    },


    saveButton: {
        padding: '10px 18px',
        borderRadius: '8px',
        border: '1px solid #10b981',
        background: '#10b981',
        color: '#052e16',
        cursor: 'pointer',
        fontWeight: 700
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