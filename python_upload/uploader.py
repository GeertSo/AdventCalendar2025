#!/usr/bin/env python3
"""
CSV → API bulk uploader

Reads a CSV file (UTF‑8, comma‑separated, header row):
    day,question,answerA,answerB,answerC,explanation,correctAnswer

For each row it builds a JSON payload matching the API spec,
URL‑encodes the JSON, appends it to the GET request URL and
logs the request together with the JSON response.

No authentication, no rate‑limiting, continue‑on‑error behaviour.
"""

from __future__ import annotations

import csv
import json
import logging
import sys
import urllib.parse
import requests
from pathlib import Path
from typing import Dict, Any
from secretconfig import API_BASE_URL, STATIC_PARAMS

# ----------------------------------------------------------------------
# Configuration -----------------------------------------------
# -----------------------------------------------------------------

# CSV settings
CSV_DELIMITER = ","
CSV_ENCODING = "utf-8"

# Logging ---------------------------------------------------------------
LOG_FORMAT = "%(asctime)s %(levelname)s %(message)s"
logging.basicConfig(
    level=logging.INFO,
   format=LOG_FORMAT,
    handlers=[
        logging.FileHandler("upload.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------
# Helper functions ------------------------------------------------------
# ----------------------------------------------------------------


def build_payload(row: Dict[str, str]) -> Dict[str, Any]:
    """
    Convert a CSV row into the JSON structure expected by the API.

    Expected keys in *row* (case‑sensitive, matching the header):
        day, question, answerA, answerB, answerC, explanation, correctAnswer
    """
    payload = {
        "question": row["question"].strip(),
        "answera": row["answerA"].strip(),
        "answerb": row["answerB"].strip(),
        "answerc": row["answerC"].strip(),
        "explanation": row["explanation"].strip(),
        "correctanswer": row["correctAnswer"].strip(),
    }
    day = int(row["day"])
    #logger.info("question: %s, answerA: %s", payload["question"], payload["answera"])
    return payload, day


def build_request_url(payload: Dict[str, Any], day: int, test_production_str: str) -> str:
    """
    Assemble the final GET URL:
      base + static params + Data=<url‑encoded‑json>
    """
    # Encode the JSON payload exactly as the example shows
    json_str = json.dumps(payload, ensure_ascii=False)
    #encoded_json = urllib.parse.quote(json_str, safe="")
    #logger.info("*** json_str: %s",json_str)

    # Merge static parameters with the encoded JSON payload
    query_params = STATIC_PARAMS.copy()
    query_params["Questionnumber"] = day
    query_params["Mode"] = test_production_str
    query_params["Data"] = json_str

    full_url = f"{API_BASE_URL}?{urllib.parse.urlencode(query_params)}"
    #logger.info("full_url: %s", full_url)
    return full_url


def send_request(url: str) -> Dict[str, Any]:
    """
    Perform the GET request and return the parsed JSON response.
    Raises ``requests.RequestException`` on network errors.
    """
    response = requests.get(url, timeout=15)
    response.raise_for_status()  # HTTP error codes raise an exception
    try:
        return response.json()
    except json.JSONDecodeError:
        # Return a synthetic dict so the caller can still log something
        return {"returncode": "NOTOK", "errorcode": "invalid_json_response"}


def process_row(row: Dict[str, str], test_production_str: str) -> None:
    """
    End‑to‑end handling of a single CSV row:
      * build payload
      * build request URL
      * call the API
      * log request + response
    """
    payload, day = build_payload(row)
    request_url = build_request_url(payload, day, test_production_str)

    try:
        resp_json = send_request(request_url)
        returncode = resp_json.get("returncode", "UNKNOWN")
        errorcode = resp_json.get("errorcode", "")
        if (returncode != "OK"):
            logger.info(
                "REQUEST: %s | RESPONSE: %s | RETURNCODE: %s | ERRORCODE: %s",
                request_url,
                json.dumps(resp_json, ensure_ascii=False),
                returncode,
                errorcode,
            )
        else:
            logger.info(
                "Upload for day %s was OK",day
            )
    except requests.RequestException as exc:
        # Network‑level failure – log and continue
        logger.error(
            "REQUEST FAILED: %s | EXCEPTION: %s",
            request_url,
            str(exc),
        )


def read_csv(csv_path: Path, test_production_str: str) -> None:
    """
    Iterate over the CSV file and process each row.
    """
    with csv_path.open(mode="r", encoding=CSV_ENCODING, newline="") as fp:
        reader = csv.DictReader(fp, delimiter=CSV_DELIMITER)
        required_fields = {
            "day",
            "question",
            "answerA",
            "answerB",
            "answerC",
            "explanation",
          "correctAnswer",
        }
        missing = required_fields - set(reader.fieldnames or [])
        if missing:
            logger.error(
                "CSV header is missing required columns: %s", ", ".join(sorted(missing))
            )
            return

        for idx, row in enumerate(reader, start=1):
            logger.debug("Processing CSV line %d", idx)
            process_row(row, test_production_str)


# ----------------------------------------------------------------------
# Main entry point -------------------------------------------------------
# ----------------------------------------------------------------------
def main() -> None:

    if len(sys.argv) < 3:
        print("Usage: python uploader <CSV-filename> <test|production>")
        sys.exit(1)

    filename = Path(sys.argv[1])
    test_production_command = sys.argv[2]

    if not filename.is_file():
        logger.error("CSV file not found: %s", filename)
        sys.exit(1)

    if test_production_command == "production":
        test_production_str = "production"
    elif test_production_command == "test":
        test_production_str = "test"
    else:
        print("Usage: python uploader <CSV-filename> <test|production>")
        print("no production or test identified")
        sys.exit(1)

    logger.info("Starting bulk upload from %s", filename)
    read_csv(filename, test_production_str)
    logger.info("Upload finished")


if __name__ == "__main__":
    main()
    