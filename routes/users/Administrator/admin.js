const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const admin = express.Router();
const db = require('../../../utils/db');

process.env.SECRET_KEY = 'Arijit';


// =====================================================
// ADMIN / STAFF REGISTER
// =====================================================

admin.post('/register', (req, res) => {

    const {
        first_name,
        last_name,
        email,
        address,
        phone_no,
        designation,
        salary,
        password
    } = req.body;

    if (
        !first_name ||
        !last_name ||
        !email ||
        !address ||
        !phone_no ||
        !designation ||
        !salary ||
        !password
    ) {
        return res.status(400).json({
            error: 'Please fill all staff fields'
        });
    }

    const checkSql = `
        SELECT *
        FROM admin
        WHERE email = ?
    `;

    db.query(checkSql, [email], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Database error'
            });
        }

        if (result.length > 0) {
            return res.status(400).json({
                error: 'Staff already exists'
            });
        }

        bcrypt.hash(password, 10, (hashError, hash) => {

            if (hashError) {
                console.log(hashError);

                return res.status(500).json({
                    error: 'Password encryption failed'
                });
            }

            const insertSql = `
                INSERT INTO admin
                (
                    first_name,
                    last_name,
                    email,
                    address,
                    phone_no,
                    designation,
                    salary,
                    password
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    first_name,
                    last_name,
                    email,
                    address,
                    phone_no,
                    designation,
                    salary,
                    hash
                ],
                (insertError, result) => {

                    if (insertError) {
                        console.log(insertError);

                        return res.status(500).json({
                            error: 'Unable to add staff'
                        });
                    }

                    res.json({
                        message: 'Staff added successfully',
                        admin_id: result.insertId
                    });
                }
            );
        });
    });
});


// =====================================================
// STAFF REGISTER ALIAS
// =====================================================

admin.post('/staff/register', (req, res) => {

    const {
        first_name,
        last_name,
        email,
        address,
        phone_no,
        designation,
        salary,
        password
    } = req.body;

    if (
        !first_name ||
        !last_name ||
        !email ||
        !address ||
        !phone_no ||
        !designation ||
        !salary ||
        !password
    ) {
        return res.status(400).json({
            error: 'Please fill all staff fields'
        });
    }

    const checkSql = `
        SELECT *
        FROM admin
        WHERE email = ?
    `;

    db.query(checkSql, [email], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Database error'
            });
        }

        if (result.length > 0) {
            return res.status(400).json({
                error: 'Staff already exists'
            });
        }

        bcrypt.hash(password, 10, (hashError, hash) => {

            if (hashError) {
                console.log(hashError);

                return res.status(500).json({
                    error: 'Password encryption failed'
                });
            }

            const sql = `
                INSERT INTO admin
                (
                    first_name,
                    last_name,
                    email,
                    address,
                    phone_no,
                    designation,
                    salary,
                    password
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    first_name,
                    last_name,
                    email,
                    address,
                    phone_no,
                    designation,
                    salary,
                    hash
                ],
                (insertError, result) => {

                    if (insertError) {
                        console.log(insertError);

                        return res.status(500).json({
                            error: 'Unable to add staff'
                        });
                    }

                    res.json({
                        message: 'Staff added successfully',
                        admin_id: result.insertId
                    });
                }
            );
        });
    });
});


// =====================================================
// ADMIN LOGIN
// =====================================================

admin.post('/login', (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required'
        });
    }

    const sql = `
        SELECT
            admin_id,
            email,
            password
        FROM admin
        WHERE email = ?
    `;

    db.query(sql, [email], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Database error'
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Email not found'
            });
        }

        const storedPassword = result[0].password;

        let passwordMatch = false;

        if (
            typeof storedPassword === 'string' &&
            storedPassword.startsWith('$2')
        ) {
            passwordMatch = bcrypt.compareSync(
                password,
                storedPassword
            );
        } else {
            passwordMatch = password === storedPassword;
        }

        if (!passwordMatch) {
            return res.status(400).json({
                error: 'Password incorrect'
            });
        }

        const token = jwt.sign(
            String(result[0].admin_id),
            process.env.SECRET_KEY
        );

        res.json({
            token: token,
            admin_id: result[0].admin_id
        });
    });
});


// =====================================================
// ADMIN DETAILS
// =====================================================

admin.get('/details', (req, res) => {

    try {

        const admin_id = jwt.verify(
            req.headers['authorization'],
            process.env.SECRET_KEY
        );

        const sql = `
            SELECT
                admin_id,
                first_name,
                last_name,
                email,
                address,
                phone_no,
                designation,
                salary
            FROM admin
            WHERE admin_id = ?
        `;

        db.query(
            sql,
            [admin_id],
            (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        error: 'Database error'
                    });
                }

                res.json(result);
            }
        );

    } catch (error) {

        return res.status(401).json({
            error: 'Invalid token'
        });
    }
});


// =====================================================
// GET ALL STAFF
// =====================================================

admin.get('/staff', (req, res) => {

    const sql = `
        SELECT
            admin_id,
            first_name,
            last_name,
            email,
            address,
            phone_no,
            designation,
            salary
        FROM admin
        ORDER BY admin_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Unable to fetch staff'
            });
        }

        res.json(result);
    });
});


// =====================================================
// GET ALL EMPLOYEES
// =====================================================

admin.get('/employees', (req, res) => {

    const sql = `
        SELECT
            admin_id,
            first_name,
            last_name,
            email,
            address,
            phone_no,
            designation,
            salary
        FROM admin
        ORDER BY admin_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Unable to fetch employees'
            });
        }

        res.json(result);
    });
});


// =====================================================
// DELETE STAFF
// =====================================================

admin.post('/staff/delete', (req, res) => {

    const admin_id = req.body.admin_id;

    if (!admin_id) {
        return res.status(400).json({
            error: 'Staff ID is required'
        });
    }

    const sql = `
        DELETE FROM admin
        WHERE admin_id = ?
    `;

    db.query(
        sql,
        [admin_id],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: 'Unable to delete staff'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Staff not found'
                });
            }

            res.json({
                message: 'Staff deleted successfully'
            });
        }
    );
});


