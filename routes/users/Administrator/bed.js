const express = require('express');

const bed = express.Router();

const db = require('../../../utils/db');


// =====================================================
// GET ALL BEDS
// =====================================================

bed.get('/beds', (req, res) => {

    const sql = `
        SELECT
            b.bed_id,
            b.bed_number,
            b.ward,
            b.bed_type,
            b.status,

            ba.assignment_id,
            ba.inpatient_id,
            ba.assigned_date,

            i.patient_id,

            p.first_name,
            p.last_name,
            p.phone_no,
            p.disease

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
                error: 'Unable to fetch beds'
            });
        }

        res.json(result);
    });
});


// =====================================================
// ADD NEW BED
// =====================================================

bed.post('/beds', (req, res) => {

    const {
        bed_number,
        ward,
        bed_type
    } = req.body;


    if (!bed_number || !ward || !bed_type) {

        return res.status(400).json({
            error: 'Bed number, ward and bed type are required'
        });
    }


    const checkSql = `
        SELECT *
        FROM beds
        WHERE bed_number = ?
    `;


    db.query(
        checkSql,
        [bed_number],
        (checkError, checkResult) => {

            if (checkError) {

                console.log(checkError);

                return res.status(500).json({
                    error: 'Database error'
                });
            }


            if (checkResult.length > 0) {

                return res.status(400).json({
                    error: 'Bed number already exists'
                });
            }


            const insertSql = `
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
                insertSql,
                [
                    bed_number,
                    ward,
                    bed_type
                ],
                (insertError, result) => {

                    if (insertError) {

                        console.log(insertError);

                        return res.status(500).json({
                            error: 'Unable to add bed'
                        });
                    }


                    res.json({
                        message: 'Bed added successfully',
                        bed_id: result.insertId
                    });
                }
            );
        }
    );
});


// =====================================================
// GET ONLY ADMITTED INPATIENTS
// =====================================================

