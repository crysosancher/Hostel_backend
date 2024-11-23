const oracledb = require('oracledb');
const connect=require('../config/db');
class Room{
	static async getRoomRent(type){
		// search in db for room tarrif
		let connection;
		try {
			connection = await connect(); // Get a connection

			const sql = `
					SELECT PRICE FROM AARYA.TARRIF WHERE ROOM_TYPE = :type
			`;

			const binds = { type };
			const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
			const result = await connection.execute(sql, binds, options);
			return result;
		} catch (err) {
			throw err;
		} finally {
			if (connection) {
				try {
					await connection.close();
				} catch (closeErr) {
					console.error('Error closing OracleDB connection:', closeErr);
				}
			}
		}

	}
	static async getNumberAvailableRooms(type){
		// search in db for number of available rooms
		let connection;
		try {
			connection = await connect(); // Get a connection

			const sql = `
					SELECT 
    COUNT(DISTINCT ROOM_NO) AS Available_Rooms,
    COUNT(DISTINCT BED_NO) AS TOTAL_BEDS
FROM AARYA.ROOM_DETAILS
WHERE ROOM_TYPE = :type
  AND AVAILABLE = 'Y'
			`;

			const binds = { type };
			const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
			const result = await connection.execute(sql, binds, options);
			return result;
		} catch (err) {
			throw err;
		} finally {
			if (connection) {
				try {
					await connection.close();
				} catch (closeErr) {
					console.error('Error closing OracleDB connection:', closeErr);
				}
			}
		}
	}
	static async getRoomNumber(type){
		// search in db for number of available rooms
		let connection;
		try {
			connection = await connect(); // Get a connection

			const sql = `
					SELECT DISTINCT 
    ROOM_NO 
FROM AARYA.ROOM_DETAILS 
WHERE ROOM_TYPE = :type`;
			const binds = { type };
			const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
			const result = await connection.execute(sql, binds, options);
			return result;
		} catch (err) {
			throw err;
		} finally {
			if (connection) {
				try {
					await connection.close();
				} catch (closeErr) {
					console.error('Error closing OracleDB connection:', closeErr);
				}
			}
		}


	}
	static async getAllRoomTypesDetails(){
		// This method will return like:
		/* [{
		"roomType: "1",
		"availableRooms": 10,
		"totalRooms": 20,
		"totalBeds": 40,
		"totalBeds":50
		}
		
		]  */
		let connection;
		try {
			connection = await connect(); // Get a connection

			const sql = `
				SELECT 
    ROOM_TYPE,
    COUNT(DISTINCT CASE WHEN AVAILABLE = 'Y' THEN ROOM_NO END) AS Available_Rooms,
    COUNT(DISTINCT ROOM_NO) AS TOTAL_ROOMS,
    COUNT(DISTINCT CASE WHEN AVAILABLE = 'Y' THEN BED_NO END) AS Available_Beds,
    COUNT(DISTINCT BED_NO) AS TOTAL_BEDS
FROM AARYA.ROOM_DETAILS
GROUP BY ROOM_TYPE
			`;

			const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
			const result = await connection.execute(sql, [], options);
			let data=result.rows;
			return data;
		} catch (err) {
			throw err;
		} finally {
			if (connection) {
				try {
					await connection.close();
				} catch (closeErr) {
					console.error('Error closing OracleDB connection:', closeErr);
				}
			}
		}
		
	}
}
module.exports=Room;