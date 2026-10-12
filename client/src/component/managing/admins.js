import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Navber from '../Navber/Navber';
import Footer from '../Footer';

class Admins extends Component {
    render() {
        return (
            <div className="bg-light min-vh-100">

                <Navber />

                <div className="container py-5">

                    {/* ================= HEADER ================= */}

                    <div className="text-center mb-5">

                        <h1 className="font-weight-bold">
                            Administrator Dashboard
                        </h1>

                        <p className="text-muted">
                            Manage hospital operations
                        </p>

                    </div>


                    {/* ================= MANAGEMENT CARDS ================= */}

                    <div className="row">

                        {/* DOCTOR MANAGEMENT */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Doctor Management
                                    </h4>

                                    <p className="text-muted">
                                        Add, view and manage hospital doctors.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/doctors"
                                        className="btn btn-primary"
                                    >
                                        Manage Doctors
                                    </Link>

                                </div>

                            </div>

                        </div>


                        {/* STAFF MANAGEMENT */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Staff Management
                                    </h4>

                                    <p className="text-muted">
                                        Manage hospital staff members.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/staff"
                                        className="btn btn-primary"
                                    >
                                        Manage Staff
                                    </Link>

                                </div>

                            </div>

                        </div>


                        {/* EMPLOYEE MANAGEMENT */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Employee Management
                                    </h4>

                                    <p className="text-muted">
                                        Add and manage hospital employees.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/employee"
                                        className="btn btn-primary"
                                    >
                                        Manage Employees
                                    </Link>

                                </div>

                            </div>

                        </div>


                        {/* BILLING */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Billing Management
                                    </h4>

                                    <p className="text-muted">
                                        Create and manage patient bills.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/billing"
                                        className="btn btn-primary"
                                    >
                                        Manage Billing
                                    </Link>

                                </div>

                            </div>

                        </div>


                        {/* APPOINTMENT MANAGEMENT */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Appointment Management
                                    </h4>

                                    <p className="text-muted">
                                        Schedule and manage patient appointments.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/appointments"
                                        className="btn btn-primary"
                                    >
                                        Manage Appointments
                                    </Link>

                                </div>

                            </div>

                        </div>


                        {/* INPATIENT MANAGEMENT */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Inpatient Management
                                    </h4>

                                    <p className="text-muted">
                                        Manage patient admissions and discharges.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/inpatients"
                                        className="btn btn-primary"
                                    >
                                        Manage Inpatients
                                    </Link>

                                </div>

                            </div>

                        </div>


                        {/* BED MANAGEMENT */}

                        <div className="col-md-4 mb-4">

                            <div className="card shadow h-100">

                                <div className="card-body text-center">

                                    <h4 className="font-weight-bold">
                                        Bed Management
                                    </h4>

                                    <p className="text-muted">
                                        Manage hospital beds and patient assignments.
                                    </p>

                                    <Link
                                        to="/administrator/login/admin_home/beds"
                                        className="btn btn-primary"
                                    >
                                        Manage Beds
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ================= QUICK INFORMATION ================= */}

                    <div className="card shadow mt-4">

                        <div className="card-header">

                            <h4 className="mb-0">
                                Hospital Management Features
                            </h4>

                        </div>

                        <div className="card-body">

                            <div className="row">

                                <div className="col-md-6">

                                    <ul className="list-group">

                                        <li className="list-group-item">
                                            Manage doctors
                                        </li>

                                        <li className="list-group-item">
                                            Manage hospital staff
                                        </li>

                                        <li className="list-group-item">
                                            Manage employees
                                        </li>

                                        <li className="list-group-item">
                                            Assign doctors to patients
                                        </li>

                                    </ul>

                                </div>

                                <div className="col-md-6">

                                    <ul className="list-group">

                                        <li className="list-group-item">
                                            Create patient bills
                                        </li>

                                        <li className="list-group-item">
                                            Manage payment information
                                        </li>

                                        <li className="list-group-item">
                                            Manage appointments
                                        </li>

                                        <li className="list-group-item">
                                            Manage inpatient admissions
                                        </li>

                                        <li className="list-group-item">
                                            Manage hospital beds
                                        </li>

                                    </ul>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <Footer />

            </div>
        );
    }
}

export default Admins;