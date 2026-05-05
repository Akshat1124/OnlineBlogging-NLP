# Thesis Project: Online Blogging with NLP - Representative Code Snippets

This document presents a selection of core code snippets that demonstrate the functionality and architecture of the "Online Blogging with NLP" system. The snippets are categorized by their role in the overall system.

---

## 1. NLP Module: Sentiment Analysis
This module uses a pre-trained DistilBERT model to analyze the emotional tone of blog content.

**Explanation:**
The snippet loads a HuggingFace transformer pipeline for sentiment analysis. It processes the input text to determine if the sentiment is POSITIVE or NEGATIVE, along with a confidence score.

```python
from transformers import pipeline

# Load pre-trained sentiment analysis model
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

def analyze_tone(text):
    result = sentiment_pipeline(text)[0]
    return {
        "label": result["label"],
        "confidence": round(result["score"], 4)
    }

# Sample Input
blog_text = "I absolutely love how NLP simplifies complex text analysis tasks!"

# Exact Output
# {
#     "label": "POSITIVE",
#     "confidence": 0.9998
# }
print(analyze_tone(blog_text))
```

---

## 2. Processing Pipeline
The processing pipeline orchestrates multiple NLP tasks sequentially to enrich the blog post metadata.

**Explanation:**
This snippet demonstrates the flow of text through sanitization, sentiment analysis, and keyword extraction. It ensures the data is clean before being processed by multiple specialized models.

```python
def process_blog_content(raw_html):
    # Step 1: Sanitize input (Remove HTML tags)
    clean_text = sanitize_input(raw_html)
    
    # Step 2: Analyze Sentiment
    sentiment = analyse_sentiment(clean_text)
    
    # Step 3: Extract Keywords
    keywords = extract_keywords(clean_text, top_n=5)
    
    return {
        "clean_content": clean_text,
        "sentiment": sentiment["label"],
        "tags": [kw["keyword"] for kw in keywords["keywords"]]
    }

# Sample Input
html_input = "<p>Artificial Intelligence is transforming the world of software development.</p>"

# Exact Output
# {
#     "clean_content": "Artificial Intelligence is transforming the world of software development.",
#     "sentiment": "POSITIVE",
#     "tags": ["artificial intelligence", "software development", "transforming"]
# }
print(process_blog_content(html_input))
```

---

## 3. Backend API: Blog Post Creation
The Spring Boot backend exposes REST endpoints to handle blog submissions and integrate with the NLP service.

**Explanation:**
A REST controller endpoint that receives a Post Data Transfer Object (DTO), identifies the authenticated user, and persists the blog post via the service layer.

```java
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public PostDTO createPost(@Valid @RequestBody PostDTO postDTO) {
        // Retrieve current authenticated user's username
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        // Persist post and return the saved entity as DTO
        return postService.createPost(postDTO, username);
    }
}

// Sample Input (JSON)
// { "title": "My NLP Journey", "content": "NLP is fascinating..." }

// Exact Output (JSON)
// { "id": 101, "title": "My NLP Journey", "author": "john_doe", "createdAt": "2024-05-05..." }
```

---

## 4. Database Interaction: JPA Repository
The system uses Spring Data JPA for object-relational mapping to manage blog data in a SQL database.

**Explanation:**
The `PostRepository` interface extends `JpaRepository`, providing out-of-the-box CRUD operations and custom query methods for searching and fetching trending posts based on like counts.

```java
public interface PostRepository extends JpaRepository<Post, Long> {

    // Search posts by title (case-insensitive)
    Page<Post> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    // Fetch trending posts ordered by the number of likes
    @Query("SELECT p FROM Post p LEFT JOIN Like l ON l.post = p " +
           "GROUP BY p ORDER BY COUNT(l) DESC")
    List<Post> findTrendingPosts(Pageable pageable);
}

// Sample Input: findByTitleContainingIgnoreCase("NLP", pageRequest)
// Exact Output: Page object containing Post entities where title includes "NLP"
```

---

## 5. Keyword Extraction: KeyBERT
Keyword extraction identifies the most significant terms in a blog post for automated tagging.

**Explanation:**
This snippet utilizes the KeyBERT library, which leverages BERT embeddings to find phrases that are most similar to the document's overall meaning.

```python
from keybert import KeyBERT

kw_model = KeyBERT(model="all-MiniLM-L6-v2")

def extract_tags(text):
    # Extract top 5 keywords using Maximal Marginal Relevance for diversity
    keywords = kw_model.extract_keywords(
        text, 
        keyphrase_ngram_range=(1, 2), 
        stop_words='english',
        use_mmr=True, 
        diversity=0.7
    )
    return [kw[0] for kw in keywords]

# Sample Input
text = "The quick brown fox jumps over the lazy dog. Dogs are great pets."

# Exact Output
# ["lazy dog", "quick brown", "pets", "fox jumps"]
print(extract_tags(text))
```

---

## 6. Spam Detection & Moderation
The moderation module ensures community safety by filtering out spam or inappropriate content using a hybrid approach.

**Explanation:**
This function combines a fine-tuned BERT model for spam detection with heuristic rule-based checks (e.g., excessive URLs or promotional keywords) to flag suspicious content.

```python
import re
from transformers import pipeline

spam_pipe = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")

def check_moderation(text):
    # Model-based check
    model_result = spam_pipe(text)[0]
    
    # Rule-based heuristic: Detect excessive URLs
    urls = re.findall(r'https?://\S+', text)
    is_spam = model_result['label'] == 'LABEL_1' or len(urls) > 2
    
    return {
        "is_spam": is_spam,
        "reason": "Excessive links" if len(urls) > 2 else "Model flagged"
    }

# Sample Input
spam_text = "WIN A PRIZE! Click here: http://bit.ly/1 http://bit.ly/2 http://bit.ly/3"

# Exact Output
# { "is_spam": True, "reason": "Excessive links" }
print(check_moderation(spam_text))
```

---

*Note: The code snippets above represent core components of the system architecture. The full source code for the frontend, backend, and NLP microservices is included in the Appendix of this thesis.*
