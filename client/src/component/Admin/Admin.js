import React, { Component } from 'react';
import Navber from './AdminNavbar';
import axios from 'axios';
import Footer from '../Footer';

class Admin extends Component {

    constructor() {
        super();

        this.state = {

            // =================================================
            // EMPLOYEE
            // =================================================

            first_name: '',
            last_name: '',
            email: '',
            address: '',
            phone_no: '',
            designation: '',
            salary: '',
            password: '',
            del_emp_id: '',

            // =================================================
            // PATIENTS
            // =================================================

            patients: [],

            // =================================================
            // DOCTORS
            // =================================================

            doctors: [],

            // =================================================
            // MESSAGES
            // =================================================

            message: '',
            error: '',

            // =================================================
            // LOADING
            // =================================================

            loadingPatients: false,
            loadingDoctors: false,
            loadingEmployee: false,
            loadingDelete: false
        };

        this.onChange =
            this.onChange.bind(this);

        this.onSubmit1 =
            this.onSubmit1.bind(this);

        this.onSubmit2 =
            this.onSubmit2.bind(this);

        this.assignDoctor =
            this.assignDoctor.bind(this);

        this.loadPatients =
            this.loadPatients.bind(this);

        this.loadDoctors =
            this.loadDoctors.bind(this);
    }


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    onChange(e) {

        this.setState({
            [e.target.name]: e.target.value
        });
    }


    // =====================================================
    // LOAD PATIENTS
    // =====================================================

    loadPatients() {

        this.setState({
            loadingPatients: true,
            error: ''
        });

        axios
            .get('/admin/patients')

            .then(response => {

                console.log(
                    'Patients:',
                    response.data
                );

                this.setState({
                    patients:
                        Array.isArray(response.data)
                            ? response.data
                            : [],
                    loadingPatients: false
                });

            })

            .catch(error => {

                console.log(
                    'Patient loading error:',
                    error
                );

                this.setState({
                    loadingPatients: false,
                    error:
                        'Unable to load patients.'
                });
            });
    }


    // =====================================================
    // LOAD DOCTORS
    // =====================================================

    loadDoctors() {

        this.setState({
            loadingDoctors: true,
            error: ''
        });

        axios
            .get('/admin/doctors')

            .then(response => {

                console.log(
                    'Doctors:',
                    response.data
                );

                this.setState({
                    doctors:
                        Array.isArray(response.data)
                            ? response.data
                            : [],
                    loadingDoctors: false
                });

            })

            .catch(error => {

                console.log(
                    'Doctor loading error:',
                    error
                );

                this.setState({
                    loadingDoctors: false,
                    error:
                        'Unable to load doctors.'
                });
            });
    }


    // =====================================================
    // LOAD DATA WHEN PAGE OPENS
    // =====================================================

    componentDidMount() {

        this.loadPatients();

        this.loadDoctors();
    }


    // =====================================================
    // ADD EMPLOYEE
    // =====================================================

    onSubmit1(e) {

        e.preventDefault();

        this.setState({
            message: '',
            error: ''
        });

        const {
            first_name,
            last_name,
            email,
            address,
            phone_no,
            designation,
            salary,
            password
        } = this.state;

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !first_name ||
            !last_name ||
            !email ||
            !address ||
            !phone_no ||
            !designation ||
            !salary ||
            !password
        ) {

            this.setState({
                error:
                    'Please fill all employee fields.'
            });

            return;
        }

        const emp = {

            first_name:
                first_name.trim(),

            last_name:
                last_name.trim(),

            email:
                email.trim(),

            address:
                address.trim(),

            phone_no:
                phone_no.trim(),

            designation:
                designation.trim(),

            salary:
                salary,

            password:
                password
        };


        this.setState({
            loadingEmployee: true
        });


        axios
            .post(
                '/admin/register',
                emp
            )

            .then(res => {

                console.log(
                    'Employee response:',
                    res.data
                );

                this.setState({

                    message:
                        res.data.message ||
                        'Employee added successfully.',

                    error: '',

                    first_name: '',
                    last_name: '',
                    email: '',
                    address: '',
                    phone_no: '',
                    designation: '',
                    salary: '',
                    password: '',

                    loadingEmployee: false
                });

            })

