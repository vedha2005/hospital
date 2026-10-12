import React, { Component } from 'react';
import Navber from '../Navber/Navber';
import Footer from '../Footer';
import axios from 'axios';

class Register extends Component {

    constructor() {
        super();

        this.state = {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            address: '',
            phone_no: '',
            disease: '',
            patient_type: 'Outpatient',
            errors: ''
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    // =====================================================
    // HANDLE INPUT CHANGES
    // =====================================================

    onChange(e) {

        this.setState({
            [e.target.name]: e.target.value
        });

    }


    // =====================================================
    // HANDLE REGISTRATION
    // =====================================================

    onSubmit(e) {

        e.preventDefault();


        const newUser = {

            first_name: this.state.first_name,

            last_name: this.state.last_name,

            email: this.state.email,

            password: this.state.password,

            address: this.state.address,

            phone_no: this.state.phone_no,

            disease: this.state.disease,

            patient_type: this.state.patient_type

        };


        console.log(
            "Sending patient data:",
            newUser
        );


        axios.post(
            'http://localhost:5000/patient/register',

            newUser,

            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        .then(response => {

            console.log(
                "Registration response:",
                response.data
            );


            // User already exists

            if (
                response.data ===
                'user already exist...'
            ) {

                this.setState({
                    errors: 'User already exists'
                });

            }


            // Registration successful

            else {

                this.setState({
                    errors: ''
                });


                alert(
                    'Patient registered successfully!'
                );


                this.props.history.push(
                    '/patient/login'
                );

            }

        })

        .catch(error => {

            console.log(
                "========== REGISTRATION ERROR =========="
            );


            let errorMessage =
                'Registration failed.';


            // =================================================
            // SERVER RESPONDED WITH AN ERROR
            // =================================================

            if (error.response) {

                console.log(
                    "STATUS:",
                    error.response.status
                );


                console.log(
                    "DATA:",
                    error.response.data
                );


                if (
                    typeof error.response.data ===
                    'string'
                ) {

                    errorMessage =
                        error.response.data;

                }


                else if (
                    error.response.data &&
                    error.response.data.error
                ) {

                    errorMessage =
                        error.response.data.error;

                }


                else {

                    errorMessage =
                        'Server error: ' +
                        error.response.status;

                }

            }


            // =================================================
            // REQUEST WAS SENT BUT NO RESPONSE
            // =================================================

            else if (error.request) {

                console.log(
                    "REQUEST ERROR:",
                    error.request
                );


                errorMessage =
                    'Cannot connect to backend. ' +
                    'Make sure the server is running on port 5000.';

            }


            // =================================================
            // OTHER ERROR
            // =================================================

            else {

                console.log(
                    "MESSAGE:",
                    error.message
                );


                errorMessage =
                    error.message;

            }


            console.log(
                "FINAL ERROR:",
                errorMessage
            );


            console.log(
                "========================================"
            );


            this.setState({
                errors: errorMessage
            });

        });

    }


    // =====================================================
    // RENDER
    // =====================================================

    render() {

        return (

            <div className="body">

                {/* Navigation Bar */}

                <Navber />


                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 mt-5 mx-auto">

                            <form
                                noValidate
                                onSubmit={this.onSubmit}
                            >

                                <h1 className="h3 mb-3 font-weight-normal btn-rg">
                                    Register
                                </h1>


                                {/* ================================================= */}
                                {/* FIRST NAME */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        First name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="first_name"
                                        placeholder="Enter your first name"
                                        value={this.state.first_name}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* LAST NAME */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Last name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="last_name"
                                        placeholder="Enter your last name"
                                        value={this.state.last_name}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* EMAIL */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Email address
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        placeholder="Enter email"
                                        value={this.state.email}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* PASSWORD */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        placeholder="Password"
                                        value={this.state.password}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* ADDRESS */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address"
                                        placeholder="Enter your Resident Address"
                                        value={this.state.address}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* PHONE NUMBER */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Phone Number
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone_no"
                                        placeholder="Enter your Phone Number"
                                        value={this.state.phone_no}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* DISEASE */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Disease
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="disease"
                                        placeholder="Enter your Disease"
                                        value={this.state.disease}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* PATIENT TYPE */}
                                {/* ================================================= */}

                                <div className="form-group">

                                    <label>
                                        Patient Type
                                    </label>

                                    <select
                                        className="form-control"
                                        name="patient_type"
                                        value={this.state.patient_type}
                                        onChange={this.onChange}
                                        required
                                    >

                                        <option value="Outpatient">
                                            Outpatient (OP)
                                        </option>

                                        <option value="Inpatient">
                                            Inpatient (IP)
                                        </option>

                                    </select>

                                </div>


                                {/* ================================================= */}
                                {/* ERROR MESSAGE */}
                                {/* ================================================= */}

                                {this.state.errors && (

                                    <div className="alert alert-danger">

                                        {this.state.errors}

                                    </div>

                                )}


                                {/* ================================================= */}
                                {/* REGISTER BUTTON */}
                                {/* ================================================= */}

                                <button
                                    type="submit"
                                    className="btn btn-lg btn-primary btn-block"
                                >
                                    Register!
                                </button>


                            </form>

                        </div>

                    </div>

                </div>


                {/* Footer */}

                <Footer />

            </div>

        );

    }

}

export default Register;