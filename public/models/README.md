# Face-API.js Models

This directory should contain the face-api.js model files for face detection and recognition.

## Required Models

Download the following model files and place them in this directory:

1. **tiny_face_detector_model-weights_manifest.json** and **tiny_face_detector_model-shard1**
2. **face_landmark_68_model-weights_manifest.json** and **face_landmark_68_model-shard1**
3. **face_recognition_model-weights_manifest.json** and **face_recognition_model-shard1**
4. **face_expression_model-weights_manifest.json** and **face_expression_model-shard1**

## Download Instructions

You can download these models from:
- https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Or use the face-api.js model downloader:
```bash
npx face-api.js-download-models
```

## Fallback Behavior

If models are not available, the system will use fallback heuristics for face detection and comparison. This ensures the validation system continues to work even without the ML models.

## File Structure

```
public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_expression_model-weights_manifest.json
├── face_expression_model-shard1
└── README.md
```
