use rusqlite::Connection;

pub fn create_tables(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            original_path TEXT,
            stored_path TEXT NOT NULL,
            thumbnail_path TEXT,
            width INTEGER,
            height INTEGER,
            file_size INTEGER,
            format TEXT,
            source_url TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- User-managed tag categories
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL DEFAULT '#6366f1',
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        -- Tags belong to a category
        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            color TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS image_tags (
            image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
            tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            confidence REAL,
            is_auto INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (image_id, tag_id)
        );

        -- AI-detected similar tags for merging suggestions
        CREATE TABLE IF NOT EXISTS tag_similarities (
            tag_a_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            tag_b_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            similarity_score REAL NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            PRIMARY KEY (tag_a_id, tag_b_id)
        );

        -- Settings key-value store
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_image_tags_image ON image_tags(image_id);
        CREATE INDEX IF NOT EXISTS idx_image_tags_tag ON image_tags(tag_id);
        CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category_id);
        ",
    )?;
    Ok(())
}

pub fn insert_default_data(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Insert default category if none exists
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM categories", [], |row| row.get(0))
        .unwrap_or(0);

    if count == 0 {
        conn.execute(
            "INSERT INTO categories (id, name, color, sort_order) VALUES ('default', '默认分类', '#6366f1', 0)",
            [],
        )?;

        // Insert some initial useful tags
        let default_tags = vec![
            ("单人", "default"),
            ("双人", "default"),
            ("多人", "default"),
            ("头像", "default"),
            ("半身", "default"),
            ("全身", "default"),
            ("场景", "default"),
            ("动物", "default"),
            ("建筑", "default"),
            ("植物", "default"),
        ];

        for (i, (name, category_id)) in default_tags.iter().enumerate() {
            let id = format!("tag_init_{}", i);
            conn.execute(
                "INSERT OR IGNORE INTO tags (id, name, category_id) VALUES (?1, ?2, ?3)",
                rusqlite::params![id, name, category_id],
            )?;
        }
    }

    Ok(())
}
