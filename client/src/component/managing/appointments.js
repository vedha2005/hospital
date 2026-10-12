import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navber from '../Navber/Navber';
import Footer from '../Footer';

class Appointments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appointments: [],
            patients: [],
            doctors: [],

            patientId: '',
            doctorId: '',
            appointmentDate: '',
            appointmentTime: '',
            reason: '',

            loading: false,
            message: '',
            error: ''
        };
    }

    componentDidMount() {
        this.loadAppointments();
        this.loadPatients();
        this.loadDoctors();
    }

    loadAppointments = () => {
        axios.get('http://localhost:5000/admin/appointments')
            .then(response => {
                this.setState({
                    appointments: response.data || []
                });
            })
            .catch(error => {
                console.log('Appointment loading error:', error);
                this.setState({
                    error: 'Unable to load appointments.'
                });
            });
    };

    loadPatients = () => {
        axios.get('http://localhost:5000/admin/patients')
            .then(response => {
                this.setState({
                    patients: response.data || []
                });
            })
            .catch(error => {
                console.log('Patient loading error:', error);
            });
    };

    loadDoctors = () => {
        axios.get('http://localhost:5000/admin/doctors')
            .then(response => {
                this.setState({
                    doctors: response.data || []
                });
            })
            .catch(error => {
                console.log('Doctor loading error:', error);
            });
    };

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    addAppointment = (event) => {
        event.preventDefault();

        this.setState({
            loading: true,
            message: '',
            error: ''
        });

        const appointmentData = {
            patient_id: this.state.patientId,
            doctor_id: this.state.doctorId,
            appointment_date: this.state.appointmentDate,
            appointment_time: this.state.appointmentTime,
            reason: this.state.reason
        };

        axios.post(
            'http://localhost:5000/admin/appointments',
            appointmentData
        )
        .then(response => {
            this.setState({
                patientId: '',
                doctorId: '',
                appointmentDate: '',
                appointmentTime: '',
                reason: '',
                loading: false,
                message: 'Appointment created successfully.'
            });

            this.loadAppointments();
        })
        .catch(error => {
            console.log('Appointment creation error:', error);

            let errorMessage = 'Unable to create appointment.';

            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                errorMessage = error.response.data.error;
            }

            this.setState({
                loading: false,
                error: errorMessage
            });
        });
    };

    updateStatus = (appointmentId, status) => {
        axios.post(
            'http://localhost:5000/admin/appointments/status',
            {
                appointment_id: appointmentId,
                status: status
            }
        )
        .then(() => {
            this.setState({
                message: 'Appointment status updated.',
                error: ''
            });

            this.loadAppointments();
        })
        .catch(error => {
            console.log('Status update error:', error);

            this.setState({
                error: 'Unable to update appointment status.'
            });
        });
    };

    deleteAppointment = (appointmentId) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this appointment?'
        );

        if (!confirmDelete) {
            return;
        }

        axios.post(
            'http://localhost:5000/admin/appointments/delete',
            {
                appointment_id: appointmentId
            }
        )
        .then(() => {
            this.setState({
                message: 'Appointment deleted successfully.',
                error: ''
            });

            this.loadAppointments();
        })
        .catch(error => {
            console.log('Appointment delete error:', error);

            this.setState({
                error: 'Unable to delete appointment.'
            });
        });
    };

    getPatientName = (appointment) => {
        if (appointment.patient_name) {
            return appointment.patient_name;
        }

        return (
            (appointment.first_name || '') +
            ' ' +
            (appointment.last_name || '')
        ).trim() || 'Unknown Patient';
    };

    getDoctorName = (appointment) => {
        if (appointment.doctor_name) {
            return appointment.doctor_name;
        }

        return (
            (appointment.doctor_first_name || '') +
            ' ' +
            (appointment.doctor_last_name || '')
        ).trim() || 'Unknown Doctor';
    };

    render() {
        const {
            appointments,
            patients,
            doctors,
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            reason,
            loading,
            message,
            error
        } = this.state;

        return (
            <div className="bg-light min-vh-100">

                <Navber />

                <div className="container py-5">

                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>
                            <h1 className="font-weight-bold">
                                Appointment Management
                            </h1>

                            <p className="text-muted">
                                Schedule and manage patient appointments
                            </p>
                        </div>

                        <Link
                            to="/administrator/login/admin_home"
                            className="btn btn-secondary"
                        >
                            Back to Dashboard
                        </Link>

                    </div>

                    {/* MESSAGES */}

                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* ADD APPOINTMENT */}

                    <div className="card shadow mb-5">

                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                Create Appointment
                            </h4>
                        </div>

                        <div className="card-body">

                            <form onSubmit={this.addAppointment}>

                                <div className="row">

                                    {/* PATIENT */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Patient
                                        </label>

                                        <select
                                            name="patientId"
                                            value={patientId}
                                            onChange={this.handleChange}
                                            className="form-control"
                                            required
                                        >

                                            <option value="">
                                                Select Patient
                                            </option>

                                            {patients.map(patient => (
                                                <option
                                                    key={patient.patient_id}
                                                    value={patient.patient_id}
                                                >
                                                    {patient.first_name}{' '}
                                                    {patient.last_name}
                                                    {' - '}
                                                    {patient.email}
                                                </option>
                                            ))}

                                        </select>

                                    </div>

                                    {/* DOCTOR */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Doctor
                                        </label>

                                        <select
                                            name="doctorId"
                                            value={doctorId}
                                            onChange={this.handleChange}
                                            className="form-control"
                                            required
                                        >

                                            <option value="">
                                                Select Doctor
                                            </option>

                                            {doctors.map(doctor => (
                                                <option
                                                    key={doctor.doctor_id}
                                                    value={doctor.doctor_id}
                                                >
                                                    Dr. {doctor.first_name}{' '}
                                                    {doctor.last_name}
                                                    {' - '}
                                                    {doctor.specialisation}
                                                </option>
                                            ))}

                                        </select>

                                    </div>

                                    {/* DATE */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Appointment Date
                                        </label>

                                        <input
                                            type="date"
                                            name="appointmentDate"
                                            value={appointmentDate}
                                            onChange={this.handleChange}
                                            className="form-control"
                                            required
                                        />

                                    </div>

                                    {/* TIME */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Appointment Time
                                        </label>

                                        <input
                                            type="time"
                                            name="appointmentTime"
                                            value={appointmentTime}
                                            onChange={this.handleChange}
                                            className="form-control"
                                            required
                                        />

                                    </div>

                                    {/* REASON */}

                                    <div className="col-md-12 mb-3">

                                        <label>
                                            Reason / Description
                                        </label>

                                        <textarea
                                            name="reason"
                                            value={reason}
                                            onChange={this.handleChange}
                                            className="form-control"
                                            rows="3"
                                            placeholder="Enter reason for appointment"
                                        />

                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Creating...'
                                        : 'Create Appointment'}
                                </button>

                            </form>

                        </div>

                    </div>

                    {/* APPOINTMENT LIST */}

                    <div className="card shadow">

                        <div className="card-header">
                            <h4 className="mb-0">
                                Appointment List
                            </h4>
                        </div>

                        <div className="card-body">

                            {appointments.length === 0 ? (

                                <div className="text-center text-muted py-4">
                                    No appointments found.
                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover">

                                        <thead className="thead-light">

                                            <tr>
                                                <th>ID</th>
                                                <th>Patient</th>
                                                <th>Doctor</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {appointments.map(appointment => (

                                                <tr
                                                    key={
                                                        appointment.appointment_id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            appointment.appointment_id
                                                        }
                                                    </td>

                                                    <td>
                                                        {this.getPatientName(
                                                            appointment
                                                        )}
                                                    </td>

                                                    <td>
                                                        {this.getDoctorName(
                                                            appointment
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.appointment_date
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.appointment_time
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.reason ||
                                                            '-'
                                                        }
                                                    </td>

                                                    <td>

                                                        <select
                                                            value={
                                                                appointment.status ||
                                                                'Scheduled'
                                                            }
                                                            onChange={(event) =>
                                                                this.updateStatus(
                                                                    appointment.appointment_id,
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="form-control"
                                                        >

                                                            <option value="Scheduled">
                                                                Scheduled
                                                            </option>

                                                            <option value="Confirmed">
                                                                Confirmed
                                                            </option>

                                                            <option value="Completed">
                                                                Completed
                                                            </option>

                                                            <option value="Cancelled">
                                                                Cancelled
                                                            </option>

                                                        </select>

                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                this.deleteAppointment(
                                                                    appointment.appointment_id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                <Footer />

            </div>
        );
    }
}

export default Appointments;