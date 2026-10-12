const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const doctor = express.Router();

const db = require('../../../utils/db');


// =====================================================
// JWT SECRET
// =====================================================

const SECRET_KEY = 'Arijit';


// =====================================================
// DOCTOR REGISTER
// =====================================================

doctor.post('/register', (req, res) => {

    const doctorData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        email: req.body.email,
        salary: req.body.salary,
        specialisation: req.body.specialisation,
        shift_time: req.body.shift_time,
        password: req.body.password
    };


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !doctorData.first_name ||
        !doctorData.last_name ||
        !doctorData.email ||
        !doctorData.password
    ) {

        return res.status(400).json({
            error:
                'First name, last name, email and password are required'
        });

    }


    // =================================================
    // CHECK EXISTING DOCTOR
    // =================================================

    const findDoctor = `
        SELECT doctor_id
        FROM doctors
        WHERE email = ?
    `;


    db.query(
        findDoctor,
        [doctorData.email],
        (err1, result1) => {

            if (err1) {

                console.log(
                    'Doctor search error:',
                    err1
                );

                return res.status(500).json({
                    error: 'Database error'
                });

            }


            if (result1.length > 0) {

                return res.status(409).send(
                    'doctor already exist...'
                );

            }


            // =================================================
            // HASH PASSWORD
            // =================================================

            bcrypt.hash(
                doctorData.password,
                10,
                (hashError, hash) => {

                    if (hashError) {

                        console.log(
                            'Password encryption error:',
                            hashError
                        );

                        return res.status(500).json({
                            error:
                                'Password encryption error'
                        });

                    }


                    // =================================================
                    // INSERT DOCTOR
                    // =================================================

                    const createDoctor = `
                        INSERT INTO doctors
                        (
                            first_name,
                            last_name,
                            address,
                            email,
                            salary,
                            specialisation,
                            shift_time,
                            password
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;


                    db.query(
                        createDoctor,
                        [
                            doctorData.first_name,
                            doctorData.last_name,
                            doctorData.address || null,
                            doctorData.email,
                            doctorData.salary || 0,
                            doctorData.specialisation || null,
                            doctorData.shift_time || null,
                            hash
                        ],
                        (err2, result2) => {

                            if (err2) {

                                console.log(
                                    'Doctor registration error:',
                                    err2
                                );

                                return res.status(500).json({
                                    error:
                                        'Doctor registration failed'
                                });

                            }


                            console.log(
                                'Doctor registered successfully. Doctor ID:',
                                result2.insertId
                            );


                            return res.send(
                                'Created Database ooooooooooooohhhhhh'
                            );

                        }
                    );

                }
            );

        }
    );

});


// =====================================================
// DOCTOR LOGIN
// =====================================================

doctor.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;


    if (!email || !password) {

        return res.status(400).json({
            error: 'Email and password are required'
        });

    }


    const findDoctor = `
        SELECT
            doctor_id,
            password
        FROM doctors
        WHERE email = ?
    `;


    db.query(
        findDoctor,
        [email],
        (err, result) => {

            if (err) {

                console.log(
                    'Doctor login database error:',
                    err
                );

                return res.status(500).json({
                    error: 'Database error'
                });

            }


            // =================================================
            // EMAIL NOT FOUND
            // =================================================

            if (result.length === 0) {

                return res.status(404).send(
                    'Email not found'
                );

            }


            const doctorId = result[0].doctor_id;
            const storedPassword = result[0].password;

            let passwordMatched = false;


            // =================================================
            // BCRYPT PASSWORD
            // =================================================

            try {

                passwordMatched = bcrypt.compareSync(
                    password,
                    storedPassword
                );

            } catch (error) {

                passwordMatched = false;

            }


            // =================================================
            // PLAIN TEXT PASSWORD
            // FOR OLD/MANUAL SQL DATA
            // =================================================

            if (
                !passwordMatched &&
                password === storedPassword
            ) {

                passwordMatched = true;

            }


            // =================================================
            // PASSWORD INCORRECT
            // =================================================

            if (!passwordMatched) {

                return res.status(401).send(
                    'Password incorrect'
                );

            }


            // =================================================
            // CREATE JWT
            // =================================================

            const token = jwt.sign(
                String(doctorId),
                SECRET_KEY
            );


            console.log(
                'Doctor login successful. Doctor ID:',
                doctorId
            );


            return res.send(token);

        }
    );

});


// =====================================================
// DOCTOR PROFILE
// =====================================================

doctor.get('/profile', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const doctor_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                doctor_id,
                first_name,
                last_name,
                address,
                email,
                salary,
                specialisation,
                shift_time
            FROM doctors
            WHERE doctor_id = ?
        `;


        db.query(
            sql,
            [doctor_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Doctor profile error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                if (result.length === 0) {

                    return res.status(404).json({
                        error: 'Doctor not found'
                    });

                }


                return res.json(result);

            }
        );

    } catch (error) {

        console.log(
            'Doctor profile token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// GET ASSIGNED PATIENTS
// =====================================================

doctor.get('/patient', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const doctor_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.email,
                p.phone_no,
                p.address,
                p.disease
            FROM patient p
            INNER JOIN assign_doctor ad
                ON p.patient_id = ad.patient_id
            WHERE ad.doctor_id = ?
        `;


        db.query(
            sql,
            [doctor_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Assigned patients error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                console.log(
                    'Patients assigned to doctor:',
                    doctor_id,
                    result.length
                );


                return res.json(result);

            }
        );

    } catch (error) {

        console.log(
            'Assigned patients token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// GET ONE ASSIGNED PATIENT
// =====================================================

doctor.get('/patient/:patient_id', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const doctor_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const patient_id = req.params.patient_id;


        const sql = `
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.email,
                p.phone_no,
                p.address,
                p.disease
            FROM patient p
            INNER JOIN assign_doctor ad
                ON p.patient_id = ad.patient_id
            WHERE p.patient_id = ?
            AND ad.doctor_id = ?
        `;


        db.query(
            sql,
            [patient_id, doctor_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Patient details error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                if (result.length === 0) {

                    return res.status(404).json({
                        error:
                            'Patient not assigned to this doctor'
                    });

                }


                return res.json(result);

            }
        );

    } catch (error) {

        console.log(
            'Patient token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// GET DOCTOR APPOINTMENTS
// =====================================================

doctor.get('/appointments', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const doctor_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                a.appointment_id,
                a.patient_id,
                a.doctor_id,
                a.appointment_date,
                a.appointment_time,
                a.reason,
                a.status,

                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name,
                p.email AS patient_email,
                p.phone_no AS patient_phone,
                p.disease AS patient_disease

            FROM appointments a

            INNER JOIN patient p
                ON a.patient_id = p.patient_id

            WHERE a.doctor_id = ?

            ORDER BY
                a.appointment_date ASC,
                a.appointment_time ASC
        `;


        db.query(
            sql,
            [doctor_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Doctor appointments error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                console.log(
                    'Appointments for doctor:',
                    doctor_id,
                    result.length
                );


                return res.json(result);

            }
        );

    } catch (error) {

        console.log(
            'Doctor appointments token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// DOCTOR BILLING
// =====================================================

doctor.post('/bill', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const doctor_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const patient_id = req.body.patient_id;


        const medicine_cost =
            Number(req.body.medicine_cost) || 0;

        const operation_charge =
            Number(req.body.operation_charge) || 0;

        const room_charge =
            Number(req.body.room_charge) || 0;

        const misc_charge =
            Number(req.body.misc_charge) || 0;


        const payment_status =
            req.body.payment_status || 'Pending';

        const payment_method =
            req.body.payment_method || 'Cash';


        // =================================================
        // VALIDATE PATIENT ID
        // =================================================

        if (!patient_id) {

            return res.status(400).json({
                error: 'Patient ID is required'
            });

        }


        // =================================================
        // CHECK PATIENT ASSIGNMENT
        // =================================================

        const checkPatient = `
            SELECT patient_id
            FROM assign_doctor
            WHERE patient_id = ?
            AND doctor_id = ?
        `;


        db.query(
            checkPatient,
            [patient_id, doctor_id],
            (err1, patientResult) => {

                if (err1) {

                    console.log(
                        'Patient assignment error:',
                        err1
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                if (patientResult.length === 0) {

                    return res.status(403).json({
                        error:
                            'This patient is not assigned to this doctor'
                    });

                }


                // =================================================
                // CHECK EXISTING BILL
                // =================================================

                const checkBill = `
                    SELECT bill_id
                    FROM bill
                    WHERE patient_id = ?
                    ORDER BY bill_id DESC
                    LIMIT 1
                `;


                db.query(
                    checkBill,
                    [patient_id],
                    (err2, billResult) => {

                        if (err2) {

                            console.log(
                                'Bill check error:',
                                err2
                            );

                            return res.status(500).json({
                                error: 'Database error'
                            });

                        }


                        // =================================================
                        // TOTAL
                        // =================================================

                        const total =
                            medicine_cost +
                            operation_charge +
                            room_charge +
                            misc_charge;


                        // =================================================
                        // UPDATE EXISTING BILL
                        // =================================================

                        if (billResult.length > 0) {

                            const updateBill = `
                                UPDATE bill
                                SET
                                    medicine_cost = ?,
                                    operation_charge = ?,
                                    room_charge = ?,
                                    misc_charge = ?,
                                    payment_status = ?,
                                    payment_method = ?
                                WHERE bill_id = ?
                            `;


                            db.query(
                                updateBill,
                                [
                                    medicine_cost,
                                    operation_charge,
                                    room_charge,
                                    misc_charge,
                                    payment_status,
                                    payment_method,
                                    billResult[0].bill_id
                                ],
                                (err3) => {

                                    if (err3) {

                                        console.log(
                                            'Bill update error:',
                                            err3
                                        );

                                        return res.status(500).json({
                                            error:
                                                'Bill update failed'
                                        });

                                    }


                                    console.log(
                                        'Bill updated. Patient:',
                                        patient_id,
                                        'Total:',
                                        total
                                    );


                                    return res.json({
                                        message:
                                            'Bill updated successfully',

                                        bill_id:
                                            billResult[0].bill_id,

                                        patient_id:
                                            patient_id,

                                        medicine_cost:
                                            medicine_cost,

                                        operation_charge:
                                            operation_charge,

                                        room_charge:
                                            room_charge,

                                        misc_charge:
                                            misc_charge,

                                        payment_status:
                                            payment_status,

                                        payment_method:
                                            payment_method,

                                        total:
                                            total
                                    });

                                }
                            );

                        }


                        // =================================================
                        // CREATE NEW BILL
                        // =================================================

                        else {

                            const createBill = `
                                INSERT INTO bill
                                (
                                    patient_id,
                                    medicine_cost,
                                    operation_charge,
                                    room_charge,
                                    misc_charge,
                                    payment_status,
                                    payment_method
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `;


                            db.query(
                                createBill,
                                [
                                    patient_id,
                                    medicine_cost,
                                    operation_charge,
                                    room_charge,
                                    misc_charge,
                                    payment_status,
                                    payment_method
                                ],
                                (err4, result4) => {

                                    if (err4) {

                                        console.log(
                                            'Bill creation error:',
                                            err4
                                        );

                                        return res.status(500).json({
                                            error:
                                                'Bill creation failed'
                                        });

                                    }


                                    console.log(
                                        'Bill created. Patient:',
                                        patient_id,
                                        'Total:',
                                        total
                                    );


                                    return res.json({
                                        message:
                                            'Bill saved successfully',

                                        bill_id:
                                            result4.insertId,

                                        patient_id:
                                            patient_id,

                                        medicine_cost:
                                            medicine_cost,

                                        operation_charge:
                                            operation_charge,

                                        room_charge:
                                            room_charge,

                                        misc_charge:
                                            misc_charge,

                                        payment_status:
                                            payment_status,

                                        payment_method:
                                            payment_method,

                                        total:
                                            total
                                    });

                                }
                            );

                        }

                    }
                );

            }
        );

    } catch (error) {

        console.log(
            'Billing token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// DELETE DOCTOR
// =====================================================

doctor.post('/delete', (req, res) => {

    const doctor_id = req.body.doctor_id;


    if (!doctor_id) {

        return res.status(400).json({
            error: 'Doctor ID is required'
        });

    }


    const findDoctor = `
        SELECT doctor_id
        FROM doctors
        WHERE doctor_id = ?
    `;


    db.query(
        findDoctor,
        [doctor_id],
        (err1, result1) => {

            if (err1) {

                console.log(
                    'Doctor search error:',
                    err1
                );

                return res.status(500).json({
                    error: 'Database error'
                });

            }


            if (result1.length === 0) {

                return res.status(404).send(
                    'Doctor not found'
                );

            }


            const deleteDoctor = `
                DELETE FROM doctors
                WHERE doctor_id = ?
            `;


            db.query(
                deleteDoctor,
                [doctor_id],
                (err2) => {

                    if (err2) {

                        console.log(
                            'Doctor delete error:',
                            err2
                        );

                        return res.status(500).json({
                            error:
                                'Delete failed. Doctor may have related records.'
                        });

                    }


                    return res.send('DELETED');

                }
            );

        }
    );

});


// =====================================================
// UPDATE DOCTOR SALARY
// =====================================================

doctor.post('/update_sal', (req, res) => {

    const doctor_id = req.body.doctor_id;
    const salary = req.body.salary;


    if (!doctor_id || salary === undefined) {

        return res.status(400).json({
            error: 'Doctor ID and salary are required'
        });

    }


    const findDoctor = `
        SELECT doctor_id
        FROM doctors
        WHERE doctor_id = ?
    `;


    db.query(
        findDoctor,
        [doctor_id],
        (err1, result1) => {

            if (err1) {

                console.log(
                    'Doctor search error:',
                    err1
                );

                return res.status(500).json({
                    error: 'Database error'
                });

            }


            if (result1.length === 0) {

                return res.status(404).send(
                    'Doctor not found'
                );

            }


            const updateDoctor = `
                UPDATE doctors
                SET salary = ?
                WHERE doctor_id = ?
            `;


            db.query(
                updateDoctor,
                [salary, doctor_id],
                (err2) => {

                    if (err2) {

                        console.log(
                            'Doctor salary update error:',
                            err2
                        );

                        return res.status(500).json({
                            error:
                                'Update failed'
                        });

                    }


                    return res.send('UPDATED');

                }
            );

        }
    );

});


module.exports = doctor;