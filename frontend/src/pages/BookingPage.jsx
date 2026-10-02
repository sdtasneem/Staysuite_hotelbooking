import React, { useEffect, useMemo, useState } from 'react';
import { bookingService, roomService } from '../services';

function BookingPage() {
    /* =========================================================
       BOOKING LIST STATE
       ========================================================= */

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cancellingId, setCancellingId] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    /* =========================================================
       CREATE BOOKING STATE
       ========================================================= */

    const [showBookingForm, setShowBookingForm] = useState(false);

    const [guests, setGuests] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

    const [loadingGuests, setLoadingGuests] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [creatingBooking, setCreatingBooking] = useState(false);

    const [bookingForm, setBookingForm] = useState({
        guest_id: '',
        room_id: '',
        check_in_date: '',
        check_out_date: '',
        number_of_guests: 1,
        nightly_rate: '',
        payment_status: 'pending',
        special_requests: ''
    });

    /* =========================================================
       FETCH BOOKINGS
       ========================================================= */

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

    useEffect(() => {
        loadBookings();
    }, []);

    /* =========================================================
       FETCH GUESTS
       ========================================================= */

    const loadGuests = async () => {
        try {
            setLoadingGuests(true);

            const response = await fetch('/api/guests');

            const text = await response.text();

            let data = null;

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    throw new Error(
                        `Invalid guest response: ${text}`
                    );
                }
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `Failed to load guests: HTTP ${response.status}`
                );
            }

            setGuests(data?.data || []);
        } catch (err) {
            console.error('Failed to load guests:', err);
            setError(err.message || 'Failed to load guests');
        } finally {
            setLoadingGuests(false);
        }
    };

    /* =========================================================
       OPEN BOOKING FORM
       ========================================================= */

    const openBookingForm = async () => {
        setShowBookingForm(true);
        setError('');
        setMessage('');

        await loadGuests();
    };

    /* =========================================================
       FORM HANDLING
       ========================================================= */

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setBookingForm((current) => ({
            ...current,
            [name]: value
        }));

        if (name === 'check_in_date' || name === 'check_out_date') {
            setAvailableRooms([]);
            setBookingForm((current) => ({
                ...current,
                [name]: value,
                room_id: ''
            }));
        }
    };

    /* =========================================================
       CHECK ROOM AVAILABILITY
       ========================================================= */

    const findAvailableRooms = async () => {
        if (
            !bookingForm.check_in_date ||
            !bookingForm.check_out_date
        ) {
            setError('Please select both check-in and check-out dates.');
            return;
        }

        if (
            bookingForm.check_in_date >=
            bookingForm.check_out_date
        ) {
            setError('Check-out date must be after check-in date.');
            return;
        }

        try {
            setLoadingRooms(true);
            setError('');
            setAvailableRooms([]);

            const response = await roomService.getAvailableRooms(
                bookingForm.check_in_date,
                bookingForm.check_out_date
            );

            if (response.success) {
                setAvailableRooms(response.data || []);

                if ((response.data || []).length === 0) {
                    setError(
                        'No rooms are available for the selected dates.'
                    );
                }
            } else {
                setError('Failed to find available rooms.');
            }
        } catch (err) {
            console.error(
                'Failed to find available rooms:',
                err
            );

            setError(
                err.message ||
                'Failed to find available rooms.'
            );
        } finally {
            setLoadingRooms(false);
        }
    };

    /* =========================================================
       CALCULATE NIGHTS
       ========================================================= */

    const totalNights = useMemo(() => {
        if (
            !bookingForm.check_in_date ||
            !bookingForm.check_out_date
        ) {
            return 0;
        }

        const checkIn = new Date(
            `${bookingForm.check_in_date}T00:00:00`
        );

        const checkOut = new Date(
            `${bookingForm.check_out_date}T00:00:00`
        );

        const difference =
            checkOut.getTime() - checkIn.getTime();

        const nights = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

        return nights > 0 ? nights : 0;
    }, [
        bookingForm.check_in_date,
        bookingForm.check_out_date
    ]);

    /* =========================================================
       CALCULATE AMOUNT
       ========================================================= */

    const nightlyRate = Number(
        bookingForm.nightly_rate || 0
    );

    const subtotal =
        nightlyRate * totalNights;

    const taxAmount =
        Math.round(subtotal * 0.10);

    const totalAmount =
        subtotal + taxAmount;

    /* =========================================================
       CREATE BOOKING
       ========================================================= */

    const handleCreateBooking = async (event) => {
        event.preventDefault();

        setError('');
        setMessage('');

        if (!bookingForm.guest_id) {
            setError('Please select a guest.');
            return;
        }

        if (!bookingForm.check_in_date) {
            setError('Please select a check-in date.');
            return;
        }

        if (!bookingForm.check_out_date) {
            setError('Please select a check-out date.');
            return;
        }

        if (totalNights <= 0) {
            setError(
                'Check-out date must be after check-in date.'
            );
            return;
        }

        if (!bookingForm.room_id) {
            setError('Please select an available room.');
            return;
        }

        if (nightlyRate <= 0) {
            setError(
                'Please enter a valid nightly rate.'
            );
            return;
        }

        if (
            Number(bookingForm.number_of_guests) < 1
        ) {
            setError(
                'Number of guests must be at least 1.'
            );
            return;
        }

        try {
            setCreatingBooking(true);

            /*
             * Get room information from the selected
             * available room.
             */
            const selectedRoom = availableRooms.find(
                (room) => room.id === bookingForm.room_id
            );

            if (!selectedRoom) {
                setError(
                    'Selected room is no longer available. Please check availability again.'
                );
                return;
            }

            const bookingData = {
                guest_id: bookingForm.guest_id,

                room_id: selectedRoom.id,

                room_type_id:
                    selectedRoom.room_type_id,

                hotel_id:
                    selectedRoom.hotel_id,

                check_in_date:
                    bookingForm.check_in_date,

                check_out_date:
                    bookingForm.check_out_date,

                number_of_guests:
                    Number(bookingForm.number_of_guests),

                nightly_rate: nightlyRate,

                total_nights: totalNights,

                total_amount: totalAmount,

                tax_amount: taxAmount,

                booking_status: 'confirmed',

                payment_status:
                    bookingForm.payment_status,

                special_requests:
                    bookingForm.special_requests ||
                    null
            };

            const response =
                await bookingService.createBooking(
                    bookingData
                );

            if (response.success) {
                setMessage(
                    'Booking created successfully'
                );

                setShowBookingForm(false);

                setBookingForm({
                    guest_id: '',
                    room_id: '',
                    check_in_date: '',
                    check_out_date: '',
                    number_of_guests: 1,
                    nightly_rate: '',
                    payment_status: 'pending',
                    special_requests: ''
                });

                setAvailableRooms([]);

                await loadBookings();
            } else {
                setError(
                    response.message ||
                    'Failed to create booking'
                );
            }
        } catch (err) {
            console.error(
                'Failed to create booking:',
                err
            );

            setError(
                err.message ||
                'Failed to create booking'
            );
        } finally {
            setCreatingBooking(false);
        }
    };

    /* =========================================================
       CANCEL BOOKING
       ========================================================= */

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

            const response =
                await bookingService.cancelBooking(
                    bookingId
                );

            if (response.success) {
                setMessage(response.message);

                setBookings((currentBookings) =>
                    currentBookings.map((booking) =>
                        booking.id === bookingId
                            ? {
                                ...booking,
                                booking_status:
                                    'cancelled'
                            }
                            : booking
                    )
                );
            }
        } catch (err) {
            console.error(
                'Failed to cancel booking:',
                err
            );

            setError(
                err.message ||
                'Failed to cancel booking'
            );
        } finally {
            setCancellingId(null);
        }
    };

    /* =========================================================
       CHECK-IN / CHECK-OUT
       ========================================================= */

    const handleStayAction = async (
        bookingId,
        action
    ) => {
        const actionText =
            action === 'check-in'
                ? 'check in'
                : 'check out';

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
                    ? await bookingService.checkInBooking(
                        bookingId
                    )
                    : await bookingService.checkOutBooking(
                        bookingId
                    );

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
            console.error(
                `Failed to ${actionText} booking:`,
                err
            );

            setError(
                err.message ||
                `Failed to ${actionText} booking`
            );
        } finally {
            setProcessingId(null);
        }
    };

    /* =========================================================
       LOADING STATE
       ========================================================= */

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingContainer}>
                    <h2>Loading bookings...</h2>

                    <p>
                        Please wait while we fetch
                        the booking data.
                    </p>
                </div>
            </div>
        );
    }

    /* =========================================================
       MAIN PAGE
       ========================================================= */

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            Bookings
                        </h1>

                        <p style={styles.subtitle}>
                            Manage hotel reservations
                            and guest bookings
                        </p>
                    </div>

                    <div style={styles.headerActions}>
                        <button
                            onClick={openBookingForm}
                            style={styles.createButton}
                        >
                            + New Booking
                        </button>

                        <button
                            onClick={loadBookings}
                            style={styles.refreshButton}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* SUCCESS MESSAGE */}
                {message && (
                    <div style={styles.successMessage}>
                        ✓ {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {/* =================================================
                    CREATE BOOKING FORM
                   ================================================= */}

                {showBookingForm && (
                    <div style={styles.formCard}>

                        <div style={styles.formHeader}>
                            <div>
                                <h2 style={styles.formTitle}>
                                    Create New Booking
                                </h2>

                                <p style={styles.formSubtitle}>
                                    Enter reservation details
                                    for the guest.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowBookingForm(false);
                                    setError('');
                                }}
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateBooking}
                        >
                            <div style={styles.formGrid}>

                                {/* GUEST */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Guest
                                    </label>

                                    <select
                                        name="guest_id"
                                        value={
                                            bookingForm.guest_id
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            loadingGuests ||
                                            creatingBooking
                                        }
                                    >
                                        <option value="">
                                            {loadingGuests
                                                ? 'Loading guests...'
                                                : 'Select guest'}
                                        </option>

                                        {guests.map((guest) => (
                                            <option
                                                key={guest.id}
                                                value={guest.id}
                                            >
                                                {guest.full_name}
                                                {guest.email
                                                    ? ` - ${guest.email}`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* NUMBER OF GUESTS */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Number of Guests
                                    </label>

                                    <input
                                        type="number"
                                        name="number_of_guests"
                                        min="1"
                                        value={
                                            bookingForm.number_of_guests
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            creatingBooking
                                        }
                                    />
                                </div>

                                {/* CHECK-IN */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Check-in Date
                                    </label>

                                    <input
                                        type="date"
                                        name="check_in_date"
                                        value={
                                            bookingForm.check_in_date
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            creatingBooking
                                        }
                                    />
                                </div>

                                {/* CHECK-OUT */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Check-out Date
                                    </label>

                                    <input
                                        type="date"
                                        name="check_out_date"
                                        value={
                                            bookingForm.check_out_date
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            creatingBooking
                                        }
                                    />
                                </div>

                                {/* FIND ROOMS */}
                                <div
                                    style={{
                                        ...styles.formGroup,
                                        gridColumn:
                                            '1 / -1'
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={
                                            findAvailableRooms
                                        }
                                        style={
                                            styles.availabilityButton
                                        }
                                        disabled={
                                            loadingRooms ||
                                            creatingBooking
                                        }
                                    >
                                        {loadingRooms
                                            ? 'Checking rooms...'
                                            : 'Check Room Availability'}
                                    </button>
                                </div>

                                {/* ROOM */}
                                <div
                                    style={{
                                        ...styles.formGroup,
                                        gridColumn:
                                            '1 / -1'
                                    }}
                                >
                                    <label style={styles.label}>
                                        Available Room
                                    </label>

                                    <select
                                        name="room_id"
                                        value={
                                            bookingForm.room_id
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            availableRooms.length ===
                                            0 ||
                                            creatingBooking
                                        }
                                    >
                                        <option value="">
                                            {availableRooms.length ===
                                                0
                                                ? 'Check availability first'
                                                : 'Select available room'}
                                        </option>

                                        {availableRooms.map(
                                            (room) => (
                                                <option
                                                    key={room.id}
                                                    value={room.id}
                                                >
                                                    Room{' '}
                                                    {
                                                        room.room_number
                                                    }
                                                    {' - Floor '}
                                                    {room.floor}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* NIGHTLY RATE */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Nightly Rate (₹)
                                    </label>

                                    <input
                                        type="number"
                                        name="nightly_rate"
                                        min="1"
                                        step="0.01"
                                        placeholder="Example: 1500"
                                        value={
                                            bookingForm.nightly_rate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            creatingBooking
                                        }
                                    />
                                </div>

                                {/* PAYMENT STATUS */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Payment Status
                                    </label>

                                    <select
                                        name="payment_status"
                                        value={
                                            bookingForm.payment_status
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={styles.input}
                                        disabled={
                                            creatingBooking
                                        }
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="paid">
                                            Paid
                                        </option>
                                    </select>
                                </div>

                                {/* SPECIAL REQUESTS */}
                                <div
                                    style={{
                                        ...styles.formGroup,
                                        gridColumn:
                                            '1 / -1'
                                    }}
                                >
                                    <label style={styles.label}>
                                        Special Requests
                                    </label>

                                    <textarea
                                        name="special_requests"
                                        value={
                                            bookingForm.special_requests
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Optional guest requests..."
                                        rows="3"
                                        style={
                                            styles.textarea
                                        }
                                        disabled={
                                            creatingBooking
                                        }
                                    />
                                </div>
                            </div>

                            {/* BOOKING SUMMARY */}
                            <div style={styles.summaryCard}>
                                <h3
                                    style={
                                        styles.summaryTitle
                                    }
                                >
                                    Booking Summary
                                </h3>

                                <div
                                    style={
                                        styles.summaryRow
                                    }
                                >
                                    <span>
                                        Total Nights
                                    </span>

                                    <strong>
                                        {totalNights}
                                    </strong>
                                </div>

                                <div
                                    style={
                                        styles.summaryRow
                                    }
                                >
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        ₹
                                        {subtotal.toLocaleString(
                                            'en-IN'
                                        )}
                                    </strong>
                                </div>

                                <div
                                    style={
                                        styles.summaryRow
                                    }
                                >
                                    <span>
                                        Tax (10%)
                                    </span>

                                    <strong>
                                        ₹
                                        {taxAmount.toLocaleString(
                                            'en-IN'
                                        )}
                                    </strong>
                                </div>

                                <div
                                    style={{
                                        ...styles.summaryRow,
                                        ...styles.totalRow
                                    }}
                                >
                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>
                                        ₹
                                        {totalAmount.toLocaleString(
                                            'en-IN'
                                        )}
                                    </strong>
                                </div>
                            </div>

                            {/* FORM ACTIONS */}
                            <div style={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookingForm(false);
                                        setError('');
                                    }}
                                    style={
                                        styles.secondaryButton
                                    }
                                    disabled={
                                        creatingBooking
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    style={
                                        styles.submitButton
                                    }
                                    disabled={
                                        creatingBooking
                                    }
                                >
                                    {creatingBooking
                                        ? 'Creating...'
                                        : 'Create Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* =================================================
                    BOOKING TABLE
                   ================================================= */}

                {bookings.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h2>No bookings found</h2>

                        <p>
                            There are currently no
                            bookings to display.
                        </p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>
                                        Booking
                                    </th>

                                    <th style={styles.th}>
                                        Guest
                                    </th>

                                    <th style={styles.th}>
                                        Room
                                    </th>

                                    <th style={styles.th}>
                                        Check-in
                                    </th>

                                    <th style={styles.th}>
                                        Check-out
                                    </th>

                                    <th style={styles.th}>
                                        Guests
                                    </th>

                                    <th style={styles.th}>
                                        Amount
                                    </th>

                                    <th style={styles.th}>
                                        Status
                                    </th>

                                    <th style={styles.th}>
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookings.map((booking) => {
                                    const isCancelled =
                                        booking.booking_status ===
                                        'cancelled';

                                    const isCancelling =
                                        cancellingId ===
                                        booking.id;

                                    const isProcessing =
                                        processingId ===
                                        booking.id;

                                    return (
                                        <tr
                                            key={booking.id}
                                        >
                                            {/* BOOKING */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {booking.booking_reference ||
                                                        booking.booking_number ||
                                                        booking.id}
                                                </strong>
                                            </td>

                                            {/* GUEST */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <div>
                                                    <strong>
                                                        {booking
                                                            .guests
                                                            ?.full_name ||
                                                            'N/A'}
                                                    </strong>

                                                    {booking
                                                        .guests
                                                        ?.email && (
                                                            <div
                                                                style={
                                                                    styles.secondaryText
                                                                }
                                                            >
                                                                {
                                                                    booking
                                                                        .guests
                                                                        .email
                                                                }
                                                            </div>
                                                        )}
                                                </div>
                                            </td>

                                            {/* ROOM */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {booking.rooms
                                                    ?.room_number ||
                                                    'N/A'}
                                            </td>

                                            {/* CHECK-IN */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    booking.check_in_date
                                                }
                                            </td>

                                            {/* CHECK-OUT */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    booking.check_out_date
                                                }
                                            </td>

                                            {/* GUEST COUNT */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    booking.number_of_guests
                                                }
                                            </td>

                                            {/* AMOUNT */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                ₹
                                                {Number(
                                                    booking.total_amount ||
                                                    0
                                                ).toLocaleString(
                                                    'en-IN'
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <span
                                                    style={{
                                                        ...styles.status,
                                                        ...(isCancelled
                                                            ? styles.cancelledStatus
                                                            : styles.activeStatus)
                                                    }}
                                                >
                                                    {
                                                        booking.booking_status
                                                    }
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <div
                                                    style={
                                                        styles.actionContainer
                                                    }
                                                >
                                                    {/* CHECK IN */}
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

                                                    {/* CHECK OUT */}
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

                                                    {/* CANCEL */}
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

                                                    {/* COMPLETED */}
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

                                                    {/* CANCELLED */}
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
        gap: '10px',
        alignItems: 'center'
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

    createButton: {
        padding: '10px 18px',
        borderRadius: '8px',
        border: '1px solid #22c55e',
        background: '#16a34a',
        color: '#ffffff',
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

    /* FORM */

    formCard: {
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px'
    },

    formHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
    },

    formTitle: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 700
    },

    formSubtitle: {
        color: '#94a3b8',
        marginTop: '6px',
        marginBottom: 0
    },

    closeButton: {
        border: 'none',
        background: 'transparent',
        color: '#94a3b8',
        fontSize: '28px',
        cursor: 'pointer',
        lineHeight: 1
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
        gap: '18px'
    },

    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '7px'
    },

    label: {
        color: '#cbd5e1',
        fontSize: '13px',
        fontWeight: 600
    },

    input: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#ffffff',
        outline: 'none'
    },

    textarea: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#ffffff',
        resize: 'vertical',
        fontFamily: 'inherit'
    },

    availabilityButton: {
        padding: '11px 16px',
        borderRadius: '8px',
        border: '1px solid #3b82f6',
        background: '#1d4ed8',
        color: '#ffffff',
        cursor: 'pointer',
        fontWeight: 600
    },

    summaryCard: {
        marginTop: '24px',
        padding: '18px',
        borderRadius: '10px',
        background: '#172033',
        border: '1px solid #334155',
        maxWidth: '500px',
        marginLeft: 'auto'
    },

    summaryTitle: {
        marginTop: 0,
        marginBottom: '14px',
        fontSize: '16px'
    },

    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '7px 0',
        color: '#cbd5e1'
    },

    totalRow: {
        marginTop: '8px',
        paddingTop: '14px',
        borderTop: '1px solid #334155',
        color: '#ffffff',
        fontSize: '17px'
    },

    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '24px'
    },

    secondaryButton: {
        padding: '10px 18px',
        borderRadius: '8px',
        border: '1px solid #475569',
        background: 'transparent',
        color: '#cbd5e1',
        cursor: 'pointer',
        fontWeight: 600
    },

    submitButton: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid #22c55e',
        background: '#16a34a',
        color: '#ffffff',
        cursor: 'pointer',
        fontWeight: 700
    },

    /* TABLE */

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