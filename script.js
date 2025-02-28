// Translation function
async function translateText(text, targetLang) {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    const data = await response.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error("Translation Error:", error);
    return "Translation failed.";
  }
}

// Function to speak translated text
function speakText(text) {
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// Function for speech-to-text
function startSpeechRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onstart = function () {
    console.log("Voice recognition started...");
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("manualText").value = transcript;
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("Speech recognition error. Try again.");
  };

  recognition.start();
}

document.getElementById("detectTextButton").addEventListener("click", function () {
  const imageInput = document.getElementById("imageInput");
  const detectedTextElement = document.getElementById("detectedText");
  const imagePreview = document.getElementById("imagePreview");
  const targetLang = document.getElementById("targetLanguage").value;

  // Clear previous results
  detectedTextElement.textContent = "Detecting text...";
  imagePreview.style.display = "none";

  if (imageInput.files && imageInput.files[0]) {
    const imageFile = imageInput.files[0];
    const imageUrl = URL.createObjectURL(imageFile);

    imagePreview.src = imageUrl;
    imagePreview.style.display = "block";

    // Use Tesseract.js to recognize text from the image
    Tesseract.recognize(imageFile, "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        detectedTextElement.textContent = text || "No text detected!";

        // Translate detected text
        translateText(text, targetLang).then((translatedText) => {
          document.getElementById("translatedText").textContent = translatedText || "Translation failed.";
        });
      })
      .catch((error) => {
        detectedTextElement.textContent = "Error occurred during text detection.";
        console.error("OCR error:", error);
      });
  } else {
    detectedTextElement.textContent = "Please upload an image first.";
  }
});

// Translate manually entered text
document.getElementById("translateManualTextButton").addEventListener("click", function () {
  const manualText = document.getElementById("manualText").value;
  const targetLang = document.getElementById("targetLanguage").value;

  if (!manualText) {
    alert("Please enter some text for translation.");
    return;
  }

  translateText(manualText, targetLang).then((translatedText) => {
    document.getElementById("translatedText").textContent = translatedText || "Translation failed.";
  });
});

// Speak translated text
document.getElementById("speakTranslatedTextButton").addEventListener("click", function () {
  const translatedText = document.getElementById("translatedText").textContent;

  if (!translatedText || translatedText === "Translated text will appear here...") {
    alert("Please translate text first.");
    return;
  }

  speakText(translatedText);
});

// Start speech recognition on mic button click
document.getElementById("speechToTextButton").addEventListener("click", startSpeechRecognition);
