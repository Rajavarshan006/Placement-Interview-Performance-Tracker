from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./intervention.db"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"

    model_config = {"env_file": ".env"}


settings = Settings()
