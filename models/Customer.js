const oracledb = require('oracledb');
const db = require('../config/db');

class Customer {
    static async createCustomer(data) {
        const conn = await db();
        const { userName, dob, mobile, emailId, adhaar, pan, address, workAddress, startDate, endDate, noticeInd, bedNo, roomNo, rent, emergencyNo, createdBy, roomType,studentInd} = data;

          // SQL query to check if the bed is available
    const checkBedSql = `
    SELECT 1 
    FROM AARYA.ROOM_DETAILS 
    WHERE ROOM_NO = :roomNo AND BED_NO = :bedNo AND AVAILABLE = 'Y'
`;


const sql = `
    INSERT INTO AARYA.CUSTOMERS 
    (USER_ID, USER_NAME, ROLE_IND, DOB, MOBILE, EMAIL_ID, ADHAAR, PAN, ADDRESS, STUDENT_IND, WORK_ADDRESS, START_DATE, END_DATE, NOTICE_IND, BED_NO, ACTIVE, CREATION_DATE, CREATED_BY, LAST_UPDATED, LAST_UPDATED_BY, ROOM_NO, RENT, EMERGENCY_NO, ROOM_TYPE) 
    VALUES 
    (AARYA.CUSTOMER_ID_SEQ.NEXTVAL, :userName, 'USER', :dob, :mobile, :emailId, :adhaar, :pan, :address, :studentInd, :workAddress, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), :noticeInd, :bedNo, 'Y', SYSDATE, :createdBy, SYSDATE, :createdBy, :roomNo, :rent, :emergencyNo, :roomType)`;

const binds = {
    userName, dob, mobile, emailId, adhaar, pan, address,studentInd, workAddress, startDate, endDate, noticeInd, bedNo, createdBy, roomNo, rent, emergencyNo, roomType
};


        try {
        // Check if the bed is available
        const checkResult = await conn.execute(checkBedSql, { roomNo, bedNo });
        if (checkResult.rows.length === 0) {
            throw new Error('The specified bed is not available.');
        }


            // Insert the customer into the database
            await conn.execute(sql, binds, { autoCommit: true });
            //once customer is created, update the room_details table to mark the bed as unavailable
            const updateRoomSql = `
            UPDATE AARYA.ROOM_DETAILS
            SET AVAILABLE = 'N'
            WHERE ROOM_NO = :roomNo AND BED_NO = :bedNo
        `;
        const updateRoomBinds = { roomNo, bedNo };
        await conn.execute(updateRoomSql, updateRoomBinds, { autoCommit: true });
        
            return { message: 'Customer created successfully' };
        } catch (err) {
            console.error('Customer creation error:', err);
            throw err;
        } finally {
            conn.close();
        }
    }
    static async updateCustomer(userId, data) {
        const conn = await db();
    
        // Base SQL query with placeholders
        let sql = `UPDATE AARYA.CUSTOMERS SET `;
        const binds = { userId };
        const fields = [];
    
        // Check each field and add it to the query if it exists in the data object
        if (data.userName) {
            fields.push(`USER_NAME = :userName`);
            binds.userName = data.userName;
        }
        if (data.dob) {
            fields.push(`DOB = :dob`);
            binds.dob = data.dob;
        }
        if (data.mobile) {
            fields.push(`MOBILE = :mobile`);
            binds.mobile = data.mobile;
        }
        if (data.emailId) {
            fields.push(`EMAIL_ID = :emailId`);
            binds.emailId = data.emailId;
        }
        if (data.adhaar) {
            fields.push(`ADHAAR = :adhaar`);
            binds.adhaar = data.adhaar;
        }
        if (data.pan) {
            fields.push(`PAN = :pan`);
            binds.pan = data.pan;
        }
        if (data.address) {
            fields.push(`ADDRESS = :address`);
            binds.address = data.address;
        }
        if (data.workAddress) {
            fields.push(`WORK_ADDRESS = :workAddress`);
            binds.workAddress = data.workAddress;
        }
        if (data.startDate) {
            fields.push(`START_DATE = TO_DATE(:startDate, 'YYYY-MM-DD')`);
            binds.startDate = data.startDate;
        }
        if (data.endDate) {
            fields.push(`END_DATE = TO_DATE(:endDate, 'YYYY-MM-DD')`);
            binds.endDate = data.endDate;
        }
        if (data.noticeInd) {
            fields.push(`NOTICE_IND = :noticeInd`);
            binds.noticeInd = data.noticeInd;
        }
        if (data.bedNo) {
            fields.push(`BED_NO = :bedNo`);
            binds.bedNo = data.bedNo;
        }
        if (data.roomNo) {
            fields.push(`ROOM_NO = :roomNo`);
            binds.roomNo = data.roomNo;
        }
        if (data.rent) {
            fields.push(`RENT = :rent`);
            binds.rent = data.rent;
        }
        if (data.emergencyNo) {
            fields.push(`EMERGENCY_NO = :emergencyNo`);
            binds.emergencyNo = data.emergencyNo;
        }
        if(data.roomType){
            fields.push(`ROOM_TYPE = :roomType`);
            binds.roomType = data.roomType;
        }
        if (data.lastUpdatedBy) {
            fields.push(`LAST_UPDATED_BY = :lastUpdatedBy`);
            binds.lastUpdatedBy = data.lastUpdatedBy;
        }
    
        // Add last updated timestamp
        fields.push(`LAST_UPDATED = SYSDATE`);
    
        // Construct final SQL query
        sql += fields.join(', ') + ` WHERE USER_ID = :userId`;
    
        try {
            const result = await conn.execute(sql, binds, { autoCommit: true });
            if (result.rowsAffected === 0) {
                return { message: 'Customer not found', status: 404 };
            }
            return { message: 'Customer updated successfully' };
        } catch (err) {
            console.error('Customer update error:', err);
            throw err;
        } finally {
            conn.close();
        }
    }
    
