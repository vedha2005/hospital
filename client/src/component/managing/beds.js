import React, { Component } from 'react';
import axios from 'axios';
import AdminNavbar from '../Admin/AdminNavbar';
import Footer from '../Footer';

class Beds extends Component {

    constructor(props) {
        super(props);

        this.state = {

            beds: [],
            inpatients: [],
            assignments: [],

            bed_number: '',
            ward: '',
            bed_type: '',

            selectedBed: '',
            selectedInpatient: '',

            message: '',
            error: '',

            loading: false
        };
    }


    componentDidMount() {

        this.loadBeds();
        this.loadInpatients();
        this.loadAssignments();

    }


    // =====================================================
    // LOAD BEDS
    // =====================================================

    loadBeds = () => {

        axios.get('/admin/beds')

            .then(response => {

                this.setState({
                    beds: response.data
                });

            })

            .catch(error => {

                console.log(error);

                this.setState({
                    error: 'Unable to load beds'
                });

            });

    };


    // =====================================================
    // LOAD ONLY ADMITTED INPATIENTS
    // =====================================================

    loadInpatients = () => {

        axios.get('/admin/inpatients/admitted')

            .then(response => {

                this.setState({
                    inpatients: response.data
                });

            })

            .catch(error => {

                console.log(error);

                this.setState({
                    error:
                        'Unable to load admitted inpatients'
                });

            });

    };


    // =====================================================
    // LOAD BED ASSIGNMENTS
    // =====================================================

    loadAssignments = () => {

        axios.get('/admin/bed-assignments')

            .then(response => {

                this.setState({
                    assignments: response.data
                });

            })

            .catch(error => {

                console.log(error);

                this.setState({
                    error:
                        'Unable to load bed assignments'
                });

            });

    };


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    handleChange = (event) => {

        this.setState({

            [event.target.name]:
                event.target.value

        });

    };


    // =====================================================
    // ADD BED
    // =====================================================

    addBed = (event) => {

        event.preventDefault();


        this.setState({

            message: '',
            error: ''

        });


        if (
            !this.state.bed_number ||
            !this.state.ward ||
            !this.state.bed_type
        ) {

            this.setState({

                error:
                    'Bed number, ward and bed type are required'

            });

            return;
        }


        const data = {

            bed_number:
                this.state.bed_number,

            ward:
                this.state.ward,

            bed_type:
                this.state.bed_type

        };


        axios.post(
            '/admin/beds',
            data
        )

            .then(response => {

                this.setState({

                    message:
                        'Bed added successfully',

                    bed_number: '',
                    ward: '',
                    bed_type: ''

                });

                this.loadBeds();

            })

            .catch(error => {

                console.log(error);

                this.setState({

                    error:
                        error.response &&
                        error.response.data &&
                        error.response.data.error
                            ? error.response.data.error
                            : 'Unable to add bed'

                });

            });

    };


    // =====================================================
    // ASSIGN BED
    // =====================================================

    assignBed = (event) => {

        event.preventDefault();


        this.setState({

            message: '',
            error: ''

        });


        if (
            !this.state.selectedBed ||
            !this.state.selectedInpatient
        ) {

            this.setState({

                error:
                    'Please select an admitted inpatient and an available bed'

            });

            return;
        }


        const data = {

            bed_id:
                Number(this.state.selectedBed),

            inpatient_id:
                Number(this.state.selectedInpatient)

        };


        axios.post(
            '/admin/beds/assign',
            data
        )

            .then(response => {

                this.setState({

                    message:
                        response.data.message ||
                        'Bed assigned successfully',

                    selectedBed: '',
                    selectedInpatient: ''

                });

                this.loadBeds();
                this.loadInpatients();
                this.loadAssignments();

            })

            .catch(error => {

                console.log(error);

                this.setState({

                    error:
                        error.response &&
                        error.response.data &&
                        error.response.data.error
                            ? error.response.data.error
                            : 'Unable to assign bed'

                });

            });

    };


    // =====================================================
    // RELEASE BED
    // =====================================================

