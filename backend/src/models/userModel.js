const pool = require("../config/db");

async function createUser(userData) {
    const { name, email, password, profile_picture } = userData;

    const [result] = await pool.execute(
        `INSERT INTO users
        (name, email, password, profile_picture)
        VALUES (?, ?, ?, ?)`,
        [name, email, password, profile_picture || null]
    );

    return result.insertId;
}

async function findUserByEmail(email) {
    const [rows] = await pool.execute(
        `SELECT id, name, email, password, profile_picture, created_at, updated_at
         FROM users
         WHERE email = ?`,
        [email]
    );

    return rows[0] || null;
}
async function findUserById(id){
    const [rows] = await pool.execute(
        `SELECT id , name, email, password,profile_picture , created_at, updated_at
        FROM users 
        WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function updateUser(id, userData) {
 const {name , profile_picture} = userData;
 const [result] = await pool.execute(

     `UPDATE users 
     SET name = ? ,profile_picture = ?
     WHERE id = ?`,
     [name,profile_picture,id]
    );
    return result.affectedRows;
}

async function updatePassword(id, password) {
 const [result ] = await pool.execute(
    `UPDATE users
    SET password = ?
    WHERE id = ?`,
    [password,id]
 );
 return result.affectedRows;
}

async function deleteUser(id) {
const [result] = await pool.execute(
        `DELETE from users
        WHERE id = ?`,
        [id]
);
return result.affectedRows;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    updatePassword,
    deleteUser
};