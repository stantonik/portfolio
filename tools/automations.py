#! /usr/bin/env python3
# vim:fenc=utf-8
#
# Copyright (C) 2025 Stanley Arnaud <stantonik@stantonik-mba.local>
#
# Distributed under terms of the MIT license.

"""
Automations
"""

from s3sync import LOCAL_DIR
import json
import frontmatter

def auto_create_project_file() -> None:
    project_mds = [f for f in (LOCAL_DIR/"projects").glob('*/*.md') if f.stem == f.parent.name]
    projects_data = {}
    for path in project_mds:
        with open(path, 'r') as f:
            meta = frontmatter.load(f).metadata
            meta.pop("name")
            projects_data[path.stem] = meta

    with open(LOCAL_DIR/"projects/projects.json", 'w') as f:
        json.dump(projects_data, f, indent=2)
    print("projects/projects.json well created")

automations = {
    "projects.json": auto_create_project_file,
}