    releaseBed = (assignmentId) => {

        if (
            !window.confirm(
                'Are you sure you want to release this bed?'
            )
        ) {

            return;

        }


        this.setState({

            message: '',
            error: ''

        });


        axios.post(
            '/admin/beds/release',
            {
                assignment_id: assignmentId
            }
        )

            .then(response => {

                this.setState({

                    message:
                        response.data.message ||
                        'Bed released successfully'

                });

                this.loadBeds();
                this.loadInpatients();
                this.loadAssignments();

            })

            .catch(error => {

                console.log(error);

                this.setState({

                    error:
                        error.response &&
                        error.response.data &&
                        error.response.data.error
                            ? error.response.data.error
                            : 'Unable to release bed'

                });

            });

    };


    // =====================================================
    // DELETE BED
    // =====================================================

    deleteBed = (bedId) => {

        if (
            !window.confirm(
                'Are you sure you want to delete this bed?'
            )
        ) {

            return;

        }


        this.setState({

            message: '',
            error: ''

        });


        axios.post(
            '/admin/beds/delete',
            {
                bed_id: bedId
            }
        )

            .then(response => {

                this.setState({

                    message:
                        response.data.message ||
                        'Bed deleted successfully'

                });

                this.loadBeds();

            })

            .catch(error => {

                console.log(error);

                this.setState({

                    error:
                        error.response &&
                        error.response.data &&
                        error.response.data.error
                            ? error.response.data.error
                            : 'Unable to delete bed'

                });

            });

    };


