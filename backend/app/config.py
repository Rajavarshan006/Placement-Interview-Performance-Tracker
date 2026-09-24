from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./intervention.db"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"

    smtp_email: str = ""
    smtp_password: str = ""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587

    model_config = {"env_file": ".env"}


settings = Settings()
