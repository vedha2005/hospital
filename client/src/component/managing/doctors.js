import React, { Component } from 'react';
import Navber from '../Navber/Navber';
import Footer from '../Footer';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Doctors extends Component {

    constructor() {
        super();

        this.state = {
            doctors: [],

            first_name: '',
            last_name: '',
            address: '',
            email: '',
            salary: '',
            specialisation: '',
            shift_time: '',
            password: '',

            loading: false,
            addingDoctor: false,
            deletingDoctor: false,

            deleteDoctorId: '',

            message: '',
            error: '',

            // =================================================
            // SELECTED DOCTOR / PATIENTS
            // =================================================

            selectedDoctor: null,
            doctorPatients: [],
            loadingPatients: false,
            patientError: ''
        };

        this.onChange = this.onChange.bind(this);
        this.loadDoctors = this.loadDoctors.bind(this);
        this.addDoctor = this.addDoctor.bind(this);
        this.deleteDoctor = this.deleteDoctor.bind(this);
        this.loadDoctorPatients =
            this.loadDoctorPatients.bind(this);
    }


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    onChange(e) {

        this.setState({
            [e.target.name]: e.target.value,
            error: '',
            message: ''
        });
    }


    // =====================================================
    // LOAD DOCTORS
    // =====================================================

    loadDoctors() {

        this.setState({
            loading: true,
            error: ''
        });

        axios.get('/admin/doctors')

            .then(response => {

                this.setState({
                    doctors: response.data,
                    loading: false
                });

            })

            .catch(error => {

                console.log(
                    'Doctor loading error:',
                    error
                );

                this.setState({
                    loading: false,
                    error: 'Unable to load doctors'
                });
            });
    }


    // =====================================================
    // LOAD PATIENTS FOR SELECTED DOCTOR
    // =====================================================

    loadDoctorPatients(doctor) {

        this.setState({

            selectedDoctor: doctor,

            doctorPatients: [],

            loadingPatients: true,

            patientError: ''

        });

        axios.get(
            '/admin/doctor/' +
            doctor.doctor_id +
            '/patients'
        )

        .then(response => {

            this.setState({

                doctorPatients:
                    response.data,

                loadingPatients: false,

                patientError: ''

            });

        })

        .catch(error => {

            console.log(
                'Doctor patients loading error:',
                error
            );

            let errorMessage =
                'Unable to load patients for this doctor';

            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {

                errorMessage =
                    error.response.data.error;
            }

            this.setState({

                doctorPatients: [],

                loadingPatients: false,

                patientError: errorMessage

            });
        });
    }


    // =====================================================
    // CLOSE PATIENT VIEW
    // =====================================================

    closePatients = () => {

        this.setState({

            selectedDoctor: null,

            doctorPatients: [],

            patientError: ''

        });
    };


    // =====================================================
    // COMPONENT DID MOUNT
    // =====================================================

    componentDidMount() {

        this.loadDoctors();
    }


    // =====================================================
    // ADD DOCTOR
    // =====================================================

    addDoctor(e) {

        e.preventDefault();

        if (
            !this.state.first_name ||
            !this.state.last_name ||
            !this.state.address ||
            !this.state.email ||
            !this.state.salary ||
            !this.state.specialisation ||
            !this.state.shift_time ||
            !this.state.password
        ) {

            this.setState({
                error: 'Please fill all doctor fields',
                message: ''
            });

            return;
        }

        const doctor = {

            first_name: this.state.first_name,
            last_name: this.state.last_name,
            address: this.state.address,
            email: this.state.email,
            salary: this.state.salary,
            specialisation: this.state.specialisation,
            shift_time: this.state.shift_time,
            password: this.state.password
        };

        this.setState({
            addingDoctor: true,
            error: '',
            message: ''
        });

        axios.post(
            '/admin/doctor/register',
            doctor
        )

        .then(response => {

            this.setState({

                addingDoctor: false,

                message:
                    response.data.message ||
                    'Doctor added successfully',

                error: '',

                first_name: '',
                last_name: '',
                address: '',
                email: '',
                salary: '',
                specialisation: '',
                shift_time: '',
                password: ''
            });

            this.loadDoctors();

        })

        .catch(error => {

            console.log(
                'Add doctor error:',
                error
            );

            let errorMessage =
                'Unable to add doctor';

            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {

                errorMessage =
                    error.response.data.error;
            }

            this.setState({

                addingDoctor: false,

                error: errorMessage,

                message: ''
            });
        });
    }


    // =====================================================
    // DELETE DOCTOR
    // =====================================================

    deleteDoctor(e) {

        e.preventDefault();

        if (!this.state.deleteDoctorId) {

            this.setState({
                error: 'Please enter doctor ID',
                message: ''
            });

            return;
        }

        const confirmDelete =
            window.confirm(
                'Are you sure you want to delete this doctor?'
            );

        if (!confirmDelete) {
            return;
        }

        this.setState({

            deletingDoctor: true,

            error: '',

            message: ''
        });

        axios.post(
            '/admin/doctor/delete',
            {
                doctor_id:
                    this.state.deleteDoctorId
            }
        )

        .then(response => {

            this.setState({

                deletingDoctor: false,

                deleteDoctorId: '',

                message:
                    response.data.message ||
                    'Doctor deleted successfully',

                error: '',

                selectedDoctor: null,

                doctorPatients: []

            });

            this.loadDoctors();

        })

        .catch(error => {

            console.log(
                'Delete doctor error:',
                error
            );

            let errorMessage =
                'Unable to delete doctor';

            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {

                errorMessage =
                    error.response.data.error;
            }

            this.setState({

                deletingDoctor: false,

                error: errorMessage,

                message: ''
            });
        });
    }


    // =====================================================
    // RENDER
    // =====================================================

    render() {

        return (

            <div className="bg-dark">

                <Navber />

                <br />

                <h2
                    className="text-white text-center"
                >
                    Doctor Management
                </h2>

                <br />


                {/* ================================================= */}
                {/* MESSAGES */}
                {/* ================================================= */}

                <div className="container">

                    {this.state.message && (

                        <div className="alert alert-success">

                            {this.state.message}

                        </div>
                    )}

                    {this.state.error && (

                        <div className="alert alert-danger">

                            {this.state.error}

                        </div>
                    )}

                </div>


                {/* ================================================= */}
                {/* ADD DOCTOR */}
                {/* ================================================= */}

                <div className="container">

                    <div className="jumbotron">

                        <h3 className="text-primary">

                            Add Doctor

                        </h3>

                        <br />

                        <form
                            onSubmit={this.addDoctor}
                        >

                            <div className="row">

                                {/* FIRST NAME */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            name="first_name"
                                            className="form-control"
                                            value={
                                                this.state.first_name
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter first name"
                                        />

                                    </div>

                                </div>


                                {/* LAST NAME */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="last_name"
                                            className="form-control"
                                            value={
                                                this.state.last_name
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter last name"
                                        />

                                    </div>

                                </div>


                                {/* EMAIL */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={
                                                this.state.email
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter email"
                                        />

                                    </div>

                                </div>


                                {/* ADDRESS */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Address
                                        </label>

                                        <input
                                            type="text"
                                            name="address"
                                            className="form-control"
                                            value={
                                                this.state.address
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter address"
                                        />

                                    </div>

                                </div>


                                {/* SALARY */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Salary
                                        </label>

                                        <input
                                            type="number"
                                            name="salary"
                                            className="form-control"
                                            value={
                                                this.state.salary
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter salary"
                                        />

                                    </div>

                                </div>


                                {/* SPECIALISATION */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Specialisation
                                        </label>

                                        <input
                                            type="text"
                                            name="specialisation"
                                            className="form-control"
                                            value={
                                                this.state.specialisation
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter specialisation"
                                        />

                                    </div>

                                </div>


                                {/* SHIFT */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Shift Time
                                        </label>

                                        <input
                                            type="text"
                                            name="shift_time"
                                            className="form-control"
                                            value={
                                                this.state.shift_time
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Example: 10:00 - 02:00"
                                        />

                                    </div>

                                </div>


                                {/* PASSWORD */}

                                <div className="col-md-6">

                                    <div className="form-group">

                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            value={
                                                this.state.password
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            placeholder="Enter password"
                                        />

                                    </div>

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                    this.state.addingDoctor
                                }
                            >

                                {
                                    this.state.addingDoctor
                                        ? 'Adding...'
                                        : 'Add Doctor'
                                }

                            </button>

                        </form>

                    </div>

                </div>


                {/* ================================================= */}
                {/* DELETE DOCTOR */}
                {/* ================================================= */}

                <div className="container">

                    <div className="jumbotron">

                        <h3 className="text-danger">

                            Delete Doctor

                        </h3>

                        <br />

                        <form
                            onSubmit={this.deleteDoctor}
                        >

                            <div className="form-group">

                                <label>
                                    Doctor ID
                                </label>

                                <input
                                    type="number"
                                    name="deleteDoctorId"
                                    className="form-control"
                                    value={
                                        this.state.deleteDoctorId
                                    }
                                    onChange={
                                        this.onChange
                                    }
                                    placeholder="Enter doctor ID"
                                />

                            </div>

                            <button
                                type="submit"
                                className="btn btn-danger"
                                disabled={
                                    this.state.deletingDoctor
                                }
                            >

                                {
                                    this.state.deletingDoctor
                                        ? 'Deleting...'
                                        : 'Delete Doctor'
                                }

                            </button>

                        </form>

                    </div>

                </div>


                {/* ================================================= */}
                {/* DOCTOR LIST */}
                {/* ================================================= */}

                <div className="container">

                    <div className="jumbotron">

                        <h3 className="text-primary">

                            Registered Doctors

                        </h3>

                        <p className="text-muted">

                            Click on a doctor's name to view
                            their assigned patients.

                        </p>

                        <br />


                        {this.state.loading && (

                            <div className="alert alert-info">

                                Loading doctors...

                            </div>
                        )}


                        {!this.state.loading &&
                        this.state.doctors.length === 0 && (

                            <div className="alert alert-warning">

                                No doctors registered yet.

                            </div>
                        )}


                        {!this.state.loading &&
                        this.state.doctors.length > 0 && (

                            <div className="table-responsive">

                                <table
                                    className="table table-bordered table-striped"
                                >

                                    <thead className="thead-dark">

                                        <tr>

                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Name
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Address
                                            </th>

                                            <th>
                                                Specialisation
                                            </th>

                                            <th>
                                                Shift
                                            </th>

                                            <th>
                                                Salary
                                            </th>

                                            <th>
                                                Patients
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {this.state.doctors.map(
                                            doctor => (

                                                <tr
                                                    key={
                                                        doctor.doctor_id
                                                    }
                                                >

                                                    <td>

                                                        {
                                                            doctor.doctor_id
                                                        }

                                                    </td>


                                                    {/* ================= NAME ================= */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-0"
                                                            onClick={() =>
                                                                this.loadDoctorPatients(
                                                                    doctor
                                                                )
                                                            }
                                                        >

                                                            Dr.{' '}

                                                            {
                                                                doctor.first_name
                                                            }

                                                            {' '}

                                                            {
                                                                doctor.last_name
                                                            }

                                                        </button>

                                                    </td>


                                                    <td>

                                                        {
                                                            doctor.email
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            doctor.address
                                                                ? doctor.address
                                                                : '-'
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            doctor.specialisation
                                                                ? doctor.specialisation
                                                                : '-'
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            doctor.shift_time
                                                                ? doctor.shift_time
                                                                : '-'
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            doctor.salary !== null &&
                                                            doctor.salary !== undefined
                                                                ? doctor.salary
                                                                : '-'
                                                        }

                                                    </td>


                                                    {/* ================= PATIENT COUNT ================= */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="btn btn-info btn-sm"
                                                            onClick={() =>
                                                                this.loadDoctorPatients(
                                                                    doctor
                                                                )
                                                            }
                                                        >

                                                            View{' '}

                                                            {
                                                                doctor.patient_count !== null &&
                                                                doctor.patient_count !== undefined
                                                                    ? doctor.patient_count
                                                                    : 0
                                                            }

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                </div>


                {/* ================================================= */}
                {/* SELECTED DOCTOR PATIENTS */}
                {/* ================================================= */}

                {this.state.selectedDoctor && (

                    <div className="container">

                        <div className="jumbotron">

                            {/* ================= HEADER ================= */}

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <h3 className="text-primary">

                                        Patients of Dr.{' '}

                                        {
                                            this.state.selectedDoctor.first_name
                                        }

                                        {' '}

                                        {
                                            this.state.selectedDoctor.last_name
                                        }

                                    </h3>

                                    <p className="mb-0">

                                        Specialisation:{' '}

                                        <strong>
                                            {
                                                this.state.selectedDoctor.specialisation
                                                    ? this.state.selectedDoctor.specialisation
                                                    : '-'
                                            }
                                        </strong>

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={this.closePatients}
                                >
                                    Close
                                </button>

                            </div>

                            <hr />


                            {/* ================= LOADING ================= */}

                            {this.state.loadingPatients && (

                                <div className="alert alert-info">

                                    Loading patients...

                                </div>

                            )}


                            {/* ================= ERROR ================= */}

                            {this.state.patientError && (

                                <div className="alert alert-danger">

                                    {
                                        this.state.patientError
                                    }

                                </div>

                            )}


                            {/* ================= NO PATIENTS ================= */}

                            {!this.state.loadingPatients &&
                            !this.state.patientError &&
                            this.state.doctorPatients.length === 0 && (

                                <div className="alert alert-warning">

                                    No patients are currently assigned
                                    to this doctor.

                                </div>

                            )}


                            {/* ================= PATIENT TABLE ================= */}

                            {!this.state.loadingPatients &&
                            !this.state.patientError &&
                            this.state.doctorPatients.length > 0 && (

                                <div className="table-responsive">

                                    <table
                                        className="table table-bordered table-striped"
                                    >

                                        <thead className="thead-dark">

                                            <tr>

                                                <th>
                                                    Patient ID
                                                </th>

                                                <th>
                                                    Patient Name
                                                </th>

                                                <th>
                                                    Email
                                                </th>

                                                <th>
                                                    Phone
                                                </th>

                                                <th>
                                                    Disease
                                                </th>

                                                <th>
                                                    Patient Type
                                                </th>

                                                <th>
                                                    Address
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                this.state.doctorPatients.map(
                                                    patient => (

                                                        <tr
                                                            key={
                                                                patient.patient_id
                                                            }
                                                        >

                                                            <td>

                                                                {
                                                                    patient.patient_id
                                                                }

                                                            </td>


                                                            <td>

                                                                {
                                                                    patient.first_name
                                                                }

                                                                {' '}

                                                                {
                                                                    patient.last_name
                                                                }

                                                            </td>


                                                            <td>

                                                                {
                                                                    patient.email
                                                                        ? patient.email
                                                                        : '-'
                                                                }

                                                            </td>


                                                            <td>

                                                                {
                                                                    patient.phone_no
                                                                        ? patient.phone_no
                                                                        : '-'
                                                                }

                                                            </td>


                                                            <td>

                                                                {
                                                                    patient.disease
                                                                        ? patient.disease
                                                                        : '-'
                                                                }

                                                            </td>


                                                            <td>

                                                                {
                                                                    patient.patient_type ===
                                                                    'Inpatient'
                                                                        ? (
                                                                            <span className="badge badge-danger">
                                                                                IP
                                                                            </span>
                                                                        )
                                                                        : (
                                                                            <span className="badge badge-success">
                                                                                OP
                                                                            </span>
                                                                        )
                                                                }

                                                            </td>


                                                            <td>

                                                                {
                                                                    patient.address
                                                                        ? patient.address
                                                                        : '-'
                                                                }

                                                            </td>

                                                        </tr>

                                                    )
                                                )
                                            }

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* ================================================= */}
                {/* NAVIGATION */}
                {/* ================================================= */}

                <div className="container text-center mb-4">

                    <Link
                        to="/administrator/login/admin_home"
                        className="btn btn-secondary mr-2"
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/administrator/login/admin_home/staff"
                        className="btn btn-secondary mr-2"
                    >
                        Staff
                    </Link>

                    <Link
                        to="/administrator/login/admin_home/employee"
                        className="btn btn-secondary mr-2"
                    >
                        Employees
                    </Link>

                    <Link
                        to="/administrator/login/admin_home/billing"
                        className="btn btn-secondary mr-2"
                    >
                        Billing
                    </Link>

                    <Link
                        to="/administrator/login/admin_home/appointments"
                        className="btn btn-secondary mr-2"
                    >
                        Appointments
                    </Link>

                    <Link
                        to="/administrator/login/admin_home/inpatients"
                        className="btn btn-secondary mr-2"
                    >
                        Inpatients
                    </Link>

                    <Link
                        to="/administrator/login/admin_home/beds"
                        className="btn btn-secondary"
                    >
                        Beds
                    </Link>

                </div>


                <Footer />

            </div>
        );
    }
}

export default Doctors;