    //for delete make active = 'N'
    static async deleteCustomer(userId, lastUpdatedBy) {
        const conn = await db();
        const sql = `
            UPDATE AARYA.CUSTOMERS 
            SET ACTIVE = 'N', 
                LAST_UPDATED = current_date, 
                LAST_UPDATED_BY = :lastUpdatedBy,
                end_date=current_date  
            WHERE USER_ID = :userId
        `;
        const binds = { userId, lastUpdatedBy };
    
        try {
            const result = await conn.execute(sql, binds, { autoCommit: true });
            
            if (result.rowsAffected === 0) {
                return { message: 'Customer not found', status: 404 };
            }
    
            return { message: 'Customer deleted successfully', status: 200 };
        } catch (err) {
            console.error('Customer deletion error:', err);
            throw err;
        } finally {
            conn.close();
        }
    }
    //for get all customers
    static async getAllCustomers() {
        const conn = await db();
        const sql = `SELECT * FROM AARYA.CUSTOMERS order by LAST_UPDATED DESC`;
    
        try {
            const result = await conn.execute(sql);
            
            // Convert rows to JSON format
            const customers = result.rows.map(row => ({
                user_id: row[0],
                user_name: row[1],
                // role_ind: row[2],
                dob: row[3],
                mobile: row[4],
                email_id: row[5],
                adhaar: row[6],
                pan: row[7],
                address: row[8],
                // student_ind: row[9],
                work_address: row[10],
                start_date: row[11]? row[11].toISOString().split('T')[0] : null,
                end_date: row[12] ? row[12].toISOString().split('T')[0] : null,
                notice_ind: row[13],
                bed_no: row[14],
                active: row[15],
                // creation_date: row[16]  ? row[16].toISOString().split('T')[0] : null,
                // created_by: row[17],
                // last_updated: row[18] ? row[18].toISOString().split('T')[0] : null,
                // last_updated_by: row[19],
                room_no: row[20],
                // photo: row[21],
                rent: row[22],
                emergency_no: row[23],
                room_type: row[24]
            }));
            
            return { customers };
        } catch (err) {
            console.error('Get all customers error:', err);
            throw err;
        } finally {
            conn.close();
        }
    }
    
    // Get customer by ID
    static async getCustomerById(userId) {
        console.log('userId:', userId);  // Debugging log
        // userId =1;
        
        const conn = await db();
        const sql = `
            SELECT 
                *
            FROM AARYA.CUSTOMERS 
            WHERE USER_ID = :userId
        `;
        const binds = { userId };
    
        try {
  // Debugging log
            const result = await conn.execute(sql, binds, { outFormat: conn.OBJECT });

            const customers = result.rows.map(row => ({
                user_id: row[0],
                user_name: row[1],
                // role_ind: row[2],
                dob: row[3],
                mobile: row[4],
                email_id: row[5],
                adhaar: row[6],
                pan: row[7],
                address: row[8],
                // student_ind: row[9],
                work_address: row[10],
                start_date: row[11]? row[11].toISOString().split('T')[0] : null,
                end_date: row[12] ? row[12].toISOString().split('T')[0] : null,
                notice_ind: row[13],
                bed_no: row[14],
                active: row[15],
                // creation_date: row[16]  ? row[16].toISOString().split('T')[0] : null,
                // created_by: row[17],
                // last_updated: row[18] ? row[18].toISOString().split('T')[0] : null,
                // last_updated_by: row[19],
                room_no: row[20],
                // photo: row[21],
                rent: row[22],
                emergency_no: row[23],
                room_type: row[24]
            }));
            
            if (result.rows.length === 0) {
                return { message: 'Customer not found', status: 404 };
            }
    
            return { customers, status: 200 };
        } catch (err) {
            console.error('Error retrieving customer by ID:', err);
            throw err;
        } finally {
            conn.close();
        }
    }
    
    
    


    
    
}

module.exports = Customer;
