from typing import Dict, Any
from ..schemas.schemas import RiskLevelEnum, LanguageEnum

class AlertService:
    """
    Multilingual Alert Generation Service.
    Conforms to the ITU-T X.1303 Common Alerting Protocol (CAP v1.2) & NDMA format.
    Generates vernacular warning advisories in English, Hindi, Assamese, and Bengali.
    """

    TEMPLATES = {
        LanguageEnum.ENGLISH: {
            RiskLevelEnum.CRITICAL: {
                "title": "URGENT DISASTER WARNING: Extreme Landslide Threat",
                "body": lambda zone, rain: f"IMMEDIATE DANGER: Geological sensors indicate critical slope instability at {zone}. 24-hour rainfall ({rain}mm) has surpassed critical threshold. Evacuate downstream hamlets to designated civil defense shelters immediately. Avoid mountain corridors."
            },
            RiskLevelEnum.HIGH: {
                "title": "HIGH ALERT: Imminent Landslide Vulnerability",
                "body": lambda zone, rain: f"ADVISORY: Severe slope saturation detected along {zone} with rainfall reaching {rain}mm. Border Roads Organisation (BRO) earthmovers on active standby. Exercise high vigilance and restrict non-essential vehicular movement."
            },
            RiskLevelEnum.WATCH: {
                "title": "WATCH NOTICE: Elevated Geotechnical Monitoring",
                "body": lambda zone, rain: f"CAUTION: Increasing pore-water pressure observed at {zone} ({rain}mm rainfall). Local village monitoring volunteers requested to conduct 2-hour fissure checks."
            }
        },
        LanguageEnum.HINDI: {
            RiskLevelEnum.CRITICAL: {
                "title": "तत्काल आपदा चेतावनी: अत्यधिक भूस्खलन का खतरा",
                "body": lambda zone, rain: f"गंभीर चेतावनी: {zone} में अत्यधिक ढलान अस्थिरता दर्ज की गई है। 24 घंटे में वर्षा ({rain} मिमी) खतरे के स्तर को पार कर चुकी है। निचले गांवों को तत्काल राहत शिविरों में खाली करें। पहाड़ी सड़कों पर यात्रा न करें।"
            },
            RiskLevelEnum.HIGH: {
                "title": "उच्च सतर्कता: संभावित भूस्खलन की चेतावनी",
                "body": lambda zone, rain: f"चेतावनी: {zone} में लगातार वर्षा ({rain} मिमी) के कारण मिट्टी का कटाव तेज हो गया है। गैर-जरूरी यात्रा से बचें और सुरक्षित स्थानों पर सतर्क रहें।"
            },
            RiskLevelEnum.WATCH: {
                "title": "सतर्कता सूचना: भू-तकनीकी निगरानी जारी",
                "body": lambda zone, rain: f"सतर्क रहें: {zone} क्षेत्र में लगातार बारिश ({rain} मिमी) से निगरानी बढ़ा दी गई है। ढलानों पर किसी भी दरार की तुरंत सूचना दें।"
            }
        },
        LanguageEnum.ASSAMESE: {
            RiskLevelEnum.CRITICAL: {
                "title": "জৰুৰী সতৰ্কবাণী: চৰম ভূমিস্খলনৰ আশংকা",
                "body": lambda zone, rain: f"অতি জৰুৰী: {zone} অঞ্চলত ধাৰাসাৰ বৰষুণৰ ({rain} মিমি) বাবে ভূমিস্খলনৰ তীব্ৰ আশংকা দেখা দিছে। নদীৰ পাৰ আৰু পাহাৰৰ নামনিৰ বাসিন্দাসকলক শীঘ্ৰে সুৰক্ষিত আশ্ৰয়স্থললৈ স্থানান্তৰিত হ'বলৈ অনুৰোধ জনোৱা হৈছে।"
            },
            RiskLevelEnum.HIGH: {
                "title": "উচ্চ সতৰ্কতা: ভূমিস্খলনৰ সম্ভাব্য ভাবুকি",
                "body": lambda zone, rain: f"সতৰ্কবাণী: {zone} পথত ধাৰাসাৰ বৰষুণৰ ({rain} মিমি) ফলত পথ বন্ধ আৰু শিল খহি পৰাৰ আশংকা বৃদ্ধি পাইছে। পাহাৰীয়া পথেৰে ভ্ৰমণ পৰিহাৰ কৰক।"
            },
            RiskLevelEnum.WATCH: {
                "title": "নজৰদাৰী জাননী: পাহাৰীয়া অঞ্চলৰ নিৰীক্ষণ",
                "body": lambda zone, rain: f"সাৱধান হওক: {zone} অঞ্চলত অব্যাহত থকা বৰষুণৰ বাবে সতৰ্কতামূলক দৃষ্টি ৰখা হৈছে। যিকোনো মাটি খহনীয়াৰ খবৰ ততাতৈয়াকৈ বিভাগক জনাওক।"
            }
        },
        LanguageEnum.BENGALI: {
            RiskLevelEnum.CRITICAL: {
                "title": "জরুরী দুর্যোগ সতর্কতা: চরম ভূমিধসের আশঙ্কা",
                "body": lambda zone, rain: f"অত্যন্ত সতর্ক থাকুন: {zone} এলাকায় অতিভারী বৃষ্টির ({rain} মিমি) ফলে মারাত্মক ভূমিধসের সম্ভাবনা দেখা দিয়েছে। নিম্নাঞ্চলের সকল বাসিন্দাদের দ্রুত নিকটবর্তী আশ্রয়কেন্দ্রে সরে যাওয়ার নির্দেশ দেওয়া হচ্ছে।"
            },
            RiskLevelEnum.HIGH: {
                "title": "উচ্চ সতর্কতা: সম্ভাব্য ভূমিধস সংক্রান্ত বিজ্ঞপ্তি",
                "body": lambda zone, rain: f"সতর্কতা: {zone} পাহাড়ি সড়কে ভারী বর্ষণে ({rain} মিমি) ধস নামার সম্ভাবনা তৈরি হয়েছে। অতি প্রয়োজন ছাড়া পাহাড়ি রাস্তায় যাতায়াত করবেন না।"
            },
            RiskLevelEnum.WATCH: {
                "title": "পর্যবেক্ষণ বিজ্ঞপ্তি: সজাগ দৃষ্টি রাখা হচ্ছে",
                "body": lambda zone, rain: f"নজরদারি: {zone} অঞ্চলে সাম্প্রতিক বৃষ্টিপাতের কারণে দুর্যোগ মোকাবিলা দল নজরদারি জারি রেখেছে। স্থানীয় মানুষকে সতর্ক থাকার আহ্বান জানানো হচ্ছে।"
            }
        }
    }

    @classmethod
    def get_vernacular_template(cls, language: LanguageEnum, risk_level: RiskLevelEnum, location_name: str, rainfall: float) -> Dict[str, str]:
        lang_dict = cls.TEMPLATES.get(language, cls.TEMPLATES[LanguageEnum.ENGLISH])
        level_dict = lang_dict.get(risk_level, lang_dict[RiskLevelEnum.CRITICAL])
        return {
            "title": level_dict["title"],
            "body": level_dict["body"](location_name, rainfall)
        }
