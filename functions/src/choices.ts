export default {
    "q1": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate1.gif",
        "plate-code": 1,
        "choices": ["12","24","Nothing"],
        "scores": {
            "12": {
                "creepy": 0,
                "red-green": 0,
                "total": 0,
                "normal": 0
            },
            "default" : {
                "creepy": 0.5
            }
        }
    },
    "q2": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate2.gif",
        "plate-code": 2,
        "choices": ["8","3","Nothing"],
        "scores": {
            "8": {
                "normal": 0.2
            },
            "3": {
                "red-green": 0.2,
                "total": 0.1,
                "normal": -0.1
            },
            "nothing": {
                "total": 0.2,
                "normal": -0.1
            },
            "default" : {
                "creepy": 0.1
            }
        }
    },
    "q3": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate8.gif",
        "plate-code": 8,
        "choices": ["6","9","3","Nothing"],
        "scores": {
            "6": {
                "normal": 0.2
            },
            "nothing": {
                "total": 0.2,
                "red-green": 0.2,
                "normal": -0.1
            },
            "default" : {
                "total": 0.1,
                "red-green": 0.1
            }
        }
    },
    "q4": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate3.gif",
        "plate-code": 3,
        "choices": ["29","70","Nothing"],
        "scores": {
            "29": {
                "normal": 0.2
            },
            "70": {
                "red-green": 0.2,
                "normal": -0.1
            },
            "nothing": {
                "total": 0.2,
                "normal": -0.1
            },
            "default" : {
                "creepy": 0.1
            }
        }
    },
    "q5": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate10.gif",
        "plate-code": 10,
        "choices": ["5","Nothing"],
        "scores": {
            "5": {
                "normal": 0.2
            },
            "nothing": {
                "total": 0.2,
                "red-green": 0.1,
                "normal": -0.1
            },
            "default" : {
                "creepy": 0.1
            }
        }
    },
    "q6": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate14A.gif",
        "plate-code": 14,
        "choices": ["5","Nothing"],
        "scores": {
            "5": {
                "normal": -0.2,
                "total": 0.2,
                "red-green": 0.2
            },
            "nothing": {
                "total": -0.2,
                "normal": 0.1
            },
            "default" : {
                "normal": 0.1
            }
        }
    }
}