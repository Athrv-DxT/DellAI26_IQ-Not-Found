import numpy as np
from scipy.optimize import linear_sum_assignment

def calculate_match_score(
    expertise_similarity: float, 
    reviewer_load_factor: float, 
    has_conflict: bool, 
    diversity_boost: float = 0.0
) -> float:
    """
    Computes a score for a potential reviewer-submission pair.
    Targeting: 0.4*Expertise + 0.3*Workload + 0.2*Conflict + 0.1*Diversity
    Where conflict is represented as a penalty or boolean multiplier.
    """
    conflict_multiplier = 0.0 if has_conflict else 1.0
    
    raw_score = (
        0.40 * expertise_similarity +
        0.30 * reviewer_load_factor +
        0.10 * diversity_boost
    )
    
    # Conflict forces score to zero to avoid selection
    return raw_score * conflict_multiplier

def solve_optimal_assignments(cost_matrix: np.ndarray) -> list:
    """
    Solves the assignment problem optimally using the Hungarian algorithm via scipy.
    scipy's linear_sum_assignment finds the minimum cost. To maximize score, 
    we pass (max_val - cost_matrix) to the solver.
    
    Returns:
        List of tuples (row_idx, col_idx) representing (submission_idx, reviewer_idx)
    """
    if cost_matrix.size == 0:
        return []
        
    # Invert the score matrix to turn maximization into minimization
    max_val = np.max(cost_matrix)
    cost = max_val - cost_matrix
    
    row_ind, col_ind = linear_sum_assignment(cost)
    return list(zip(row_ind, col_ind))