bed.get('/inpatients', (req, res) => {

    const sql = `
        SELECT
            i.inpatient_id,
            i.patient_id,
            i.admission_date,
            i.status,

            p.first_name,
            p.last_name,
            p.phone_no,
            p.email,
            p.disease,
            p.address

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
                error: 'Unable to fetch inpatients'
            });
        }

        res.json(result);
    });
});


// =====================================================
// ASSIGN BED TO INPATIENT
// =====================================================

bed.post('/beds/assign', (req, res) => {

    const {
        bed_id,
        inpatient_id
    } = req.body;


    if (!bed_id || !inpatient_id) {

        return res.status(400).json({
            error: 'Bed and inpatient are required'
        });
    }


    // -------------------------------------------------
    // CHECK BED
    // -------------------------------------------------

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
                    error: 'Database error'
                });
            }


            if (bedResult.length === 0) {

                return res.status(404).json({
                    error: 'Bed not found'
                });
            }


            if (bedResult[0].status === 'Occupied') {

                return res.status(400).json({
                    error: 'This bed is already occupied'
                });
            }


            // -----------------------------------------
            // CHECK INPATIENT
            // -----------------------------------------

            const inpatientSql = `
                SELECT *
                FROM inpatients
                WHERE inpatient_id = ?
                AND status = 'Admitted'
            `;


            db.query(
                inpatientSql,
                [inpatient_id],
                (inpatientError, inpatientResult) => {

                    if (inpatientError) {

                        console.log(inpatientError);

                        return res.status(500).json({
                            error: 'Database error'
                        });
                    }


                    if (inpatientResult.length === 0) {

                        return res.status(400).json({
                            error: 'Only admitted inpatients can be assigned a bed'
                        });
                    }


                    // ---------------------------------
                    // CHECK WHETHER PATIENT ALREADY
                    // HAS A BED
                    // ---------------------------------

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
                                    error: 'Database error'
                                });
                            }


                            if (existingResult.length > 0) {

                                return res.status(400).json({
                                    error: 'This inpatient already has a bed'
                                });
                            }


                            // -----------------------------
                            // ASSIGN BED
                            // -----------------------------

                            const assignmentSql = `
                                INSERT INTO bed_assignments
                                (
                                    bed_id,
                                    inpatient_id,
                                    status
                                )
                                VALUES (?, ?, 'Occupied')
                            `;


                            db.query(
                                assignmentSql,
                                [
                                    bed_id,
                                    inpatient_id
                                ],
                                (assignmentError) => {

                                    if (assignmentError) {

                                        console.log(assignmentError);

                                        return res.status(500).json({
                                            error: 'Unable to assign bed'
                                        });
                                    }


                                    // -------------------------
                                    // UPDATE BED STATUS
                                    // -------------------------

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
                                                    error: 'Bed assigned but status update failed'
                                                });
                                            }


                                            res.json({
                                                message: 'Bed assigned successfully'
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

bed.post('/beds/release', (req, res) => {

    const {
        bed_id
    } = req.body;


    if (!bed_id) {

        return res.status(400).json({
            error: 'Bed ID is required'
        });
    }


    const assignmentSql = `
        SELECT *
        FROM bed_assignments
        WHERE bed_id = ?
        AND status = 'Occupied'
    `;


    db.query(
        assignmentSql,
        [bed_id],
        (assignmentError, assignmentResult) => {

            if (assignmentError) {

                console.log(assignmentError);

                return res.status(500).json({
                    error: 'Database error'
                });
            }


            if (assignmentResult.length === 0) {

                return res.status(400).json({
                    error: 'This bed is not currently occupied'
                });
            }


            const assignmentId =
                assignmentResult[0].assignment_id;


            const updateAssignmentSql = `
                UPDATE bed_assignments
                SET
                    status = 'Released',
                    released_date = CURRENT_TIMESTAMP
                WHERE assignment_id = ?
            `;


            db.query(
                updateAssignmentSql,
                [assignmentId],
                (updateError) => {

                    if (updateError) {

                        console.log(updateError);

                        return res.status(500).json({
                            error: 'Unable to release bed'
                        });
                    }


                    const updateBedSql = `
                        UPDATE beds
                        SET status = 'Available'
                        WHERE bed_id = ?
                    `;


                    db.query(
                        updateBedSql,
                        [bed_id],
                        (bedError) => {

                            if (bedError) {

                                console.log(bedError);

                                return res.status(500).json({
                                    error: 'Bed released but status update failed'
                                });
                            }


                            res.json({
                                message: 'Bed released successfully'
                            });
                        }
                    );
                }
            );
        }
    );
});


// =====================================================
// DELETE BED
// =====================================================

bed.post('/beds/delete', (req, res) => {

    const {
        bed_id
    } = req.body;


    if (!bed_id) {

        return res.status(400).json({
            error: 'Bed ID is required'
        });
    }


    const checkSql = `
        SELECT *
        FROM beds
        WHERE bed_id = ?
        AND status = 'Occupied'
    `;


    db.query(
        checkSql,
        [bed_id],
        (checkError, checkResult) => {

            if (checkError) {

                console.log(checkError);

                return res.status(500).json({
                    error: 'Database error'
                });
            }


            if (checkResult.length > 0) {

                return res.status(400).json({
                    error: 'Cannot delete an occupied bed'
                });
            }


            const deleteSql = `
                DELETE FROM beds
                WHERE bed_id = ?
            `;


            db.query(
                deleteSql,
                [bed_id],
                (deleteError, result) => {

                    if (deleteError) {

                        console.log(deleteError);

                        return res.status(500).json({
                            error: 'Unable to delete bed'
                        });
                    }


                    if (result.affectedRows === 0) {

                        return res.status(404).json({
                            error: 'Bed not found'
                        });
                    }


                    res.json({
                        message: 'Bed deleted successfully'
                    });
                }
            );
        }
    );
});


module.exports = bed;