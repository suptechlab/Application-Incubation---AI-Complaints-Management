import os
import logging
import chardet
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from datetime import datetime

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS

# -------------------------------------------------------------------
# 🔐 Environment and Configuration Setup
# -------------------------------------------------------------------
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise EnvironmentError("OPENAI_API_KEY not found in environment variables.")

# Logger configuration
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s'
)

# Constants
FAISS_INDEX_FILE = "/app/actions/faiss_index"
FAQ_FILE = "/app/actions/FAQ_Chatbot.xlsx"
EMBEDDING_MODEL = "text-embedding-3-large"
LLM_MODEL = "gpt-4o"

# Initialize embedding model
embedding_model = OpenAIEmbeddings(model=EMBEDDING_MODEL)

# Globals
faq_questions, faq_answers, faq_embeddings = [], [], []
vectordb = None

# -------------------------------------------------------------------
# 📘 Function: Load FAQ Data
# -------------------------------------------------------------------
def load_faq(faq_path: str):
    """Loads FAQ data from an Excel/CSV file and embeds questions."""
    logger.info(f"Loading FAQ data from: {faq_path}")
    try:
        if faq_path.endswith(".xlsx") or faq_path.endswith(".xls"):
            df = pd.read_excel(faq_path)
        else:
            with open(faq_path, "rb") as f:
                result = chardet.detect(f.read(100000))
            df = pd.read_csv(faq_path, encoding=result["encoding"], on_bad_lines='skip')

        required_columns = ["Question", "Answer"]
        if not all(col in df.columns for col in required_columns):
            raise ValueError(
                f"FAQ file must contain the following columns: {required_columns}"
            )

        questions = df["Question"].astype(str).tolist()
        answers = df["Answer"].astype(str).tolist()

        embeddings = embedding_model.embed_documents(questions)
        logger.info(f"Loaded {len(questions)} FAQ entries successfully.")
        return questions, answers, np.array(embeddings)
    except Exception as e:
        logger.error(f"Error loading FAQ: {e}")
        return [], [], []

# -------------------------------------------------------------------
# 🏷️ Helper: Parse Publication Date
# -------------------------------------------------------------------
def parse_publication_date(date_str: str):
    if not date_str or date_str.lower() == "nao applicable":
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None