            .catch(err => {

                console.log(
                    'Employee error:',
                    err
                );

                let errorMessage =
                    'Unable to add employee.';

                if (
                    err.response &&
                    err.response.data &&
                    err.response.data.error
                ) {

                    errorMessage =
                        err.response.data.error;
                }

                this.setState({

                    error:
                        errorMessage,

                    message: '',

                    loadingEmployee: false
                });
            });
    }


    // =====================================================
    // DELETE EMPLOYEE
    // =====================================================

    onSubmit2(e) {

        e.preventDefault();

        this.setState({
            message: '',
            error: ''
        });

        const {
            del_emp_id
        } = this.state;


        if (!del_emp_id) {

            this.setState({
                error:
                    'Please enter an Employee ID.'
            });

            return;
        }


        const confirmDelete =
            window.confirm(
                'Are you sure you want to delete this employee?'
            );


        if (!confirmDelete) {

            return;
        }


        this.setState({
            loadingDelete: true
        });


        axios
            .post(
                '/admin/delete',
                {
                    admin_id:
                        Number(del_emp_id)
                }
            )

            .then(res => {

                console.log(
                    'Delete response:',
                    res.data
                );

                this.setState({

                    message:
                        res.data.message ||
                        'Employee deleted successfully.',

                    error: '',

                    del_emp_id: '',

                    loadingDelete: false
                });

            })

            .catch(err => {

                console.log(
                    'Delete error:',
                    err
                );

                let errorMessage =
                    'Unable to delete employee.';

                if (
                    err.response &&
                    err.response.data &&
                    err.response.data.error
                ) {

                    errorMessage =
                        err.response.data.error;
                }

                this.setState({

                    error:
                        errorMessage,

                    message: '',

                    loadingDelete: false
                });
            });
    }


    // =====================================================
    // ASSIGN DOCTOR TO PATIENT
    // =====================================================

    assignDoctor(patient_id, doctor_id) {

        if (!doctor_id) {

            return;
        }

        this.setState({
            message: '',
            error: ''
        });


        axios
            .post(
                '/admin/assign_doctor',
                {
                    patient_id:
                        Number(patient_id),

                    doctor_id:
                        Number(doctor_id)
                }
            )

            .then(response => {

                console.log(
                    'Assignment response:',
                    response.data
                );

                this.setState({

                    message:
                        response.data.message ||
                        'Doctor assigned successfully.',

                    error: ''
                });


                // Reload patients so the
                // assigned doctor appears.

                this.loadPatients();

            })

            .catch(error => {

                console.log(
                    'Assignment error:',
                    error
                );

                let errorMessage =
                    'Unable to assign doctor.';

                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {

                    errorMessage =
                        error.response.data.error;
                }

                this.setState({

                    error:
                        errorMessage,

                    message: ''
                });
            });
    }


    // =====================================================
    // GET PATIENT TYPE
    // =====================================================

    getPatientType(patient) {

        if (
            patient.patient_type ===
            'Inpatient'
        ) {

            return (
                <span className="badge badge-danger">
                    Inpatient (IP)
                </span>
            );
        }

        return (
            <span className="badge badge-success">
                Outpatient (OP)
            </span>
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    render() {

        const {
            first_name,
            last_name,
            email,
            address,
            phone_no,
            designation,
            salary,
            password,
            del_emp_id,

            patients,
            doctors,

            message,
            error,

            loadingPatients,
            loadingDoctors,
            loadingEmployee,
            loadingDelete
        } = this.state;


        return (

            <div className="bg-dark">

                {/* ================================================= */}
                {/* NAVBAR */}
                {/* ================================================= */}

                <Navber />

                <br />


                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <h2
                    className="text-white"
                    align="center"
                >
                    Administrator Home
                </h2>

                <h3
                    className="text-white"
                    align="center"
                >
                    Welcome!
                </h3>

                <br />


                {/* ================================================= */}
                {/* MESSAGES */}
                {/* ================================================= */}

                <div className="container">

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

                </div>


                {/* ================================================= */}
                {/* PATIENTS SECTION */}
                {/* ================================================= */}

                <div className="container">

                    <div
                        className="jumbotron mt-4"
                        style={{
                            backgroundColor:
                                '#e0e0e0'
                        }}
                    >

                        <h2 className="text-primary">
                            Registered Patients
                        </h2>

                        <br />


                        {/* Loading */}

                        {loadingPatients && (

                            <p>
                                Loading patients...
                            </p>
                        )}


                        {/* No Patients */}

                        {!loadingPatients &&
                        patients.length === 0 && (

                            <div className="alert alert-warning">

                                No patients registered yet.

                            </div>
                        )}


                        {/* Patient Table */}

                        {patients.length > 0 && (

                            <div className="table-responsive">

                                <table className="table table-bordered table-striped">

                                    <thead className="thead-dark">

                                        <tr>

                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Patient Name
                                            </th>

                                            <th>
                                                Patient Type
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
                                                Assigned Doctor
                                            </th>

                                            <th>
                                                Assign / Change
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {patients.map(
                                            patient => (

                                                <tr
                                                    key={
                                                        patient.patient_id
                                                    }
                                                >

                                                    {/* ================= ID ================= */}

                                                    <td>
                                                        {
                                                            patient.patient_id
                                                        }
                                                    </td>


                                                    {/* ================= NAME ================= */}

                                                    <td>

                                                        {
                                                            patient.first_name
                                                        }

                                                        {' '}

                                                        {
                                                            patient.last_name
                                                        }

                                                    </td>


                                                    {/* ================= PATIENT TYPE ================= */}

                                                    <td>

                                                        {this.getPatientType(
                                                            patient
                                                        )}

                                                    </td>


                                                    {/* ================= EMAIL ================= */}

                                                    <td>
                                                        {
                                                            patient.email
                                                        }
                                                    </td>


                                                    {/* ================= PHONE ================= */}

                                                    <td>
                                                        {
                                                            patient.phone_no
                                                        }
                                                    </td>


                                                    {/* ================= DISEASE ================= */}

                                                    <td>
                                                        {
                                                            patient.disease ||
                                                            '-'
                                                        }
                                                    </td>


                                                    {/* ================= ASSIGNED DOCTOR ================= */}

                                                    <td>

                                                        {patient.doctor_id ? (

                                                            <span>

                                                                Dr.{' '}

                                                                {
                                                                    patient.doctor_first_name
                                                                }

                                                                {' '}

                                                                {
                                                                    patient.doctor_last_name
                                                                }

                                                                <br />

                                                                <small>

                                                                    {
                                                                        patient.specialisation ||
                                                                        'Specialisation not available'
                                                                    }

                                                                </small>

                                                            </span>

                                                        ) : (

                                                            <span className="text-danger">

                                                                Not Assigned

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* ================= ASSIGN DOCTOR ================= */}

                                                    <td>

                                                        <select
                                                            className="form-control"
                                                            defaultValue={
                                                                patient.doctor_id ||
                                                                ''
                                                            }
                                                            onChange={
                                                                e =>
                                                                    this.assignDoctor(
                                                                        patient.patient_id,
                                                                        e.target.value
                                                                    )
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Doctor
                                                            </option>


                                                            {doctors.map(
                                                                doctor => (

                                                                    <option
                                                                        key={
                                                                            doctor.doctor_id
                                                                        }
                                                                        value={
                                                                            doctor.doctor_id
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

                                                                        {' - '}

                                                                        {
                                                                            doctor.specialisation
                                                                        }

                                                                    </option>

                                                                )
                                                            )}

                                                        </select>

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
                {/* DOCTORS SECTION */}
                {/* ================================================= */}

                <div className="container">

                    <div
                        className="jumbotron mt-4"
                        style={{
                            backgroundColor:
                                '#e0e0e0'
                        }}
                    >

                        <h2 className="text-primary">
                            Available Doctors
                        </h2>

                        <br />


                        {loadingDoctors && (

                            <p>
                                Loading doctors...
                            </p>
                        )}


                        {!loadingDoctors &&
                        doctors.length === 0 && (

                            <div className="alert alert-warning">

                                No doctors registered yet.

                            </div>
                        )}


                        {doctors.length > 0 && (

                            <div className="table-responsive">

                                <table className="table table-bordered table-striped">

                                    <thead className="thead-dark">

                                        <tr>

                                            <th>
                                                Doctor ID
                                            </th>

                                            <th>
                                                Doctor Name
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Specialisation
                                            </th>

                                            <th>
                                                Shift
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {doctors.map(
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

                                                    <td>

                                                        Dr.{' '}

                                                        {
                                                            doctor.first_name
                                                        }

                                                        {' '}

                                                        {
                                                            doctor.last_name
                                                        }

                                                    </td>

                                                    <td>
                                                        {
                                                            doctor.email
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            doctor.specialisation
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            doctor.shift_time ||
                                                            '-'
                                                        }
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
                {/* EMPLOYEE MANAGEMENT */}
                {/* ================================================= */}

                <div className="row">

                    {/* ================================================= */}
                    {/* ADD EMPLOYEE */}
                    {/* ================================================= */}

                    <div className="col">

                        <div className="container">

                            <div
                                className="jumbotron mt-5"
                                style={{
                                    backgroundColor:
                                        '#e0e0e0'
                                }}
                            >

                                <form
                                    noValidate
                                    onSubmit={
                                        this.onSubmit1
                                    }
                                >

                                    <h2 className="text-primary">
                                        Add New Employee
                                    </h2>

                                    <br />


                                    {/* First Name */}

                                    <div className="form-group">

                                        <label>
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="first_name"
                                            placeholder="Enter First Name"
                                            value={
                                                first_name
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Last Name */}

                                    <div className="form-group">

                                        <label>
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="last_name"
                                            placeholder="Enter Last Name"
                                            value={
                                                last_name
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Email */}

                                    <div className="form-group">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            placeholder="Enter Email Address"
                                            value={
                                                email
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Address */}

                                    <div className="form-group">

                                        <label>
                                            Address
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            placeholder="Enter Address"
                                            value={
                                                address
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Designation */}

                                    <div className="form-group">

                                        <label>
                                            Designation
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="designation"
                                            placeholder="Enter Designation"
                                            value={
                                                designation
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Salary */}

                                    <div className="form-group">

                                        <label>
                                            Salary
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="salary"
                                            placeholder="Enter Salary"
                                            value={
                                                salary
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                            min="0"
                                        />

                                    </div>


                                    {/* Phone */}

                                    <div className="form-group">

                                        <label>
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone_no"
                                            placeholder="Enter Phone Number"
                                            value={
                                                phone_no
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Password */}

                                    <div className="form-group">

                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="Enter Password"
                                            value={
                                                password
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Submit */}

                                    <button
                                        type="submit"
                                        className="btn btn-lg btn-primary btn-block"
                                        disabled={
                                            loadingEmployee
                                        }
                                    >

                                        {loadingEmployee
                                            ? 'Adding Employee...'
                                            : 'Enter Employee'}

                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* DELETE EMPLOYEE */}
                    {/* ================================================= */}

                    <div className="col">

                        <div className="container">

                            <div
                                className="jumbotron mt-5"
                                style={{
                                    backgroundColor:
                                        '#e0e0e0'
                                }}
                            >

                                <form
                                    noValidate
                                    onSubmit={
                                        this.onSubmit2
                                    }
                                >

                                    <h3 className="text-primary">
                                        Delete Employee Information
                                    </h3>

                                    <br />


                                    <div className="form-group">

                                        <label>
                                            Employee ID
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="del_emp_id"
                                            placeholder="Enter Employee ID"
                                            value={
                                                del_emp_id
                                            }
                                            onChange={
                                                this.onChange
                                            }
                                            required
                                            min="1"
                                        />

                                    </div>


                                    <button
                                        type="submit"
                                        className="btn btn-lg btn-primary btn-block"
                                        disabled={
                                            loadingDelete
                                        }
                                    >

                                        {loadingDelete
                                            ? 'Deleting...'
                                            : 'Delete'}

                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>


                <br />
                <br />


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <Footer />

            </div>
        );
    }
}

export default Admin;