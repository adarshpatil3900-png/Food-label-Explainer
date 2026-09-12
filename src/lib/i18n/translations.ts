export type SupportedLanguage = "en" | "hi" | "mr";

export interface TranslationDictionary {
  appName: string;
  appDescription: string;
  nav: {
    title: string;
    lightMode: string;
    darkMode: string;
    selectLanguage: string;
  };
  upload: {
    title: string;
    subtitle: string;
    chooseImage: string;
    takePhoto: string;
    hint: string;
    samplePrompt: string;
    sampleHighlight: string;
    sampleGranola: string;
    sampleSoup: string;
  };
  preview: {
    uploadDifferent: string;
    original: string;
    enhanced: string;
    contrastTitle: string;
    contrastDesc: string;
    analyzeLabel: string;
    loadingPreview: string;
  };
  status: {
    readingLabel: string;
    workerNote: string;
    startingEngine: string;
  };
  results: {
    title: string;
    detectedSummary: (nutrients: number, ingredients: number) => string;
    scanAnother: string;
    limitedDataTitle: string;
    limitedDataDesc: string;
    nutritionHighlights: string;
    nutritionFacts: string;
    deterministicNote: string;
    notDetected: string;
    ingredientsList: string;
    itemsCount: (count: number) => string;
    containsAllergens: string;
    noIngredientsFound: string;
    noIngredientsDesc: string;
    ingredientsOrderNote: string;
    whatThisMeans: string;
    regenerate: string;
    generatingExplanation: string;
    explanationUnavailable: string;
    tryAgain: string;
    takeaway: string;
    viewRawOcr: (count: number) => string;
    confidenceLine: (conf: number, lines: number) => string;
    copyRawText: string;
    copied: string;
    rerunOcr: string;
    viewScannedPhoto: (name: string) => string;
  };
  nutrients: {
    calories: string;
    totalFat: string;
    saturatedFat: string;
    transFat: string;
    cholesterol: string;
    sodium: string;
    totalCarbs: string;
    dietaryFiber: string;
    sugars: string;
    addedSugars: string;
    protein: string;
    servingSize: string;
  };
  tagLabels: {
    [key: string]: string;
  };
  error: {
    unableToRead: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tryAgain: string;
    chooseDifferent: string;
    fallbackError: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: "Food Label Explainer",
    appDescription:
      "Extract, examine, and understand packaged food nutrition facts and ingredients with client-side OCR and plain-language explanation.",
    nav: {
      title: "Food Label Explainer",
      lightMode: "Switch to light mode",
      darkMode: "Switch to dark mode",
      selectLanguage: "Select language",
    },
    upload: {
      title: "Upload food packaging label",
      subtitle: "Drag and drop an image file here, or choose an option below",
      chooseImage: "Choose Image",
      takePhoto: "Take Photo",
      hint: "Supports JPG, PNG, WEBP, HEIC. All processing runs locally in your browser.",
      samplePrompt: "Test with a sample food package:",
      sampleHighlight: "No label image handy?",
      sampleGranola: "Granola Label",
      sampleSoup: "Soup Label",
    },
    preview: {
      uploadDifferent: "Upload different image",
      original: "Original",
      enhanced: "Enhanced (OCR view)",
      contrastTitle: "Apply contrast optimization before OCR",
      contrastDesc: "Converts to grayscale & stretches dynamic range for crisper label text",
      analyzeLabel: "Analyze Label",
      loadingPreview: "Loading preview…",
    },
    status: {
      readingLabel: "Reading label…",
      workerNote: "Processing image in a background worker thread. Please wait…",
      startingEngine: "Starting OCR engine…",
    },
    results: {
      title: "Parsed Label Analysis",
      detectedSummary: (n, i) => `${n} of 7 core nutrients detected • ${i} ingredients identified`,
      scanAnother: "Analyze another label",
      limitedDataTitle: "Limited data detected.",
      limitedDataDesc:
        "The label may be angled, low resolution, or missing standard nutrition headers. Check the raw text below or try capturing a closer, well-lit photo.",
      nutritionHighlights: "Nutrition Highlights",
      nutritionFacts: "Nutrition Facts",
      deterministicNote: "Values extracted deterministically from label OCR.",
      notDetected: "Not detected",
      ingredientsList: "Ingredients List",
      itemsCount: (c) => `${c} items`,
      containsAllergens: "Contains:",
      noIngredientsFound: "No ingredients list found",
      noIngredientsDesc:
        'No "Ingredients:" block could be detected. If present on the package, verify in the raw text below.',
      ingredientsOrderNote: "Ingredients are listed in order of predominance by weight.",
      whatThisMeans: "What This Means",
      regenerate: "Regenerate",
      generatingExplanation: "Generating explanation…",
      explanationUnavailable:
        "Explanation unavailable right now — the nutrition data above is still accurate.",
      tryAgain: "Try again",
      takeaway: "Takeaway:",
      viewRawOcr: (c) => `View raw extracted OCR text (${c} characters)`,
      confidenceLine: (conf, lines) => `Confidence: ${conf}% • ${lines} lines`,
      copyRawText: "Copy Raw Text",
      copied: "Copied",
      rerunOcr: "Re-run OCR engine on current image",
      viewScannedPhoto: (name) => `View scanned source photo (${name})`,
    },
    nutrients: {
      calories: "Calories",
      totalFat: "Total Fat",
      saturatedFat: "Saturated Fat",
      transFat: "Trans Fat",
      cholesterol: "Cholesterol",
      sodium: "Sodium",
      totalCarbs: "Total Carbohydrate",
      dietaryFiber: "Dietary Fiber",
      sugars: "Sugars",
      addedSugars: "Added Sugars",
      protein: "Protein",
      servingSize: "Serving size",
    },
    tagLabels: {
      "High Sugar": "High Sugar",
      "Low Sugar": "Low Sugar",
      "High Sodium": "High Sodium",
      "Low Sodium": "Low Sodium",
      "High Protein": "High Protein",
      "Good Source of Fiber": "Good Source of Fiber",
      "High Saturated Fat": "High Saturated Fat",
      "Moderate Sugar": "Moderate Sugar",
      "Moderate Sodium": "Moderate Sodium",
    },
    error: {
      unableToRead: "Unable to read label",
      tipsTitle: "Tips for better recognition:",
      tip1: "Ensure label text is flat and well-lit without heavy glare or flash reflections",
      tip2: "Hold the camera closer so the nutrition facts or ingredient list fills the frame",
      tip3: "Avoid blurry or tilted shots",
      tryAgain: "Try Again",
      chooseDifferent: "Choose Different Photo",
      fallbackError: "Failed to process food label. Please ensure the image is clear and try again.",
    },
  },

