import os
from dotenv import load_dotenv
from groq import Groq

import mysql.connector

def get_reviews(asin):
    load_dotenv()
    
    # Load environment variables securely
    host = os.getenv('DB_HOST')
    database = os.getenv('DB_NAME')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')

    # Ensure credentials are set
    if not all([host, database, user, password]):
        raise ValueError("Database credentials are missing!")

    try:
        # Establish database connection
        conn = mysql.connector.connect(
            host=host,
            database=database,
            user=user,
            password=password
        )

        if conn.is_connected():
            cursor = conn.cursor(dictionary=True)

            # Query to fetch review text and rating
            query = """
                SELECT text, rating 
                FROM reviews3 
                WHERE asin = %s;
            """

            cursor.execute(query, (asin,))
            reviews = cursor.fetchall()
            
            # Format reviews for AI processing
            review_list = [{"text": review["text"], "rating": review["rating"]} for review in reviews]
            
            return review_list

    except mysql.connector.Error as e:
        raise Exception(f"Database error: {str(e)}")

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()


def generate_summary(reviews):
    load_dotenv()
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ API key not found")

    client = Groq(api_key=api_key)

    # Calculate average rating
    ratings = [review['rating'] for review in reviews]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    review_texts = [f"Review (Rating: {review['rating']}): {review['text']}" for review in reviews]
    all_reviews_text = "\n".join(review_texts)

    prompt = (
        "Based on the following reviews, provide a structured analysis in this EXACT format:\n\n"
        "PRODUCT_NAME: [Extract product name from reviews if possible]\n"
        f"AVERAGE_RATING: {avg_rating:.1f}\n"
        "SUMMARY: [2-3 sentence overview]\n\n"
        "PROS:\n"
        "1. [Most mentioned positive point]\n"
        "2. [Second most mentioned positive point]\n"
        "3. [Third most mentioned positive point]\n\n"
        "CONS:\n"
        "1. [Most mentioned negative point]\n"
        "2. [Second most mentioned negative point]\n"
        "3. [Third most mentioned negative point]\n\n"
        "BEST_FOR: [Type of user this product is best suited for]\n\n"
        f"Reviews to analyze:\n{all_reviews_text}\n\n"
        "Remember to maintain the exact format with section headers like PRODUCT_NAME:, SUMMARY:, etc."
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,  
        max_tokens=1000  
    )

    # Parse the response into a structured dictionary
    content = response.choices[0].message.content
    summary_dict = {}
    current_section = None
    current_list = []

    for line in content.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        if ':' in line and not line.startswith(('1.', '2.', '3.')):
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            if key in ['PROS', 'CONS']:
                current_section = key
                current_list = []
                summary_dict[key] = current_list
            else:
                summary_dict[key] = value
                current_section = None
                
        elif current_section and line.startswith(('1.', '2.', '3.')):
            point = line.split('.', 1)[1].strip()
            current_list.append(point)

    return summary_dict

if __name__ == "__main__":
    # Test the function
    test_reviews = [{"text": "Great product!", "rating": 5}]
    summary = generate_summary(test_reviews)
    print(summary)