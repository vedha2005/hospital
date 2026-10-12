import React, { Component } from 'react';
import Navber from '../Navber/Navber';
import axios from 'axios';

class DoctorLogin extends Component {

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
    // DOCTOR LOGIN
    // ==========================================

    onSubmit(e) {

        e.preventDefault();


        const email = this.state.email.trim();
        const password = this.state.password;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (email === '' || password === '') {

            this.setState({
                errors: {
                    login: 'Please enter email and password'
                }
            });

            return;
        }


        // ==========================================
        // CLEAR OLD LOGIN DATA
        // ==========================================

        sessionStorage.removeItem('usertoken');
        sessionStorage.removeItem('userData');


        // ==========================================
        // LOGIN REQUEST
        // ==========================================

        axios.post(
            'http://localhost:5000/doctor/login',
            {
                email: email,
                password: password
            }
        )
        .then(response => {

            console.log(
                'Doctor login response:',
                response.data
            );


            const result = response.data;


            // ==========================================
            // EMAIL NOT FOUND
            // ==========================================

            if (result === 'Email not found') {

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

            if (result === 'Password incorrect') {

                this.setState({
                    errors: {
                        login: 'Password incorrect'
                    }
                });

                return;
            }


            // ==========================================
            // EMPTY RESPONSE
            // ==========================================

            if (
                result === null ||
                result === undefined ||
                result === ''
            ) {

                this.setState({
                    errors: {
                        login: 'Login failed. Server returned an empty response.'
                    }
                });

                return;
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            sessionStorage.setItem(
                'usertoken',
                result
            );


            sessionStorage.setItem(
                'userData',
                JSON.stringify({
                    email: email
                })
            );


            console.log(
                'Doctor token stored successfully'
            );


            // ==========================================
            // REDIRECT
            // ==========================================

            this.props.history.push(
                '/doctors/login/doctor_home'
            );

        })
        .catch(error => {

            console.log(
                'Doctor login error:',
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
    // RENDER
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
                                    Please sign in as Doctor
                                </h1>


                                {/* ERROR MESSAGE */}

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

                </div>


                <div className="mb-5 mt-5">
                    v
                </div>

            </div>

        );

    }

}

export default DoctorLogin;