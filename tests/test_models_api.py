from __future__ import annotations

import json

import pytest

from libvbrief import ValidationError, VBriefDocument, validate


def test_model_from_dict_and_to_dict_preserves_unknown_fields() -> None:
    doc = {
        "vBRIEFInfo": {"version": "0.5", "x-info": "value"},
        "plan": {
            "title": "Plan",
            "status": "running",
            "items": [
                {
                    "title": "Task",
                    "status": "pending",
                    "metadata": {"k": "v"},
                    "x-item": 1,
                }
            ],
            "x-plan": {"hello": True},
        },
        "x-root": [1, 2, 3],
    }

    model = VBriefDocument.from_dict(doc)
    rendered = model.to_dict()

    assert rendered["x-root"] == [1, 2, 3]
    assert rendered["plan"]["x-plan"] == {"hello": True}
    assert rendered["plan"]["items"][0]["x-item"] == 1


def test_model_validation_returns_report() -> None:
    model = VBriefDocument.from_dict(
        {
            "vBRIEFInfo": {"version": "0.5"},
            "plan": {"title": "P", "status": "running", "items": [{"title": "x", "status": "pending"}]},
        }
    )

    report = model.validate()

    assert report.is_valid
    assert validate(model).is_valid


def test_model_preserve_order_uses_original_field_order() -> None:
    source = {
        "vBRIEFInfo": {"version": "0.5"},
        "plan": {
            "title": "P",
            "status": "running",
            "items": [],
            "z": 1,
            "a": 2,
        },
    }

    model = VBriefDocument.from_dict(source)
    text = model.to_json(canonical=False, preserve_format=True)

    assert text.index('"z"') < text.index('"a"')


def test_model_vbrief_info_extras_round_trip() -> None:
    """Unknown keys inside vBRIEFInfo must survive to_dict() and to_json()."""
    doc = {
        "vBRIEFInfo": {"version": "0.5", "x-generator": "myapp", "x-schema": "v1"},
        "plan": {"title": "P", "status": "running", "items": []},
    }

    model = VBriefDocument.from_dict(doc)
    result = model.to_dict()

    assert result["vBRIEFInfo"]["x-generator"] == "myapp"
    assert result["vBRIEFInfo"]["x-schema"] == "v1"
    # Also verify via JSON round-trip
    assert json.loads(model.to_json())["vBRIEFInfo"]["x-generator"] == "myapp"


def test_model_from_dict_strict_raises_on_invalid() -> None:
    with pytest.raises(ValidationError) as exc_info:
        VBriefDocument.from_dict({"vBRIEFInfo": {"version": "0.4"}, "plan": {"title": "x", "status": "oops", "items": []}}, strict=True)

    assert exc_info.value.report is not None
    assert not exc_info.value.report.is_valid


def test_model_from_json_round_trip() -> None:
    text = json.dumps({
        "vBRIEFInfo": {"version": "0.5"},
        "plan": {"title": "Q", "status": "draft", "items": []},
    })

    model = VBriefDocument.from_json(text)

    assert model.plan.title == "Q"
    assert model.plan.status == "draft"


def test_model_from_file_and_to_file_round_trip(tmp_path) -> None:
    source = {
        "vBRIEFInfo": {"version": "0.5"},
        "plan": {"title": "File", "status": "running", "items": [{"title": "T", "status": "pending"}]},
    }
    path = tmp_path / "plan.vbrief.json"
    model = VBriefDocument.from_dict(source)
    model.to_file(path)

    loaded = VBriefDocument.from_file(path)

    assert loaded.plan.title == "File"
    assert loaded.plan.items[0].title == "T"


def test_plan_item_from_dict_with_sub_items() -> None:
    from libvbrief.models import PlanItem

    data = {
        "title": "Parent",
        "status": "pending",
        "subItems": [
            {"title": "Child", "status": "running"},
            42,  # non-Mapping: intentionally skipped
        ],
    }

    item = PlanItem.from_dict(data)

    assert len(item.subItems) == 1
    assert item.subItems[0].title == "Child"


def test_plan_item_from_dict_prefers_items_key_over_sub_items() -> None:
    """v0.6 'items' key takes precedence over legacy 'subItems' when both present."""
    from libvbrief.models import PlanItem

    data = {
        "title": "Parent",
        "status": "pending",
        "items": [{"title": "v0.6 child", "status": "running"}],
        "subItems": [{"title": "legacy child", "status": "pending"}],
    }

    item = PlanItem.from_dict(data)

    assert len(item.subItems) == 1
    assert item.subItems[0].title == "v0.6 child"


def test_plan_item_from_dict_reads_items_key_for_nested_children() -> None:
    """A v0.6 document using 'items' for nested children must parse them correctly."""
    from libvbrief.models import PlanItem

    data = {
        "title": "Parent",
        "status": "pending",
        "items": [{"title": "Child", "status": "running"}],
    }

    item = PlanItem.from_dict(data)

    assert len(item.subItems) == 1
    assert item.subItems[0].title == "Child"


