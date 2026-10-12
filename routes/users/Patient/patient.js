const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const patient = express.Router();

const db = require('../../../utils/db');

// =====================================================
// JWT SECRET
// =====================================================

const SECRET_KEY = 'Arijit';


// =====================================================
// PATIENT REGISTER
// =====================================================

patient.post('/register', (req, res) => {

    const patientData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        email: req.body.email,
        phone_no: req.body.phone_no,
        password: req.body.password,
        disease: req.body.disease,
        patient_type: req.body.patient_type
    };


    // =================================================
    // VALIDATE REQUIRED FIELDS
    // =================================================

    if (
        !patientData.first_name ||
        !patientData.last_name ||
        !patientData.email ||
        !patientData.password ||
        !patientData.patient_type
    ) {

        return res.status(400).json({
            error: 'First name, last name, email, password and patient type are required'
        });

    }


    // =================================================
    // VALIDATE PATIENT TYPE
    // =================================================

    if (
        patientData.patient_type !== 'Outpatient' &&
        patientData.patient_type !== 'Inpatient'
    ) {

        return res.status(400).json({
            error: 'Patient type must be Outpatient or Inpatient'
        });

    }


    // =================================================
    // CHECK WHETHER PATIENT ALREADY EXISTS
    // =================================================

    const findPatient = `
        SELECT patient_id
        FROM patient
        WHERE email = ?
    `;


    db.query(
        findPatient,
        [patientData.email],
        (err, result) => {

            if (err) {

                console.log(
                    'Patient search error:',
                    err
                );

                return res.status(500).json({
                    error: 'Database error'
                });

            }


            // =================================================
            // PATIENT ALREADY EXISTS
            // =================================================

            if (result.length > 0) {

                return res.status(409).send(
                    'user already exist...'
                );

            }


            // =================================================
            // HASH PASSWORD
            // =================================================

            bcrypt.hash(
                patientData.password,
                10,
                (hashError, hash) => {

                    if (hashError) {

                        console.log(
                            'Password hashing error:',
                            hashError
                        );

                        return res.status(500).json({
                            error: 'Password encryption error'
                        });

                    }


                    // =================================================
                    // INSERT PATIENT
                    // =================================================

                    const createPatient = `
                        INSERT INTO patient
                        (
                            first_name,
                            last_name,
                            address,
                            email,
                            phone_no,
                            password,
                            disease,
                            patient_type
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;


                    db.query(
                        createPatient,
                        [
                            patientData.first_name,
                            patientData.last_name,
                            patientData.address || null,
                            patientData.email,
                            patientData.phone_no || null,
                            hash,
                            patientData.disease || null,
                            patientData.patient_type
                        ],
                        (insertError, result2) => {

                            if (insertError) {

                                console.log(
                                    'Patient registration error:',
                                    insertError
                                );

                                return res.status(500).json({
                                    error: 'Patient registration failed'
                                });

                            }


                            const patient_id = result2.insertId;


                            // =================================================
                            // CREATE INITIAL BILL
                            // =================================================

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
                                VALUES (?, 0, 0, 0, 0, 'Pending', 'Cash')
                            `;


                            db.query(
                                createBill,
                                [patient_id],
                                (billError) => {

                                    if (billError) {

                                        console.log(
                                            'Bill creation error:',
                                            billError
                                        );

                                        /*
                                         * Patient registration was successful.
                                         * The bill can still be created later
                                         * from the admin billing module.
                                         */

                                    }


                                    console.log(
                                        'Patient registered successfully. Patient ID:',
                                        patient_id
                                    );


                                    return res.send(
                                        'Patient registered successfully'
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// =====================================================
// PATIENT LOGIN
// =====================================================

patient.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;


    if (!email || !password) {

        return res.status(400).json({
            error: 'Email and password are required'
        });

    }


    // =================================================
    // FIND PATIENT
    // =================================================

    const findPatient = `
        SELECT
            patient_id,
            password
        FROM patient
        WHERE email = ?
    `;


    db.query(
        findPatient,
        [email],
        (err, result) => {

            if (err) {

                console.log(
                    'Patient login database error:',
                    err
                );

                return res.status(500).json({
                    error: 'Database error'
                });

            }


            // =================================================
            // EMAIL DOES NOT EXIST
            // =================================================

            if (result.length === 0) {

                return res.status(404).send(
                    'Email not found'
                );

            }


            const patientId = result[0].patient_id;
            const storedPassword = result[0].password;

            let passwordMatched = false;


            // =================================================
            // CHECK BCRYPT PASSWORD
            // =================================================

            try {

                passwordMatched = bcrypt.compareSync(
                    password,
                    storedPassword
                );

            } catch (error) {

                /*
                 * If password is not a bcrypt hash,
                 * compare it as plain text below.
                 */

                passwordMatched = false;

            }


            // =================================================
            // SUPPORT OLD PLAIN-TEXT PASSWORDS
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
                String(patientId),
                SECRET_KEY
            );


            console.log(
                'Patient login successful. Patient ID:',
                patientId
            );


            return res.send(token);

        }
    );

});


// =====================================================
// PATIENT PROFILE
// =====================================================

patient.get('/profile', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const patient_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                patient_id,
                first_name,
                last_name,
                address,
                email,
                phone_no,
                disease,
                patient_type
            FROM patient
            WHERE patient_id = ?
        `;


        db.query(
            sql,
            [patient_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Patient profile error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                if (result.length === 0) {

                    return res.status(404).json({
                        error: 'Patient not found'
                    });

                }


                return res.send(result);

            }
        );

    } catch (error) {

        console.log(
            'Patient profile token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// PATIENT DETAILS
// =====================================================

patient.get('/details', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const patient_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                patient_id,
                first_name,
                last_name,
                address,
                email,
                phone_no,
                disease,
                patient_type
            FROM patient
            WHERE patient_id = ?
        `;


        db.query(
            sql,
            [patient_id],
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
                        error: 'Patient not found'
                    });

                }


                return res.send(result);

            }
        );

    } catch (error) {

        console.log(
            'Patient details token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// PATIENT DOCTOR
// =====================================================

patient.get('/doctor', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const patient_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                d.doctor_id,
                d.first_name AS doctor_firstname,
                d.last_name AS doctor_lastname,
                d.email AS doctor_email,
                d.specialisation,
                d.shift_time
            FROM assign_doctor ad
            INNER JOIN doctors d
                ON ad.doctor_id = d.doctor_id
            WHERE ad.patient_id = ?
        `;


        db.query(
            sql,
            [patient_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Patient doctor error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                return res.send(result);

            }
        );

    } catch (error) {

        console.log(
            'Patient doctor token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


// =====================================================
// PATIENT BILL
// =====================================================

patient.get('/bill', (req, res) => {

    try {

        const token = req.headers.authorization;


        if (!token) {

            return res.status(401).json({
                error: 'Authorization token missing'
            });

        }


        const patient_id = jwt.verify(
            token,
            SECRET_KEY
        );


        const sql = `
            SELECT
                bill_id,
                patient_id,
                medicine_cost,
                operation_charge,
                room_charge,
                misc_charge,
                bill_date,
                payment_status,
                payment_method,

                (
                    COALESCE(medicine_cost, 0) +
                    COALESCE(operation_charge, 0) +
                    COALESCE(room_charge, 0) +
                    COALESCE(misc_charge, 0)
                ) AS total_amount

            FROM bill

            WHERE patient_id = ?

            ORDER BY bill_date DESC
        `;


        db.query(
            sql,
            [patient_id],
            (err, result) => {

                if (err) {

                    console.log(
                        'Patient bill error:',
                        err
                    );

                    return res.status(500).json({
                        error: 'Database error'
                    });

                }


                return res.send(result);

            }
        );

    } catch (error) {

        console.log(
            'Patient bill token error:',
            error
        );

        return res.status(401).json({
            error: 'Invalid or expired token'
        });

    }

});


module.exports = patient;