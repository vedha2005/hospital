import React, { Component } from 'react';
import Navber from '../Navber/Navber';
import axios from 'axios';

class PatientLogin extends Component {

    constructor() {
        super();

        this.state = {
            email: '',
            password: '',
            errors: {}
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    onChange(e) {

        this.setState({
            [e.target.name]: e.target.value
        });

    }


    // ==========================================
    // PATIENT LOGIN
    // ==========================================

    onSubmit(e) {

        e.preventDefault();


        const user = {
            email: this.state.email,
            password: this.state.password
        };


        // Remove old/invalid login data
        sessionStorage.removeItem('usertoken');
        sessionStorage.removeItem('userData');


        axios.post(
            'http://localhost:5000/patient/login',
            {
                email: user.email,
                password: user.password
            }
        )
        .then(response => {

            console.log(
                'Patient login response:',
                response.data
            );


            // ==========================================
            // EMAIL NOT FOUND
            // ==========================================

            if (response.data === 'Email not found') {

                this.setState({
                    errors: {
                        login: 'Email not found'
                    }
                });

                return;
            }


            // ==========================================
            // PASSWORD INCORRECT
            // ==========================================

            if (response.data === 'Password incorrect') {

                this.setState({
                    errors: {
                        login: 'Password incorrect'
                    }
                });

                return;
            }


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            sessionStorage.setItem(
                'usertoken',
                response.data
            );


            sessionStorage.setItem(
                'userData',
                JSON.stringify(user)
            );


            this.props.history.push(
                '/patient/login/patient_home'
            );

        })
        .catch(error => {

            console.log(
                'Patient login error:',
                error
            );


            let errorMessage =
                'Unable to connect to server';


            if (
                error.response &&
                error.response.data
            ) {

                if (
                    typeof error.response.data === 'string'
                ) {

                    errorMessage =
                        error.response.data;

                } else if (
                    error.response.data.error
                ) {

                    errorMessage =
                        error.response.data.error;

                }

            }


            this.setState({
                errors: {
                    login: errorMessage
                }
            });

        });

    }


    // ==========================================
    // UI
    // ==========================================

    render() {

        return (

            <div className="body">

                <Navber />


                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 mt-5 mx-auto">

                            <form
                                noValidate
                                onSubmit={this.onSubmit}
                            >

                                <h1 className="h3 mb-3 mt-5 font-weight-normal btn-rg">
                                    Please sign in as Patient
                                </h1>


                                {/* LOGIN ERROR */}

                                {this.state.errors.login && (

                                    <div className="alert alert-danger">

                                        {this.state.errors.login}

                                    </div>

                                )}


                                {/* EMAIL */}

                                <div className="form-group btn-rg">

                                    <label htmlFor="email">
                                        Email address
                                    </label>


                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        placeholder="Enter email"
                                        value={this.state.email}
                                        onChange={this.onChange}
                                    />

                                </div>


                                {/* PASSWORD */}

                                <div className="form-group btn-rg">

                                    <label htmlFor="password">
                                        Password
                                    </label>


                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        placeholder="Password"
                                        value={this.state.password}
                                        onChange={this.onChange}
                                    />

                                </div>


                                {/* LOGIN BUTTON */}

                                <button
                                    type="submit"
                                    className="btn btn-lg btn-primary btn-block mb-5"
                                >
                                    Sign in
                                </button>


                            </form>

                        </div>

                    </div>


                    {/* REGISTRATION */}

                    <div className="reg ml-5">

                        <h5 className="btn-rg">

                            Don't have any account{' '}

                            <a href="/regPatient">
                                Register Here
                            </a>

                        </h5>

                    </div>

                </div>


                <div className="mb-5 mt-5">
                    v
                </div>

            </div>

        );

    }

}

export default PatientLogin;