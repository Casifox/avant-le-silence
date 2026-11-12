#!/usr/bin/env python3
"""Validation statique du contenu d'AVANT LE SILENCE.

Aucune dépendance externe. Exécuter depuis la racine du projet :

    python tests/validate_content.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "fr"

DOCUMENT_TYPES = {
    "photographie",
    "lettre",
    "dessin",
    "carnet",
    "document-administratif",
    "temoignage",
    "document-commemoratif",
    "document-judiciaire",
}

STATUSES = {"verified", "review_required", "permission_required", "illustrative", "not_applicable"}


def load(name: str) -> dict:
    path = CONTENT / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"Fichier manquant : {path}")
    except json.JSONDecodeError as error:
        raise SystemExit(f"JSON invalide dans {path} : {error}")


def main() -> int:
    chapters = load("chapters.json").get("chapters", [])
    documents = load("documents.json").get("documents", [])
    people = load("people.json").get("people", [])
    timeline = load("timeline.json").get("events", [])
    sources = load("sources.json").get("sources", [])
    glossary = load("glossary.json").get("terms", [])
    narratives = load("narratives.json")

    errors: list[str] = []
    warnings: list[str] = []

    chapter_ids = {item.get("id") for item in chapters}
    document_ids = {item.get("id") for item in documents}
    people_ids = {item.get("id") for item in people}
    event_ids = {item.get("id") for item in timeline}
    source_ids = {item.get("id") for item in sources}
    term_ids = {item.get("id") for item in glossary}

    def unique(items: list[dict], label: str) -> None:
        seen = set()
        for item in items:
            item_id = item.get("id")
            if not item_id:
                errors.append(f"{label} : élément sans identifiant.")
                continue
            if item_id in seen:
                errors.append(f"{label} : identifiant dupliqué « {item_id} ».")
            seen.add(item_id)

    unique(chapters, "Chapitres")
    unique(documents, "Documents")
    unique(people, "Personnes")
    unique(timeline, "Chronologie")
    unique(sources, "Sources")
    unique(glossary, "Glossaire")

    def refs(values, known, label: str) -> None:
        for value in values or []:
            if value not in known:
                errors.append(f"{label} : référence inconnue « {value} ».")

    for document in documents:
        doc_id = document.get("id", "?")
        if document.get("type") not in DOCUMENT_TYPES:
            errors.append(f"Document « {doc_id} » : type inconnu.")
        if document.get("status") and document["status"] not in STATUSES:
            errors.append(f"Document « {doc_id} » : statut inconnu.")
        if document.get("rightsStatus") and document["rightsStatus"] not in STATUSES:
            errors.append(f"Document « {doc_id} » : droits inconnus.")
        refs(document.get("sourceIds"), source_ids, f"Document « {doc_id} »")
        refs(document.get("relatedPeople"), people_ids, f"Document « {doc_id} »")
        refs(document.get("relatedEvents"), event_ids, f"Document « {doc_id} »")
        if document.get("asset") and document.get("rightsStatus") == "permission_required":
            warnings.append(
                f"Document « {doc_id} » : une image est associée alors que les droits sont "
                "« permission_required ». Vérifier l'autorisation."
            )

    for person in people:
        person_id = person.get("id", "?")
        if person.get("status") and person["status"] not in STATUSES:
            errors.append(f"Personne « {person_id} » : statut inconnu.")
        refs(person.get("sourceIds"), source_ids, f"Personne « {person_id} »")

    for event in timeline:
        event_id = event.get("id", "?")
        if event.get("status") and event["status"] not in STATUSES:
            errors.append(f"Événement « {event_id} » : statut inconnu.")
        refs(event.get("sourceIds"), source_ids, f"Événement « {event_id} »")
        refs(event.get("documents"), document_ids, f"Événement « {event_id} »")
        refs(event.get("people"), people_ids, f"Événement « {event_id} »")

    for term in glossary:
        refs(term.get("sourceIds"), source_ids, f"Glossaire « {term.get('id', '?')} »")

    for source in sources:
        url = source.get("url")
        if url:
            parsed = urlparse(url)
            if parsed.scheme not in {"http", "https"}:
                errors.append(f"Source « {source.get('id')} » : URL non HTTP(S).")
        if source.get("status") == "review_required" and not source.get("note"):
            warnings.append(
                f"Source « {source.get('id')} » : statut review_required sans note explicative."
            )

    for chapter in chapters:
        chapter_id = chapter.get("id", "?")
        next_id = chapter.get("completion", {}).get("next")
        if next_id and next_id != "conclusion" and next_id not in chapter_ids:
            errors.append(f"Chapitre « {chapter_id} » : suite inconnue « {next_id} ».")
        scenes = chapter.get("scenes", [])
        if not scenes:
            errors.append(f"Chapitre « {chapter_id} » : aucune scène.")
        for scene in scenes:
            scene_id = scene.get("id", "?")
            label = f"Scène « {chapter_id}/{scene_id} »"
            refs(scene.get("readingList"), document_ids | people_ids, label)
            reading_set = set(scene.get("readingList", []))
            hotspot_ids = {
                hotspot.get("action", {}).get("id")
                for hotspot in scene.get("hotspots", [])
                if hotspot.get("action", {}).get("type") in {"document", "person"}
            }
            for required in scene.get("required", []):
                known = document_ids if required.get("type") == "document" else people_ids
                if required.get("id") not in known:
                    errors.append(f"{label} : élément requis inconnu « {required.get('id')} ».")
                elif required.get("id") not in reading_set and required.get("id") not in hotspot_ids:
                    errors.append(
                        f"{label} : élément requis « {required.get('id')} » inaccessible "
                        "depuis la liste de lecture ou un point d'intérêt."
                    )
            for hotspot in scene.get("hotspots", []):
                action = hotspot.get("action", {})
                if action.get("type") == "document" and action.get("id") not in document_ids:
                    errors.append(f"{label} : point d'intérêt document inconnu.")
                if action.get("type") == "person" and action.get("id") not in people_ids:
                    errors.append(f"{label} : point d'intérêt personne inconnu.")
            activity = scene.get("activity")
            if activity and activity.get("type") == "chronology":
                refs(activity.get("eventIds"), event_ids, f"Atelier « {activity.get('id')} »")
            for path_key in ("illustration", "cover"):
                value = scene.get(path_key)
                if value:
                    local = (ROOT / value.replace("./", "")).resolve()
                    if not local.exists():
                        errors.append(f"{label} : fichier introuvable « {value} ».")

        cover = chapter.get("cover")
        if cover:
            local = (ROOT / cover.replace("./", "")).resolve()
            if not local.exists():
                errors.append(f"Chapitre « {chapter_id} » : couverture introuvable « {cover} ».")

    for section in ("home", "warning", "prologue", "chapterWarning", "conclusion", "final", "about", "sources", "glossary", "notebook", "errors"):
        if section not in narratives:
            errors.append(f"narratives.json : section « {section} » manquante.")

    print("AVANT LE SILENCE - validation du contenu")
    print(f"  Chapitres   : {len(chapters)}")
    print(f"  Scenes      : {sum(len(c.get('scenes', [])) for c in chapters)}")
    print(f"  Documents   : {len(documents)}")
    print(f"  Personnes   : {len(people)}")
    print(f"  Evenements  : {len(timeline)}")
    print(f"  Sources     : {len(sources)}")
    print(f"  Glossaire   : {len(glossary)}")
    print()

    for warning in warnings:
        print(f"AVERTISSEMENT : {warning}")

    if errors:
        print()
        for error in errors:
            print(f"ERREUR : {error}")
        print(f"\n{len(errors)} erreur(s).")
        return 1

    print("Aucune erreur de reference ou de schema detectee.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