def test_plan_item_failed_factory() -> None:
    """PlanItem.failed(...) must produce a PlanItem with status 'failed'."""
    from libvbrief.models import PlanItem

    item = PlanItem.failed("Deploy failed")

    assert item.title == "Deploy failed"
    assert item.status == "failed"


def test_builder_produces_v06_version_string() -> None:
    """PlanBuilder.to_document(), quick_todo(), and from_items() must emit version '0.6'."""
    from libvbrief.builder import PlanBuilder, from_items, quick_todo
    from libvbrief.models import PlanItem

    via_builder = PlanBuilder("P", status="draft").to_document()
    assert via_builder.vbrief_info["version"] == "0.6"

    via_quick_todo = quick_todo("T", ["item one"])
    assert via_quick_todo.vbrief_info["version"] == "0.6"

    via_from_items = from_items("T", [PlanItem(title="x", status="pending")])
    assert via_from_items.vbrief_info["version"] == "0.6"


def test_nested_items_serialized_as_items_key() -> None:
    """Round-trip: nested children are emitted under 'items' key, not 'subItems'."""
    from libvbrief.builder import PlanBuilder

    builder = PlanBuilder("Plan", status="running")
    parent = builder.add_item("Parent", id="p", status="pending")
    parent.add_subitem("Child", status="pending")

    rendered = builder.to_document().to_dict()
    parent_item = rendered["plan"]["items"][0]

    assert "items" in parent_item
    assert parent_item["items"][0]["title"] == "Child"
    assert "subItems" not in parent_item


def test_plan_with_optional_fields_round_trips() -> None:
    doc = {
        "vBRIEFInfo": {"version": "0.5"},
        "plan": {
            "id": "proj.2026",
            "title": "Quarterly",
            "status": "running",
            "author": "alice",
            "tags": ["q1"],
            "items": [],
        },
    }

    model = VBriefDocument.from_dict(doc)
    result = model.to_dict()

    assert result["plan"]["id"] == "proj.2026"
    assert result["plan"]["author"] == "alice"
    assert result["plan"]["tags"] == ["q1"]


def test_merge_values_includes_fields_added_after_parse() -> None:
    """Known fields set after from_dict (not in original _field_order) still appear in preserve-order output."""
    source = {
        "vBRIEFInfo": {"version": "0.5"},
        "plan": {"title": "P", "status": "running", "items": []},
    }
    model = VBriefDocument.from_dict(source)
    model.plan.author = "bob"  # set after parse; not in _field_order

    result = model.to_dict(preserve_order=True)

    assert result["plan"]["author"] == "bob"


# ---------------------------------------------------------------------------
# from_dict with non-Mapping input (lenient fallback to empty dict)
# ---------------------------------------------------------------------------


def test_plan_item_from_dict_non_mapping_returns_empty_item() -> None:
    """PlanItem.from_dict with a non-Mapping falls back to empty dict (models.py:110)."""
    from libvbrief.models import PlanItem

    item = PlanItem.from_dict(None)  # type: ignore[arg-type]

    assert item.title == ""
    assert item.status == ""
    assert item.subItems == []


def test_plan_from_dict_non_mapping_returns_empty_plan() -> None:
    """Plan.from_dict with a non-Mapping falls back to empty dict (models.py:195)."""
    from libvbrief.models import Plan

    plan = Plan.from_dict(42)  # type: ignore[arg-type]

    assert plan.title == ""
    assert plan.items == []


def test_vbrief_document_from_dict_non_mapping_returns_empty_doc() -> None:
    """VBriefDocument.from_dict with a non-Mapping falls back to empty dict (models.py:257)."""
    doc = VBriefDocument.from_dict(None)  # type: ignore[arg-type]

    assert doc.plan.title == ""
    assert doc.vbrief_info == {}


def test_vbrief_document_from_dict_non_dict_vbrief_info_becomes_empty() -> None:
    """When vBRIEFInfo is not a dict, it is silently replaced with {} (models.py:263)."""
    doc = VBriefDocument.from_dict(
        {"vBRIEFInfo": "not-a-dict", "plan": {"title": "T", "status": "running", "items": []}}
    )

    assert doc.vbrief_info == {}


def test_merge_values_extras_added_after_parse_appear_in_preserve_order_output() -> None:
    """Extras added programmatically (not in _field_order) are still emitted (models.py:431)."""
    model = VBriefDocument.from_dict(
        {"vBRIEFInfo": {"version": "0.5"}, "plan": {"title": "T", "status": "running", "items": []}}
    )
    model.extras["runtime_key"] = "runtime_value"  # not in _field_order

    result = model.to_dict(preserve_order=True)

    assert result["runtime_key"] == "runtime_value"
