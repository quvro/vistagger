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
            embedding BLOB,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Structured attribute dimensions (e.g. 主体, 构图, 光线)
        CREATE TABLE IF NOT EXISTS dimensions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL DEFAULT '#6366f1',
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        -- Attribute values within dimensions (e.g. 光线 → 顶光)
        CREATE TABLE IF NOT EXISTS attributes (
            id TEXT PRIMARY KEY,
            dimension_id TEXT NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(dimension_id, name)
        );

        -- Image-attribute associations
        CREATE TABLE IF NOT EXISTS image_attributes (
            image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
            attribute_id TEXT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
            confidence REAL,
            is_auto INTEGER NOT NULL DEFAULT 0,
            is_primary INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (image_id, attribute_id)
        );

        -- Collections / boards
        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT REFERENCES collections(id),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Settings key-value store
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_image_attributes_image ON image_attributes(image_id);
        CREATE INDEX IF NOT EXISTS idx_image_attributes_attr ON image_attributes(attribute_id);
        CREATE INDEX IF NOT EXISTS idx_attributes_dimension ON attributes(dimension_id);
        ",
    )?;
    Ok(())
}

pub fn insert_default_data(conn: &Connection) -> Result<(), rusqlite::Error> {
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM dimensions", [], |row| row.get(0))
        .unwrap_or(0);

    if count > 0 {
        return Ok(());
    }

    let dims = vec![
        ("dim_subject", "主体", "#6366f1", 1),
        ("dim_composition", "构图", "#8b5cf6", 2),
        ("dim_lighting", "光线", "#f59e0b", 3),
        ("dim_color", "色调", "#10b981", 4),
        ("dim_elements", "元素", "#f43f5e", 5),
        ("dim_style", "风格", "#06b6d4", 6),
        ("dim_mood", "情绪", "#eab308", 7),
    ];

    for (id, name, color, order) in &dims {
        conn.execute(
            "INSERT INTO dimensions (id, name, color, sort_order) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![id, name, color, order],
        )?;
    }

    // Initial attribute values for each dimension
    let attrs: Vec<(&str, &str)> = vec![
        // 主体
        ("dim_subject", "人物"), ("dim_subject", "单人"), ("dim_subject", "双人"),
        ("dim_subject", "多人"), ("dim_subject", "动物"), ("dim_subject", "机械"),
        ("dim_subject", "建筑"), ("dim_subject", "植物"), ("dim_subject", "物体"),
        // 构图
        ("dim_composition", "头像"), ("dim_composition", "半身"), ("dim_composition", "全身"),
        ("dim_composition", "特写"), ("dim_composition", "近景"), ("dim_composition", "中景"),
        ("dim_composition", "远景"), ("dim_composition", "正面"), ("dim_composition", "侧面"),
        ("dim_composition", "四分之三侧脸"), ("dim_composition", "背面"),
        ("dim_composition", "仰视"), ("dim_composition", "俯视"), ("dim_composition", "鸟瞰"),
        ("dim_composition", "对称构图"), ("dim_composition", "三分法"), ("dim_composition", "对角线"),
        ("dim_composition", "中心构图"), ("dim_composition", "引导线"),
        // 光线
        ("dim_lighting", "自然光"), ("dim_lighting", "顶光"), ("dim_lighting", "侧光"),
        ("dim_lighting", "逆光"), ("dim_lighting", "底光"), ("dim_lighting", "柔光"),
        ("dim_lighting", "硬光"), ("dim_lighting", "环境光"), ("dim_lighting", "黄昏光"),
        ("dim_lighting", "夜景"), ("dim_lighting", "人工光"),
        // 色调
        ("dim_color", "暖色"), ("dim_color", "冷色"), ("dim_color", "黑白"),
        ("dim_color", "高饱和"), ("dim_color", "低饱和"), ("dim_color", "单色调"),
        ("dim_color", "柔和"), ("dim_color", "补色"),
        // 元素
        ("dim_elements", "手部动作"), ("dim_elements", "波浪发"), ("dim_elements", "长发"),
        ("dim_elements", "短发"), ("dim_elements", "眼睛特写"), ("dim_elements", "服饰细节"),
        ("dim_elements", "武器"), ("dim_elements", "翅膀"), ("dim_elements", "花纹"),
        ("dim_elements", "水面"), ("dim_elements", "火焰"), ("dim_elements", "烟雾"),
        // 风格
        ("dim_style", "写实"), ("dim_style", "二次元"), ("dim_style", "水墨"),
        ("dim_style", "油画"), ("dim_style", "素描"), ("dim_style", "赛博朋克"),
        ("dim_style", "厚涂"), ("dim_style", "平涂"), ("dim_style", "像素"),
        ("dim_style", "水彩"), ("dim_style", "浮世绘"), ("dim_style", "极简"),
        ("dim_style", "电影感"), ("dim_style", "复古"),
        // 情绪
        ("dim_mood", "沉静"), ("dim_mood", "内敛"), ("dim_mood", "忧郁"),
        ("dim_mood", "欢快"), ("dim_mood", "激昂"), ("dim_mood", "温暖"),
        ("dim_mood", "冷峻"), ("dim_mood", "孤独"), ("dim_mood", "神秘"),
        ("dim_mood", "恐怖"), ("dim_mood", "浪漫"),
    ];

    for (i, (dim_id, name)) in attrs.iter().enumerate() {
        let id = format!("attr_{:04}", i);
        conn.execute(
            "INSERT OR IGNORE INTO attributes (id, dimension_id, name) VALUES (?1, ?2, ?3)",
            rusqlite::params![id, dim_id, name],
        )?;
    }

    Ok(())
}