# -------------------------------------------------------------------
# 🧠 Function: RAG Query Pipeline
# -------------------------------------------------------------------
def rag_query_pipeline(query: str):
    global faq_questions, faq_answers, faq_embeddings, vectordb

    if not faq_questions:
        faq_questions, faq_answers, faq_embeddings = load_faq(FAQ_FILE)

    logger.info(f"Processing query: {query}")

    if faq_embeddings is not None and len(faq_embeddings) > 0:
        query_embedding = np.array([embedding_model.embed_query(query)])
        try:
            similarities = cosine_similarity(query_embedding, faq_embeddings)[0]
            best_match_idx = np.argmax(similarities)
            if similarities[best_match_idx] >= 0.75:
                answer = faq_answers[best_match_idx].strip()
                logger.info(f"Matched FAQ: {faq_questions[best_match_idx]} (length: {len(answer)} chars)")
                if len(answer) > 1024:
                    logger.warning("FAQ answer exceeds WhatsApp limit. Summarizing response.")
                    llm = ChatOpenAI(model=LLM_MODEL, openai_api_key=openai_api_key, max_tokens=200, temperature=0.3)
                    summarize_prompt = f"""
                    Resume la siguiente respuesta en español manteniéndola por debajo de 950 caracteres:

                    {answer}
                    """
                    summary_response = llm.invoke(summarize_prompt)
                    answer = summary_response.content.strip()
                return answer
        except Exception as e:
            logger.error(f"Error during FAQ similarity match: {e}")
    else:
        logger.warning("FAQ data is empty or failed to load. Skipping FAQ matching.")

    logger.info("Querying FAISS for similar chunks...")
    if vectordb is None:
        logger.info("Loading FAISS vector store...")
        vectordb = FAISS.load_local(
            FAISS_INDEX_FILE, embedding_model, allow_dangerous_deserialization=True
        )
        logger.info("FAISS vector store loaded successfully.")

    results = vectordb.similarity_search_with_score(query, k=20)
    if not results:
        logger.warning("No relevant chunks retrieved from FAISS.")
        return "No se encontró información relevante en los documentos disponibles."

    re_ranked = []
    for doc, score in results:
        pub_date_str = doc.metadata.get("publication_date", "Nao applicable")
        parsed_date = parse_publication_date(pub_date_str)
        re_ranked.append((doc, score, pub_date_str, parsed_date))

    re_ranked.sort(
        key=lambda x: x[3] if x[3] is not None else datetime.min,
        reverse=True
    )

    combined_context = ""
    for doc, score, raw_date_str, parsed_date in re_ranked:
        source_doc = doc.metadata.get("document_name", "Unknown Document")
        section = doc.metadata.get("section", "Unknown Section")
        display_date = parsed_date.date() if parsed_date else "Nao applicable"

        logger.info(
            f"Retrieved Chunk - Source: {source_doc}, "
            f"Date: {display_date}, Section: {section}, Score: {score:.4f}"
        )

        combined_context += (
            f"\nFuente: {source_doc}, Fecha: {display_date}, {section}\n"
            f"{doc.page_content}\n"
        )

    prompt = f"""You are a legal assistant specialized in documents from the Superintendence 
    of Popular and Solidarity Economy (SEPS).

    Use only the retrieved context below to answer the user query. 
    **Do not assume or invent information. Do not answer user queries that are not related to SEPS regulations or legal matters.**

    If the User Query is clearly unrelated to SEPS regulations or legal matters 
    (e.g., about cooking, entertainment, general knowledge), and there is no relevant information in the Retrieved Context, respond with:
    “Esta consulta está fuera del alcance de los documentos regulatorios de la SEPS.”

    If legal regulations apply, clearly state whether the reference is from: 
    - *Ley Orgánica de Economía Popular y Solidaria (LOEPS)*
    - *Reglamento de la LOEPS*
    - *Código Orgánico Monetario y Financiero (COMF)*
    - or an official *Resolución de la SEPS* (prefer the most recent if multiple exist)

    ✅ **All responses must be in Spanish.**

    Format Guidelines:
    1. Limit your response to 950 characters; format responses per *Meta WhatsApp* message guidelines.
    1. If the User Query expects a short or factual answer (e.g., Yes/No, a name, date, article number), respond with a concise sentence.
    2. If the User Query is seeking **details, definitions, or explanations**, provide a well-structured and informative answer using bullet points or short paragraphs.
    3. For explanatory or open-ended user queries, maintain clarity by using structured bullet points or short paragraphs.
    4. If multiple sources give different answers:
    - Prefer the chunk with the most recent publication date or year.
    - If the publication date or year is unavailable, mention "Fecha no disponible" and present both viewpoints neutrally.
    5.Highlight key points using *single asterisks* (e.g., laws, dates, terms).
    6. Include full URLs in plain text (not as hyperlinks).
    7. Cite the source document and section naturally within the answer.

    Example:
    ✅ “De acuerdo con la Regulación SEPS No. 123, Sección 4, se establece que...”
    🚫 “La regulación establece que...” (sin citar)

    User Query:
    {query}

    Retrieved Context:
    {combined_context}

    Answer:"""

    llm = ChatOpenAI(
        model=LLM_MODEL,
        openai_api_key=openai_api_key,
        max_tokens=200,
        temperature=0.3
    )
    response = llm.invoke(prompt)
    answer = response.content.strip()

    if len(answer) > 1024:
        logger.warning(f"LLM response exceeded WhatsApp limit: {len(answer)} chars. Truncating.")
        answer = answer[:1010] + "..."

    return answer

# -------------------------------------------------------------------
# 🏃 CLI Entry Point
# -------------------------------------------------------------------
# if __name__ == "__main__":
#     while True:
#         query = input("You: ")
#         if query.lower() in ["exit", "quit"]:
#             break
#         print(rag_query_pipeline(query))
