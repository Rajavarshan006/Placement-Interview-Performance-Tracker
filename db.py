import sqlite3
import uuid
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database and create tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create the authenticate table as required
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS authenticate (
            uuid TEXT PRIMARY KEY,
            gmail TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    
    # Create the drives table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS drives (
            id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            job_role TEXT NOT NULL,
            ctc_lpa REAL NOT NULL,
            min_cgpa REAL NOT NULL,
            allowed_branches TEXT NOT NULL,
            location TEXT NOT NULL,
            status TEXT NOT NULL,
            deadline TEXT,
            current_round INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create the student drive results table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_drive_results (
            id TEXT PRIMARY KEY,
            drive_id TEXT NOT NULL,
            gmail TEXT NOT NULL,
            result TEXT NOT NULL,
            round INTEGER DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(drive_id, gmail)
        )
    """)
    conn.commit()

    # Migrations for pre-existing database tables
    try:
        cursor.execute("ALTER TABLE drives ADD COLUMN current_round INTEGER DEFAULT 1")
        conn.commit()
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE student_drive_results ADD COLUMN round INTEGER DEFAULT 1")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    
    # Seed demo users if empty
    cursor.execute("SELECT COUNT(*) as count FROM authenticate")
    row = cursor.fetchone()
    if row["count"] == 0:
        seed_users = [
            (str(uuid.uuid4()), "coordinator@gmail.com", "coord123", "Coordinator"),
            (str(uuid.uuid4()), "student@gmail.com", "student123", "Student"),
            (str(uuid.uuid4()), "recruiter@gmail.com", "recruiter123", "Recruiter")
        ]
        cursor.executemany("""
            INSERT INTO authenticate (uuid, gmail, password, role)
            VALUES (?, ?, ?, ?)
        """, seed_users)
        conn.commit()
        print("Database seeded with sample demo accounts.")
    else:
        # Ensure coordinator account exists
        cursor.execute("SELECT uuid FROM authenticate WHERE LOWER(gmail) = 'coordinator@gmail.com'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO authenticate (uuid, gmail, password, role)
                VALUES (?, ?, ?, ?)
            """, (str(uuid.uuid4()), "coordinator@gmail.com", "coord123", "Coordinator"))
            conn.commit()
            print("Seeded Coordinator demo account.")

        # Migrate/remove legacy Admin role records to Coordinator
        cursor.execute("UPDATE authenticate SET role = 'Coordinator' WHERE LOWER(role) = 'admin'")
        cursor.execute("DELETE FROM authenticate WHERE LOWER(gmail) = 'admin@gmail.com'")
        conn.commit()

    # Seed sample drives if drives table is empty
    cursor.execute("SELECT COUNT(*) as count FROM drives")
    d_row = cursor.fetchone()
    if d_row["count"] == 0:
        sample_drives = [
            (str(uuid.uuid4()), "Microsoft", "Software Engineer - SDE I", 18.5, 8.0, "CSE, IT, ECE, AIDS", "Bangalore / Remote", "Active", "2026-10-15"),
            (str(uuid.uuid4()), "Goldman Sachs", "Analyst - Technology Division", 22.0, 8.5, "CSE, ECE, EEE", "Hyderabad", "Active", "2026-10-20"),
            (str(uuid.uuid4()), "Amazon", "Applied Scientist / SDE", 28.0, 8.2, "CSE, IT, AIDS", "Chennai", "Upcoming", "2026-11-01")
        ]
        cursor.executemany("""
            INSERT INTO drives (id, company_name, job_role, ctc_lpa, min_cgpa, allowed_branches, location, status, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_drives)
        conn.commit()
        print("Database seeded with sample recruitment drives.")
        
    conn.close()

def get_user_by_gmail(gmail: str):
    """Fetch user record from 'authenticate' table by gmail."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT uuid, gmail, password, role FROM authenticate WHERE LOWER(gmail) = LOWER(?)", (gmail.strip(),))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def get_all_users():
    """Retrieve all accounts (without secrets) for demo quick-fill feature."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT uuid, gmail, role FROM authenticate")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return users

def get_all_drives():
    """Fetch all placement drives from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, company_name, job_role, ctc_lpa, min_cgpa, allowed_branches, location, status, deadline, current_round, created_at FROM drives ORDER BY created_at DESC")
    drives = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return drives

def create_drive(company_name: str, job_role: str, ctc_lpa: float, min_cgpa: float, allowed_branches: str, location: str, status: str = "Active", deadline: str = None):
    """Create a new placement drive record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    drive_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO drives (id, company_name, job_role, ctc_lpa, min_cgpa, allowed_branches, location, status, deadline, current_round)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    """, (drive_id, company_name, job_role, ctc_lpa, min_cgpa, allowed_branches, location, status, deadline))
    conn.commit()
    cursor.execute("SELECT id, company_name, job_role, ctc_lpa, min_cgpa, allowed_branches, location, status, deadline, current_round, created_at FROM drives WHERE id = ?", (drive_id,))
    new_drive = dict(cursor.fetchone())
    conn.close()
    return new_drive

