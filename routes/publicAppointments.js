const express = require('express');

const router = express.Router();

const db = require('../utils/db');


// =====================================================
// GET ALL DOCTORS
// =====================================================

router.get('/doctors', (req, res) => {

    const sql = `
        SELECT
            doctor_id,
            first_name,
            last_name,
            specialisation,
            shift_time
        FROM doctors
        ORDER BY first_name ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(
                'Public doctor list error:',
                err
            );

            return res.status(500).json({
                error: 'Database error'
            });
        }

        return res.json(result);
    });
});


// =====================================================
// CHECK DOCTOR AVAILABILITY
// =====================================================

router.get('/availability', (req, res) => {

    const doctor_id =
        req.query.doctor_id;

    const appointment_date =
        req.query.appointment_date;


    if (!doctor_id || !appointment_date) {

        return res.status(400).json({
            error:
                'Doctor and appointment date are required'
        });
    }


    const doctorSql = `
        SELECT
            doctor_id,
            first_name,
            last_name,
            specialisation,
            shift_time
        FROM doctors
        WHERE doctor_id = ?
    `;


    db.query(
        doctorSql,
        [doctor_id],
        (doctorError, doctorResult) => {

            if (doctorError) {

                console.log(
                    'Doctor availability error:',
                    doctorError
                );

                return res.status(500).json({
                    error: 'Database error'
                });
            }


            if (doctorResult.length === 0) {

                return res.status(404).json({
                    error: 'Doctor not found'
                });
            }


            const doctor =
                doctorResult[0];


            const shift =
                doctor.shift_time || '';


            const shiftMatch =
                shift.match(
                    /(\d{1,2})\s*(AM|PM)\s*[-–]\s*(\d{1,2})\s*(AM|PM)/i
                );


            if (!shiftMatch) {

                return res.status(400).json({
                    error:
                        'Doctor shift format is invalid'
                });
            }


            let startHour =
                parseInt(shiftMatch[1]);

            const startPeriod =
                shiftMatch[2].toUpperCase();


            let endHour =
                parseInt(shiftMatch[3]);

            const endPeriod =
                shiftMatch[4].toUpperCase();


            if (
                startPeriod === 'PM' &&
                startHour !== 12
            ) {

                startHour += 12;
            }


            if (
                startPeriod === 'AM' &&
                startHour === 12
            ) {

                startHour = 0;
            }


            if (
                endPeriod === 'PM' &&
                endHour !== 12
            ) {

                endHour += 12;
            }


            if (
                endPeriod === 'AM' &&
                endHour === 12
            ) {

                endHour = 0;
            }


            const appointmentSql = `
                SELECT
                    appointment_time
                FROM appointments
                WHERE doctor_id = ?
                AND appointment_date = ?
                AND status != 'Cancelled'
            `;


            db.query(
                appointmentSql,
                [
                    doctor_id,
                    appointment_date
                ],
                (
                    appointmentError,
                    appointmentResult
                ) => {

                    if (appointmentError) {

                        console.log(
                            'Appointment availability error:',
                            appointmentError
                        );

                        return res.status(500).json({
                            error:
                                'Database error'
                        });
                    }


                    const bookedTimes =
                        appointmentResult.map(
                            appointment => {

                                return String(
                                    appointment.appointment_time
                                ).substring(0, 5);

                            }
                        );


                    const slots = [];


                    for (
                        let hour = startHour;
                        hour < endHour;
                        hour++
                    ) {

                        const time =
                            `${String(hour).padStart(2, '0')}:00`;


                        if (
                            !bookedTimes.includes(time)
                        ) {

                            slots.push(time);
                        }
                    }


                    return res.json({

                        doctor_id:
                            doctor.doctor_id,

                        doctor_name:
                            `${doctor.first_name} ${doctor.last_name}`,

                        specialisation:
                            doctor.specialisation,

                        shift_time:
                            doctor.shift_time,

                        appointment_date:
                            appointment_date,

                        available_slots:
                            slots
                    });
                }
            );
        }
    );
});


// =====================================================
// CHECK PATIENT
// =====================================================

router.post('/check-patient', (req, res) => {

    const email =
        req.body.email;


    if (!email) {

        return res.status(400).json({
            error:
                'Patient email is required'
        });
    }


    const sql = `
        SELECT
            patient_id,
            first_name,
            last_name,
            email,
            phone_no
        FROM patient
        WHERE email = ?
    `;


    db.query(
        sql,
        [email],
        (err, result) => {

            if (err) {

                console.log(
                    'Patient check error:',
                    err
                );

                return res.status(500).json({
                    error: 'Database error'
                });
            }


            if (result.length === 0) {

                return res.status(404).json({
                    error:
                        'Patient not registered'
                });
            }


            return res.json({

                found: true,

                patient:
                    result[0]
            });
        }
    );
});


// =====================================================
// BOOK APPOINTMENT
// =====================================================

router.post('/book', (req, res) => {

    const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason
    } = req.body;


    console.log(
        'BOOK APPOINTMENT REQUEST:',
        {
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason
        }
    );


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


    // =================================================
    // CHECK PATIENT
    // =================================================

    const patientSql = `
        SELECT
            patient_id,
            first_name,
            last_name
        FROM patient
        WHERE patient_id = ?
    `;


    db.query(
        patientSql,
        [patient_id],
        (patientError, patientResult) => {

            if (patientError) {

                console.log(
                    'Patient validation error:',
                    patientError
                );

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


            // =============================================
            // CHECK DOCTOR
            // =============================================

            const doctorSql = `
                SELECT
                    doctor_id,
                    first_name,
                    last_name,
                    specialisation
                FROM doctors
                WHERE doctor_id = ?
            `;


            db.query(
                doctorSql,
                [doctor_id],
                (
                    doctorError,
                    doctorResult
                ) => {

                    if (doctorError) {

                        console.log(
                            'Doctor validation error:',
                            doctorError
                        );

                        return res.status(500).json({
                            error:
                                'Database error'
                        });
                    }


                    if (
                        doctorResult.length === 0
                    ) {

                        return res.status(404).json({
                            error:
                                'Doctor not found'
                        });
                    }


                    const doctor =
                        doctorResult[0];


                    // =========================================
                    // CHECK SLOT
                    // =========================================

                    const slotSql = `
                        SELECT
                            appointment_id
                        FROM appointments
                        WHERE doctor_id = ?
                        AND appointment_date = ?
                        AND appointment_time = ?
                        AND status != 'Cancelled'
                    `;


                    db.query(
                        slotSql,
                        [
                            doctor_id,
                            appointment_date,
                            appointment_time
                        ],
                        (
                            slotError,
                            slotResult
                        ) => {

                            if (slotError) {

                                console.log(
                                    'Appointment slot error:',
                                    slotError
                                );

                                return res.status(500).json({
                                    error:
                                        'Database error'
                                });
                            }


                            if (
                                slotResult.length > 0
                            ) {

                                return res.status(409).json({
                                    error:
                                        'This time slot is already booked'
                                });
                            }


                            // =========================================
                            // INSERT APPOINTMENT
                            // =========================================

                            const appointmentSql = `
                                INSERT INTO appointments
                                (
                                    patient_id,
                                    doctor_id,
                                    appointment_date,
                                    appointment_time,
                                    reason,
                                    status
                                )
                                VALUES
                                (
                                    ?,
                                    ?,
                                    ?,
                                    ?,
                                    ?,
                                    'Scheduled'
                                )
                            `;


                            db.query(
                                appointmentSql,
                                [
                                    patient_id,
                                    doctor_id,
                                    appointment_date,
                                    appointment_time,
                                    reason || null
                                ],
                                (
                                    appointmentError,
                                    appointmentResult
                                ) => {

                                    if (
                                        appointmentError
                                    ) {

                                        console.log(
                                            'Appointment insert error:',
                                            appointmentError
                                        );

                                        return res.status(500).json({
                                            error:
                                                'Appointment booking failed'
                                        });
                                    }


                                    const appointmentId =
                                        appointmentResult.insertId;


                                    console.log(
                                        'Appointment created:',
                                        appointmentId
                                    );


                                    // =========================================
                                    // CHECK ASSIGNMENT
                                    // =========================================

                                    const assignmentCheckSql = `
                                        SELECT
                                            doctor_id,
                                            patient_id
                                        FROM assign_doctor
                                        WHERE doctor_id = ?
                                        AND patient_id = ?
                                    `;


                                    db.query(
                                        assignmentCheckSql,
                                        [
                                            doctor_id,
                                            patient_id
                                        ],
                                        (
                                            assignmentCheckError,
                                            assignmentResult
                                        ) => {

                                            if (
                                                assignmentCheckError
                                            ) {

                                                console.log(
                                                    'Assignment check error:',
                                                    assignmentCheckError
                                                );

                                                return res.status(500).json({
                                                    error:
                                                        'Appointment created, but assignment check failed'
                                                });
                                            }


                                            // =====================================
                                            // ALREADY ASSIGNED
                                            // =====================================

                                            if (
                                                assignmentResult.length > 0
                                            ) {

                                                console.log(
                                                    'Patient already assigned to doctor'
                                                );


                                                return res.json({

                                                    success: true,

                                                    message:
                                                        'Appointment booked successfully',

                                                    appointment_id:
                                                        appointmentId,

                                                    patient_id:
                                                        patient_id,

                                                    doctor_id:
                                                        doctor_id,

                                                    doctor_name:
                                                        `${doctor.first_name} ${doctor.last_name}`,

                                                    specialisation:
                                                        doctor.specialisation,

                                                    appointment_date:
                                                        appointment_date,

                                                    appointment_time:
                                                        appointment_time,

                                                    reason:
                                                        reason || null,

                                                    status:
                                                        'Scheduled',

                                                    assigned:
                                                        true
                                                });
                                            }


                                            // =====================================
                                            // INSERT ASSIGNMENT
                                            // =====================================

                                            const assignmentSql = `
                                                INSERT INTO assign_doctor
                                                (
                                                    doctor_id,
                                                    patient_id
                                                )
                                                VALUES
                                                (
                                                    ?,
                                                    ?
                                                )
                                            `;


                                            db.query(
                                                assignmentSql,
                                                [
                                                    doctor_id,
                                                    patient_id
                                                ],
                                                (
                                                    assignmentError
                                                ) => {

                                                    if (
                                                        assignmentError
                                                    ) {

                                                        console.log(
                                                            '================================='
                                                        );

                                                        console.log(
                                                            'PATIENT ASSIGNMENT FAILED'
                                                        );

                                                        console.log(
                                                            assignmentError
                                                        );

                                                        console.log(
                                                            '================================='
                                                        );


                                                        return res.status(500).json({

                                                            error:
                                                                'Appointment created, but patient could not be assigned to doctor',

                                                            appointment_id:
                                                                appointmentId,

                                                            assignment_error:
                                                                assignmentError.message
                                                        });
                                                    }


                                                    console.log(
                                                        'Patient assigned successfully:',
                                                        {
                                                            doctor_id:
                                                                doctor_id,

                                                            patient_id:
                                                                patient_id
                                                        }
                                                    );


                                                    // =====================================
                                                    // FINAL SUCCESS
                                                    // =====================================

                                                    return res.json({

                                                        success:
                                                            true,

                                                        message:
                                                            'Appointment booked and patient assigned successfully',

                                                        appointment_id:
                                                            appointmentId,

                                                        patient_id:
                                                            patient_id,

                                                        doctor_id:
                                                            doctor_id,

                                                        doctor_name:
                                                            `${doctor.first_name} ${doctor.last_name}`,

                                                        specialisation:
                                                            doctor.specialisation,

                                                        appointment_date:
                                                            appointment_date,

                                                        appointment_time:
                                                            appointment_time,

                                                        reason:
                                                            reason || null,

                                                        status:
                                                            'Scheduled',

                                                        assigned:
                                                            true
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
});


module.exports = router;