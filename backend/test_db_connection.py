import os
import socket
import ssl
import mysql.connector
from mysql.connector import Error
import time
 
# IMPORTANT: do not hardcode credentials/endpoints in repo.
# Configure via env vars when you need to test a remote database.
HOST = os.getenv("DB_HOST", "localhost")
PORT = int(os.getenv("DB_PORT", "3306"))
USER = os.getenv("DB_USER", "root")
PASS = os.getenv("DB_PASS", "")
DB = os.getenv("DB_NAME", "equivocal")

def test_tcp():
    print(f"\n[1] Testing TCP Connection to {HOST}:{PORT}...")
    try:
        start = time.time()
        s = socket.create_connection((HOST, PORT), timeout=5)
        end = time.time()
        print(f"    SUCCESS: TCP Connected in {end-start:.4f}s")
        s.close()
        return True
    except Exception as e:
        print(f"    FAILED: {e}")
        return False

def test_ssl_handshake():
    print(f"\n[2] Testing SSL Handshake (ignoring cert errors)...")
    try:
        # Create a raw socket
        sock = socket.create_connection((HOST, PORT), timeout=10)
        
        # Wrap it with SSL
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # TiDB/MySQL requires a specific handshake protocol, so a simple SSL wrap might fail 
        # if the server expects the MySQL protocol first. 
        # However, checking if we can even establish a secure context is useful.
        # NOTE: MySQL does STARTTLS-like upgrade, so direct SSL wrap usually fails on port 3306/4000 
        # unless it's an SSL-only port. We'll skip this specific raw SSL test for MySQL 
        # and rely on the driver's debug output.
        print("    SKIPPED: MySQL uses protocol-level SSL upgrade (STARTTLS), cannot test with simple SSL socket.")
        sock.close()
        return True
    except Exception as e:
        print(f"    FAILED: {e}")
        return False

def test_mysql_login(use_ssl=True, verify_cert=False):
    ssl_status = "WITH SSL" if use_ssl else "WITHOUT SSL"
    verify_status = "(No Verify)" if not verify_cert else "(Verify Cert)"
    print(f"\n[3] Testing MySQL Login {ssl_status} {verify_status}...")
    
    try:
        conn = mysql.connector.connect(
            host=HOST,
            port=PORT,
            user=USER,
            password=PASS,
            database=DB,
            connect_timeout=10,
            ssl_disabled=not use_ssl,
            ssl_verify_cert=verify_cert
        )
        
        if conn.is_connected():
            print(f"    SUCCESS: Logged in! Server version: {conn.get_server_info()}")
            conn.close()
            return True
    except Error as e:
        print(f"    FAILED: {e}")
        return False
    except Exception as e:
        print(f"    FAILED (System): {e}")
        return False

if __name__ == "__main__":
    if test_tcp():
        # TiDB Cloud REQUIRES SSL, so we test that first
        test_mysql_login(use_ssl=True, verify_cert=False)
        
        # Just in case, test without SSL to see the error message
        test_mysql_login(use_ssl=False)
