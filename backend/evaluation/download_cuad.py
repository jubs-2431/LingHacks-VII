import subprocess
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "data" / "cuad"
DATASET = "konradb/atticus-open-contract-dataset-aok-beta"
FILE = "CUAD_v1/CUAD_v1.json"


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "kaggle",
            "datasets",
            "download",
            "-d",
            DATASET,
            "-f",
            FILE,
            "-p",
            str(OUTPUT),
        ],
        check=True,
    )
    archives = sorted(OUTPUT.glob("*.zip"))
    if not archives:
        raise RuntimeError("Kaggle did not produce the expected CUAD archive.")
    with zipfile.ZipFile(archives[-1]) as archive:
        archive.extractall(OUTPUT)
    json_path = OUTPUT / "CUAD_v1.json"
    if not json_path.exists():
        raise RuntimeError("CUAD_v1.json was not found after extraction.")
    print(f"Downloaded {json_path} ({json_path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