// =====================================================
// DELETE EMPLOYEE / ADMIN
// =====================================================

admin.post('/delete', (req, res) => {

    const admin_id = req.body.admin_id;

    if (!admin_id) {
        return res.status(400).json({
            error: 'Employee ID is required'
        });
    }

    const sql = `
        DELETE FROM admin
        WHERE admin_id = ?
    `;

    db.query(
        sql,
        [admin_id],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: 'Unable to delete employee'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Employee not found'
                });
            }

            res.json({
                message: 'Employee deleted successfully'
            });
        }
    );
});


// =====================================================
// GET ALL DOCTORS
// =====================================================

admin.get('/doctors', (req, res) => {

    const sql = `
        SELECT
            d.doctor_id,
            d.first_name,
            d.last_name,
            d.address,
            d.email,
            d.salary,
            d.specialisation,
            d.shift_time,
            COUNT(ad.patient_id) AS patient_count
        FROM doctors d
        LEFT JOIN assign_doctor ad
            ON d.doctor_id = ad.doctor_id
        GROUP BY
            d.doctor_id,
            d.first_name,
            d.last_name,
            d.address,
            d.email,
            d.salary,
            d.specialisation,
            d.shift_time
        ORDER BY d.doctor_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Unable to fetch doctors'
            });
        }

        res.json(result);
    });
});


// =====================================================
// ADD DOCTOR
// =====================================================

admin.post('/doctor/register', (req, res) => {

    const {
        first_name,
        last_name,
        address,
        email,
        salary,
        specialisation,
        shift_time,
        password
    } = req.body;

    if (
        !first_name ||
        !last_name ||
        !address ||
        !email ||
        !salary ||
        !specialisation ||
        !shift_time ||
        !password
    ) {
        return res.status(400).json({
            error: 'Please fill all doctor fields'
        });
    }

    const checkSql = `
        SELECT *
        FROM doctors
        WHERE email = ?
    `;

    db.query(
        checkSql,
        [email],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    error: 'Doctor already exists'
                });
            }

            bcrypt.hash(
                password,
                10,
                (hashError, hash) => {

                    if (hashError) {
                        return res.status(500).json({
                            error: 'Password encryption failed'
                        });
                    }

                    const sql = `
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
                        sql,
                        [
                            first_name,
                            last_name,
                            address,
                            email,
                            salary,
                            specialisation,
                            shift_time,
                            hash
                        ],
                        (insertError, result) => {

                            if (insertError) {
                                console.log(insertError);

                                return res.status(500).json({
                                    error: 'Unable to add doctor'
                                });
                            }

                            res.json({
                                message:
                                    'Doctor added successfully',
                                doctor_id:
                                    result.insertId
                            });
                        }
                    );
                }
            );
        }
    );
});


// =====================================================
// DELETE DOCTOR
// =====================================================

admin.post('/doctor/delete', (req, res) => {

    const doctor_id = req.body.doctor_id;

    if (!doctor_id) {
        return res.status(400).json({
            error: 'Doctor ID is required'
        });
    }

    const checkSql = `
        SELECT *
        FROM assign_doctor
        WHERE doctor_id = ?
    `;

    db.query(
        checkSql,
        [doctor_id],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    error:
                        'Cannot delete doctor. Patients are assigned to this doctor.'
                });
            }

            const deleteSql = `
                DELETE FROM doctors
                WHERE doctor_id = ?
            `;

            db.query(
                deleteSql,
                [doctor_id],
                (deleteError, deleteResult) => {

                    if (deleteError) {
                        console.log(deleteError);

                        return res.status(500).json({
                            error: 'Unable to delete doctor'
                        });
                    }

                    if (deleteResult.affectedRows === 0) {
                        return res.status(404).json({
                            error: 'Doctor not found'
                        });
                    }

                    res.json({
                        message:
                            'Doctor deleted successfully'
                    });
                }
            );
        }
    );
});


// =====================================================
// GET ALL PATIENTS
// =====================================================
// IMPORTANT:
// patient_type is included here because the frontend uses
// it for OP/IP filtering.

