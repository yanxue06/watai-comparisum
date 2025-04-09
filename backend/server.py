from flask import Flask, request, jsonify
from flask_cors import CORS 
from reviewSummary import get_reviews, generate_summary

app = Flask(__name__)

# Configure CORS properly
CORS(app) 

@app.route('/reviewpages', methods=['POST'])
def process_reviews():
    try:
        data = request.json
        asin_list = data.get('asinList', [])
        
        if not asin_list:
            return jsonify({
                'success': False,
                'error': "No Amazon IDs provided"
            }), 400
            
        summaries = []  # Changed from dict to list
        for asin in asin_list:
            try:
                reviews = get_reviews(asin)
                if not reviews:
                    summaries.append({
                        "asin": asin,
                        "error": f"No reviews found for ASIN: {asin}"
                    })
                    continue
                    
                summary = generate_summary(reviews)
                summary["asin"] = asin  # Add ASIN to the summary
                summaries.append(summary)  # Append to list instead of dict

                print(summaries)
            except Exception as e:
                summaries.append({
                    "asin": asin,
                    "error": f"Failed to process ASIN {asin}: {str(e)}"
                })

        return jsonify({
            'success': True,
            'reviews': summaries  # Now it's an array of dictionaries
        })
        
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=6000)
