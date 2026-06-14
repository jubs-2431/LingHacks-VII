import os
import tempfile

import pytest


database_fd, database_path = tempfile.mkstemp(
    prefix="eldershield-tests-",
    suffix=".db",
)
os.close(database_fd)
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{database_path}"
os.environ["AUTO_CREATE_SCHEMA"] = "false"
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough-for-jwt-signing"
os.environ["ENCRYPTION_KEY"] = (
    "MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA="
)
os.environ["RATE_LIMIT_REQUESTS"] = "10000"
os.environ["AUTH_RATE_LIMIT_REQUESTS"] = "1000"

from app.db.models import Base  # noqa: E402
from app.db.session import engine  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def database_schema():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    try:
        os.unlink(database_path)
    except FileNotFoundError:
        pass


@pytest.fixture(autouse=True)
def clean_database(database_schema):
    with engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
    yield
