import spacy
from spacy.pipeline import EntityRuler

class SkillExtractor:
    def __init__(self):
        self._nlp = None

    @property
    def nlp(self):
        if self._nlp is None:
            # Load spaCy pipeline
            nlp = spacy.load("en_core_web_sm")
            
            # Setup custom EntityRuler for skills
            ruler = nlp.add_pipe("entity_ruler", before="ner")
            
            # Define sample skill patterns
            # In a production context, these can be loaded from a JSON configuration file.
            patterns = [
                {"label": "SKILL", "pattern": [{"LOWER": "python"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "react"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "node.js"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "machine"}, {"LOWER": "learning"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "deep"}, {"LOWER": "learning"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "postgres"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "fastapi"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "next.js"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "typescript"}]},
                {"label": "SKILL", "pattern": [{"LOWER": "scipy"}]},
            ]
            ruler.add_patterns(patterns)
            self._nlp = nlp
        return self._nlp

    def extract_skills(self, text: str) -> list:
        """
        Parses biography or skill list text to extract technology tags.
        """
        if not text:
            return []
        
        doc = self.nlp(text)
        skills = set()
        
        # Extract skills matched by EntityRuler
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                skills.add(ent.text.lower())
                
        return list(skills)

# Singleton extractor instance
skill_extractor = SkillExtractor()
