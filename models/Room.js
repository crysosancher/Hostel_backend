const oracledb = require("oracledb");
const connect = require("../config/db");
class Room {
  static async getRoomRent(type) {
    // search in db for room tarrif
    let connection;
    try {
      connection = await connect(); // Get a connection

      const sql = `
					SELECT PRICE FROM TARRIF WHERE ROOM_TYPE = :type
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
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }
  static async getNumberAvailableRooms(type) {
    // search in db for number of available rooms
    let connection;
    try {
      connection = await connect(); // Get a connection

      const sql = `
					SELECT 
    COUNT(DISTINCT ROOM_NO) AS Available_Rooms,
    COUNT(DISTINCT BED_NO) AS TOTAL_BEDS
FROM ROOM_DETAILS
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
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }
  static async getRoomNumber(type) {
    // search in db for number of available rooms
    let connection;
    try {
      connection = await connect(); // Get a connection

      const sql = `
					SELECT DISTINCT 
    ROOM_NO 
FROM ROOM_DETAILS 
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
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }
  static async getAllRoomTypesDetails() {
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
    rd.ROOM_TYPE,
    COUNT(DISTINCT CASE WHEN rd.AVAILABLE = 'Y' THEN rd.ROOM_NO END) AS Available_Rooms,
    COUNT(DISTINCT rd.ROOM_NO) AS Total_Rooms,
    COUNT(DISTINCT CASE WHEN rd.AVAILABLE = 'Y' THEN rd.BED_NO END) AS Available_Beds,
    COUNT(DISTINCT rd.BED_NO) AS Total_Beds,
    t.PRICE AS Rent
FROM ROOM_DETAILS rd
LEFT JOIN TARRIF t ON rd.ROOM_TYPE = t.ROOM_TYPE
GROUP BY rd.ROOM_TYPE, t.PRICE
			`;

      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, [], options);
      let data = result.rows;
      return data;
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }
  static async getTypeDetails(type) {
    let connection;
    try {
      connection = await connect();
      const sql = `SELECT 
                ROOM_NO,
                ROOM_TYPE,
                LISTAGG(CASE WHEN AVAILABLE = 'Y' THEN BED_NO END, ',') WITHIN GROUP (ORDER BY BED_NO) AS AvailableBeds,
                LISTAGG(BED_NO, ',') WITHIN GROUP (ORDER BY BED_NO) AS TotalBeds
            FROM ROOM_DETAILS
            WHERE ROOM_TYPE = :roomType
            GROUP BY ROOM_NO, ROOM_TYPE`;
      const binds = { roomType: type };
      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, binds, options);
      let data = result.rows;
      return data;
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }
}
module.exports = Room;