admin.get('/patients', (req, res) => {

    const sql = `
        SELECT
            p.patient_id,
            p.first_name,
            p.last_name,
            p.address,
            p.email,
            p.phone_no,
            p.disease,
            p.patient_type,

            d.doctor_id,
            d.first_name AS doctor_first_name,
            d.last_name AS doctor_last_name,
            d.specialisation

        FROM patient p

        LEFT JOIN assign_doctor ad
            ON p.patient_id = ad.patient_id

        LEFT JOIN doctors d
            ON ad.doctor_id = d.doctor_id

        ORDER BY p.patient_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: 'Unable to fetch patients'
            });
        }

        res.json(result);
    });
});


// =====================================================
// GET PATIENTS OF DOCTOR
// =====================================================

admin.get(
    '/doctor/:doctor_id/patients',
    (req, res) => {

        const doctor_id = req.params.doctor_id;

        const sql = `
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.address,
                p.email,
                p.phone_no,
                p.disease,
                p.patient_type,

                d.doctor_id,
                d.first_name AS doctor_first_name,
                d.last_name AS doctor_last_name,
                d.specialisation

            FROM assign_doctor ad

            JOIN patient p
                ON ad.patient_id = p.patient_id

            JOIN doctors d
                ON ad.doctor_id = d.doctor_id

            WHERE ad.doctor_id = ?

            ORDER BY p.patient_id DESC
        `;

        db.query(
            sql,
            [doctor_id],
            (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        error:
                            'Unable to fetch doctor patients'
                    });
                }

                res.json(result);
            }
        );
    }
);


// =====================================================
// ASSIGN / REASSIGN DOCTOR
// =====================================================

admin.post('/assign_doctor', (req, res) => {

    const {
        patient_id,
        doctor_id
    } = req.body;

    if (!patient_id || !doctor_id) {
        return res.status(400).json({
            error:
                'Patient and doctor are required'
        });
    }

    const patientSql = `
        SELECT patient_id
        FROM patient
        WHERE patient_id = ?
    `;

    db.query(
        patientSql,
        [patient_id],
        (patientError, patientResult) => {

            if (patientError) {
                console.log(patientError);

                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (patientResult.length === 0) {
                return res.status(404).json({
                    error: 'Patient not found'
                });
            }

            const doctorSql = `
                SELECT doctor_id
                FROM doctors
                WHERE doctor_id = ?
            `;

            db.query(
                doctorSql,
                [doctor_id],
                (doctorError, doctorResult) => {

                    if (doctorError) {
                        console.log(doctorError);

                        return res.status(500).json({
                            error: 'Database error'
                        });
                    }

                    if (doctorResult.length === 0) {
                        return res.status(404).json({
                            error: 'Doctor not found'
                        });
                    }

                    const checkSql = `
                        SELECT *
                        FROM assign_doctor
                        WHERE patient_id = ?
                    `;

                    db.query(
                        checkSql,
                        [patient_id],
                        (checkError, assignmentResult) => {

                            if (checkError) {
                                console.log(checkError);

                                return res.status(500).json({
                                    error: 'Database error'
                                });
                            }

                            if (assignmentResult.length > 0) {

                                const updateSql = `
                                    UPDATE assign_doctor
                                    SET doctor_id = ?
                                    WHERE patient_id = ?
                                `;

                                db.query(
                                    updateSql,
                                    [
                                        doctor_id,
                                        patient_id
                                    ],
                                    (updateError) => {

                                        if (updateError) {
                                            console.log(updateError);

                                            return res.status(500).json({
                                                error:
                                                    'Unable to update doctor assignment'
                                            });
                                        }

                                        res.json({
                                            message:
                                                'Doctor assignment updated successfully'
                                        });
                                    }
                                );

                            } else {

                                const insertSql = `
                                    INSERT INTO assign_doctor
                                    (
                                        patient_id,
                                        doctor_id
                                    )
                                    VALUES (?, ?)
                                `;

                                db.query(
                                    insertSql,
                                    [
                                        patient_id,
                                        doctor_id
                                    ],
                                    (insertError) => {

                                        if (insertError) {
                                            console.log(insertError);

                                            return res.status(500).json({
                                                error:
                                                    'Unable to assign doctor'
                                            });
                                        }

                                        res.json({
                                            message:
                                                'Doctor assigned successfully'
                                        });
                                    }
                                );
                            }
                        }
                    );
                }
            );
        }
    );
});


// =====================================================
// GET BILL FOR PATIENT
// =====================================================

admin.get(
    '/bill/:patient_id',
    (req, res) => {

        const patient_id =
            req.params.patient_id;

        const sql = `
            SELECT *
            FROM bill
            WHERE patient_id = ?
            ORDER BY bill_id DESC
        `;

        db.query(
            sql,
            [patient_id],
            (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        error:
                            'Unable to fetch bill'
                    });
                }

                res.json(result);
            }
        );
    }
);


// =====================================================
// CREATE / UPDATE BILL
// =====================================================
//
// billing_type is:
// OP = Outpatient
// IP = Inpatient
//
// Current bill table does not contain billing_type,
// so it is validated here but not stored as a column.
//
// OP:
// medicine + operation + misc
// room charge forced to 0
//
// IP:
// medicine + operation + room + misc
// patient must have an active inpatient record
// =====================================================

admin.post('/bill', (req, res) => {

    const {
        billing_type,
        doctor_id,
        patient_id,
        medicine_cost,
        operation_charge,
        room_charge,
        misc_charge,
        payment_status,
        payment_method
    } = req.body;

    if (!billing_type) {
        return res.status(400).json({
            error:
                'Billing type is required'
        });
    }

    if (
        billing_type !== 'OP' &&
        billing_type !== 'IP'
    ) {
        return res.status(400).json({
            error:
                'Billing type must be OP or IP'
        });
    }

    if (!doctor_id || !patient_id) {
        return res.status(400).json({
            error:
                'Doctor and patient are required'
        });
    }

    const medicine =
        Number(medicine_cost) || 0;

    const operation =
        Number(operation_charge) || 0;

    let room =
        Number(room_charge) || 0;

    const misc =
        Number(misc_charge) || 0;

    // OP billing cannot have room/bed charges.
    if (billing_type === 'OP') {
        room = 0;
    }

    const finalPaymentStatus =
        payment_status || 'Pending';

    const finalPaymentMethod =
        payment_method || 'Cash';


    // =================================================
    // CHECK PATIENT
    // =================================================

    const patientSql = `
        SELECT
            patient_id,
            first_name,
            last_name,
            patient_type
        FROM patient
        WHERE patient_id = ?
    `;

    db.query(
        patientSql,
        [patient_id],
        (patientError, patientResult) => {

            if (patientError) {
                console.log(patientError);

                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (patientResult.length === 0) {
                return res.status(404).json({
                    error: 'Patient not found'
                });
            }

            const patient =
                patientResult[0];


            // =============================================
            // CHECK BILLING TYPE AGAINST PATIENT TYPE
            // =============================================

            if (
                billing_type === 'OP' &&
                patient.patient_type === 'Inpatient'
            ) {
                return res.status(400).json({
                    error:
                        'This patient is registered as Inpatient. Use IP Billing.'
                });
            }

            if (
                billing_type === 'IP' &&
                patient.patient_type !== 'Inpatient'
            ) {
                return res.status(400).json({
                    error:
                        'Only Inpatient patients can use IP Billing.'
                });
            }


            // =============================================
            // IP MUST HAVE ACTIVE ADMISSION
            // =============================================

            if (billing_type === 'IP') {

                const inpatientSql = `
                    SELECT
                        inpatient_id,
                        patient_id,
                        status
                    FROM inpatients
                    WHERE patient_id = ?
                    AND status = 'Admitted'
                    LIMIT 1
                `;

                db.query(
                    inpatientSql,
                    [patient_id],
                    (inpatientError, inpatientResult) => {

                        if (inpatientError) {
                            console.log(inpatientError);

                            return res.status(500).json({
                                error:
                                    'Database error'
                            });
                        }

                        if (inpatientResult.length === 0) {
                            return res.status(400).json({
                                error:
                                    'Patient must be admitted before IP billing'
                            });
                        }

                        checkDoctorAssignment();
                    }
                );

            } else {

                checkDoctorAssignment();

            }


            // =============================================
            // CHECK DOCTOR ASSIGNMENT
            // =============================================

            function checkDoctorAssignment() {

                const assignmentSql = `
                    SELECT *
                    FROM assign_doctor
                    WHERE patient_id = ?
                    AND doctor_id = ?
                `;

                db.query(
                    assignmentSql,
                    [
                        patient_id,
                        doctor_id
                    ],
                    (assignmentError, assignmentResult) => {

                        if (assignmentError) {
                            console.log(assignmentError);

                            return res.status(500).json({
                                error:
                                    'Database error'
                            });
                        }

                        if (assignmentResult.length === 0) {
                            return res.status(400).json({
                                error:
                                    'This patient is not assigned to the selected doctor'
                            });
                        }

                        saveBill();
                    }
                );
            }


            // =============================================
            // SAVE BILL
            // =============================================

            function saveBill() {

                const billSql = `
                    SELECT
                        bill_id
                    FROM bill
                    WHERE patient_id = ?
                    ORDER BY bill_id DESC
                    LIMIT 1
                `;

                db.query(
                    billSql,
                    [patient_id],
                    (billError, billResult) => {

                        if (billError) {
                            console.log(billError);

                            return res.status(500).json({
                                error:
                                    'Database error'
                            });
                        }


                        // =================================
                        // UPDATE EXISTING BILL
                        // =================================

                        if (billResult.length > 0) {

                            const billId =
                                billResult[0].bill_id;

                            const updateSql = `
                                UPDATE bill
                                SET
                                    medicine_cost = ?,
                                    operation_charge = ?,
                                    room_charge = ?,
                                    misc_charge = ?,
                                    payment_status = ?,
                                    payment_method = ?,
                                    bill_date = CURRENT_TIMESTAMP
                                WHERE bill_id = ?
                            `;

                            db.query(
                                updateSql,
                                [
                                    medicine,
                                    operation,
                                    room,
                                    misc,
                                    finalPaymentStatus,
                                    finalPaymentMethod,
                                    billId
                                ],
                                (updateError) => {

                                    if (updateError) {
                                        console.log(updateError);

                                        return res.status(500).json({
                                            error:
                                                'Unable to update bill'
                                        });
                                    }

                                    const total =
                                        medicine +
                                        operation +
                                        room +
                                        misc;

                                    res.json({
                                        message:
                                            'Bill updated successfully',
                                        billing_type:
                                            billing_type,
                                        bill_id:
                                            billId,
                                        total:
                                            total
                                    });
                                }
                            );


                        // =================================
                        // CREATE NEW BILL
                        // =================================

                        } else {

                            const insertSql = `
                                INSERT INTO bill
                                (
                                    patient_id,
                                    medicine_cost,
                                    operation_charge,
                                    room_charge,
                                    misc_charge,
                                    payment_status,
                                    payment_method,
                                    bill_date
                                )
                                VALUES
                                (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                            `;

                            db.query(
                                insertSql,
                                [
                                    patient_id,
                                    medicine,
                                    operation,
                                    room,
                                    misc,
                                    finalPaymentStatus,
                                    finalPaymentMethod
                                ],
                                (insertError, result) => {

                                    if (insertError) {
                                        console.log(insertError);

                                        return res.status(500).json({
                                            error:
                                                'Unable to create bill'
                                        });
                                    }

                                    const total =
                                        medicine +
                                        operation +
                                        room +
                                        misc;

                                    res.json({
                                        message:
                                            'Bill created successfully',
                                        billing_type:
                                            billing_type,
                                        bill_id:
                                            result.insertId,
                                        total:
                                            total
                                    });
                                }
                            );
                        }
                    }
                );
            }
        }
    );
});


// =====================================================
// APPOINTMENT MANAGEMENT
// =====================================================


// =====================================================
// GET ALL APPOINTMENTS
// =====================================================

admin.get('/appointments', (req, res) => {

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

            d.first_name AS doctor_first_name,
            d.last_name AS doctor_last_name,
            d.specialisation

        FROM appointments a

        JOIN patient p
            ON a.patient_id = p.patient_id

        JOIN doctors d
            ON a.doctor_id = d.doctor_id

        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error:
                    'Unable to fetch appointments'
            });
        }

        res.json(result);
    });
});


// =====================================================
// CREATE APPOINTMENT
// =====================================================

admin.post('/appointments', (req, res) => {

    const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason
    } = req.body;

    if (
        !patient_id ||
        !doctor_id ||
        !appointment_date ||
        !appointment_time
    ) {
        return res.status(400).json({
            error:
                'Patient, doctor, date and time are required'
        });
    }

    const checkSql = `
        SELECT appointment_id
        FROM appointments
        WHERE doctor_id = ?
        AND appointment_date = ?
        AND appointment_time = ?
        AND status != 'Cancelled'
    `;

    db.query(
        checkSql,
        [
            doctor_id,
            appointment_date,
            appointment_time
        ],
        (checkError, result) => {

            if (checkError) {
                console.log(checkError);

                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    error:
                        'Doctor already has an appointment at this time'
                });
            }

            const sql = `
                INSERT INTO appointments
                (
                    patient_id,
                    doctor_id,
                    appointment_date,
                    appointment_time,
                    reason,
                    status
                )
                VALUES (?, ?, ?, ?, ?, 'Scheduled')
            `;

            db.query(
                sql,
                [
                    patient_id,
                    doctor_id,
                    appointment_date,
                    appointment_time,
                    reason || null
                ],
                (err, result) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            error:
                                'Unable to create appointment'
                        });
                    }

                    res.json({
                        message:
                            'Appointment created successfully',
                        appointment_id:
                            result.insertId
                    });
                }
            );
        }
    );
});


// =====================================================
// UPDATE APPOINTMENT STATUS
// =====================================================

admin.post('/appointments/status', (req, res) => {

    const {
        appointment_id,
        status
    } = req.body;

    if (!appointment_id || !status) {
        return res.status(400).json({
            error:
                'Appointment ID and status are required'
        });
    }

    const allowedStatuses = [
        'Scheduled',
        'Completed',
        'Cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error:
                'Invalid appointment status'
        });
    }

    const sql = `
        UPDATE appointments
        SET status = ?
        WHERE appointment_id = ?
    `;

    db.query(
        sql,
        [
            status,
            appointment_id
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error:
                        'Unable to update appointment'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error:
                        'Appointment not found'
                });
            }

            res.json({
                message:
                    'Appointment status updated successfully'
            });
        }
    );
});


// =====================================================
// DELETE APPOINTMENT
// =====================================================

admin.post('/appointments/delete', (req, res) => {

    const appointment_id =
        req.body.appointment_id;

    if (!appointment_id) {
        return res.status(400).json({
            error:
                'Appointment ID is required'
        });
    }

    const sql = `
        DELETE FROM appointments
        WHERE appointment_id = ?
    `;

    db.query(
        sql,
        [appointment_id],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error:
                        'Unable to delete appointment'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error:
                        'Appointment not found'
                });
            }

            res.json({
                message:
                    'Appointment deleted successfully'
            });
        }
    );
});


// =====================================================
// INPATIENT MANAGEMENT
// =====================================================


// =====================================================
// GET ALL INPATIENTS
// =====================================================

admin.get('/inpatients', (req, res) => {

    const sql = `
        SELECT
            i.inpatient_id,
            i.patient_id,
            i.admission_date,
            i.discharge_date,
            i.status,

            p.first_name,
            p.last_name,
            p.email,
            p.phone_no,
            p.disease,
            p.patient_type

        FROM inpatients i

        JOIN patient p
            ON i.patient_id = p.patient_id

        ORDER BY i.inpatient_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error:
                    'Unable to fetch inpatients'
            });
        }

        res.json(result);
    });
});


