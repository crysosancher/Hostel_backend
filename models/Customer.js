const oracledb = require('oracledb');
const db = require('../config/db');

class Customer {
    static async createCustomer(data) {
        const conn = await db();
        const { userName, dob, mobile, emailId, adhaar, pan, address, workAddress, startDate, endDate, noticeInd, bedNo, roomNo, rent, emergencyNo, createdBy } = data;
        
        const sql = `
            INSERT INTO AARYA.CUSTOMERS 
            (USER_ID, USER_NAME, ROLE_IND, DOB, MOBILE, EMAIL_ID, ADHAAR, PAN, ADDRESS, STUDENT_IND, WORK_ADDRESS, START_DATE, END_DATE, NOTICE_IND, BED_NO, ACTIVE, CREATION_DATE, CREATED_BY, LAST_UPDATED, LAST_UPDATED_BY, ROOM_NO, RENT, EMERGENCY_NO) 
            VALUES 
            (AARYA.CUSTOMER_ID_SEQ.NEXTVAL, :userName, 'USER', :dob, :mobile, :emailId, :adhaar, :pan, :address, 'Y', :workAddress, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), :noticeInd, :bedNo, 'Y', SYSDATE, :createdBy, SYSDATE, :createdBy, :roomNo, :rent, :emergencyNo)`;

        const binds = {
            userName, dob, mobile, emailId, adhaar, pan, address, workAddress, startDate, endDate, noticeInd, bedNo, createdBy, roomNo, rent, emergencyNo
        };

        try {
            await conn.execute(sql, binds, { autoCommit: true });
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
        const { userName, dob, mobile, emailId, adhaar, pan, address, workAddress, startDate, endDate, noticeInd, bedNo, roomNo, rent, emergencyNo, lastUpdatedBy } = data;
    
        const sql = `
            UPDATE AARYA.CUSTOMERS SET
                USER_NAME = :userName,
                DOB = :dob,
                MOBILE = :mobile,
                EMAIL_ID = :emailId,
                ADHAAR = :adhaar,
                PAN = :pan,
                ADDRESS = :address,
                WORK_ADDRESS = :workAddress,
                START_DATE = TO_DATE(:startDate, 'YYYY-MM-DD'),
                END_DATE = TO_DATE(:endDate, 'YYYY-MM-DD'),
                NOTICE_IND = :noticeInd,
                BED_NO = :bedNo,
                ROOM_NO = :roomNo,
                RENT = :rent,
                EMERGENCY_NO = :emergencyNo,
                LAST_UPDATED = SYSDATE,
                LAST_UPDATED_BY = :lastUpdatedBy
            WHERE USER_ID = :userId`;
    
        const binds = {
            userId, userName, dob, mobile, emailId, adhaar, pan, address, workAddress, startDate, endDate, noticeInd, bedNo, roomNo, rent, emergencyNo, lastUpdatedBy
        };
    
        try {
            const result = await conn.execute(sql, binds, { autoCommit: true });    
            if (result.rowsAffected === 0) {
                
                //return status code 
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
    static async deleteCustomer(userId) {
        const conn = await db();
        const sql = `UPDATE AARYA.CUSTOMERS SET ACTIVE = 'N' WHERE USER_ID = :userId`;
        const binds = { userId };
    
        try {
            const result = await conn.execute(sql, binds, { autoCommit: true });
            
            if (result.rowsAffected === 0) {
                return { message: 'Customer not found' };
            }
    
            return { message: 'Customer deleted successfully' };
        } catch (err) {
            console.error('Customer deletion error:', err);
            throw err;
        } finally {
            conn.close();
        }
    }
    
}

module.exports = Customer;
