# Anugat AI Platform


## Project Overview

Anugat AI is a Retrieval-Augmented Generation (RAG) powered chatbot embedded within a no-code training portal designed for educational institutions. It empowers schools and universities to upload institutional data and deploy an AI assistant capable of answering domain-specific questions about admissions, academics, events, and more.


## Features

### RAG Chatbot Integration

- Integrated with Gemini LLM API.  
- Fine-tuned to serve as a school or university digital assistant.    

### No-Code Training Portal

- **Authentication**: Secure login/signup using JWT. 
- **Content Upload**: Supports uploading of:
  - Text  
  - Images  
  - Videos  
  - PDFs (with text extraction)  
  - Web Links  
- **Repository Management**: Organize data into searchable folders (e.g., "Admission Info", "Course Syllabus").  
- **Chatbot Testing Interface**: Preview/test the chatbot within the portal in real time.  

### AI Confidence Score

- Calculates a confidence score (0–100%) for each chatbot response.  
- Flags responses under 70% confidence and lists them in a "Gaps" section for user review and content addition.  

### Deployment

- Hosted on Vercel.  
- Optimized for speed, scalability, and usability.  



## Functional Priorities

- **Accuracy**: The chatbot should reliably generate answers using only the uploaded repository content.  
- **Modularity and Scalability**: Codebase designed for clean integration of future features like multi-language support or analytics.  
- **Cost Efficiency**: Only relevant documents are loaded during a query to minimize LLM token usage.  
- **Error Handling**: Graceful handling of upload failures, API issues, and unexpected conditions with user-friendly alerts.  



## Folder Structure Strategy

To maintain efficiency:

- All uploads are categorized into logical folders for better management.  
- During queries, only relevant files are retrieved and passed to the LLM.  
- Minimizes token usage and enhances performance.  



## Confidence Score Logic

- **baseConfidence**: This is the similarity score of the most relevant document (`relevantContent[0]`).  
- It's a float between 0 and 1 (e.g., 0.73 means 73% similarity).  

- **baseConfidence * 90 + 10**:  
  - The score is scaled up to a percentage-like range between 10 and 100.  
  - The formula gives more optimistic/confident scores while leaving room to reflect low certainty:
    - 0.9 similarity → 0.9 * 90 + 10 = 91  
    - 0.5 similarity → 0.5 * 90 + 10 = 55  
    - 0.0 similarity → 0.0 * 90 + 10 = 10  

- **Math.round(...)**: Rounds the confidence to a whole number.  

- **Math.min(100, Math.max(0, ...))**: Ensures the final confidence score is between 0 and 100.  

### Why This Logic?

- It weights high-similarity results more favorably but ensures a floor of 10, even if similarity is very low.  
- Helps with thresholding later:  
  - If confidence < 70, the system treats the answer as less reliable and stores it in the Gap collection.  
