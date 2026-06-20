import pytest
from ai.models.ner import SkillExtractor

def test_skill_extractor_skeleton():
    """
    Test NLP skill extractor configuration.
    """
    extractor = SkillExtractor()
    assert extractor._nlp is None
    
    # We can test extracting mock matching patterns if spaCy en_core_web_sm is present.
    # We test empty text fallback.
    assert extractor.extract_skills("") == []
