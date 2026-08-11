"""
WSGI config for StudySphere AI Django Project.
Exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Auto-migrate database tables on startup to guarantee PostgreSQL tables exist
try:
    from django.core.management import call_command
    print("[WSGI Startup] Running auto-migrations for PostgreSQL...")
    call_command('migrate', interactive=False)
    print("[WSGI Startup] Auto-migrations completed successfully!")
except Exception as e:
    print("[WSGI Startup Migration Warning]:", e)
