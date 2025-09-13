#! /usr/bin/env python3
# vim:fenc=utf-8
#
# Copyright (C) 2025 Stanley Arnaud <stantonik@stantonik-mba.local>
#
# Distributed under terms of the MIT license.

"""

"""

import json
import hashlib
import base64
from pathlib import Path
from typing import Union, Optional
import subprocess, sys
import shutil

"""
Variables
"""
S3_NAME = "portfoliosa"
S3_URL = f"s3://{S3_NAME}"

LOCAL_DIR = Path("public/s3")
S3_SYNC_DIR = Path(".cache/s3")

ASSET_MANIFEST_REL_PATH = Path("assets-manifest.json")

IGNORED_NAMES = [".DS_Store"]

"""
Utils
"""
def make_hash(
    data: Union[dict, Path, bytes, str],
    length: Optional[int] = 10
) -> str:
    sha256 = hashlib.sha256()

    if isinstance(data, dict):
        # Hash JSON dict deterministically
        data_bytes = json.dumps(data, sort_keys=True).encode("utf-8")
        sha256.update(data_bytes)

    elif isinstance(data, Path):
        # Hash file contents
        with open(data, "rb") as f:
            while chunk := f.read(8192):
                sha256.update(chunk)

    elif isinstance(data, str):
        # Hash string directly
        sha256.update(data.encode("utf-8"))

    elif isinstance(data, bytes):
        # Hash raw bytes
        sha256.update(data)

    b64_hash = base64.urlsafe_b64encode(sha256.digest()).decode("utf-8")
    return b64_hash if not length else b64_hash[:length]

def filename_insert_hash(path: Path, hash: str) -> Path:
    if len(path.stem.split('.')) > 1:
        return path
    return path.parent / f"{path.stem}.{hash}{path.suffix}"

def filename_remove_hash(path: Path) -> Path:
    return path.parent / f"{path.stem.split('.')[0]}{path.suffix}"

def filename_get_hash(path: Path) -> Optional[str]:
    split = path.stem.split('.')
    if len(split) == 1:
        return None
    return path.stem.split('.')[1]