// =====================================================
// GET ONLY ADMITTED INPATIENTS
// =====================================================

admin.get('/inpatients/admitted', (req, res) => {

    const sql = `
        SELECT
            i.inpatient_id,
            i.patient_id,
            i.admission_date,
            i.discharge_date,
            i.status,

            p.first_name,
            p.last_name,
            p.email,
            p.phone_no,
            p.disease,
            p.patient_type

        FROM inpatients i

        JOIN patient p
            ON i.patient_id = p.patient_id

        WHERE i.status = 'Admitted'

        ORDER BY i.inpatient_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error:
                    'Unable to fetch admitted patients'
            });
        }

        res.json(result);
    });
});


// =====================================================
// ADMIT PATIENT
// =====================================================

admin.post('/inpatients/admit', (req, res) => {

    const {
        patient_id,
        admission_date
    } = req.body;

    if (!patient_id) {
        return res.status(400).json({
            error:
                'Patient is required'
        });
    }


    // =================================================
    // CHECK PATIENT AND PATIENT TYPE
    // =================================================

    const patientSql = `
        SELECT
            patient_id,
            patient_type
        FROM patient
        WHERE patient_id = ?
    `;

    db.query(
        patientSql,
        [patient_id],
        (patientError, patientResult) => {

            if (patientError) {
                console.log(patientError);

                return res.status(500).json({
                    error:
                        'Database error'
                });
            }

            if (patientResult.length === 0) {
                return res.status(404).json({
                    error:
                        'Patient not found'
                });
            }

            const patient =
                patientResult[0];


            // Only IP patients can be admitted.

            if (
                patient.patient_type !==
                'Inpatient'
            ) {
                return res.status(400).json({
                    error:
                        'Only patients registered as Inpatient (IP) can be admitted'
                });
            }


            // =================================================
            // CHECK CURRENT ADMISSION
            // =================================================

            const checkSql = `
                SELECT
                    inpatient_id
                FROM inpatients
                WHERE patient_id = ?
                AND status = 'Admitted'
                LIMIT 1
            `;

            db.query(
                checkSql,
                [patient_id],
                (checkError, result) => {

                    if (checkError) {
                        console.log(checkError);

                        return res.status(500).json({
                            error:
                                'Database error'
                        });
                    }

                    if (result.length > 0) {
                        return res.status(400).json({
                            error:
                                'Patient is already admitted'
                        });
                    }


                    // =================================================
                    // CHECK FOR PREVIOUS DISCHARGED RECORD
                    // =================================================
                    //
                    // inpatients.patient_id is UNIQUE.
                    //
                    // Therefore we reuse the old discharged row
                    // instead of inserting another row.
                    //

                    const previousSql = `
                        SELECT
                            inpatient_id
                        FROM inpatients
                        WHERE patient_id = ?
                        LIMIT 1
                    `;

                    db.query(
                        previousSql,
                        [patient_id],
                        (previousError, previousResult) => {

                            if (previousError) {
                                console.log(previousError);

                                return res.status(500).json({
                                    error:
                                        'Database error'
                                });
                            }


                            const finalAdmissionDate =
                                admission_date ||
                                new Date()
                                    .toISOString()
                                    .slice(0, 10);


                            // =========================================
                            // REUSE PREVIOUS DISCHARGED RECORD
                            // =========================================

                            if (
                                previousResult.length > 0
                            ) {

                                const inpatientId =
                                    previousResult[0]
                                        .inpatient_id;

                                const updateSql = `
                                    UPDATE inpatients
                                    SET
                                        admission_date = ?,
                                        discharge_date = NULL,
                                        status = 'Admitted'
                                    WHERE inpatient_id = ?
                                `;

                                db.query(
                                    updateSql,
                                    [
                                        finalAdmissionDate,
                                        inpatientId
                                    ],
                                    (updateError) => {

                                        if (updateError) {
                                            console.log(updateError);

                                            return res.status(500).json({
                                                error:
                                                    'Unable to admit patient'
                                            });
                                        }

                                        return res.json({
                                            message:
                                                'Patient admitted successfully',
                                            inpatient_id:
                                                inpatientId
                                        });
                                    }
                                );

                                return;
                            }


                            // =========================================
                            // CREATE NEW INPATIENT RECORD
                            // =========================================

                            const insertSql = `
                                INSERT INTO inpatients
                                (
                                    patient_id,
                                    admission_date,
                                    status
                                )
                                VALUES (?, ?, 'Admitted')
                            `;

                            db.query(
                                insertSql,
                                [
                                    patient_id,
                                    finalAdmissionDate
                                ],
                                (insertError, result) => {

                                    if (insertError) {
                                        console.log(insertError);

                                        return res.status(500).json({
                                            error:
                                                'Unable to admit patient'
                                        });
                                    }

                                    res.json({
                                        message:
                                            'Patient admitted successfully',
                                        inpatient_id:
                                            result.insertId
                                    });
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
// DISCHARGE PATIENT
// =====================================================

admin.post('/inpatients/discharge', (req, res) => {

    const {
        inpatient_id
    } = req.body;

    if (!inpatient_id) {
        return res.status(400).json({
            error:
                'Inpatient ID is required'
        });
    }


    // =================================================
    // CHECK ACTIVE ADMISSION
    // =================================================

    const checkSql = `
        SELECT
            inpatient_id,
            patient_id
        FROM inpatients
        WHERE inpatient_id = ?
        AND status = 'Admitted'
    `;

    db.query(
        checkSql,
        [inpatient_id],
        (checkError, result) => {

            if (checkError) {
                console.log(checkError);

                return res.status(500).json({
                    error:
                        'Database error'
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    error:
                        'Admitted patient not found'
                });
            }

            const updateSql = `
                UPDATE inpatients
                SET
                    status = 'Discharged',
                    discharge_date = CURRENT_DATE
                WHERE inpatient_id = ?
            `;

            db.query(
                updateSql,
                [inpatient_id],
                (updateError) => {

                    if (updateError) {
                        console.log(updateError);

                        return res.status(500).json({
                            error:
                                'Unable to discharge patient'
                        });
                    }


                    // =================================================
                    // FIND OCCUPIED BED
                    // =================================================

                    const assignmentSql = `
                        SELECT
                            assignment_id,
                            bed_id
                        FROM bed_assignments
                        WHERE inpatient_id = ?
                        AND status = 'Occupied'
                        LIMIT 1
                    `;

                    db.query(
                        assignmentSql,
                        [inpatient_id],
                        (assignmentError, assignmentResult) => {

                            if (assignmentError) {
                                console.log(assignmentError);

                                return res.status(500).json({
                                    error:
                                        'Unable to check bed assignment'
                                });
                            }


                            // No bed assigned.

                            if (
                                assignmentResult.length === 0
                            ) {

                                return res.json({
                                    message:
                                        'Patient discharged successfully'
                                });
                            }


                            const assignmentId =
                                assignmentResult[0]
                                    .assignment_id;

                            const bedId =
                                assignmentResult[0]
                                    .bed_id;


                            // =========================================
                            // RELEASE ASSIGNMENT
                            // =========================================

                            const releaseAssignmentSql = `
                                UPDATE bed_assignments
                                SET
                                    status = 'Released',
                                    released_date = CURRENT_TIMESTAMP
                                WHERE assignment_id = ?
                            `;

                            db.query(
                                releaseAssignmentSql,
                                [assignmentId],
                                (releaseError) => {

                                    if (releaseError) {
                                        console.log(releaseError);

                                        return res.status(500).json({
                                            error:
                                                'Unable to release bed assignment'
                                        });
                                    }


                                    // =================================
                                    // RELEASE BED
                                    // =================================

                                    const releaseBedSql = `
                                        UPDATE beds
                                        SET status = 'Available'
                                        WHERE bed_id = ?
                                    `;

                                    db.query(
                                        releaseBedSql,
                                        [bedId],
                                        (bedError) => {

                                            if (bedError) {
                                                console.log(bedError);

                                                return res.status(500).json({
                                                    error:
                                                        'Unable to release bed'
                                                });
                                            }

                                            res.json({
                                                message:
                                                    'Patient discharged and bed released successfully'
                                            });
                                        }
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
// BED MANAGEMENT
// =====================================================


// =====================================================
// GET ALL BEDS
// =====================================================

admin.get('/beds', (req, res) => {

    const sql = `
        SELECT
            b.bed_id,
            b.bed_number,
            b.ward,
            b.bed_type,
            b.status,

            ba.assignment_id,
            ba.inpatient_id,

            p.patient_id,
            p.first_name,
            p.last_name

        FROM beds b

        LEFT JOIN bed_assignments ba
            ON b.bed_id = ba.bed_id
            AND ba.status = 'Occupied'

        LEFT JOIN inpatients i
            ON ba.inpatient_id = i.inpatient_id

        LEFT JOIN patient p
            ON i.patient_id = p.patient_id

        ORDER BY b.bed_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error:
                    'Unable to fetch beds'
            });
        }

        res.json(result);
    });
});