    render() {

        const {

            beds,
            inpatients,
            assignments,

            bed_number,
            ward,
            bed_type,

            selectedBed,
            selectedInpatient,

            message,
            error

        } = this.state;


        const availableBeds =
            beds.filter(
                bed =>
                    bed.status === 'Available'
            );


        return (

            <div className="bg-dark min-vh-100">

                <AdminNavbar />

                <div className="container py-5">

                    <div className="jumbotron">

                        <h2 className="text-primary text-center">
                            Bed Management
                        </h2>

                        <hr />


                        {/* ================================================= */}
                        {/* MESSAGE */}
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


                        {/* ================================================= */}
                        {/* ADD BED */}
                        {/* ================================================= */}

                        <h4 className="text-primary">
                            Add New Bed
                        </h4>

                        <form onSubmit={this.addBed}>

                            <div className="form-row">

                                <div className="form-group col-md-4">

                                    <label>
                                        Bed Number
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bed_number"
                                        value={bed_number}
                                        onChange={this.handleChange}
                                        placeholder="Example: B-101"
                                    />

                                </div>


                                <div className="form-group col-md-4">

                                    <label>
                                        Ward
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="ward"
                                        value={ward}
                                        onChange={this.handleChange}
                                        placeholder="Example: General Ward"
                                    />

                                </div>


                                <div className="form-group col-md-4">

                                    <label>
                                        Bed Type
                                    </label>

                                    <select
                                        className="form-control"
                                        name="bed_type"
                                        value={bed_type}
                                        onChange={this.handleChange}
                                    >

                                        <option value="">
                                            Select Type
                                        </option>

                                        <option value="General">
                                            General
                                        </option>

                                        <option value="Semi-Private">
                                            Semi-Private
                                        </option>

                                        <option value="Private">
                                            Private
                                        </option>

                                        <option value="ICU">
                                            ICU
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Add Bed
                            </button>

                        </form>


                        <hr className="my-5" />


                        {/* ================================================= */}
                        {/* ASSIGN BED */}
                        {/* ================================================= */}

                        <h4 className="text-primary">
                            Assign Bed to Inpatient
                        </h4>

                        <div className="alert alert-info">

                            Only patients with an active
                            <strong> Admitted </strong>
                            inpatient record are shown here.

                        </div>


                        <form onSubmit={this.assignBed}>

                            <div className="form-row">

                                <div className="form-group col-md-6">

                                    <label>
                                        Admitted Inpatient
                                    </label>

                                    <select
                                        className="form-control"
                                        name="selectedInpatient"
                                        value={selectedInpatient}
                                        onChange={this.handleChange}
                                    >

                                        <option value="">
                                            Select Inpatient
                                        </option>


                                        {inpatients.map(
                                            inpatient => (

                                                <option
                                                    key={
                                                        inpatient.inpatient_id
                                                    }
                                                    value={
                                                        inpatient.inpatient_id
                                                    }
                                                >

                                                    IP ID:
                                                    {' '}
                                                    {
                                                        inpatient.inpatient_id
                                                    }

                                                    {' - Patient ID: '}

                                                    {
                                                        inpatient.patient_id
                                                    }

                                                    {' - '}

                                                    {
                                                        inpatient.first_name
                                                    }

                                                    {' '}

                                                    {
                                                        inpatient.last_name
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="form-group col-md-6">

                                    <label>
                                        Available Bed
                                    </label>

                                    <select
                                        className="form-control"
                                        name="selectedBed"
                                        value={selectedBed}
                                        onChange={this.handleChange}
                                    >

                                        <option value="">
                                            Select Available Bed
                                        </option>


                                        {availableBeds.map(
                                            bed => (

                                                <option
                                                    key={bed.bed_id}
                                                    value={bed.bed_id}
                                                >

                                                    {bed.bed_number}
                                                    {' - '}
                                                    {bed.ward}
                                                    {' - '}
                                                    {bed.bed_type}

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-success"
                            >

                                Assign Bed

                            </button>

                        </form>


                        <hr className="my-5" />


                        {/* ================================================= */}
                        {/* CURRENT BED ASSIGNMENTS */}
                        {/* ================================================= */}

                        <h4 className="text-primary">
                            Current Bed Assignments
                        </h4>

                        <div className="table-responsive">

                            <table className="table table-bordered table-striped">

                                <thead>

                                    <tr>

                                        <th>
                                            Bed
                                        </th>

                                        <th>
                                            Ward
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Inpatient ID
                                        </th>

                                        <th>
                                            Patient ID
                                        </th>

                                        <th>
                                            Patient Name
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {beds
                                        .filter(
                                            bed =>
                                                bed.status ===
                                                'Occupied'
                                        )
                                        .map(bed => (

                                            <tr
                                                key={
                                                    bed.bed_id
                                                }
                                            >

                                                <td>
                                                    {
                                                        bed.bed_number
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        bed.ward
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        bed.bed_type
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        bed.inpatient_id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        bed.patient_id
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        bed.first_name
                                                    }

                                                    {' '}

                                                    {
                                                        bed.last_name
                                                    }

                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() =>
                                                            this.releaseBed(
                                                                bed.assignment_id
                                                            )
                                                        }
                                                    >

                                                        Release

                                                    </button>

                                                </td>

                                            </tr>

                                        ))}


                                    {beds.filter(
                                        bed =>
                                            bed.status ===
                                            'Occupied'
                                    ).length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center"
                                            >

                                                No occupied beds

                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>


                        <hr className="my-5" />


                        {/* ================================================= */}
                        {/* ALL BEDS */}
                        {/* ================================================= */}

                        <h4 className="text-primary">
                            All Beds
                        </h4>

                        <div className="table-responsive">

                            <table className="table table-bordered">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Bed Number
                                        </th>

                                        <th>
                                            Ward
                                        </th>

                                        <th>
                                            Type
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

                                    {beds.map(bed => (

                                        <tr
                                            key={
                                                bed.bed_id
                                            }
                                        >

                                            <td>
                                                {
                                                    bed.bed_id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    bed.bed_number
                                                }
                                            </td>

                                            <td>
                                                {
                                                    bed.ward
                                                }
                                            </td>

                                            <td>
                                                {
                                                    bed.bed_type
                                                }
                                            </td>

                                            <td>

                                                {bed.status ===
                                                'Occupied'
                                                    ? 'Occupied'
                                                    : 'Available'
                                                }

                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        this.deleteBed(
                                                            bed.bed_id
                                                        )
                                                    }
                                                    disabled={
                                                        bed.status ===
                                                        'Occupied'
                                                    }
                                                >

                                                    Delete

                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                    </div>

                </div>

                <Footer />

            </div>

        );

    }

}

export default Beds;