  hi: {
    appName: "फूड लेबल एक्सप्लेनर",
    appDescription:
      "ब्राउज़र-आधारित ओसीआर और सरल स्पष्टीकरण के साथ पैकेज्ड फूड के पोषण तथ्यों और सामग्रियों को निकालें, जांचें और समझें।",
    nav: {
      title: "फूड लेबल एक्सप्लेनर",
      lightMode: "लाइट मोड पर स्विच करें",
      darkMode: "डार्क मोड पर स्विच करें",
      selectLanguage: "भाषा चुनें",
    },
    upload: {
      title: "खाद्य पैकेजिंग लेबल अपलोड करें",
      subtitle: "यहाँ इमेज फ़ाइल खींचें और छोड़ें, या नीचे दिए गए विकल्पों में से चुनें",
      chooseImage: "इमेज चुनें",
      takePhoto: "फोटो लें",
      hint: "JPG, PNG, WEBP, HEIC समर्थित हैं। सभी प्रोसेसिंग सीधे आपके ब्राउज़र में होती है।",
      samplePrompt: "नमूना पैकेज के साथ परीक्षण करें:",
      sampleHighlight: "क्या आपके पास लेबल फोटो नहीं है?",
      sampleGranola: "ग्रेनोला लेबल",
      sampleSoup: "वेजिटेबल सूप लेबल",
    },
    preview: {
      uploadDifferent: "अन्य इमेज अपलोड करें",
      original: "मूल इमेज",
      enhanced: "संवर्धित (OCR दृश्य)",
      contrastTitle: "OCR से पहले कंट्रास्ट सुधार लागू करें",
      contrastDesc: "स्पष्ट लेबल टेक्स्ट के लिए ग्रेस्केल में बदलता है और डायनामिक रेंज बढ़ाता है",
      analyzeLabel: "लेबल का विश्लेषण करें",
      loadingPreview: "पूर्वावलोकन लोड हो रहा है…",
    },
    status: {
      readingLabel: "लेबल पढ़ा जा रहा है…",
      workerNote: "बैकग्राउंड वर्कर थ्रेड में इमेज प्रोसेस हो रही है। कृपया प्रतीक्षा करें…",
      startingEngine: "OCR इंजन प्रारंभ हो रहा है…",
    },
    results: {
      title: "पार्स किया गया लेबल विश्लेषण",
      detectedSummary: (n, i) => `7 में से ${n} मुख्य पोषक तत्व पहचाने गए • ${i} सामग्रियां मिलीं`,
      scanAnother: "अन्य लेबल का विश्लेषण करें",
      limitedDataTitle: "सीमित डेटा मिला।",
      limitedDataDesc:
        "लेबल तिरछा, कम रिज़ॉल्यूशन का हो सकता है या मानक पोषण शीर्षक गायब हो सकते हैं। नीचे दिया गया कच्चा टेक्स्ट देखें या पास से स्पष्ट फोटो लें।",
      nutritionHighlights: "मुख्य पोषण बिंदु",
      nutritionFacts: "पोषण तथ्य (Nutrition Facts)",
      deterministicNote: "लेबल OCR से निकाली गई सटीक संख्यात्मक वैल्यू।",
      notDetected: "पहचान नहीं हुई",
      ingredientsList: "सामग्रियों की सूची (Ingredients)",
      itemsCount: (c) => `${c} सामग्रियां`,
      containsAllergens: "एलर्जी कारक (Allergens):",
      noIngredientsFound: "सामग्रियों की सूची नहीं मिली",
      noIngredientsDesc:
        '"Ingredients:" ब्लॉक नहीं मिल सका। यदि पैकेज पर मौजूद है, तो नीचे दिए गए कच्चे टेक्स्ट में जांचें।',
      ingredientsOrderNote: "सामग्रियां वजन के अनुसार घटते क्रम में सूचीबद्ध हैं।",
      whatThisMeans: "इसका क्या अर्थ है",
      regenerate: "पुनः जनरेट करें",
      generatingExplanation: "स्पष्टीकरण तैयार किया जा रहा है…",
      explanationUnavailable:
        "स्पष्टीकरण अभी उपलब्ध नहीं है — उपरोक्त पोषण डेटा बिल्कुल सटीक है।",
      tryAgain: "पुनः प्रयास करें",
      takeaway: "निष्कर्ष (Takeaway):",
      viewRawOcr: (c) => `निकाला गया कच्चा OCR टेक्स्ट देखें (${c} अक्षर)`,
      confidenceLine: (conf, lines) => `सटीकता: ${conf}% • ${lines} पंक्तियाँ`,
      copyRawText: "कच्चा टेक्स्ट कॉपी करें",
      copied: "कॉपी हो गया",
      rerunOcr: "मौजूदा इमेज पर OCR दोबारा चलाएं",
      viewScannedPhoto: (name) => `स्कैन की गई मूल फोटो देखें (${name})`,
    },
    nutrients: {
      calories: "कैलोरी (Calories)",
      totalFat: "कुल वसा (Total Fat)",
      saturatedFat: "संतृप्त वसा (Saturated Fat)",
      transFat: "ट्रांस वसा (Trans Fat)",
      cholesterol: "कोलेस्ट्रॉल (Cholesterol)",
      sodium: "सोडियम (Sodium)",
      totalCarbs: "कुल कार्बोहाइड्रेट (Total Carbs)",
      dietaryFiber: "फाइबर (Dietary Fiber)",
      sugars: "शर्करा / चीनी (Sugars)",
      addedSugars: "अतिरिक्त चीनी (Added Sugars)",
      protein: "प्रोटीन (Protein)",
      servingSize: "सर्विंग साइज़",
    },
    tagLabels: {
      "High Sugar": "अधिक चीनी (High Sugar)",
      "Low Sugar": "कम चीनी (Low Sugar)",
      "High Sodium": "अधिक सोडियम (High Sodium)",
      "Low Sodium": "कम सोडियम (Low Sodium)",
      "High Protein": "उच्च प्रोटीन (High Protein)",
      "Good Source of Fiber": "फाइबर का अच्छा स्रोत",
      "High Saturated Fat": "अधिक संतृप्त वसा",
      "Moderate Sugar": "मध्यम चीनी",
      "Moderate Sodium": "मध्यम सोडियम",
    },
    error: {
      unableToRead: "लेबल पढ़ने में असमर्थ",
      tipsTitle: "बेहतर पहचान के लिए सुझाव:",
      tip1: "सुनिश्चित करें कि लेबल सीधा और अच्छी रोशनी में हो, तेज़ चमक या फ्लैश न हो",
      tip2: "कैमरे को पास रखें ताकि पोषण तथ्य या सामग्री सूची फ्रेम में स्पष्ट दिखे",
      tip3: "धुंधली या तिरछी तस्वीरों से बचें",
      tryAgain: "पुनः प्रयास करें",
      chooseDifferent: "अन्य फोटो चुनें",
      fallbackError: "फूड लेबल प्रोसेस करने में विफल। कृपया सुनिश्चित करें कि इमेज स्पष्ट है और पुनः प्रयास करें।",
    },
  },