// =====================================================
// ADD BED
// =====================================================

admin.post('/beds', (req, res) => {

    const {
        bed_number,
        ward,
        bed_type
    } = req.body;

    if (
        !bed_number ||
        !ward ||
        !bed_type
    ) {
        return res.status(400).json({
            error:
                'Bed number, ward and bed type are required'
        });
    }

    const checkSql = `
        SELECT
            bed_id
        FROM beds
        WHERE bed_number = ?
    `;

    db.query(
        checkSql,
        [bed_number],
        (checkError, result) => {

            if (checkError) {
                console.log(checkError);

                return res.status(500).json({
                    error:
                        'Database error'
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    error:
                        'Bed number already exists'
                });
            }

            const sql = `
                INSERT INTO beds
                (
                    bed_number,
                    ward,
                    bed_type,
                    status
                )
                VALUES (?, ?, ?, 'Available')
            `;

            db.query(
                sql,
                [
                    bed_number,
                    ward,
                    bed_type
                ],
                (err, result) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            error:
                                'Unable to add bed'
                        });
                    }

                    res.json({
                        message:
                            'Bed added successfully',
                        bed_id:
                            result.insertId
                    });
                }
            );
        }
    );
});


// =====================================================
// ASSIGN BED
// =====================================================

admin.post('/beds/assign', (req, res) => {

    const {
        bed_id,
        inpatient_id
    } = req.body;

    if (!bed_id || !inpatient_id) {
        return res.status(400).json({
            error:
                'Bed and inpatient are required'
        });
    }


    // =================================================
    // CHECK BED
    // =================================================

    const bedSql = `
        SELECT *
        FROM beds
        WHERE bed_id = ?
    `;

    db.query(
        bedSql,
        [bed_id],
        (bedError, bedResult) => {

            if (bedError) {
                console.log(bedError);

                return res.status(500).json({
                    error:
                        'Database error'
                });
            }

            if (bedResult.length === 0) {
                return res.status(404).json({
                    error:
                        'Bed not found'
                });
            }

            if (
                bedResult[0].status ===
                'Occupied'
            ) {
                return res.status(400).json({
                    error:
                        'Bed is already occupied'
                });
            }


            // =================================================
            // CHECK INPATIENT
            // =================================================

            const inpatientSql = `
                SELECT
                    i.inpatient_id,
                    i.patient_id,
                    i.status,
                    p.patient_type
                FROM inpatients i

                JOIN patient p
                    ON i.patient_id = p.patient_id

                WHERE i.inpatient_id = ?
                AND i.status = 'Admitted'
            `;

            db.query(
                inpatientSql,
                [inpatient_id],
                (inpatientError, inpatientResult) => {

                    if (inpatientError) {
                        console.log(inpatientError);

                        return res.status(500).json({
                            error:
                                'Database error'
                        });
                    }

                    if (
                        inpatientResult.length === 0
                    ) {
                        return res.status(404).json({
                            error:
                                'Admitted inpatient not found'
                        });
                    }

                    if (
                        inpatientResult[0]
                            .patient_type !==
                        'Inpatient'
                    ) {
                        return res.status(400).json({
                            error:
                                'Only Inpatient patients can be assigned a bed'
                        });
                    }


                    // =================================================
                    // CHECK EXISTING BED
                    // =================================================

                    const existingSql = `
                        SELECT *
                        FROM bed_assignments
                        WHERE inpatient_id = ?
                        AND status = 'Occupied'
                    `;

                    db.query(
                        existingSql,
                        [inpatient_id],
                        (existingError, existingResult) => {

                            if (existingError) {
                                console.log(existingError);

                                return res.status(500).json({
                                    error:
                                        'Database error'
                                });
                            }

                            if (
                                existingResult.length > 0
                            ) {
                                return res.status(400).json({
                                    error:
                                        'Patient already has an occupied bed'
                                });
                            }


                            // =================================================
                            // ASSIGN BED
                            // =================================================

                            const insertSql = `
                                INSERT INTO bed_assignments
                                (
                                    bed_id,
                                    inpatient_id,
                                    assigned_date,
                                    status
                                )
                                VALUES
                                (
                                    ?,
                                    ?,
                                    CURRENT_TIMESTAMP,
                                    'Occupied'
                                )
                            `;

                            db.query(
                                insertSql,
                                [
                                    bed_id,
                                    inpatient_id
                                ],
                                (insertError) => {

                                    if (insertError) {
                                        console.log(insertError);

                                        return res.status(500).json({
                                            error:
                                                'Unable to assign bed'
                                        });
                                    }


                                    // =====================================
                                    // UPDATE BED STATUS
                                    // =====================================

                                    const updateBedSql = `
                                        UPDATE beds
                                        SET status = 'Occupied'
                                        WHERE bed_id = ?
                                    `;

                                    db.query(
                                        updateBedSql,
                                        [bed_id],
                                        (updateError) => {

                                            if (updateError) {
                                                console.log(updateError);

                                                return res.status(500).json({
                                                    error:
                                                        'Unable to update bed status'
                                                });
                                            }

                                            res.json({
                                                message:
                                                    'Bed assigned successfully'
                                            });
                                        }
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
// RELEASE BED
// =====================================================

admin.post('/beds/release', (req, res) => {

    const {
        assignment_id,
        bed_id
    } = req.body;


    if (
        !assignment_id &&
        !bed_id
    ) {
        return res.status(400).json({
            error:
                'Assignment ID or bed ID is required'
        });
    }


    // =================================================
    // RELEASE USING ASSIGNMENT ID
    // =================================================

    if (assignment_id) {

        const findSql = `
            SELECT
                assignment_id,
                bed_id
            FROM bed_assignments
            WHERE assignment_id = ?
            AND status = 'Occupied'
        `;

        db.query(
            findSql,
            [assignment_id],
            (findError, result) => {

                if (findError) {
                    console.log(findError);

                    return res.status(500).json({
                        error:
                            'Database error'
                    });
                }

                if (result.length === 0) {
                    return res.status(404).json({
                        error:
                            'Occupied bed assignment not found'
                    });
                }

                releaseAssignment(
                    result[0].assignment_id,
                    result[0].bed_id
                );
            }
        );

        return;
    }


    // =================================================
    // RELEASE USING BED ID
    // =================================================

    const findBedSql = `
        SELECT
            assignment_id,
            bed_id
        FROM bed_assignments
        WHERE bed_id = ?
        AND status = 'Occupied'
        LIMIT 1
    `;

    db.query(
        findBedSql,
        [bed_id],
        (findError, result) => {

            if (findError) {
                console.log(findError);

                return res.status(500).json({
                    error:
                        'Database error'
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    error:
                        'Occupied bed assignment not found'
                });
            }

            releaseAssignment(
                result[0].assignment_id,
                result[0].bed_id
            );
        }
    );


    // =================================================
    // RELEASE ASSIGNMENT FUNCTION
    // =================================================

    function releaseAssignment(
        assignmentId,
        bedId
    ) {

        const assignmentSql = `
            UPDATE bed_assignments
            SET
                status = 'Released',
                released_date = CURRENT_TIMESTAMP
            WHERE assignment_id = ?
            AND status = 'Occupied'
        `;

        db.query(
            assignmentSql,
            [assignmentId],
            (assignmentError, assignmentResult) => {

                if (assignmentError) {
                    console.log(assignmentError);

                    return res.status(500).json({
                        error:
                            'Unable to release assignment'
                    });
                }

                if (
                    assignmentResult.affectedRows === 0
                ) {
                    return res.status(404).json({
                        error:
                            'Occupied bed assignment not found'
                    });
                }


                const bedSql = `
                    UPDATE beds
                    SET status = 'Available'
                    WHERE bed_id = ?
                `;

                db.query(
                    bedSql,
                    [bedId],
                    (bedError) => {

                        if (bedError) {
                            console.log(bedError);

                            return res.status(500).json({
                                error:
                                    'Unable to update bed'
                            });
                        }

                        res.json({
                            message:
                                'Bed released successfully'
                        });
                    }
                );
            }
        );
    }
});


// =====================================================
// DELETE BED
// =====================================================

admin.post('/beds/delete', (req, res) => {

    const {
        bed_id
    } = req.body;

    if (!bed_id) {
        return res.status(400).json({
            error:
                'Bed ID is required'
        });
    }


    // Do not delete occupied beds.

    const checkSql = `
        SELECT *
        FROM beds
        WHERE bed_id = ?
        AND status = 'Occupied'
    `;

    db.query(
        checkSql,
        [bed_id],
        (checkError, result) => {

            if (checkError) {
                console.log(checkError);

                return res.status(500).json({
                    error:
                        'Database error'
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    error:
                        'Cannot delete an occupied bed'
                });
            }


            const sql = `
                DELETE FROM beds
                WHERE bed_id = ?
            `;

            db.query(
                sql,
                [bed_id],
                (err, result) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            error:
                                'Unable to delete bed'
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            error:
                                'Bed not found'
                        });
                    }

                    res.json({
                        message:
                            'Bed deleted successfully'
                    });
                }
            );
        }
    );
});


// =====================================================
// GET BED ASSIGNMENTS
// =====================================================

admin.get('/bed-assignments', (req, res) => {

    const sql = `
        SELECT
            ba.assignment_id,
            ba.assigned_date,
            ba.released_date,
            ba.status,

            b.bed_id,
            b.bed_number,
            b.ward,
            b.bed_type,

            i.inpatient_id,
            i.admission_date,
            i.discharge_date,

            p.patient_id,
            p.first_name,
            p.last_name,
            p.phone_no,
            p.disease,
            p.patient_type

        FROM bed_assignments ba

        JOIN beds b
            ON ba.bed_id = b.bed_id

        JOIN inpatients i
            ON ba.inpatient_id = i.inpatient_id

        JOIN patient p
            ON i.patient_id = p.patient_id

        ORDER BY ba.assignment_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error:
                    'Unable to fetch bed assignments'
            });
        }

        res.json(result);
    });
});


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

admin.get('/dashboard', (req, res) => {

    const queries = {

        doctors: `
            SELECT COUNT(*) AS count
            FROM doctors
        `,

        patients: `
            SELECT COUNT(*) AS count
            FROM patient
        `,

        staff: `
            SELECT COUNT(*) AS count
            FROM admin
        `,

        appointments: `
            SELECT COUNT(*) AS count
            FROM appointments
            WHERE status = 'Scheduled'
        `,

        inpatients: `
            SELECT COUNT(*) AS count
            FROM inpatients
            WHERE status = 'Admitted'
        `,

        availableBeds: `
            SELECT COUNT(*) AS count
            FROM beds
            WHERE status = 'Available'
        `,

        occupiedBeds: `
            SELECT COUNT(*) AS count
            FROM beds
            WHERE status = 'Occupied'
        `
    };

    db.query(
        queries.doctors,
        (doctorError, doctorResult) => {

            if (doctorError) {
                console.log(doctorError);

                return res.status(500).json({
                    error:
                        'Unable to load dashboard'
                });
            }

            db.query(
                queries.patients,
                (patientError, patientResult) => {

                    if (patientError) {
                        console.log(patientError);

                        return res.status(500).json({
                            error:
                                'Unable to load dashboard'
                        });
                    }

                    db.query(
                        queries.staff,
                        (staffError, staffResult) => {

                            if (staffError) {
                                console.log(staffError);

                                return res.status(500).json({
                                    error:
                                        'Unable to load dashboard'
                                });
                            }

                            db.query(
                                queries.appointments,
                                (
                                    appointmentError,
                                    appointmentResult
                                ) => {

                                    if (appointmentError) {
                                        console.log(
                                            appointmentError
                                        );

                                        return res.status(500).json({
                                            error:
                                                'Unable to load dashboard'
                                        });
                                    }

                                    db.query(
                                        queries.inpatients,
                                        (
                                            inpatientError,
                                            inpatientResult
                                        ) => {

                                            if (inpatientError) {
                                                console.log(
                                                    inpatientError
                                                );

                                                return res.status(500).json({
                                                    error:
                                                        'Unable to load dashboard'
                                                });
                                            }

                                            db.query(
                                                queries.availableBeds,
                                                (
                                                    availableError,
                                                    availableResult
                                                ) => {

                                                    if (availableError) {
                                                        console.log(
                                                            availableError
                                                        );

                                                        return res.status(500).json({
                                                            error:
                                                                'Unable to load dashboard'
                                                        });
                                                    }

                                                    db.query(
                                                        queries.occupiedBeds,
                                                        (
                                                            occupiedError,
                                                            occupiedResult
                                                        ) => {

                                                            if (occupiedError) {
                                                                console.log(
                                                                    occupiedError
                                                                );

                                                                return res.status(500).json({
                                                                    error:
                                                                        'Unable to load dashboard'
                                                                });
                                                            }

                                                            res.json({
                                                                doctors:
                                                                    doctorResult[0].count,

                                                                patients:
                                                                    patientResult[0].count,

                                                                staff:
                                                                    staffResult[0].count,

                                                                appointments:
                                                                    appointmentResult[0].count,

                                                                inpatients:
                                                                    inpatientResult[0].count,

                                                                availableBeds:
                                                                    availableResult[0].count,

                                                                occupiedBeds:
                                                                    occupiedResult[0].count
                                                            });
                                                        }
                                                    );
                                                }
                                            );
                                        }
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
// EXPORT
// =====================================================

module.exports = admin;