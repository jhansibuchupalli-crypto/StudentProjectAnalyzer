
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

app = Flask(__name__)
CORS(app)


# Text similarity calculation
def compare_text(text1, text2):
    text1 = str(text1 or "").strip()
    text2 = str(text2 or "").strip()

    if not text1 or not text2:
        return 0.0

    vectors = TfidfVectorizer().fit_transform([text1, text2])
    score = cosine_similarity(
        vectors[0:1],
        vectors[1:2]
    )[0][0]

    return round(float(score) * 100, 2)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "Analysis service is running"
    })


# Convert list into text
def format_list(value):
    if isinstance(value, list):
        return ", ".join(
            str(item).strip()
            for item in value
            if str(item).strip()
        )

    if isinstance(value, str):
        try:
            parsed = json.loads(value)

            if isinstance(parsed, list):
                return format_list(parsed)
        except (ValueError, TypeError):
            pass

        return value.strip()

    return ""


# Convert features into list
def get_features(value):
    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    if isinstance(value, str):
        try:
            parsed = json.loads(value)

            if isinstance(parsed, list):
                return get_features(parsed)
        except (ValueError, TypeError):
            pass

        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    return []


# Compare individual features
def feature_similarity(feature1, feature2):
    return compare_text(feature1, feature2)


# Novelty Analysis - Compare with Top 5
def calculate_novelty(project, top_projects):
    new_features = get_features(
        project.get("mainFeatures", [])
    )

    if not new_features:
        return {
            "noveltyScore": None,
            "noveltyLevel": "Not Available",
            "uniqueFeatures": [],
            "commonFeatures": [],
            "message": "No features provided"
        }

    if not top_projects:
        return {
            "noveltyScore": None,
            "noveltyLevel": "Not Available",
            "uniqueFeatures": [],
            "commonFeatures": [],
            "message": "No existing projects available for comparison"
        }

    existing_features = []

    for existing in top_projects:
        features = get_features(
            existing.get("mainFeatures", [])
        )
        existing_features.extend(features)

    if not existing_features:
        return {
            "noveltyScore": None,
            "noveltyLevel": "Not Available",
            "uniqueFeatures": [],
            "commonFeatures": [],
            "message": "Existing projects have no feature data"
        }

    unique_features = []
    common_features = []

    for feature in new_features:
        max_similarity = max(
            feature_similarity(feature, existing_feature)
            for existing_feature in existing_features
        )

        if max_similarity >= 70:
            common_features.append(feature)
        else:
            unique_features.append(feature)

    novelty_score = round(
        (len(unique_features) / len(new_features)) * 100,
        2
    )

    if novelty_score >= 70:
        novelty_level = "High"
    elif novelty_score >= 40:
        novelty_level = "Moderate"
    else:
        novelty_level = "Low"

    return {
        "noveltyScore": novelty_score,
        "noveltyLevel": novelty_level,
        "uniqueFeatures": unique_features,
        "commonFeatures": common_features,
        "message": "Novelty analysis completed"
    }


# Differentiation Analysis - Compare with Top 1
def calculate_differentiation(project, top_project):

    if not top_project:
        return {
            "mostSimilarProject": None,
            "commonFeatures": [],
            "additionalFeatures": [],
            "differentFeatures": [],
            "message": "No matching project available"
        }

    new_features = get_features(
        project.get("mainFeatures", [])
    )

    existing_features = get_features(
        top_project.get("mainFeatures", [])
    )

    common_features = []
    additional_features = []
    different_features = []

    threshold = 70

    # New project features comparison
    for new_feature in new_features:

        is_common = any(
            feature_similarity(new_feature, old_feature) >= threshold
            for old_feature in existing_features
        )

        if is_common:
            common_features.append(new_feature)
        else:
            additional_features.append(new_feature)

    # Features present only in existing project
    for old_feature in existing_features:

        is_common = any(
            feature_similarity(old_feature, new_feature) >= threshold
            for new_feature in new_features
        )

        if not is_common:
            different_features.append(old_feature)

    return {
        "mostSimilarProject": {
            "projectId": top_project.get("projectId", ""),
            "projectTitle": top_project.get("projectTitle", ""),
            "overallSimilarity": top_project.get(
                "overallSimilarity", 0
            )
        },
        "commonFeatures": common_features,
        "additionalFeatures": additional_features,
        "differentFeatures": different_features,
        "message": "Differentiation analysis completed"
    }


# Similarity + Novelty + Differentiation API
@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json(silent=True) or {}
    project = data.get("project", {})
    existing_projects = data.get("existingProjects", [])

    fields = [
        "title",
        "domain",
        "abstract",
        "technologies",
        "problemStatement",
        "mainFeatures"
    ]

    results = []

    # Compare new project with all existing projects
    for existing in existing_projects:
        field_scores = {}

        for field in fields:
            field_scores[field] = compare_text(
                format_list(project.get(field, "")),
                format_list(existing.get(field, ""))
            )

        overall = round(
            sum(field_scores.values()) / len(fields),
            2
        )

        results.append({
            "projectId": str(
                existing.get(
                    "_id",
                    existing.get("projectId", "")
                )
            ),
            "projectTitle": existing.get(
                "title",
                "Untitled Project"
            ),
            "title": existing.get(
                "title",
                "Untitled Project"
            ),
            "abstract": existing.get("abstract", ""),
            "domain": existing.get("domain", ""),
            "technologies": format_list(
                existing.get("technologies", [])
            ),
            "mainFeatures": format_list(
                existing.get("mainFeatures", [])
            ),
            "problemStatement": existing.get(
                "problemStatement",
                ""
            ),
            "fieldScores": field_scores,
            "overallSimilarity": overall
        })

    # Sort projects by similarity
    results.sort(
        key=lambda item: item["overallSimilarity"],
        reverse=True
    )

    # Select Top 5 projects
    top_five_projects = results[:5]

    # Select Top 1 project
    top_one_project = results[0] if results else None

    # Overall similarity and category scores
    selected_overall = (
        top_one_project["overallSimilarity"]
        if top_one_project else 0
    )

    selected_field_scores = (
        top_one_project["fieldScores"]
        if top_one_project else {}
    )

    # Novelty Analysis using Top 5
    novelty_result = calculate_novelty(
        project,
        top_five_projects
    )

    # Differentiation Analysis using Top 1
    differentiation_result = calculate_differentiation(
        project,
        top_one_project
    )

    return jsonify({
        "success": True,
        "analyzedProject": {
            "title": project.get("title", ""),
            "domain": project.get("domain", ""),
            "abstract": project.get("abstract", ""),
            "technologies": project.get(
                "technologies", ""
            ),
            "problemStatement": project.get(
                "problemStatement", ""
            ),
            "mainFeatures": project.get(
                "mainFeatures", ""
            )
        },
        "overallSimilarity": selected_overall,
        "fieldScores": selected_field_scores,
        "matchingProjects": top_five_projects,
        "noveltyAnalysis": novelty_result,
        "differentiationAnalysis": differentiation_result,
        "message": "Analysis completed"
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )
