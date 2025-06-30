# Yappy

Yappy is a proof-of-concept web app for real-time voice conversations with OpenAI's advanced voice models.

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   or using the `pyproject.toml` with `uv` or `pip`.
2. Create a `.env` file in the project root containing:
   ```
   OPENAI_API_KEY=sk-xxx
   ```
3. Start the app:
   ```bash
   python run.py
   ```
4. Open your browser at [http://localhost:8000](http://localhost:8000) and hold the button to talk.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
