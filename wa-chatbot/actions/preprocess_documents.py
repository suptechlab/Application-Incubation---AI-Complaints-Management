import os
import re
import logging
import traceback
import time
import numpy as np
from dotenv import load_dotenv
from sklearn.preprocessing import normalize
from langchain_community.document_loaders import (
    PyPDFLoader, UnstructuredPDFLoader, Docx2txtLoader, TextLoader, 
    CSVLoader, UnstructuredExcelLoader, UnstructuredPowerPointLoader
)
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

# -------------------------------------------------------------------
# 🔐 Environment Setup
# -------------------------------------------------------------------
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise EnvironmentError("OPENAI_API_KEY not found in environment variables.")
os.environ["OPENAI_API_KEY"] = openai_api_key

# Logging setup
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Constants
FAISS_INDEX_FILE = "faiss_index"
EMBEDDING_MODEL = "text-embedding-3-large"

# -------------------------------------------------------------------
# 📌 Main Preprocessing Function
# -------------------------------------------------------------------
def preprocess_and_save_documents(directory_path: str, chunk_size: int = 1024, chunk_overlap: int = 50) -> None:
    try:
        if not os.path.exists(directory_path):
            logger.error(f"❌ Directory path '{directory_path}' does not exist.")
            return
        if not os.listdir(directory_path):
            logger.warning(f"⚠️ Directory '{directory_path}' is empty.")
            return

        # Step 1: Load documents
        documents, failed_pdfs, file_chunk_map = load_documents(directory_path)
        total_original_docs = len(documents)
        if not documents:
            logger.info("No valid documents found for processing.")
            return

        logger.info(f"✅ Successfully loaded {total_original_docs} documents.")
        if failed_pdfs:
            logger.warning(f"⚠️ Failed to extract data from these PDFs: {failed_pdfs}")
        else:
            logger.info("✅ All PDFs were successfully loaded.")

        # Step 2: Split documents into smaller chunks
        start_split = time.time()
        chunks = split_documents(documents, chunk_size, chunk_overlap)
        logger.info(f"📌 Document splitting completed in {time.time() - start_split:.2f} seconds.")
        for file_name, chunk_count in file_chunk_map.items():
            logger.info(f"📄 File Processed: {file_name}, Extracted Chunks: {chunk_count}")

        total_chunks = len(chunks)
        logger.info(f"📊 Total Chunks Generated: {total_chunks}")

        if not chunks:
            logger.error("⚠️ No chunks generated.")
            return

        # Step 3: Embedding & Normalization
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
        texts = [doc.page_content for doc in chunks]
        metadata_list = [doc.metadata for doc in chunks]

        start_embed = time.time()
        embedding_vectors = embeddings.embed_documents(texts)
        normalized_embeddings = normalize(embedding_vectors, axis=1)
        logger.info(f"📉 Embeddings generated and normalized in {time.time() - start_embed:.2f} seconds.")

        # Step 4: Create and Save FAISS index
        start_faiss = time.time()
        vectordb = load_or_create_faiss_index(texts, normalized_embeddings, metadata_list, embeddings)
        vectordb.save_local(FAISS_INDEX_FILE)
        logger.info(f"🟢 FAISS index saved at '{FAISS_INDEX_FILE}' in {time.time() - start_faiss:.2f} seconds.")

        # Final stats
        logger.info(f"📊 Final Stats: Documents = {total_original_docs}, Chunks = {total_chunks}, Failed PDFs = {len(failed_pdfs)}")

    except Exception as e:
        logger.error(f"❌ Error in preprocessing: {str(e)}")
        logger.error(traceback.format_exc())

