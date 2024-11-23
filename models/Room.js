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
}
module.exports=Room;