def increment_student_drive_round(drive_id: str, gmail: str):
    """
    Increment a student's round for a specific drive by 1 in the student database.
    Everyone in the uploaded Excel is shortlisted for the next round.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    gmail_clean = gmail.strip().lower()

    # Fetch current drive round
    cursor.execute("SELECT current_round FROM drives WHERE id = ?", (drive_id,))
    drive_row = cursor.fetchone()
    drive_round = drive_row["current_round"] if (drive_row and "current_round" in drive_row.keys() and drive_row["current_round"]) else 1

    # Check existing student record for this drive
    cursor.execute("SELECT round FROM student_drive_results WHERE drive_id = ? AND LOWER(gmail) = ?", (drive_id, gmail_clean))
    existing = cursor.fetchone()

    if existing and existing["round"] is not None:
        new_round = existing["round"] + 1
    else:
        new_round = max(drive_round, 1) + 1

    result_str = f"Shortlisted for Round {new_round}"
    res_id = str(uuid.uuid4())

    cursor.execute("""
        INSERT INTO student_drive_results (id, drive_id, gmail, result, round, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(drive_id, gmail) DO UPDATE SET
            round = excluded.round,
            result = excluded.result,
            updated_at = CURRENT_TIMESTAMP
    """, (res_id, drive_id, gmail_clean, result_str, new_round))
    conn.commit()
    conn.close()

    return {
        "gmail": gmail_clean,
        "round": new_round,
        "result": result_str
    }

def increment_drive_current_round(drive_id: str):
    """Increment overall drive round counter by 1."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE drives SET current_round = COALESCE(current_round, 1) + 1 WHERE id = ?", (drive_id,))
    conn.commit()
    conn.close()

def upsert_student_drive_result(drive_id: str, gmail: str, result: str):
    """Insert or update a student's result status for a specific company drive."""
    conn = get_db_connection()
    cursor = conn.cursor()
    res_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO student_drive_results (id, drive_id, gmail, result, updated_at)
        VALUES (?, ?, LOWER(?), ?, CURRENT_TIMESTAMP)
        ON CONFLICT(drive_id, gmail) DO UPDATE SET
            result = excluded.result,
            updated_at = CURRENT_TIMESTAMP
    """, (res_id, drive_id, gmail.strip(), result.strip()))
    conn.commit()
    conn.close()

def get_drive_results(drive_id: str):
    """Fetch all candidate evaluation results for a specific placement drive."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, drive_id, gmail, result, round, updated_at 
        FROM student_drive_results 
        WHERE drive_id = ? 
        ORDER BY updated_at DESC
    """, (drive_id,))
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

def get_student_drive_results(gmail: str):
    """Fetch drive results for a specific student across all drives."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.id, s.drive_id, s.gmail, s.result, s.round, s.updated_at, d.company_name, d.job_role, d.ctc_lpa, d.location
        FROM student_drive_results s
        JOIN drives d ON s.drive_id = d.id
        WHERE LOWER(s.gmail) = LOWER(?)
        ORDER BY s.updated_at DESC
    """, (gmail.strip(),))
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

def get_drive_results_count(drive_id: str) -> int:
    """Count candidate results for a specific drive."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM student_drive_results WHERE drive_id = ?", (drive_id,))
    row = cursor.fetchone()
    conn.close()
    return row["count"] if row else 0

def bulk_grant_user_access(users_list: list):
    """
    Bulk create or update user access in 'authenticate' table.
    users_list is a list of dicts: [{"gmail": "...", "role": "..."}, ...]
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    created_count = 0
    updated_count = 0
    processed_users = []

    for item in users_list:
        gmail = item.get("gmail", "").strip().lower()
        role = item.get("role", "Student").strip()

        # Normalize role casing
        if role.lower() == "student":
            role = "Student"
        elif role.lower() == "recruiter":
            role = "Recruiter"
        elif role.lower() in ["coordinator", "admin"]:
            role = "Coordinator"

        if not gmail or "@" not in gmail:
            continue

        # Check existing user
        cursor.execute("SELECT uuid, role, password FROM authenticate WHERE LOWER(gmail) = ?", (gmail,))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("UPDATE authenticate SET role = ? WHERE LOWER(gmail) = ?", (role, gmail))
            updated_count += 1
            processed_users.append({
                "uuid": existing["uuid"],
                "gmail": gmail,
                "role": role,
                "action": "Updated Role"
            })
        else:
            if role == "Student":
                default_pwd = "student123"
            elif role == "Recruiter":
                default_pwd = "recruiter123"
            elif role == "Coordinator":
                default_pwd = "coord123"
            else:
                default_pwd = "user123"

            new_uuid = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO authenticate (uuid, gmail, password, role)
                VALUES (?, ?, ?, ?)
            """, (new_uuid, gmail, default_pwd, role))
            created_count += 1
            processed_users.append({
                "uuid": new_uuid,
                "gmail": gmail,
                "role": role,
                "action": "Created Account"
            })

    conn.commit()
    conn.close()

    return {
        "created_count": created_count,
        "updated_count": updated_count,
        "total_processed": len(processed_users),
        "processed_users": processed_users
    }

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")