  mr: {
    appName: "फूड लेबल स्पष्टीकरण",
    appDescription:
      "ब्राउझर-आधारित ओसीआर आणि सोप्या स्पष्टीकरणासह पॅकेज केलेल्या अन्नाचे पोषण तथ्य आणि घटक तपासा व समजून घ्या.",
    nav: {
      title: "फूड लेबल स्पष्टीकरण",
      lightMode: "लाइट मोडवर बदला",
      darkMode: "डार्क मोडवर बदला",
      selectLanguage: "भाषा निवडा",
    },
    upload: {
      title: "अन्न पॅकेजिंग लेबल अपलोड करा",
      subtitle: "येथे इमेज फाइल ड्रॅग आणि ड्रॉप करा, किंवा खालील पर्यायांमधून निवडा",
      chooseImage: "इमेज निवडा",
      takePhoto: "फोटो काढा",
      hint: "JPG, PNG, WEBP, HEIC समर्थित. सर्व प्रक्रिया थेट तुमच्या ब्राउझरमध्ये होते.",
      samplePrompt: "नमुना पॅकेजसह तपासा:",
      sampleHighlight: "लेबलचा फोटो उपलब्ध नाही?",
      sampleGranola: "ग्रॅनोला लेबल",
      sampleSoup: "व्हेज सूप लेबल",
    },
    preview: {
      uploadDifferent: "दुसरी इमेज अपलोड करा",
      original: "मूळ इमेज",
      enhanced: "सुधारित (OCR दृश्य)",
      contrastTitle: "OCR आधी कॉन्ट्रास्ट ऑप्टिमायझेशन लागू करा",
      contrastDesc: "स्पष्ट मजकुरासाठी ग्रेस्केलमध्ये रूपांतरित करते आणि डायनॅमिक रेंज वाढवते",
      analyzeLabel: "लेबलचे विश्लेषण करा",
      loadingPreview: "पूर्वावलोकन लोड होत आहे…",
    },
    status: {
      readingLabel: "लेबल वाचत आहे…",
      workerNote: "बॅकग्राउंड वर्कर थ्रेडमध्ये प्रक्रिया सुरू आहे. कृपया प्रतीक्षा करा…",
      startingEngine: "OCR इंजिन सुरू होत आहे…",
    },
    results: {
      title: "विश्लेषण केलेले लेबल तपशील",
      detectedSummary: (n, i) => `7 पैकी ${n} मुख्य पोषक घटक आढळले • ${i} घटक ओळखले गेले`,
      scanAnother: "दुसऱ्या लेबलचे विश्लेषण करा",
      limitedDataTitle: "मर्यादित माहिती आढळली.",
      limitedDataDesc:
        "लेबल तिरपे, कमी रिझोल्यूशनचे असू शकते किंवा मानक पोषण मथळे सापडले नसतील. खालील कच्चा मजकूर तपासा किंवा अधिक जवळून व स्पष्ट फोटो घ्या.",
      nutritionHighlights: "प्रमुख पोषण मुद्दे",
      nutritionFacts: "पोषण माहिती (Nutrition Facts)",
      deterministicNote: "लेबल OCR वरून अचूक काढलेली संख्यात्मक मूल्ये.",
      notDetected: "आढळले नाही",
      ingredientsList: "घटकांची यादी (Ingredients)",
      itemsCount: (c) => `${c} घटक`,
      containsAllergens: "ॲलर्जी घटक (Allergens):",
      noIngredientsFound: "घटकांची यादी आढळली नाही",
      noIngredientsDesc:
        '"Ingredients:" विभाग सापडला नाही. पॅकेटवर असल्यास खालील कच्च्या मजकुरात तपासा.',
      ingredientsOrderNote: "घटक त्यांच्या वजनाच्या उतरत्या क्रमाने सूचीबद्ध आहेत.",
      whatThisMeans: "याचा अर्थ काय होतो",
      regenerate: "पुन्हा तयार करा",
      generatingExplanation: "स्पष्टीकरण तयार होत आहे…",
      explanationUnavailable:
        "स्पष्टीकरण सध्या उपलब्ध नाही — वरील पोषण माहिती अचूक आहे.",
      tryAgain: "पुन्हा प्रयत्न करा",
      takeaway: "निष्कर्ष (Takeaway):",
      viewRawOcr: (c) => `काढलेला कच्चा OCR मजकूर पहा (${c} अक्षरे)`,
      confidenceLine: (conf, lines) => `अचूकता: ${conf}% • ${lines} ओळी`,
      copyRawText: "कच्चा मजकूर कॉपी करा",
      copied: "कॉपी केले",
      rerunOcr: "सध्याच्या इमेजवर OCR पुन्हा चालवा",
      viewScannedPhoto: (name) => `स्कॅन केलेला मूळ फोटो पहा (${name})`,
    },
    nutrients: {
      calories: "कॅलरीज (Calories)",
      totalFat: "एकूण चरबी (Total Fat)",
      saturatedFat: "सॅच्युरेटेड फॅट (Saturated Fat)",
      transFat: "ट्रान्स फॅट (Trans Fat)",
      cholesterol: "कोलेस्टेरॉल (Cholesterol)",
      sodium: "सोडियम (Sodium)",
      totalCarbs: "एकूण कर्बोदके (Total Carbs)",
      dietaryFiber: "फायबर (Dietary Fiber)",
      sugars: "साखर (Sugars)",
      addedSugars: "अतिरिक्त साखर (Added Sugars)",
      protein: "प्रथिने / प्रोटीन (Protein)",
      servingSize: "सर्व्हिंग आकार",
    },
    tagLabels: {
      "High Sugar": "जास्त साखर (High Sugar)",
      "Low Sugar": "कमी साखर (Low Sugar)",
      "High Sodium": "जास्त सोडियम (High Sodium)",
      "Low Sodium": "कमी सोडियम (Low Sodium)",
      "High Protein": "जास्त प्रथिने (High Protein)",
      "Good Source of Fiber": "फायबरचा चांगला स्रोत",
      "High Saturated Fat": "जास्त सॅच्युरेटेड चरबी",
      "Moderate Sugar": "मध्यम साखर",
      "Moderate Sodium": "मध्यम सोडियम",
    },
    error: {
      unableToRead: "लेबल वाचण्यात अडचण आली",
      tipsTitle: "उत्तम ओळखीसाठी टिप्स:",
      tip1: "लेबल सपाट आणि चांगल्या प्रकाशात असल्याची खात्री करा, जास्त चकाकी टाळा",
      tip2: "कॅमेरा जवळ धरा जेणेकरून पोषण माहिती किंवा घटकांची यादी फ्रेममध्ये स्पष्ट दिसेल",
      tip3: "अस्पष्ट किंवा तिरके फोटो टाळा",
      tryAgain: "पुन्हा प्रयत्न करा",
      chooseDifferent: "दुसरा फोटो निवडा",
      fallbackError: "फूड लेबल प्रक्रिया अयशस्वी. कृपया फोटो स्पष्ट असल्याची खात्री करा आणि पुन्हा प्रयत्न करा.",
    },
  },
};
