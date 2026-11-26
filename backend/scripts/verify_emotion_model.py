"""Sanity-check the pinned emotion model with synthetic representative text."""

from app.services.emotion import infer_emotions


SAMPLES = {
    "joy": "I felt calm and grateful after spending time with my family.",
    "anger": "I am furious and deeply disappointed by what happened.",
    "fear": "I feel worried that nothing will work out.",
}


def main() -> None:
    for expected_label, text in SAMPLES.items():
        scores = infer_emotions(text)
        predicted_label = max(scores, key=scores.get)
        confidence = scores[predicted_label]
        print(f"expected={expected_label} predicted={predicted_label} score={confidence:.3f}")
        if predicted_label != expected_label or confidence < 0.5:
            raise SystemExit(f"Model sanity check failed for expected label: {expected_label}")


if __name__ == "__main__":
    main()
