import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


def send_credentials_email(
    to_email: str,
    student_name: str,
    username: str,
    password: str,
) -> bool:
    if not settings.smtp_email or not settings.smtp_password:
        print(f"[EMAIL SKIP] SMTP not configured. Credentials for {student_name}: username={username}, password={password}")
        return False

    subject = "Placement Portal - Your Access Credentials"
    body = f"""Dear {student_name},

You have been granted access to the Placement Interview Performance Tracking Portal.

Here are your login credentials:

    Gmail (Username): {username}
    Password: {password}

Use your Gmail address as your username to login.
Please change your password immediately after first login.

Important: Do not share your credentials with anyone.

Regards,
Placement Coordination Team
"""

    msg = MIMEMultipart()
    msg["From"] = settings.smtp_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_email, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False


def send_access_revoked_email(to_email: str, student_name: str) -> bool:
    if not settings.smtp_email or not settings.smtp_password:
        print(f"[EMAIL SKIP] SMTP not configured. Access revoked for {student_name}")
        return False

    subject = "Placement Portal - Access Revoked"
    body = f"""Dear {student_name},

Your access to the Placement Interview Performance Tracking Portal has been revoked by the coordinator.

Your login credentials are no longer valid.

If you believe this is a mistake, please contact your placement coordinator.

Regards,
Placement Coordination Team
"""

    msg = MIMEMultipart()
    msg["From"] = settings.smtp_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_email, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False
