import React, { Component } from 'react';
import axios from 'axios';
import './AppointmentChatbot.css';

class AppointmentChatbot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            step: 'start',
            message: '',
            doctors: [],
            selectedDoctor: '',
            selectedDate: '',
            selectedTime: '',
            availableSlots: [],
            reason: '',
            patientEmail: '',
            patient: null,
            bookingSuccess: false
        };
    }

    openChat = () => {
        this.setState({
            isOpen: true
        });
    };

    closeChat = () => {
        this.setState({
            isOpen: false
        });
    };

    startAppointment = () => {
        this.setState({
            step: 'email'
        });
    };

    handleEmailChange = (e) => {
        this.setState({
            patientEmail: e.target.value
        });
    };

    checkPatient = async () => {
        const email = this.state.patientEmail.trim();

        if (!email) {
            alert('Please enter your email');
            return;
        }

        try {
            const response = await axios.post(
                '/public-appointments/check-patient',
                {
                    email: email
                }
            );

            this.setState({
                patient: response.data.patient,
                step: 'doctor'
            });

            this.loadDoctors();

        } catch (error) {
            alert(
                error.response &&
                error.response.data &&
                error.response.data.error
                    ? error.response.data.error
                    : 'Patient not registered'
            );
        }
    };

    loadDoctors = async () => {
        try {
            const response = await axios.get(
                '/public-appointments/doctors'
            );

            this.setState({
                doctors: response.data
            });

        } catch (error) {
            console.log('Doctor loading error:', error);
        }
    };

    handleDoctorChange = (e) => {
        this.setState({
            selectedDoctor: e.target.value,
            selectedDate: '',
            selectedTime: '',
            availableSlots: []
        });
    };

    handleDateChange = (e) => {
        this.setState({
            selectedDate: e.target.value,
            selectedTime: ''
        });
    };

    loadAvailability = async () => {
        const {
            selectedDoctor,
            selectedDate
        } = this.state;

        if (!selectedDoctor || !selectedDate) {
            return;
        }

        try {
            const response = await axios.get(
                '/public-appointments/availability',
                {
                    params: {
                        doctor_id: selectedDoctor,
                        appointment_date: selectedDate
                    }
                }
            );

            this.setState({
                availableSlots:
                    response.data.available_slots || [],
                step: 'time'
            });

        } catch (error) {
            alert(
                error.response &&
                error.response.data &&
                error.response.data.error
                    ? error.response.data.error
                    : 'Unable to load available slots'
            );
        }
    };

    handleReasonChange = (e) => {
        this.setState({
            reason: e.target.value
        });
    };

    bookAppointment = async () => {
        const {
            patient,
            selectedDoctor,
            selectedDate,
            selectedTime,
            reason
        } = this.state;

        if (
            !patient ||
            !selectedDoctor ||
            !selectedDate ||
            !selectedTime
        ) {
            alert('Please complete all appointment details');
            return;
        }

        try {
            const response = await axios.post(
                '/public-appointments/book',
                {
                    patient_id: patient.patient_id,
                    doctor_id: selectedDoctor,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    reason: reason
                }
            );

            if (response.data.success) {
                this.setState({
                    step: 'success',
                    bookingSuccess: true,
                    message:
                        'Your appointment has been booked successfully!'
                });
            }

        } catch (error) {
            alert(
                error.response &&
                error.response.data &&
                error.response.data.error
                    ? error.response.data.error
                    : 'Appointment booking failed'
            );
        }
    };

    resetChat = () => {
        this.setState({
            step: 'start',
            message: '',
            doctors: [],
            selectedDoctor: '',
            selectedDate: '',
            selectedTime: '',
            availableSlots: [],
            reason: '',
            patientEmail: '',
            patient: null,
            bookingSuccess: false
        });
    };

    renderStart() {
        return (
            <div className="chat-content">
                <div className="bot-message">
                    🤖 Hi! I'm your <strong>Appointment Assistant</strong>.
                </div>

                <div className="bot-message">
                    I can help you book an appointment with our doctors.
                </div>

                <button
                    className="chat-option-button"
                    onClick={this.startAppointment}
                >
                    📅 Book an Appointment
                </button>
            </div>
        );
    }

    renderEmail() {
        return (
            <div className="chat-content">

                <div className="bot-message">
                    🤖 Great! First, please enter your registered
                    patient email.
                </div>

                <input
                    type="email"
                    className="chat-input"
                    placeholder="Enter patient email"
                    value={this.state.patientEmail}
                    onChange={this.handleEmailChange}
                />

                <button
                    className="chat-send-button"
                    onClick={this.checkPatient}
                >
                    Continue
                </button>

            </div>
        );
    }

    renderDoctor() {
        return (
            <div className="chat-content">

                <div className="bot-message">
                    🤖 Welcome,{' '}
                    <strong>
                        {this.state.patient.first_name}
                    </strong>
                    !
                </div>

                <div className="bot-message">
                    Please select a doctor.
                </div>

                <select
                    className="chat-input"
                    value={this.state.selectedDoctor}
                    onChange={this.handleDoctorChange}
                >
                    <option value="">
                        Select Doctor
                    </option>

                    {this.state.doctors.map((doctor) => (
                        <option
                            key={doctor.doctor_id}
                            value={doctor.doctor_id}
                        >
                            Dr. {doctor.first_name}{' '}
                            {doctor.last_name} -{' '}
                            {doctor.specialisation}
                        </option>
                    ))}
                </select>

                {this.state.selectedDoctor && (
                    <div className="date-section">

                        <label>
                            Select Date
                        </label>

                        <input
                            type="date"
                            className="chat-input"
                            value={this.state.selectedDate}
                            onChange={this.handleDateChange}
                            min={
                                new Date()
                                    .toISOString()
                                    .split('T')[0]
                            }
                        />

                        {this.state.selectedDate && (
                            <button
                                className="chat-send-button"
                                onClick={this.loadAvailability}
                            >
                                Check Available Slots
                            </button>
                        )}

                    </div>
                )}

            </div>
        );
    }

    renderTime() {
        return (
            <div className="chat-content">

                <div className="bot-message">
                    🤖 Available appointment slots:
                </div>

                {this.state.availableSlots.length === 0 ? (
                    <div className="no-slots">
                        ❌ No slots available for this date.
                    </div>
                ) : (
                    <div className="slot-container">
                        {this.state.availableSlots.map(
                            (slot) => (
                                <button
                                    key={slot}
                                    className={
                                        this.state.selectedTime === slot
                                            ? 'slot-button selected'
                                            : 'slot-button'
                                    }
                                    onClick={() =>
                                        this.setState({
                                            selectedTime: slot,
                                            step: 'reason'
                                        })
                                    }
                                >
                                    {slot}
                                </button>
                            )
                        )}
                    </div>
                )}

            </div>
        );
    }

    renderReason() {
        return (
            <div className="chat-content">

                <div className="bot-message">
                    🤖 What is the reason for your visit?
                </div>

                <textarea
                    className="chat-input chat-textarea"
                    placeholder="Enter reason (optional)"
                    value={this.state.reason}
                    onChange={this.handleReasonChange}
                />

                <div className="appointment-summary">

                    <strong>
                        Appointment Summary
                    </strong>

                    <p>
                        👤 Patient:{' '}
                        {this.state.patient.first_name}{' '}
                        {this.state.patient.last_name}
                    </p>

                    <p>
                        📅 Date:{' '}
                        {this.state.selectedDate}
                    </p>

                    <p>
                        🕐 Time:{' '}
                        {this.state.selectedTime}
                    </p>

                </div>

                <button
                    className="chat-send-button"
                    onClick={this.bookAppointment}
                >
                    ✅ Confirm Appointment
                </button>

            </div>
        );
    }

    renderSuccess() {
        return (
            <div className="chat-content success-content">

                <div className="success-icon">
                    ✅
                </div>

                <div className="bot-message success-message">
                    <strong>
                        Appointment Booked Successfully!
                    </strong>
                </div>

                <p>
                    Your appointment has been successfully
                    scheduled.
                </p>

                <button
                    className="chat-send-button"
                    onClick={this.resetChat}
                >
                    📅 Book Another Appointment
                </button>

            </div>
        );
    }

    renderChatContent() {
        switch (this.state.step) {
            case 'start':
                return this.renderStart();

            case 'email':
                return this.renderEmail();

            case 'doctor':
                return this.renderDoctor();

            case 'time':
                return this.renderTime();

            case 'reason':
                return this.renderReason();

            case 'success':
                return this.renderSuccess();

            default:
                return this.renderStart();
        }
    }

    render() {
        if (!this.state.isOpen) {
            return (
                <button
                    className="chatbot-floating-button"
                    onClick={this.openChat}
                    title="Open Appointment Assistant"
                >
                    💬
                </button>
            );
        }

        return (
            <div className="appointment-chatbot-container">

                <div className="chatbot-window">

                    {/* HEADER */}
                    <div className="chatbot-header">

                        <div className="assistant-info">

                            <div className="assistant-avatar">
                                🤖
                            </div>

                            <div>
                                <div className="assistant-name">
                                    Appointment Assistant
                                </div>

                                <div className="assistant-status">
                                    ● Online
                                </div>
                            </div>

                        </div>

                        <button
                            className="chatbot-close-button"
                            onClick={this.closeChat}
                        >
                            ✕
                        </button>

                    </div>

                    {/* CHAT BODY */}
                    <div className="chatbot-body">
                        {this.renderChatContent()}
                    </div>

                </div>

            </div>
        );
    }
}

export default AppointmentChatbot;