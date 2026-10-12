import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navber from '../Navber/Navber';
import Footer from '../Footer';

class Employee extends Component {

    constructor() {
        super();

        this.state = {
            employees: [],

            first_name: '',
            last_name: '',
            email: '',
            address: '',
            phone_no: '',
            designation: '',
            salary: '',
            password: '',

            delete_emp_id: '',
            message: '',
            error: ''
        };

        this.onChange = this.onChange.bind(this);
        this.addEmployee = this.addEmployee.bind(this);
        this.deleteEmployee = this.deleteEmployee.bind(this);
        this.loadEmployees = this.loadEmployees.bind(this);
    }


    componentDidMount() {
        this.loadEmployees();
    }


    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }


    // ================= LOAD EMPLOYEES =================

    loadEmployees() {

        axios.get('/admin/employees')

            .then(response => {

                this.setState({
                    employees: response.data,
                    error: ''
                });

            })

            .catch(error => {

                console.log('Employee loading error:', error);

                this.setState({
                    error: 'Unable to load employees.'
                });

            });

    }


    // ================= ADD EMPLOYEE =================

    addEmployee(e) {

        e.preventDefault();

        this.setState({
            message: '',
            error: ''
        });


        const employee = {

            first_name: this.state.first_name,
            last_name: this.state.last_name,
            email: this.state.email,
            address: this.state.address,
            phone_no: this.state.phone_no,
            designation: this.state.designation,
            salary: this.state.salary,
            password: this.state.password

        };


        axios.post(
            '/admin/register',
            employee
        )

            .then(response => {

                alert('Employee added successfully!');

                this.setState({

                    first_name: '',
                    last_name: '',
                    email: '',
                    address: '',
                    phone_no: '',
                    designation: '',
                    salary: '',
                    password: '',

                    message: 'Employee added successfully!'

                });

                this.loadEmployees();

            })

            .catch(error => {

                console.log('Employee registration error:', error);

                let errorMessage = 'Unable to add employee.';

                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {

                    errorMessage = error.response.data.error;

                }

                this.setState({
                    error: errorMessage
                });

            });

    }


    // ================= DELETE EMPLOYEE =================

    deleteEmployee(e) {

        e.preventDefault();


        if (this.state.delete_emp_id === '') {

            alert('Please enter Employee ID.');

            return;

        }


        axios.post(
            '/admin/delete',
            {
                admin_id: this.state.delete_emp_id
            }
        )

            .then(response => {

                alert('Employee deleted successfully!');

                this.setState({

                    delete_emp_id: '',
                    message: 'Employee deleted successfully!'

                });

                this.loadEmployees();

            })

            .catch(error => {

                console.log('Employee delete error:', error);

                let errorMessage = 'Unable to delete employee.';

                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {

                    errorMessage = error.response.data.error;

                }

                this.setState({
                    error: errorMessage
                });

            });

    }


    render() {

        return (

            <div className="bg-dark min-vh-100">

                <Navber />


                <div className="container py-5">


                    {/* ================= HEADER ================= */}

                    <h1 className="text-white text-center mb-4">
                        Employee Management
                    </h1>


                    {/* ================= ADMIN TABS ================= */}

                    <div className="card mb-4">

                        <div className="card-body">

                            <ul className="nav nav-tabs">


                                <li className="nav-item">

                                    <Link
                                        className="nav-link"
                                        to="/administrator/login/admin_home"
                                    >
                                        Dashboard
                                    </Link>

                                </li>


                                <li className="nav-item">

                                    <Link
                                        className="nav-link"
                                        to="/administrator/login/admin_home/doctors"
                                    >
                                        Doctors
                                    </Link>

                                </li>


                                <li className="nav-item">

                                    <Link
                                        className="nav-link"
                                        to="/administrator/login/admin_home/staff"
                                    >
                                        Staff
                                    </Link>

                                </li>


                                <li className="nav-item">

                                    <Link
                                        className="nav-link active"
                                        to="/administrator/login/admin_home/employee"
                                    >
                                        Employees
                                    </Link>

                                </li>


                                <li className="nav-item">

                                    <Link
                                        className="nav-link"
                                        to="/administrator/login/admin_home/billing"
                                    >
                                        Billing
                                    </Link>

                                </li>

                            </ul>

                        </div>

                    </div>


                    {/* ================= MESSAGES ================= */}

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


                    {/* ================= ADD EMPLOYEE ================= */}

                    <div className="card mb-5">

                        <div className="card-header bg-primary text-white">

                            <h3 className="mb-0">
                                Add New Employee
                            </h3>

                        </div>


                        <div className="card-body">

                            <form onSubmit={this.addEmployee}>

                                <div className="row">


                                    {/* FIRST NAME */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="first_name"
                                            value={this.state.first_name}
                                            onChange={this.onChange}
                                            placeholder="Enter first name"
                                            required
                                        />

                                    </div>


                                    {/* LAST NAME */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="last_name"
                                            value={this.state.last_name}
                                            onChange={this.onChange}
                                            placeholder="Enter last name"
                                            required
                                        />

                                    </div>


                                    {/* EMAIL */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={this.state.email}
                                            onChange={this.onChange}
                                            placeholder="Enter email"
                                            required
                                        />

                                    </div>


                                    {/* PHONE */}

                                    <div className="col-md-6 mb-3">

                                        <label>
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone_no"
                                            value={this.state.phone_no}
                                            onChange={this.onChange}
                                            placeholder="Enter phone number"
                                            required
                                        />

                                    </div>


                                    {/* ADDRESS */}

                                    <div className="col-md-12 mb-3">

                                        <label>
                                            Address
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={this.state.address}
                                            onChange={this.onChange}
                                            placeholder="Enter address"
                                            required
                                        />

                                    </div>


                                    {/* DESIGNATION */}

                                    <div className="col-md-4 mb-3">

                                        <label>
                                            Designation
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="designation"
                                            value={this.state.designation}
                                            onChange={this.onChange}
                                            placeholder="Example: Receptionist"
                                            required
                                        />

                                    </div>


                                    {/* SALARY */}

                                    <div className="col-md-4 mb-3">

                                        <label>
                                            Salary
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="salary"
                                            value={this.state.salary}
                                            onChange={this.onChange}
                                            placeholder="Enter salary"
                                            required
                                        />

                                    </div>


                                    {/* PASSWORD */}

                                    <div className="col-md-4 mb-3">

                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={this.state.password}
                                            onChange={this.onChange}
                                            placeholder="Enter password"
                                            required
                                        />

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Add Employee
                                </button>

                            </form>

                        </div>

                    </div>


                    {/* ================= EMPLOYEE LIST ================= */}

                    <div className="card mb-5">

                        <div className="card-header bg-secondary text-white">

                            <h3 className="mb-0">
                                Registered Employees
                            </h3>

                        </div>


                        <div className="card-body">

                            <div className="table-responsive">

                                <table className="table table-bordered table-striped">

                                    <thead>

                                        <tr>

                                            <th>ID</th>

                                            <th>Name</th>

                                            <th>Email</th>

                                            <th>Phone</th>

                                            <th>Designation</th>

                                            <th>Salary</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {this.state.employees.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="6"
                                                    className="text-center"
                                                >
                                                    No employees found
                                                </td>

                                            </tr>

                                        ) : (

                                            this.state.employees.map(
                                                employee => (

                                                    <tr
                                                        key={employee.admin_id}
                                                    >

                                                        <td>
                                                            {employee.admin_id}
                                                        </td>

                                                        <td>
                                                            {employee.first_name}{' '}
                                                            {employee.last_name}
                                                        </td>

                                                        <td>
                                                            {employee.email}
                                                        </td>

                                                        <td>
                                                            {employee.phone_no}
                                                        </td>

                                                        <td>
                                                            {employee.designation}
                                                        </td>

                                                        <td>
                                                            {employee.salary}
                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>


                    {/* ================= DELETE EMPLOYEE ================= */}

                    <div className="card mb-5">

                        <div className="card-header bg-danger text-white">

                            <h3 className="mb-0">
                                Delete Employee
                            </h3>

                        </div>


                        <div className="card-body">

                            <form onSubmit={this.deleteEmployee}>

                                <div className="row align-items-end">


                                    <div className="col-md-6">

                                        <label>
                                            Employee ID
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="delete_emp_id"
                                            value={this.state.delete_emp_id}
                                            onChange={this.onChange}
                                            placeholder="Enter Employee ID"
                                            required
                                        />

                                    </div>


                                    <div className="col-md-3">

                                        <button
                                            type="submit"
                                            className="btn btn-danger mt-3"
                                        >
                                            Delete Employee
                                        </button>

                                    </div>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>


                <Footer />

            </div>

        );

    }

}

export default Employee;