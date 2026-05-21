pub mod schema;

use rusqlite::Connection;
use std::sync::Mutex;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init_database(path: &str) -> Result<DbState, rusqlite::Error> {
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
    schema::create_tables(&conn)?;
    schema::insert_default_data(&conn)?;
    Ok(DbState {
        conn: Mutex::new(conn),
    })
}
