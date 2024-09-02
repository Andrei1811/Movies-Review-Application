import warnings
warnings.filterwarnings("ignore")


from transformers import pipeline

def analyze_sentiment_bert(review):
    # Specifică explicit modelul și versiunea pentru analiza sentimentului
    sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    
    # Analiza sentimentului pentru review-ul dat
    result = sentiment_analyzer(review)[0]
    
    # Returnează eticheta (LABEL_0, LABEL_1 etc.) și scorul (score)
    return result['label'], result['score']

if __name__ == "__main__":
    import sys
    review_text = sys.argv[1]
    label, score = analyze_sentiment_bert(review_text)
    print(f"Sentiment: {label}, Score: {score}")