def aws_s3_sync(src: Path | str, dst: Path | str, opts: list[str] = []) -> None:
    cmd = ['aws', 's3', 'sync', str(src), str(dst), '--delete', '--exact-timestamps'] + opts
    res = subprocess.run(cmd, stdout=sys.stdout, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise Exception(str(res.stderr))

def gen_asset_manifest(dir: Path) -> dict[str, str]:
    data = { str(filename_remove_hash(f.relative_to(dir))): str(filename_insert_hash(f.relative_to(dir), make_hash(f))) for f in filter(lambda f: f.is_file() and f.name not in IGNORED_NAMES, dir.rglob('*')) }
    return data

def compare(src_manifest: dict, dst_manifest: dict) -> tuple[dict, dict, dict]:
    to_add = {k: v for k, v in src_manifest.items() if k not in dst_manifest.keys()}
    to_remove = {k: v for k, v in dst_manifest.items() if k not in src_manifest.keys()}
    edited = {k: { "src": src_manifest[k], "dst": dst_manifest[k] } for k in src_manifest.keys() & dst_manifest.keys() if src_manifest[k] != dst_manifest[k]}

    return to_add, to_remove, edited

"""
Automations
"""
def auto_create_project_file() -> None:
    projects = [f.name for f in (LOCAL_DIR/"projects").glob('*') if f.is_dir()]
    with open(LOCAL_DIR/"projects/projects.json", 'w') as f:
        json.dump(projects, f, indent=2)
    print("projects/projects.json well created")

automations = {
    "projects.json": auto_create_project_file,
}

"""
Core
"""
def handle_status(_) -> None:
    to_add, to_remove, edited = compare(gen_asset_manifest(LOCAL_DIR), gen_asset_manifest(S3_SYNC_DIR))

    if len(to_add) | len(to_remove) | len(edited) == 0:
        print("No change.")
        return

    for f, _ in to_add.items():
        print(f"\033[92m+ Added: {f}\033[0m")
    for f, _ in to_remove.items():
        print(f"\033[91m- Deleted: {f}\033[0m")
    for f, hfs in edited.items():
        print(f"\033[93mx Edited: {f} (sha{filename_get_hash(Path(hfs['src']))} -> sha{filename_get_hash(Path(hfs['dst']))})\033[0m")

def handle_push(_) -> None:
    local_manifest = gen_asset_manifest(LOCAL_DIR)
    to_add, to_remove, edited = compare(local_manifest, gen_asset_manifest(S3_SYNC_DIR))

    if len(to_add) | len(to_remove) | len(edited) == 0:
        print("Nothing to push.")
        return

    print("Pushing...")

    if len(automations) > 0:
        print("Launching automations...")
        for name, fn in automations.items():
            print(f"'{name}' automation:", end=' ')
            fn()
        print("Automations done.")

    for f, hf in to_add.items():
        (S3_SYNC_DIR/hf).parent.mkdir(exist_ok=True, parents=True)
        shutil.copy2(LOCAL_DIR/f, S3_SYNC_DIR/hf)

    for f, hfs in edited.items():
        (S3_SYNC_DIR/hfs["dst"]).unlink()
        shutil.copy2(LOCAL_DIR/f, S3_SYNC_DIR/hfs["src"])

    for _, hf in to_remove.items():
        file = S3_SYNC_DIR/hf
        file.unlink()
        if not any(file.parent.iterdir()):
            file.parent.unlink()

    with open(S3_SYNC_DIR/ASSET_MANIFEST_REL_PATH, "w") as f:
        json.dump(local_manifest, f, indent=2, sort_keys=True)

    # Clean the cache dir before uploading (eg. DS_Store...)
    for f in S3_SYNC_DIR.rglob('*'):
        if f.name in [".DS_Store"]:
            f.unlink()

    aws_s3_sync(S3_SYNC_DIR, S3_URL)

    print("Pushed.")

def handle_pull(_) -> None:
    print("Pulling...")

    aws_s3_sync(S3_URL, S3_SYNC_DIR)

    to_add, to_remove, edited = compare(gen_asset_manifest(S3_SYNC_DIR), gen_asset_manifest(LOCAL_DIR))

    if len(to_add) | len(to_remove) | len(edited) == 0:
        print("Nothing to pull.")
        return

    for f, hf in to_add.items():
        (LOCAL_DIR/f).parent.mkdir(exist_ok=True, parents=True)
        shutil.copy2(S3_SYNC_DIR/hf, LOCAL_DIR/f)

    for f, hfs in edited.items():
        shutil.copy2(S3_SYNC_DIR/hfs["src"], LOCAL_DIR/f)

    for f, _ in to_remove.items():
        file = LOCAL_DIR/f
        file.unlink()
        if not any(file.parent.iterdir()):
            file.parent.unlink()

    print("Pulled.")

def handle_automation(args) -> None:
    handler = automations.get(args[0])
    if handler:
        handler()

"""
Main
"""
if __name__ == "__main__":
    S3_SYNC_DIR.mkdir(exist_ok=True, parents=True)
    LOCAL_DIR.mkdir(exist_ok=True, parents=True)

    IGNORED_NAMES.append(ASSET_MANIFEST_REL_PATH.name)

    script_name = sys.argv[0]

    cmds = {
        "push": { "handler": handle_push, 
                 "desc": "Push" 
        },
        "pull": { "handler": handle_pull, 
                 "desc": "Pull" 
        },
        "status": { "handler": handle_status, 
                 "desc": "Get status" 
        },
        "automation": { "handler": handle_automation, 
                 "desc": "Launch automation" 
        },
    }

    try:
        if len(sys.argv) < 2:
            raise Exception("no arguments given")

        cmd = sys.argv[1]
        if cmd == "help":
            print("Commands:")
            for key, val in cmds.items():
                print(f"    {script_name} {key}: {val['desc']}")
        else:
            cmd_handler = cmds.get(cmd)
            if not cmd_handler:
                raise Exception("unknown argument")
            cmd_handler = cmd_handler['handler']

            cmd_handler(sys.argv[2::])

    except Exception as e:
        print(f"Error: {e}")
        print(f"Type {script_name} help")

