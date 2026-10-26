
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)


def compare_text(text1, text2):
    text1 = str(text1 or "").strip()
    text2 = str(text2 or "").strip()

    if not text1 or not text2:
        return 0.0

    vectors = TfidfVectorizer().fit_transform([text1, text2])
    score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

    return round(float(score) * 100, 2)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "Similarity service is running"
    })


def format_list(value):
    if isinstance(value, list):
        return ", ".join(str(item).strip() for item in value if str(item).strip())

    if isinstance(value, str):
        try:
            import json
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return ", ".join(
                    str(item).strip() for item in parsed if str(item).strip()
                )
        except (ValueError, TypeError):
            pass

        return value.strip()

    return ""


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
    selected_field_scores = {}
    selected_overall = 0

    if existing_projects:
        best_match = None
        best_score = -1

        for existing in existing_projects:
            scores = {
                field: compare_text(
                    project.get(field, ""),
                    existing.get(field, "")
                )
                for field in fields
            }

            score = round(sum(scores.values()) / len(fields), 2)

            if score > best_score:
                best_score = score
                best_match = scores

        selected_field_scores = best_match or {}
        selected_overall = max(best_score, 0)

    results = []

    for existing in existing_projects:
        field_scores = {}

        for field in fields:
            field_scores[field] = compare_text(
                project.get(field, ""),
                existing.get(field, "")
            )

        overall = round(sum(field_scores.values()) / len(fields), 2)

        

    results = []

    for existing in existing_projects:
        field_scores = {}

        for field in fields:
            field_scores[field] = compare_text(
                project.get(field, ""),
                existing.get(field, "")
            )

        overall = round(sum(field_scores.values()) / len(fields), 2)

        results.append({
            "projectId": str(existing.get("_id", existing.get("projectId", ""))),
            "projectTitle": existing.get("title", "Untitled Project"),
            "title": existing.get("title", "Untitled Project"),
            "abstract": existing.get("abstract", ""),
            "domain": existing.get("domain", ""),
            "technologies": format_list(existing.get("technologies", [])),
            "mainFeatures": format_list(existing.get("mainFeatures", [])),
            "problemStatement": existing.get("problemStatement", ""),
            "fieldScores": field_scores,
            "overallSimilarity": overall
        })

    results.sort(
        key=lambda item: item["overallSimilarity"],
        reverse=True
    )

    return jsonify({
        "success": True,
        "analyzedProject": {
            "title": project.get("title", ""),
            "domain": project.get("domain", ""),
            "abstract": project.get("abstract", ""),
            "technologies": project.get("technologies", ""),
            "problemStatement": project.get("problemStatement", ""),
            "mainFeatures": project.get("mainFeatures", "")
        },
        "overallSimilarity": selected_overall,
        "fieldScores": selected_field_scores,
        "matchingProjects": results[:5],
        "message": "Analysis completed"
    })



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)