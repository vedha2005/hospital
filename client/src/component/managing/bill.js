import React, { Component } from 'react';
import axios from 'axios';
import AdminNavbar from '../Admin/AdminNavbar';
import Footer from '../Footer';

class Bill extends Component {

    constructor(props) {
        super(props);

        this.state = {

            // OP or IP
            billingType: 'OP',

            // Data
            patients: [],
            doctors: [],

            // Selected values
            selectedDoctor: '',
            selectedPatient: '',

            // Charges
            medicine_cost: '0',
            operation_charge: '0',
            room_charge: '0',
            misc_charge: '0',

            // Payment
            payment_status: 'Pending',
            payment_method: 'Cash',

            // Total
            total: 0,

            // Messages
            message: '',
            error: '',

            // Loading
            loading: false
        };
    }


    // =====================================================
    // COMPONENT DID MOUNT
    // =====================================================

    componentDidMount() {

        this.loadPatients();

        this.loadDoctors();

    }


    // =====================================================
    // LOAD PATIENTS
    // =====================================================

    loadPatients = () => {

        axios.get('/admin/patients')

            .then(response => {

                console.log(
                    'Patients:',
                    response.data
                );

                this.setState({
                    patients: response.data,
                    error: ''
                });

            })

            .catch(error => {

                console.log(
                    'Patient loading error:',
                    error
                );

                this.setState({
                    error:
                        'Unable to load patients'
                });

            });

    };


    // =====================================================
    // LOAD DOCTORS
    // =====================================================

    loadDoctors = () => {

        axios.get('/admin/doctors')

            .then(response => {

                console.log(
                    'Doctors:',
                    response.data
                );

                this.setState({
                    doctors: response.data,
                    error: ''
                });

            })

            .catch(error => {

                console.log(
                    'Doctor loading error:',
                    error
                );

                this.setState({
                    error:
                        'Unable to load doctors'
                });

            });

    };


    // =====================================================
    // CHANGE BILLING TYPE
    // =====================================================

