import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  appointmentService,
  AppointmentDto,
  AppointmentRequest,
  OFFICE_LOCATIONS,
  OFFICE_DETAILS,
} from '../../../services/appointment.service';
import './Appointments.scss';

type ViewMode = 'list' | 'book' | 'reschedule';

export const Appointments: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Booking state
  const [selectedOffice, setSelectedOffice] = useState<string>(OFFICE_LOCATIONS.MUMBAI);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Reschedule state
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate && (viewMode === 'book' || viewMode === 'reschedule')) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedOffice, viewMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const slots = await appointmentService.getAvailableSlots(selectedOffice, selectedDate);
      setAvailableSlots(slots);
      setSelectedSlot('');
    } catch (err: any) {
      toast.error('Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select date and time slot');
      return;
    }

    try {
      setSubmitting(true);
      const request: AppointmentRequest = {
        officeLocation: selectedOffice,
        appointmentDate: `${selectedDate}T10:00:00`,
        timeSlot: selectedSlot,
        notes: notes || undefined,
      };

      await appointmentService.createAppointment(request);
      toast.success('Appointment booked successfully!');
      resetBookingForm();
      setViewMode('list');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleAppointmentId || !selectedDate || !selectedSlot) {
      toast.error('Please select date and time slot');
      return;
    }

    try {
      setSubmitting(true);
      const request: AppointmentRequest = {
        officeLocation: selectedOffice,
        appointmentDate: `${selectedDate}T10:00:00`,
        timeSlot: selectedSlot,
        notes: notes || undefined,
      };

      await appointmentService.rescheduleAppointment(rescheduleAppointmentId, request);
      toast.success('Appointment rescheduled successfully!');
      resetBookingForm();
      setViewMode('list');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled');
      await loadAppointments();
    } catch (err: any) {
      toast.error('Failed to cancel appointment');
    }
  };

  const startReschedule = (appointment: AppointmentDto) => {
    setRescheduleAppointmentId(appointment.id);
    setSelectedOffice(appointment.officeLocation);
    setNotes(appointment.notes || '');
    setViewMode('reschedule');
  };

  const resetBookingForm = () => {
    setSelectedDate('');
    setSelectedSlot('');
    setNotes('');
    setAvailableSlots([]);
    setRescheduleAppointmentId(null);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
          <div className="appointments">
            <div className="loading">Loading appointments...</div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
        <div className="appointments">
          <div className="appointments__header">
            <h1>My Appointments</h1>
            {viewMode === 'list' && (
              <button
                className="btn-primary"
                onClick={() => {
                  resetBookingForm();
                  setViewMode('book');
                }}
              >
                + Book New Appointment
              </button>
            )}
            {viewMode !== 'list' && (
              <button
                className="btn-secondary"
                onClick={() => {
                  resetBookingForm();
                  setViewMode('list');
                }}
              >
                ← Back to List
              </button>
            )}
          </div>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="appointments__list">
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <p>No appointments booked yet</p>
                  <button
                    className="btn-primary"
                    onClick={() => setViewMode('book')}
                  >
                    Book Your First Appointment
                  </button>
                </div>
              ) : (
                <div className="appointment-cards">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="appointment-card">
                      <div className="appointment-card__header">
                        <div className="office-badge">{apt.officeLocation}</div>
                        <span className={appointmentService.getStatusBadgeClass(apt.status)}>
                          {appointmentService.getStatusLabel(apt.status)}
                        </span>
                      </div>
                      <div className="appointment-card__body">
                        <div className="info-row">
                          <span className="label">📅 Date & Time:</span>
                          <span className="value">{appointmentService.formatAppointmentDate(apt.appointmentDate)}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">🕒 Time Slot:</span>
                          <span className="value">{apt.timeSlot}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">📍 Office:</span>
                          <span className="value">{OFFICE_DETAILS[apt.officeLocation as keyof typeof OFFICE_DETAILS].name}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">📝 Purpose:</span>
                          <span className="value">{apt.purpose}</span>
                        </div>
                        {apt.notes && (
                          <div className="info-row info-row--full">
                            <span className="label">💬 Notes:</span>
                            <span className="value">{apt.notes}</span>
                          </div>
                        )}
                      </div>
                      {apt.status === 'SCHEDULED' && (
                        <div className="appointment-card__footer">
                          <button
                            className="btn-outline"
                            onClick={() => startReschedule(apt)}
                          >
                            Reschedule
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleCancel(apt.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Book/Reschedule View */}
          {(viewMode === 'book' || viewMode === 'reschedule') && (
            <div className="appointments__booking">
              <div className="booking-card">
                <h2>
                  {viewMode === 'book' ? 'Book New Appointment' : 'Reschedule Appointment'}
                </h2>

                {/* Office Selection */}
                <div className="form-section">
                  <h3>Select Office Location</h3>
                  <div className="office-grid">
                    {Object.entries(OFFICE_DETAILS).map(([key, details]) => (
                      <div
                        key={key}
                        className={`office-option ${selectedOffice === key ? 'selected' : ''}`}
                        onClick={() => setSelectedOffice(key)}
                      >
                        <h4>{details.name}</h4>
                        <p>{details.address}</p>
                        <p>📞 {details.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="form-section">
                  <h3>Select Date</h3>
                  <input
                    type="date"
                    className="date-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                  />
                  <p className="hint">
                    Available: Monday - Friday (Next 30 days)
                  </p>
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                  <div className="form-section">
                    <h3>Select Time Slot</h3>
                    {loadingSlots ? (
                      <p>Loading available slots...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="no-slots">No slots available for this date</p>
                    ) : (
                      <div className="time-slots">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="form-section">
                  <h3>Additional Notes (Optional)</h3>
                  <textarea
                    className="notes-input"
                    placeholder="Any special requirements or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit */}
                <div className="form-section">
                  <button
                    className="btn-submit"
                    onClick={viewMode === 'book' ? handleBookAppointment : handleReschedule}
                    disabled={!selectedDate || !selectedSlot || submitting}
                  >
                    {submitting
                      ? 'Processing...'
                      : viewMode === 'book'
                      ? 'Confirm Booking'
                      : 'Confirm Reschedule'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};
