import pandas as pd
import numpy as np
from scipy import stats

def detect_score_outliers(scores_df: pd.DataFrame, threshold: float = 2.0) -> list:
    """
    Groups scores by demographics and calculates z-scores.
    
    Parameters:
        scores_df: pd.DataFrame with columns:
                   ['score_id', 'final_score', 'gender', 'institution', 'location']
        threshold: Z-score value beyond which scores are flagged (default 2.0)
        
    Returns:
        List of dicts representing flagged bias alerts.
    """
    alerts = []
    if scores_df.empty or len(scores_df) < 3:
        return alerts
        
    group_fields = ["gender", "institution", "location"]
    
    for field in group_fields:
        if field not in scores_df.columns:
            continue
            
        # Group and calculate mean and standard deviation per group
        grouped = scores_df.groupby(field)['final_score']
        
        for name, group in grouped:
            if len(group) < 3:
                continue  # skip tiny samples to avoid high false positives
                
            mean = group.mean()
            std = group.std(ddof=0)
            
            if std == 0:
                continue
                
            for idx, row in scores_df[scores_df[field] == name].iterrows():
                z_val = (row['final_score'] - mean) / std
                if abs(z_val) > threshold:
                    alerts.append({
                        "score_id": row['score_id'],
                        "bias_type": field,
                        "z_score": z_val,
                        "confidence": abs(z_val)
                    })
                    
    return alerts