    changeBillingType = (type) => {

        this.setState(
            {
                billingType: type,

                selectedPatient: '',

                medicine_cost: '0',

                operation_charge: '0',

                room_charge: '0',

                misc_charge: '0',

                total: 0,

                message: '',

                error: ''
            }
        );

    };


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        this.setState(
            {
                [name]: value
            },
            this.calculateTotal
        );

    };


    // =====================================================
    // CALCULATE TOTAL
    // =====================================================

    calculateTotal = () => {

        const medicine =
            Number(this.state.medicine_cost) || 0;

        const operation =
            Number(this.state.operation_charge) || 0;

        const room =
            Number(this.state.room_charge) || 0;

        const misc =
            Number(this.state.misc_charge) || 0;


        let total = 0;


        // =================================================
        // OP BILL
        // =================================================

        if (this.state.billingType === 'OP') {

            total =
                medicine +
                operation +
                misc;

        }


        // =================================================
        // IP BILL
        // =================================================

        else {

            total =
                medicine +
                operation +
                room +
                misc;

        }


        this.setState({
            total: total
        });

    };


    // =====================================================
    // SAVE BILL
    // =====================================================

    saveBill = (event) => {

        event.preventDefault();


        this.setState({
            message: '',
            error: '',
            loading: true
        });


        // =================================================
        // VALIDATE DOCTOR
        // =================================================

        if (!this.state.selectedDoctor) {

            this.setState({
                error:
                    'Please select a doctor',
                loading: false
            });

            return;
        }


        // =================================================
        // VALIDATE PATIENT
        // =================================================

        if (!this.state.selectedPatient) {

            this.setState({
                error:
                    'Please select a patient',
                loading: false
            });

            return;
        }


        // =================================================
        // FIND SELECTED PATIENT
        // =================================================

        const selectedPatient =
            this.state.patients.find(
                patient =>
                    String(patient.patient_id) ===
                    String(this.state.selectedPatient)
            );


        if (!selectedPatient) {

            this.setState({
                error:
                    'Selected patient was not found',
                loading: false
            });

            return;
        }


        // =================================================
        // VALIDATE PATIENT TYPE
        // =================================================

        const expectedPatientType =
            this.state.billingType === 'OP'
                ? 'Outpatient'
                : 'Inpatient';


        if (
            selectedPatient.patient_type &&
            selectedPatient.patient_type !==
                expectedPatientType
        ) {

            this.setState({
                error:
                    this.state.billingType === 'OP'
                        ? 'Only Outpatient patients can receive OP billing'
                        : 'Only Inpatient patients can receive IP billing',

                loading: false
            });

            return;
        }


        // =================================================
        // OP ROOM CHARGE MUST ALWAYS BE ZERO
        // =================================================

        const roomCharge =
            this.state.billingType === 'IP'
                ? Number(this.state.room_charge) || 0
                : 0;


        // =================================================
        // BILL DATA
        // =================================================

        const billData = {

            billing_type:
                this.state.billingType,

            doctor_id:
                Number(this.state.selectedDoctor),

            patient_id:
                Number(this.state.selectedPatient),

            medicine_cost:
                Number(this.state.medicine_cost) || 0,

            operation_charge:
                Number(this.state.operation_charge) || 0,

            room_charge:
                roomCharge,

            misc_charge:
                Number(this.state.misc_charge) || 0,

            payment_status:
                this.state.payment_status,

            payment_method:
                this.state.payment_method
        };


        console.log(
            'Billing data:',
            billData
        );


        // =================================================
        // SEND BILL TO BACKEND
        // =================================================

        axios.post(
            '/admin/bill',
            billData
        )

            .then(response => {

                console.log(
                    'Bill response:',
                    response.data
                );


                this.setState({

                    message:
                        response.data.message ||
                        'Bill saved successfully',

                    error: '',

                    loading: false

                });


                // Recalculate total using backend response
                if (
                    response.data.total !==
                    undefined
                ) {

                    this.setState({
                        total:
                            Number(
                                response.data.total
                            ) || 0
                    });

                }

            })

            .catch(error => {

                console.log(
                    'Billing error:',
                    error
                );


                const errorMessage =
                    error.response &&
                    error.response.data &&
                    error.response.data.error

                        ? error.response.data.error

                        : 'Unable to save bill';


                this.setState({

                    error:
                        errorMessage,

                    message: '',

                    loading: false

                });

            });

    };


    // =====================================================
    // RESET FORM
    // =====================================================

    resetForm = () => {

        this.setState({

            selectedDoctor: '',

            selectedPatient: '',

            medicine_cost: '0',

            operation_charge: '0',

            room_charge: '0',

            misc_charge: '0',

            payment_status: 'Pending',

            payment_method: 'Cash',

            total: 0,

            message: '',

            error: ''

        });

    };


    // =====================================================
    // GET FILTERED PATIENTS
    // =====================================================

    getFilteredPatients = () => {

        const {
            patients,
            billingType
        } = this.state;


        const requiredType =
            billingType === 'OP'
                ? 'Outpatient'
                : 'Inpatient';


        return patients.filter(
            patient => {

                // New records will have patient_type
                if (patient.patient_type) {

                    return (
                        patient.patient_type ===
                        requiredType
                    );

                }


                // Fallback for old records
                // without patient_type
                return false;

            }
        );

    };


    // =====================================================
    // RENDER
    // =====================================================

    render() {

        const {

            billingType,

            doctors,

            selectedDoctor,

            selectedPatient,

            medicine_cost,

            operation_charge,

            room_charge,

            misc_charge,

            payment_status,

            payment_method,

            total,

            message,

            error,

            loading

        } = this.state;


        const filteredPatients =
            this.getFilteredPatients();


        return (

            <div className="bg-dark min-vh-100">

                <AdminNavbar />


                <div className="container py-5">

                    <div className="jumbotron">


                        {/* ================================================= */}
                        {/* TITLE */}
                        {/* ================================================= */}

                        <h2 className="text-primary text-center">

                            Hospital Billing

                        </h2>


                        <hr />


                        {/* ================================================= */}
                        {/* BILLING TYPE */}
                        {/* ================================================= */}

                        <div className="text-center mb-4">


                            <button

                                type="button"

                                className={
                                    billingType === 'OP'

                                        ? 'btn btn-primary mr-2'

                                        : 'btn btn-outline-primary mr-2'
                                }

                                onClick={() =>
                                    this.changeBillingType(
                                        'OP'
                                    )
                                }

                            >

                                Outpatient Billing

                            </button>


                            <button

                                type="button"

                                className={
                                    billingType === 'IP'

                                        ? 'btn btn-success'

                                        : 'btn btn-outline-success'
                                }

                                onClick={() =>
                                    this.changeBillingType(
                                        'IP'
                                    )
                                }

                            >

                                Inpatient Billing

                            </button>


                        </div>


                        {/* ================================================= */}
                        {/* BILLING INFORMATION */}
                        {/* ================================================= */}

                        <div className="alert alert-info">


                            {billingType === 'OP'

                                ? (

                                    <div>

                                        <strong>
                                            Outpatient Billing
                                        </strong>

                                        <br />

                                        Medicine, operation
                                        and miscellaneous
                                        charges are included.

                                        <br />

                                        Room/Bed charges are
                                        not included.

                                    </div>

                                )

                                : (

                                    <div>

                                        <strong>
                                            Inpatient Billing
                                        </strong>

                                        <br />

                                        Medicine, operation,
                                        room/bed and
                                        miscellaneous charges
                                        are included.

                                        <br />

                                        Patient must be
                                        admitted before
                                        inpatient billing.

                                    </div>

                                )

                            }

                        </div>


                        {/* ================================================= */}
                        {/* MESSAGES */}
                        {/* ================================================= */}

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


                        <form
                            onSubmit={this.saveBill}
                        >


                            {/* ================================================= */}
                            {/* DOCTOR */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    <strong>
                                        Doctor
                                    </strong>

                                </label>


                                <select

                                    className="form-control"

                                    name="selectedDoctor"

                                    value={
                                        selectedDoctor
                                    }

                                    onChange={
                                        this.handleChange
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
                                                }{' '}

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

                            </div>


                            {/* ================================================= */}
                            {/* PATIENT */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    <strong>
                                        Patient
                                    </strong>

                                </label>


                                <select

                                    className="form-control"

                                    name="selectedPatient"

                                    value={
                                        selectedPatient
                                    }

                                    onChange={
                                        this.handleChange
                                    }

                                >

                                    <option value="">

                                        Select{' '}

                                        {
                                            billingType === 'OP'
                                                ? 'Outpatient'
                                                : 'Inpatient'
                                        }

                                    </option>


                                    {filteredPatients.map(
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
                                                }{' '}

                                                {
                                                    patient.last_name
                                                }

                                                {' - ID: '}

                                                {
                                                    patient.patient_id
                                                }

                                                {' - '}

                                                {
                                                    billingType === 'OP'
                                                        ? 'OP'
                                                        : 'IP'
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                {/* No matching patients */}

                                {filteredPatients.length === 0 && (

                                    <small className="text-danger">

                                        No{' '}

                                        {
                                            billingType === 'OP'
                                                ? 'outpatient'
                                                : 'inpatient'
                                        }

                                        {' '}patients available.

                                    </small>

                                )}

                            </div>


                            {/* ================================================= */}
                            {/* MEDICINE */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    Medicine Cost

                                </label>


                                <input

                                    type="number"

                                    min="0"

                                    step="0.01"

                                    className="form-control"

                                    name="medicine_cost"

                                    value={
                                        medicine_cost
                                    }

                                    onChange={
                                        this.handleChange
                                    }

                                />

                            </div>


                            {/* ================================================= */}
                            {/* OPERATION */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    Operation Charge

                                </label>


                                <input

                                    type="number"

                                    min="0"

                                    step="0.01"

                                    className="form-control"

                                    name="operation_charge"

                                    value={
                                        operation_charge
                                    }

                                    onChange={
                                        this.handleChange
                                    }

                                />

                            </div>


                            {/* ================================================= */}
                            {/* ROOM CHARGE - IP ONLY */}
                            {/* ================================================= */}

                            {billingType === 'IP' && (

                                <div className="form-group">

                                    <label>

                                        Room / Bed Charge

                                    </label>


                                    <input

                                        type="number"

                                        min="0"

                                        step="0.01"

                                        className="form-control"

                                        name="room_charge"

                                        value={
                                            room_charge
                                        }

                                        onChange={
                                            this.handleChange
                                        }

                                    />

                                </div>

                            )}


                            {/* ================================================= */}
                            {/* MISCELLANEOUS */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    Miscellaneous Charge

                                </label>


                                <input

                                    type="number"

                                    min="0"

                                    step="0.01"

                                    className="form-control"

                                    name="misc_charge"

                                    value={
                                        misc_charge
                                    }

                                    onChange={
                                        this.handleChange
                                    }

                                />

                            </div>


                            {/* ================================================= */}
                            {/* PAYMENT STATUS */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    Payment Status

                                </label>


                                <select

                                    className="form-control"

                                    name="payment_status"

                                    value={
                                        payment_status
                                    }

                                    onChange={
                                        this.handleChange
                                    }

                                >

                                    <option value="Pending">

                                        Pending

                                    </option>


                                    <option value="Paid">

                                        Paid

                                    </option>

                                </select>

                            </div>


                            {/* ================================================= */}
                            {/* PAYMENT METHOD */}
                            {/* ================================================= */}

                            <div className="form-group">

                                <label>

                                    Payment Method

                                </label>


                                <select

                                    className="form-control"

                                    name="payment_method"

                                    value={
                                        payment_method
                                    }

                                    onChange={
                                        this.handleChange
                                    }

                                >

                                    <option value="Cash">

                                        Cash

                                    </option>


                                    <option value="Card">

                                        Card

                                    </option>


                                    <option value="UPI">

                                        UPI

                                    </option>

                                </select>

                            </div>


                            {/* ================================================= */}
                            {/* TOTAL */}
                            {/* ================================================= */}

                            <div className="alert alert-secondary mt-4">

                                <h3 className="text-center">

                                    Total Amount:

                                    {' ₹'}

                                    {
                                        Number(total)
                                            .toFixed(2)
                                    }

                                </h3>

                            </div>


                            {/* ================================================= */}
                            {/* BILLING SUMMARY */}
                            {/* ================================================= */}

                            <div className="card mb-4">

                                <div className="card-body">

                                    <h5 className="card-title">

                                        Billing Summary

                                    </h5>


                                    <p className="mb-1">

                                        <strong>
                                            Billing Type:
                                        </strong>

                                        {' '}

                                        {
                                            billingType === 'OP'
                                                ? 'Outpatient (OP)'
                                                : 'Inpatient (IP)'
                                        }

                                    </p>


                                    <p className="mb-1">

                                        <strong>
                                            Medicine:
                                        </strong>

                                        {' ₹'}

                                        {
                                            Number(
                                                medicine_cost
                                            ).toFixed(2)
                                        }

                                    </p>


                                    <p className="mb-1">

                                        <strong>
                                            Operation:
                                        </strong>

                                        {' ₹'}

                                        {
                                            Number(
                                                operation_charge
                                            ).toFixed(2)
                                        }

                                    </p>


                                    {billingType === 'IP' && (

                                        <p className="mb-1">

                                            <strong>
                                                Room / Bed:
                                            </strong>

                                            {' ₹'}

                                            {
                                                Number(
                                                    room_charge
                                                ).toFixed(2)
                                            }

                                        </p>

                                    )}


                                    <p className="mb-1">

                                        <strong>
                                            Miscellaneous:
                                        </strong>

                                        {' ₹'}

                                        {
                                            Number(
                                                misc_charge
                                            ).toFixed(2)
                                        }

                                    </p>


                                    <hr />


                                    <h5>

                                        <strong>
                                            Total:
                                        </strong>

                                        {' ₹'}

                                        {
                                            Number(total)
                                                .toFixed(2)
                                        }

                                    </h5>

                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* BUTTONS */}
                            {/* ================================================= */}

                            <div className="text-center">


                                <button

                                    type="submit"

                                    className="btn btn-primary mr-2"

                                    disabled={
                                        loading ||
                                        filteredPatients.length === 0
                                    }

                                >

                                    {loading

                                        ? 'Saving...'

                                        : 'Generate / Update Bill'

                                    }

                                </button>


                                <button

                                    type="button"

                                    className="btn btn-secondary"

                                    onClick={
                                        this.resetForm
                                    }

                                >

                                    Reset

                                </button>


                            </div>


                        </form>

                    </div>

                </div>


                <Footer />

            </div>

        );

    }

}


export default Bill;