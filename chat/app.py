from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
from langchain_groq import ChatGroq

import gradio as gr

from langchain_core.documents import Document
from paddleocr import PaddleOCR
from pathlib import Path
from langdetect import detect

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel

# Chargement des documents PDF
pdf_folder = Path("pdf/")
documents = []

for pdf_file in pdf_folder.glob("*.pdf"):
    loader = PyPDFLoader(str(pdf_file))
    documents.extend(loader.load())

# Découpage des documents
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(documents)

# Embedding
embeddings = OllamaEmbeddings(model="nomic-embed-text")

# Stockage vectoriel
vectorstore = InMemoryVectorStore.from_texts(
    texts=[doc.page_content for doc in chunks],
    embedding=embeddings,
)

base_retriever = vectorstore.as_retriever(search_kwargs={"k": 8})

# Compression des documents pour retrieval avancé
llm_compression = ChatGroq(
    api_key="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",
    model="llama-3.3-70b-versatile"
)
compressor_llm = LLMChainExtractor.from_llm(llm_compression)

advanced_retriever = ContextualCompressionRetriever(
    base_compressor=compressor_llm,
    base_retriever=base_retriever
)

# Prompts multilingues
rag_template_fr = """Rôle : Expert en formation, orientation professionnelle et création de formations en ligne multilingue.
Mission : 
- Répondre aux questions en français, anglais ou arabe, selon la langue utilisée par l'utilisateur.
- Fournir des informations sur tous types de formations (universitaires, professionnelles, certifications, MOOCs, etc.).
- Orienter les jeunes vers des parcours adaptés à leurs besoins et ambitions.
- Conseiller les personnes souhaitant créer et publier des formations en ligne (plateformes, méthodologie, outils).

Historique : {history}
Connaissances : {context}
Question : {question}

Consignes :
- Répondez dans la même langue que l'utilisateur si possible.
- Répondez uniquement avec les informations disponibles.
- Structurez votre réponse avec des paragraphes clairs pour faciliter la lecture.
- Utilisez des titres et sous-titres si nécessaire pour organiser l'information.
- En cas de hors-sujet : "Je n'ai pas cette information. Voulez-vous une question sur les universités marocaines ?"
- Ton professionnel, bienveillant, clair et motivant.
"""

rag_template_en = """Role: Expert in training, professional guidance, and online course creation (multilingual).
Mission:
- Answer questions in French, English, or Arabic, depending on the user's language.
- Provide information on all types of training (academic, professional, certifications, MOOCs, etc.).
- Guide young people towards paths suited to their needs and ambitions.
- Advise those wishing to create and publish online courses (platforms, methodology, tools).

History: {history}
Knowledge: {context}
Question: {question}

Instructions:
- Respond in the same language as the user whenever possible.
- Only answer using available information.
- Structure your response with clear paragraphs for easier reading.
- Use headings and subheadings if necessary to organize the information.
- If the question is out of scope: "I don't have that information. Would you like a question about Moroccan universities?"
- Tone: professional, caring, clear, and motivating.
"""

rag_template_ar = """الدور: خبير في التكوين، التوجيه المهني، وإنشاء الدورات التدريبية عبر الإنترنت (بجميع اللغات).
المهمة:
- الإجابة عن الأسئلة بالفرنسية أو الإنجليزية أو العربية حسب لغة المستخدم.
- تقديم معلومات عن جميع أنواع التكوين (الجامعي، المهني، الشهادات، الدورات عبر الإنترنت، إلخ).
- توجيه الشباب نحو المسارات المناسبة لاحتياجاتهم وطموحاتهم.
- تقديم المشورة للأشخاص الراغبين في إنشاء ونشر الدورات التدريبية عبر الإنترنت (المنصات، المنهجية، الأدوات).

السجل: {history}
المعرفة: {context}
السؤال: {question}

التعليمات:
- الرد بنفس لغة المستخدم إن أمكن.
- الرد فقط بناءً على المعلومات المتاحة.
- تقسيم الرد بالبنائم للقراءة سهلة.
- استخدام العناوين والعناوين الفرعية اذا كانت مطلوبة.
- إذا كان السؤال خارج النطاق: "لا أملك هذه المعلومة. هل ترغب في سؤال عن الجامعات المغربية؟"
- النبرة: مهنية، ودودة، واضحة، ومشجعة.
"""

# Configuration du modèle de réponse
llm_response = ChatGroq(
    temperature=0,
    api_key="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",
    model="llama-3.3-70b-versatile"
)

memory = ConversationBufferMemory(memory_key="history", return_messages=False)

# Fonction de détection de langue
def detect_language(text):
    try:
        lang = detect(text)
        return lang
    except:
        return "unknown"

# Fonction pour récupérer du contexte
def retrieve_context(query):
    docs = advanced_retriever.get_relevant_documents(query)
    return "\n\n".join([f"- {doc.page_content}" for doc in docs])

# Fonction principale de génération de réponse
def generate_response(user_message, response_format="default"):
    conversation_history = memory.buffer
    context = retrieve_context(user_message)

    user_language = detect_language(user_message)

    # Sélection du template selon la langue
    if user_language == "fr":
        language_instruction = "Réponds en français."
        selected_prompt = ChatPromptTemplate.from_template(rag_template_fr)
    elif user_language == "en":
        language_instruction = "Reply in English."
        selected_prompt = ChatPromptTemplate.from_template(rag_template_en)
    elif user_language == "ar":
        language_instruction = "أجب باللغة العربية."
        selected_prompt = ChatPromptTemplate.from_template(rag_template_ar)
    else:
        language_instruction = "Réponds en français."
        selected_prompt = ChatPromptTemplate.from_template(rag_template_fr)

    # Ajout d'instructions de formatage
    format_instruction = ""
    if response_format == "structured":
        format_instruction = "\nStructure ta réponse avec des titres, sous-titres, et paragraphes clairs."
    elif response_format == "paragraphs":
        format_instruction = "\nOrganise ta réponse en paragraphes distincts, chacun traitant d'un aspect spécifique de la question."
    
    modified_question = f"{language_instruction}{format_instruction}\n\n{user_message}"

    prompt = selected_prompt.format(
        history=conversation_history,
        context=context,
        question=modified_question
    )
    response = llm_response([HumanMessage(content=prompt)]).content

    memory.save_context({"input": user_message}, {"output": response})

    return response
# Traitement OCR (image vers texte)
ocr = PaddleOCR(use_angle_cls=True, lang='fr')  
results = ocr.ocr("image/img4.png", cls=True)

text_from_image = ""
if results and results[0] is not None:
    for line in results[0]:
        text_line = line[1][0]  
        text_from_image += text_line + "\n"
else:
    print("Aucun texte détecté dans l'image.")

doc_from_image = Document(page_content=text_from_image)

# Ajout du texte OCR au vectorstore
image_chunks = text_splitter.split_documents([doc_from_image])
vectorstore.add_texts([chunk.page_content for chunk in image_chunks])

app = FastAPI()

# Configuration CORS pour permettre les requêtes depuis Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # URL de votre frontend Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    format: str = "default"

@app.post("/api/chat")
async def chat(request: ChatMessage):
    user_message = request.message
    response_format = request.format
    response = generate_response(user_message, response_format)
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
