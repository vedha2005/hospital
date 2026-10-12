import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navber from '../Navber/Navber';
import Footer from '../Footer';

class Inpatients extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inpatients: [],
            patients: [],

            patientId: '',
            admissionDate: '',

            loading: false,
            message: '',
            error: ''
        };
    }

    componentDidMount() {
        this.loadInpatients();
        this.loadPatients();
    }

    // =====================================================
    // LOAD INPATIENT RECORDS
    // =====================================================

    loadInpatients = () => {
        axios
            .get('/admin/inpatients')
            .then(response => {
                this.setState({
                    inpatients: response.data || [],
                    error: ''
                });
            })
            .catch(error => {
                console.log(
                    'Inpatient loading error:',
                    error
                );

                this.setState({
                    error:
                        'Unable to load inpatient records.'
                });
            });
    };

    // =====================================================
    // LOAD PATIENTS
    // =====================================================

    loadPatients = () => {
        axios
            .get('/admin/patients')
            .then(response => {
                this.setState({
                    patients: response.data || []
                });
            })
            .catch(error => {
                console.log(
                    'Patient loading error:',
                    error
                );

                this.setState({
                    error: 'Unable to load patients.'
                });
            });
    };

    // =====================================================
    // INPUT CHANGE
    // =====================================================

    handleChange = event => {
        const {
            name,
            value
        } = event.target;

        this.setState({
            [name]: value
        });
    };

    // =====================================================
    // ADMIT PATIENT
    // =====================================================

    admitPatient = event => {
        event.preventDefault();

        this.setState({
            loading: true,
            message: '',
            error: ''
        });

        const {
            patientId,
            admissionDate,
            patients,
            inpatients
        } = this.state;

        // -------------------------------------------------
        // Validate patient
        // -------------------------------------------------

        if (!patientId) {
            this.setState({
                loading: false,
                error: 'Please select an inpatient.'
            });

            return;
        }

        // -------------------------------------------------
        // Validate admission date
        // -------------------------------------------------

        if (!admissionDate) {
            this.setState({
                loading: false,
                error:
                    'Please select an admission date.'
            });

            return;
        }

        // -------------------------------------------------
        // Find selected patient
        // -------------------------------------------------

        const selectedPatient = patients.find(
            patient =>
                Number(patient.patient_id) ===
                Number(patientId)
        );

        if (!selectedPatient) {
            this.setState({
                loading: false,
                error:
                    'Selected patient was not found.'
            });

            return;
        }

        // -------------------------------------------------
        // Patient must be registered as Inpatient
        // -------------------------------------------------

        if (
            selectedPatient.patient_type !==
            'Inpatient'
        ) {
            this.setState({
                loading: false,
                error:
                    'Only patients registered as Inpatient (IP) can be admitted.'
            });

            return;
        }

        // -------------------------------------------------
        // Check whether patient is already admitted
        // -------------------------------------------------

        const alreadyAdmitted =
            inpatients.some(
                inpatient =>
                    Number(inpatient.patient_id) ===
                        Number(patientId) &&
                    inpatient.status === 'Admitted'
            );

        if (alreadyAdmitted) {
            this.setState({
                loading: false,
                error:
                    'This patient is already admitted.'
            });

            return;
        }

        // -------------------------------------------------
        // Send admission request
        // -------------------------------------------------

        const data = {
            patient_id: Number(patientId),
            admission_date: admissionDate
        };

        axios
            .post(
                '/admin/inpatients/admit',
                data
            )
            .then(response => {
                this.setState({
                    patientId: '',
                    admissionDate: '',
                    loading: false,

                    message:
                        response.data.message ||
                        'Patient admitted successfully.',

                    error: ''
                });

                this.loadInpatients();
                this.loadPatients();
            })
            .catch(error => {
                console.log(
                    'Patient admission error:',
                    error
                );

                let errorMessage =
                    'Unable to admit patient.';

                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {
                    errorMessage =
                        error.response.data.error;
                }

                this.setState({
                    loading: false,
                    error: errorMessage,
                    message: ''
                });
            });
    };

    // =====================================================
    // DISCHARGE PATIENT
    // =====================================================

    dischargePatient = inpatientId => {
        const confirmDischarge =
            window.confirm(
                'Are you sure you want to discharge this patient?'
            );

        if (!confirmDischarge) {
            return;
        }

        this.setState({
            message: '',
            error: '',
            loading: true
        });

        axios
            .post(
                '/admin/inpatients/discharge',
                {
                    inpatient_id:
                        Number(inpatientId)
                }
            )
            .then(response => {
                this.setState({
                    message:
                        response.data.message ||
                        'Patient discharged successfully.',

                    error: '',
                    loading: false
                });

                this.loadInpatients();
                this.loadPatients();
            })
            .catch(error => {
                console.log(
                    'Patient discharge error:',
                    error
                );

                let errorMessage =
                    'Unable to discharge patient.';

                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {
                    errorMessage =
                        error.response.data.error;
                }

                this.setState({
                    error: errorMessage,
                    message: '',
                    loading: false
                });
            });
    };

    // =====================================================
    // GET PATIENT NAME
    // =====================================================

    getPatientName = inpatient => {
        if (inpatient.patient_name) {
            return inpatient.patient_name;
        }

        return (
            `${inpatient.first_name || ''} ${
                inpatient.last_name || ''
            }`.trim() || 'Unknown Patient'
        );
    };

    // =====================================================
    // GET PATIENT TYPE
    // =====================================================

    getPatientType = inpatient => {
        if (
            inpatient.patient_type ===
            'Inpatient'
        ) {
            return 'Inpatient (IP)';
        }

        return 'Outpatient (OP)';
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    formatDate = date => {
        if (!date) {
            return '-';
        }

        return String(date).substring(0, 10);
    };

    // =====================================================
    // RENDER
    // =====================================================

    render() {
        const {
            inpatients,
            patients,
            patientId,
            admissionDate,
            loading,
            message,
            error
        } = this.state;

        // -------------------------------------------------
        // Only Inpatient registered patients
        // -------------------------------------------------

        const inpatientPatients =
            patients.filter(
                patient =>
                    patient.patient_type ===
                    'Inpatient'
            );

        // -------------------------------------------------
        // Remove patients who are already admitted
        // -------------------------------------------------

        const availableInpatients =
            inpatientPatients.filter(
                patient =>
                    !inpatients.some(
                        inpatient =>
                            Number(
                                inpatient.patient_id
                            ) ===
                                Number(
                                    patient.patient_id
                                ) &&
                            inpatient.status ===
                                'Admitted'
                    )
            );

        return (
            <div className="bg-light min-vh-100">

                {/* ================================================= */}
                {/* NAVBAR */}
                {/* ================================================= */}

                <Navber />

                <div className="container py-5">

                    {/* ================================================= */}
                    {/* HEADER */}
                    {/* ================================================= */}

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h1 className="font-weight-bold">
                                Inpatient Management
                            </h1>

                            <p className="text-muted mb-0">
                                Manage inpatient admissions,
                                bed allocation and
                                discharges.
                            </p>

                        </div>

                        <Link
                            to="/administrator/login/admin_home"
                            className="btn btn-secondary"
                        >
                            Back to Dashboard
                        </Link>

                    </div>


                    {/* ================================================= */}
                    {/* SUCCESS MESSAGE */}
                    {/* ================================================= */}

                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}


                    {/* ================================================= */}
                    {/* ERROR MESSAGE */}
                    {/* ================================================= */}

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}


                    {/* ================================================= */}
                    {/* ADMIT PATIENT */}
                    {/* ================================================= */}

                    <div className="card shadow mb-5">

                        <div className="card-header bg-primary text-white">

                            <h4 className="mb-0">
                                Admit Inpatient
                            </h4>

                        </div>

                        <div className="card-body">

                            <div className="alert alert-info">

                                Only patients registered as
                                <strong>
                                    {' '}Inpatient (IP)
                                </strong>
                                {' '}can be admitted.

                            </div>


                            <form
                                onSubmit={
                                    this.admitPatient
                                }
                            >

                                <div className="row">

                                    {/* ================================================= */}
                                    {/* PATIENT */}
                                    {/* ================================================= */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            <strong>
                                                Inpatient
                                            </strong>
                                        </label>

                                        <select
                                            name="patientId"
                                            value={
                                                patientId
                                            }
                                            onChange={
                                                this.handleChange
                                            }
                                            className="form-control"
                                            required
                                        >

                                            <option value="">
                                                Select Inpatient
                                            </option>

                                            {availableInpatients.map(
                                                patient => (

                                                    <option
                                                        key={
                                                            patient.patient_id
                                                        }
                                                        value={
                                                            patient.patient_id
                                                        }
                                                    >

                                                        {
                                                            patient.first_name
                                                        }

                                                        {' '}

                                                        {
                                                            patient.last_name
                                                        }

                                                        {' - Patient ID: '}

                                                        {
                                                            patient.patient_id
                                                        }

                                                        {' - '}

                                                        {
                                                            patient.email
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>


                                        {inpatientPatients.length ===
                                            0 && (
                                            <small className="text-danger">

                                                No patients registered
                                                as Inpatient (IP).

                                            </small>
                                        )}


                                        {inpatientPatients.length >
                                            0 &&
                                            availableInpatients.length ===
                                                0 && (
                                                <small className="text-warning">

                                                    All registered
                                                    inpatient patients
                                                    are currently
                                                    admitted.

                                                </small>
                                            )}

                                    </div>


                                    {/* ================================================= */}
                                    {/* ADMISSION DATE */}
                                    {/* ================================================= */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            <strong>
                                                Admission Date
                                            </strong>
                                        </label>

                                        <input
                                            type="date"
                                            name="admissionDate"
                                            value={
                                                admissionDate
                                            }
                                            onChange={
                                                this.handleChange
                                            }
                                            className="form-control"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* ================================================= */}
                                {/* ADMIT BUTTON */}
                                {/* ================================================= */}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        loading ||
                                        availableInpatients.length ===
                                            0
                                    }
                                >

                                    {loading
                                        ? 'Processing...'
                                        : 'Admit Patient'}

                                </button>

                            </form>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* INPATIENT RECORDS */}
                    {/* ================================================= */}

                    <div className="card shadow">

                        <div className="card-header">

                            <h4 className="mb-0">
                                Inpatient Records
                            </h4>

                        </div>

                        <div className="card-body">

                            {inpatients.length ===
                            0 ? (

                                <div className="text-center text-muted py-4">

                                    No inpatient records
                                    found.

                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover">

                                        <thead className="thead-light">

                                            <tr>

                                                <th>
                                                    IP ID
                                                </th>

                                                <th>
                                                    Patient ID
                                                </th>

                                                <th>
                                                    Patient
                                                </th>

                                                <th>
                                                    Patient Type
                                                </th>

                                                <th>
                                                    Admission Date
                                                </th>

                                                <th>
                                                    Discharge Date
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {inpatients.map(
                                                inpatient => (

                                                    <tr
                                                        key={
                                                            inpatient.inpatient_id
                                                        }
                                                    >

                                                        {/* IP ID */}

                                                        <td>
                                                            {
                                                                inpatient.inpatient_id
                                                            }
                                                        </td>


                                                        {/* PATIENT ID */}

                                                        <td>
                                                            {
                                                                inpatient.patient_id
                                                            }
                                                        </td>


                                                        {/* PATIENT */}

                                                        <td>
                                                            {
                                                                this.getPatientName(
                                                                    inpatient
                                                                )
                                                            }
                                                        </td>


                                                        {/* PATIENT TYPE */}

                                                        <td>

                                                            <span className="badge badge-info">

                                                                {
                                                                    this.getPatientType(
                                                                        inpatient
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ADMISSION DATE */}

                                                        <td>
                                                            {
                                                                this.formatDate(
                                                                    inpatient.admission_date
                                                                )
                                                            }
                                                        </td>


                                                        {/* DISCHARGE DATE */}

                                                        <td>
                                                            {
                                                                this.formatDate(
                                                                    inpatient.discharge_date
                                                                )
                                                            }
                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    inpatient.status ===
                                                                    'Admitted'
                                                                        ? 'badge badge-success'
                                                                        : 'badge badge-secondary'
                                                                }
                                                            >

                                                                {
                                                                    inpatient.status
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td>

                                                            {inpatient.status ===
                                                            'Admitted' ? (

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() =>
                                                                        this.dischargePatient(
                                                                            inpatient.inpatient_id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >

                                                                    Discharge

                                                                </button>

                                                            ) : (

                                                                <span className="text-muted">

                                                                    Completed

                                                                </span>

                                                            )}

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

                </div>


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <Footer />

            </div>
        );
    }
}

export default Inpatients;