# -------------------------------------------------------------------
# 🔨 Utility Functions
# -------------------------------------------------------------------
def load_documents(directory_path: str):
    from langchain.schema import Document
    documents = []
    failed_pdfs = []
    file_chunk_map = {}

    for root, _, files in os.walk(directory_path):
        files = [f for f in files if not f.startswith('.')]
        for file_name in files:
            path = os.path.join(root, file_name)
            ext = os.path.splitext(file_name)[1].lower()
            loader = get_loader(ext, path)

            if loader:
                try:
                    loaded_docs = loader.load()
                    if not loaded_docs:
                        if ext == ".pdf":
                            failed_pdfs.append(file_name)
                        logger.warning(f"⚠️ No content extracted from {file_name}")
                    else:
                        for doc in loaded_docs:
                            doc.metadata["document_name"] = file_name
                            doc.metadata["file_path"] = path
                            publication_date = extract_date_from_filename(file_name)
                            doc.metadata["publication_date"] = publication_date
                        documents.extend(loaded_docs)
                        file_chunk_map[file_name] = len(loaded_docs)
                        logger.info(f"✅ Loaded {file_name}: {len(loaded_docs)} docs extracted.")
                except Exception as e:
                    logger.error(f"❌ Error loading {file_name}: {e}")
                    if ext == ".pdf":
                        failed_pdfs.append(file_name)
            else:
                logger.warning(f"⚠️ Unsupported format: {file_name}")

    return documents, failed_pdfs, file_chunk_map

def get_loader(file_extension: str, file_path: str):
    try:
        if file_extension == ".pdf":
            try:
                return PyPDFLoader(file_path)
            except Exception:
                logger.warning(f"🔄 PyPDFLoader failed for {file_path}. Using UnstructuredPDFLoader.")
                return UnstructuredPDFLoader(file_path, mode="elements")
        else:
            loaders = {
                ".docx": Docx2txtLoader,
                ".doc": Docx2txtLoader,
                ".txt": TextLoader,
                ".csv": CSVLoader,
                ".xlsx": UnstructuredExcelLoader,
                ".xls": UnstructuredExcelLoader,
                ".pptx": UnstructuredPowerPointLoader
            }
            return loaders.get(file_extension, None)(file_path) if file_extension in loaders else None
    except Exception as e:
        logger.error(f"❌ Error initializing loader for {file_path}: {e}")
        return None

def extract_date_from_filename(filename: str) -> str:
    match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    return match.group(1) if match else "Nao applicable"

def split_documents(documents: list, chunk_size: int = 1024, chunk_overlap: int = 50) -> list:
    from langchain.schema import Document
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    all_chunks = []
    for doc in documents:
        chunks = splitter.split_documents([doc])
        all_chunks.extend(chunks)
    return all_chunks

def load_or_create_faiss_index(texts: list, normalized_embeddings: list, metadata_list: list, embeddings) -> FAISS:
    text_embedding_pairs = list(zip(texts, normalized_embeddings))
    if os.path.exists(FAISS_INDEX_FILE):
        try:
            vectordb = FAISS.load_local(FAISS_INDEX_FILE, embeddings, allow_dangerous_deserialization=True)
            index_dim = vectordb.index.d
            embedding_dim = len(embeddings.embed_query("test"))
            if index_dim != embedding_dim:
                logger.warning(f"⚠️ FAISS index dimension mismatch: Expected {embedding_dim}, Found {index_dim}. Rebuilding.")
                os.remove(FAISS_INDEX_FILE)
                vectordb = FAISS.from_embeddings(text_embedding_pairs, embeddings, metadatas=metadata_list)
            else:
                logger.info("🔄 Adding new documents to existing FAISS index.")
                vectordb.add_embeddings(text_embedding_pairs, metadatas=metadata_list)
        except Exception as e:
            logger.warning(f"⚠️ Failed to load FAISS index: {e}. Recreating it.")
            vectordb = FAISS.from_embeddings(text_embedding_pairs, embeddings, metadatas=metadata_list)
    else:
        logger.info("🔟 Creating new FAISS vector index.")
        vectordb = FAISS.from_embeddings(text_embedding_pairs, embeddings, metadatas=metadata_list)
    return vectordb

if __name__ == "__main__":
    directory_path = "/home/ganesh/Documents/SEPES_FINAL_CODE/APPLICABLE REGULATIONS"
    preprocess_and_save_documents(directory_path)
