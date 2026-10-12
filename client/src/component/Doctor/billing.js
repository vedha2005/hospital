import React, { Component } from 'react';
import axios from 'axios';
import DocNavbar from './DocNavbar';
import Footer from '../Footer';

class Billing extends Component {

    constructor(props) {
        super(props);

        this.state = {
            patient_id: '',
            patient_name: '',
            patient_email: '',
            patient_phone: '',
            patient_disease: '',

            medicine_cost: '',
            operation_charge: '',
            room_charge: '',
            misc_charge: '',

            total: 0,

            message: '',
            error: '',
            loading: true
        };
    }

    componentDidMount() {

        const patientId = this.props.match.params.patient_id;

        this.setState({
            patient_id: patientId
        });

        axios.get(
            `http://localhost:5000/doctor/patient/${patientId}`,
            {
                headers: {
                    authorization: sessionStorage.getItem('usertoken')
                }
            }
        )
        .then(response => {

            console.log("Patient details:", response.data);

            if (response.data.length > 0) {

                const patient = response.data[0];

                this.setState({
                    patient_name:
                        patient.first_name + ' ' + patient.last_name,

                    patient_email: patient.email,
                    patient_phone: patient.phone_no,
                    patient_disease: patient.disease,

                    loading: false
                });

            } else {

                this.setState({
                    error: 'Patient not found.',
                    loading: false
                });
            }
        })
        .catch(error => {

            console.log("Patient loading error:", error);

            this.setState({
                error:
                    (error.response &&
                     error.response.data &&
                     error.response.data.error) ||
                    'Unable to load patient details.',

                loading: false
            });
        });
    }

    handleChange = (event) => {

        const { name, value } = event.target;

        this.setState(
            {
                [name]: value
            },
            this.calculateTotal
        );
    };

    calculateTotal = () => {

        const medicine =
            Number(this.state.medicine_cost) || 0;

        const operation =
            Number(this.state.operation_charge) || 0;

        const room =
            Number(this.state.room_charge) || 0;

        const misc =
            Number(this.state.misc_charge) || 0;

        const total =
            medicine +
            operation +
            room +
            misc;

        this.setState({
            total: total
        });
    };

    saveBill = () => {

        const billData = {

            patient_id: this.state.patient_id,

            medicine_cost:
                Number(this.state.medicine_cost) || 0,

            operation_charge:
                Number(this.state.operation_charge) || 0,

            room_charge:
                Number(this.state.room_charge) || 0,

            misc_charge:
                Number(this.state.misc_charge) || 0
        };

        console.log("Bill data:", billData);

        axios.post(
            'http://localhost:5000/doctor/bill',
            billData,
            {
                headers: {
                    authorization:
                        sessionStorage.getItem('usertoken'),

                    'Content-Type':
                        'application/json'
                }
            }
        )
        .then(response => {

            console.log("Bill response:", response.data);

            this.setState({
                message: 'Bill saved successfully!',
                error: ''
            });
        })
        .catch(error => {

            console.log("Billing error:", error);

            this.setState({
                error:
                    (error.response &&
                     error.response.data &&
                     error.response.data.error) ||
                    'Failed to save bill.',

                message: ''
            });
        });
    };

    render() {

        return (
            <div>

                <DocNavbar />

                <div className="container mt-5 mb-5">

                    <div className="jumbotron">

                        <h1 className="text-center">
                            Patient Billing
                        </h1>

                        <hr />

                        {this.state.loading ? (

                            <h4 className="text-center">
                                Loading patient details...
                            </h4>

                        ) : (

                            <div>

                                {this.state.error && (
                                    <div className="alert alert-danger">
                                        {this.state.error}
                                    </div>
                                )}

                                {this.state.message && (
                                    <div className="alert alert-success">
                                        {this.state.message}
                                    </div>
                                )}

                                <h3>
                                    Patient Details
                                </h3>

                                <div className="row">

                                    <div className="col-md-6">

                                        <p>
                                            <strong>Name:</strong>{' '}
                                            {this.state.patient_name}
                                        </p>

                                        <p>
                                            <strong>Email:</strong>{' '}
                                            {this.state.patient_email}
                                        </p>

                                    </div>

                                    <div className="col-md-6">

                                        <p>
                                            <strong>Phone:</strong>{' '}
                                            {this.state.patient_phone}
                                        </p>

                                        <p>
                                            <strong>Disease:</strong>{' '}
                                            {this.state.patient_disease}
                                        </p>

                                    </div>

                                </div>

                                <hr />

                                <h3>
                                    Billing Details
                                </h3>

                                <div className="form-group">

                                    <label>
                                        Medicine Cost
                                    </label>

                                    <input
                                        type="number"
                                        name="medicine_cost"
                                        className="form-control"
                                        value={this.state.medicine_cost}
                                        onChange={this.handleChange}
                                        placeholder="Enter medicine cost"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Operation Charge
                                    </label>

                                    <input
                                        type="number"
                                        name="operation_charge"
                                        className="form-control"
                                        value={this.state.operation_charge}
                                        onChange={this.handleChange}
                                        placeholder="Enter operation charge"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Room Charge
                                    </label>

                                    <input
                                        type="number"
                                        name="room_charge"
                                        className="form-control"
                                        value={this.state.room_charge}
                                        onChange={this.handleChange}
                                        placeholder="Enter room charge"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Miscellaneous Charge
                                    </label>

                                    <input
                                        type="number"
                                        name="misc_charge"
                                        className="form-control"
                                        value={this.state.misc_charge}
                                        onChange={this.handleChange}
                                        placeholder="Enter miscellaneous charge"
                                    />

                                </div>

                                <hr />

                                <div className="text-center">

                                    <h2>
                                        Total: ₹{this.state.total}
                                    </h2>

                                </div>

                                <br />

                                <div className="text-center">

                                    <button
                                        className="btn btn-success"
                                        onClick={this.saveBill}
                                    >
                                        Save Bill
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

                <Footer />

            </div>
        );
    }
}

export default Billing;