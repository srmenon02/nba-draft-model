#!/bin/bash

# NBA Draft Model - Full Pipeline Orchestration
# Runs complete data pipeline: ingest → features → models → JSON export

set -e  # Exit on error

echo "================================================================================"
echo "NBA DRAFT MODEL - FULL PIPELINE"
echo "================================================================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "Error: Python not found"
    exit 1
fi

# Determine Python command
PYTHON_CMD="/Users/smeno/Documents/Personal/Projects/ml-task-engine/backend/venv/bin/python"

if [ ! -f "$PYTHON_CMD" ]; then
    echo "Error: Python executable not found at $PYTHON_CMD"
    echo "Please update PYTHON_CMD in run_pipeline.sh"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"
echo ""

# Step 1: Data Analysis
echo "================================================================================"
echo "STEP 1: DATA ANALYSIS & VALIDATION"
echo "================================================================================"
echo ""
$PYTHON_CMD src/analyze_data.py
if [ $? -ne 0 ]; then
    echo "Error: Data analysis failed"
    exit 1
fi
echo ""

# Step 2: Collect Supplemental Data
echo "================================================================================"
echo "STEP 2: COLLECT SUPPLEMENTAL DATA"
echo "================================================================================"
echo ""
$PYTHON_CMD src/collect_supplemental_data.py
if [ $? -ne 0 ]; then
    echo "Error: Data collection failed"
    exit 1
fi
echo ""

# Step 3: Data Validation
echo "================================================================================"
echo "STEP 3: DATA VALIDATION"
echo "================================================================================"
echo ""
$PYTHON_CMD src/features/validation.py
if [ $? -ne 0 ]; then
    echo "Error: Data validation failed"
    exit 1
fi
echo ""

# Step 4: Train Success Prediction Model
echo "================================================================================"
echo "STEP 4: TRAIN SUCCESS PREDICTION MODEL"
echo "================================================================================"
echo ""
$PYTHON_CMD src/models/success.py
if [ $? -ne 0 ]; then
    echo "Error: Model training failed"
    exit 1
fi
echo ""

# Step 5: SHAP Analysis
echo "================================================================================"
echo "STEP 5: SHAP FEATURE IMPORTANCE ANALYSIS"
echo "================================================================================"
echo ""
$PYTHON_CMD src/models/shap_analysis.py
if [ $? -ne 0 ]; then
    echo "Error: SHAP analysis failed"
    exit 1
fi
echo ""

# Step 6: Player Similarity Comparisons
echo "================================================================================"
echo "STEP 6: GENERATE PLAYER COMPARISONS"
echo "================================================================================"
echo ""
$PYTHON_CMD src/models/similarity.py
if [ $? -ne 0 ]; then
    echo "Error: Similarity analysis failed"
    exit 1
fi
echo ""

# Step 7: Export JSON for Frontend
echo "================================================================================"
echo "STEP 7: EXPORT JSON FILES"
echo "================================================================================"
echo ""
$PYTHON_CMD src/export/build_json.py
if [ $? -ne 0 ]; then
    echo "Error: JSON export failed"
    exit 1
fi
echo ""

# Success summary
echo "================================================================================"
echo "✓ PIPELINE COMPLETE"
echo "================================================================================"
echo ""
echo "Generated artifacts:"
echo "  • Data: data/processed/enhanced_draft_data.csv"
echo "  • Models: data/models/success_model.pkl"
echo "  • JSON: frontend/public/data/*.json"
echo ""
echo "Next steps:"
echo "  1. cd ../frontend"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "================================================================================"
