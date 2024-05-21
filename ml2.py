# import sys
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
# from pymongo import MongoClient
# import json


# def recommend_products(query, n=5):
#     # Connect to MongoDB
#     client = MongoClient('mongodb://localhost:27017/')
#     db = client['decoar']
#     collection = db['products']

#     # Fetch data from MongoDB
#     data = collection.find({}, {'_id': 0, 'category': 1, 'description': 1, 'tags': 1})

#     # Preprocess text data
#     documents = []
#     for item in data:
#         text = ' '.join([item.get('category', ''), item.get('description', '')] + item.get('tags', []))
#         documents.append(text)

#     # Calculate TF-IDF
#     tfidf_vectorizer = TfidfVectorizer(stop_words='english')
#     tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

#     query_vector = tfidf_vectorizer.transform([query])
#     cosine_similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
#     related_product_indices = cosine_similarities.argsort()[::-1]
#     recommendations = [(documents[i], cosine_similarities[i]) for i in related_product_indices[:n]]
#     return recommendations

# if __name__ == "__main__":
#     query = ' '.join(sys.argv[1:])
    
#     recommendations = recommend_products(query)
#     print(json.dumps(recommendations))
#     # for i, (product, score) in enumerate(recommendations, start=1):
#     #     print(f"Recommendation {i}:")
#     #     print(f"Product: {product}")
#     #     print(f"Similarity Score: {score}\n")

import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import json


def recommend_products(query, n=5):
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['decoar']
    collection = db['products']

  
    data = collection.find({}, {'_id': 1, 'category': 1, 'description': 1, 'tags': 1})

    documents = []
    for item in data:
        text = ' '.join([item.get('category', ''), item.get('description', '')] + item.get('tags', []))
        documents.append((str(item['_id']), text))  # Include _id in the documents

    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform([doc[1] for doc in documents])

    query_vector = tfidf_vectorizer.transform([query])
    cosine_similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    related_product_indices = cosine_similarities.argsort()[::-1]
    recommendations = [(documents[i][0], cosine_similarities[i]) for i in related_product_indices[:n]]
    return recommendations

if __name__ == "__main__":
    query = ' '.join(sys.argv[1:])
    recommendations = recommend_products(query)
    if(len(recommendations)>3):
        recommendations=recommendations[:3]
    print(json.dumps(recommendations))
