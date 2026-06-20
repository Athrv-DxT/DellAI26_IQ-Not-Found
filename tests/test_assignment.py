import pytest
import numpy as np
from ai.models.matcher import calculate_match_score, solve_optimal_assignments

def test_calculate_match_score():
    # Full conflict must equal 0 score
    assert calculate_match_score(0.8, 0.9, has_conflict=True) == 0.0
    
    # Calculate score without conflict: 0.4*0.8 + 0.3*0.9 + 0.1*0.0 = 0.32 + 0.27 = 0.59
    val = calculate_match_score(0.8, 0.9, has_conflict=False, diversity_boost=0.0)
    assert abs(val - 0.59) < 1e-5

def test_hungarian_solver():
    # Row idx 0 and Row idx 1
    # Col idx 0 and Col idx 1
    score_matrix = np.array([
        [10.0, 2.0],
        [1.0,  8.0]
    ])
    
    assignments = solve_optimal_assignments(score_matrix)
    # The optimal assignments should pair row 0 to col 0 and row 1 to col 1
    # as 10.0 + 8.0 = 18.0 (optimal)
    assert assignments == [(0, 0), (1, 1)]
