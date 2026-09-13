"""
ImmunoHuman Research — website backend
=================================================
A small Flask app that:
  1. Serves the static site (index.html, style.css, script.js, assets)
  2. Accepts contact-form submissions at POST /api/contact,
     validates them, stores them in a local SQLite database,
     and (optionally) emails the team.

Run locally:
    pip install -r requirements.txt
    python app.py
Then open  http://127.0.0.1:5000

To enable real email delivery, set the environment variables
listed in the `send_email()` docstring before running the app.
Without them, submissions are still safely stored in
`submissions.db` and the site keeps working.
"""

import os
import re
import sqlite3
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage

from flask import Flask, request, jsonify, send_from_directory # type: ignore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "submissions.db")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

COMPANY_EMAIL = "Ihresearch@gmail.com"


# ---------------------------------------------------------------
# Database
# ---------------------------------------------------------------
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                subject TEXT,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def save_submission(data: dict) -> int:
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute(
            """
            INSERT INTO submissions (name, email, phone, subject, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                data["name"],
                data["email"],
                data.get("phone", ""),
                data.get("subject", ""),
                data["message"],
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()
        return cur.lastrowid


# ---------------------------------------------------------------
# Email (optional — only fires if SMTP env vars are configured)
# ---------------------------------------------------------------
def send_email(data: dict) -> bool:
    """
    Sends a notification email using SMTP credentials from the
    environment. Configure these before running app.py to enable
    live delivery (Gmail example shown):

        export SMTP_HOST="smtp.gmail.com"
        export SMTP_PORT="587"
        export SMTP_USER="your-address@gmail.com"
        export SMTP_PASS="your-app-password"   # use a Gmail App Password

    If these are not set, the function is skipped silently and the
    submission is still stored in the database.
    """
    host = os.environ.get("SMTP_HOST")
    port = os.environ.get("SMTP_PORT")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")

    if not all([host, port, user, password]):
        return False

    msg = EmailMessage()
    msg["Subject"] = f"New enquiry — {data.get('subject', 'Website contact form')}"
    msg["From"] = user
    msg["To"] = COMPANY_EMAIL
    msg.set_content(
        f"Name: {data['name']}\n"
        f"Email: {data['email']}\n"
        f"Phone: {data.get('phone', '-')}\n"
        f"Reaching out as: {data.get('subject', '-')}\n\n"
        f"Message:\n{data['message']}\n"
    )

    with smtplib.SMTP(host, int(port)) as server:
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
    return True


# ---------------------------------------------------------------
# Routes
# ---------------------------------------------------------------
@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "error": "Name, email and message are required."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"ok": False, "error": "Please provide a valid email address."}), 400

    clean = {
        "name": name,
        "email": email,
        "phone": (data.get("phone") or "").strip(),
        "subject": (data.get("subject") or "").strip(),
        "message": message,
    }

    submission_id = save_submission(clean)

    try:
        send_email(clean)
    except Exception as exc:  # pragma: no cover - network/SMTP failures shouldn't break the request
        app.logger.warning("Email delivery failed: %s", exc)

    return jsonify({"ok": True, "id": submission_id}), 200


@app.route("/api/submissions", methods=["GET"])
def list_submissions():
    """Simple JSON view of stored enquiries — useful for the team's own review.
    In production, protect this route with authentication."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT id, name, email, phone, subject, message, created_at "
            "FROM submissions ORDER BY id DESC"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
