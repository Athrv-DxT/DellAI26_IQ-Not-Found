import pytest
import pandas as pd
from ai.models.bias_detector import detect_score_outliers

def test_bias_detection_outliers():
    # If standard deviation is 0, no outliers are flagged
    df_no_var = pd.DataFrame([
        {"score_id": "1", "final_score": 5.0, "gender": "Female"},
        {"score_id": "2", "final_score": 5.0, "gender": "Female"},
        {"score_id": "3", "final_score": 5.0, "gender": "Female"}
    ])
    assert detect_score_outliers(df_no_var) == []

    # Significant outlier score: 10.0 is outlier compared to 4.0 and 4.0
    # Mean: (10 + 4 + 4) / 3 = 6.0
    # Std: sqrt(((10-6)^2 + (4-6)^2 + (4-6)^2)/3) = sqrt((16 + 4 + 4)/3) = sqrt(8) = 2.828
    # Z-score for 10.0: (10 - 6) / 2.828 = 1.414 (which is < threshold 2.0)
    # Let's adjust inputs to cross threshold: 12.0, 2.0, 2.0
    # Mean: 5.33, Std: 4.71. Z-score for 12: (12-5.33)/4.71 = 1.41
    # To easily hit z-score > 2.0, we need a larger sample size or a very massive outlier with tight variance.
    # E.g. final_scores: 100.0, 1.0, 1.0, 1.0, 1.0
    # Mean: 20.8
    # Variance terms: (100-20.8)^2 + 4 * (1-20.8)^2 = 6272.64 + 4 * 392.04 = 7840.8
    # Std: sqrt(7840.8 / 5) = sqrt(1568.16) = 39.6
    # Z-score for 100.0: (100 - 20.8) / 39.6 = 2.0001 (which is > 2.0 threshold!)
    df_outlier = pd.DataFrame([
        {"score_id": "1", "final_score": 100.0, "gender": "Male"},
        {"score_id": "2", "final_score": 1.0, "gender": "Male"},
        {"score_id": "3", "final_score": 1.0, "gender": "Male"},
        {"score_id": "4", "final_score": 1.0, "gender": "Male"},
        {"score_id": "5", "final_score": 1.0, "gender": "Male"}
    ])
    
    alerts = detect_score_outliers(df_outlier, threshold=2.0)
    assert len(alerts) == 1
    assert alerts[0]["score_id"] == "1"
    assert alerts[0]["bias_type"] == "gender"
