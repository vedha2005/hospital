import React, { Component } from 'react';
import Navber from '../Navber/Navber';
import axios from 'axios';

class AdministratorLogin extends Component {

    constructor() {
        super();

        this.state = {
            email: '',
            password: '',
            errors: ''
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        this.setState({
            errors: ''
        });

        const user = {
            email: this.state.email,
            password: this.state.password
        };

        axios.post('/admin/login', user)
            .then(response => {

                console.log('Admin login response:', response.data);

                if (response.data === 'Email not found') {

                    this.setState({
                        errors: 'Email not found'
                    });

                    return;
                }

                // Save admin token
                sessionStorage.setItem(
                    'usertoken',
                    response.data
                );

                // Save admin information
                sessionStorage.setItem(
                    'userData',
                    JSON.stringify({
                        email: this.state.email
                    })
                );

                // Go to Admin Dashboard
                this.props.history.push(
                    '/administrator/login/admin_home'
                );
            })
            .catch(error => {

                console.log('Admin login error:', error);

                let errorMessage = 'Login failed.';

                if (error.response) {

                    if (
                        error.response.data &&
                        error.response.data.error
                    ) {
                        errorMessage =
                            error.response.data.error;
                    }
                    else if (
                        typeof error.response.data === 'string'
                    ) {
                        errorMessage =
                            error.response.data;
                    }
                }
                else if (error.request) {

                    errorMessage =
                        'Cannot connect to backend. Make sure the server is running on port 5000.';
                }

                this.setState({
                    errors: errorMessage
                });
            });
    }

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

                                {/* =========================
                                    ADMIN LOGIN TITLE
                                ========================== */}

                                <h1 className="h3 mb-3 font-weight-normal btn-rg">
                                    Please Sign In as Administrator
                                </h1>


                                {/* =========================
                                    EMAIL
                                ========================== */}

                                <div className="form-group">

                                    <label>
                                        Email address
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        placeholder="Enter admin email"
                                        value={this.state.email}
                                        onChange={this.onChange}
                                        required
                                    />

                                </div>


                                {/* =========================
                                    PASSWORD
                                ========================== */}

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


                                {/* =========================
                                    ERROR MESSAGE
                                ========================== */}

                                {this.state.errors && (

                                    <div className="alert alert-danger">

                                        {this.state.errors}

                                    </div>

                                )}


                                {/* =========================
                                    LOGIN BUTTON
                                ========================== */}

                                <button
                                    type="submit"
                                    className="btn btn-lg btn-primary btn-block"
                                >
                                    Sign in
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>
        );
    }
}

export default AdministratorLogin;