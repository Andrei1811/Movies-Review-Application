import ReviewsDAO from "../dao/reviewsDAO.js";
import { spawn } from 'child_process';

export default class ReviewsController {
    static async apiPostReview(req, res, next) {
        try {
            const movieId = parseInt(req.body.movieId);
            const review = req.body.review;
            const user = req.body.user;

            console.log("Calling Python script for sentiment analysis...");

            // Apelăm scriptul Python pentru a analiza sentimentul
            const pythonProcess = spawn('python', ['utils/sentiment_analysis.py', review]);

            let responseSent = false;

            pythonProcess.stdout.on('data', async (data) => {
                if (responseSent) return; // Dacă răspunsul a fost deja trimis, nu mai face nimic

                try {
                    const sentimentData = data.toString().trim().split(', ');
                    const sentiment = sentimentData[0].split(': ')[1].replace('"', '');
                    const score = parseFloat(sentimentData[1].split(': ')[1]);

                    console.log("Sentiment returned from Python script:", sentiment);

                    const reviewResponse = await ReviewsDAO.addReview(
                        movieId,
                        user,
                        review,
                        sentiment  // Stocăm sentimentul în baza de date
                    
                    );
                    
                    res.json({ status: "success", sentiment: sentiment });
                    responseSent = true;
                } catch (err) {
                    console.error(`Failed to process sentiment data: ${err}`);
                    res.status(500).json({ error: "Failed to process sentiment data." });
                    responseSent = true;
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Error from Python script: ${data}`);
                if (!responseSent) {
                    res.status(500).json({ error: "Error in sentiment analysis." });
                    responseSent = true;
                }
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python process closed with code: ${code}`);
                    if (!responseSent) {
                        res.status(500).json({ error: "Sentiment analysis process failed." });
                        responseSent = true;
                    }
                }
            });

        } catch (e) {
            console.error(`Unable to post review: ${e}`);
            if (!responseSent) {
                res.status(500).json({ error: e.message });
            }
        }
    }

    static async apiGetReview(req, res, next) {
        try {
            let id = req.params.id || {};
            let review = await ReviewsDAO.getReview(id);
            if (!review) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            res.json(review);
        } catch (e) {
            console.log(`api, ${e}`);
            res.status(500).json({ error: e });
        }
    }

    static async apiUpdateReview(req, res, next) {
        try {
            const reviewId = req.params.id;
            const review = req.body.review;
            const user = req.body.user;
    
            console.log("Calling Python script for sentiment analysis...");
    
            // Apelăm scriptul Python pentru a analiza sentimentul
            const pythonProcess = spawn('python', ['utils/sentiment_analysis.py', review]);
    
            let responseSent = false;
    
            pythonProcess.stdout.on('data', async (data) => {
                if (responseSent) return; // Dacă răspunsul a fost deja trimis, nu mai face nimic
    
                try {
                    const sentimentData = data.toString().trim().split(', ');
                    const sentiment = sentimentData[0].split(': ')[1].replace('"', '');
                    const score = parseFloat(sentimentData[1].split(': ')[1]);
    
                    console.log("Sentiment returned from Python script:", sentiment);
    
                    const reviewResponse = await ReviewsDAO.updateReview(
                        reviewId,
                        user,
                        review,
                        sentiment  // Actualizăm sentimentul în baza de date
                    );
    
                    res.json({ status: "success", sentiment: sentiment, score: score });
                    responseSent = true;
                } catch (err) {
                    console.error(`Failed to process sentiment data: ${err}`);
                    res.status(500).json({ error: "Failed to process sentiment data." });
                    responseSent = true;
                }
            });
    
            pythonProcess.stderr.on('data', (data) => {
                console.error(`Error from Python script: ${data}`);
                if (!responseSent) {
                    res.status(500).json({ error: "Error in sentiment analysis." });
                    responseSent = true;
                }
            });
    
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python process closed with code: ${code}`);
                    if (!responseSent) {
                        res.status(500).json({ error: "Sentiment analysis process failed." });
                        responseSent = true;
                    }
                }
            });
    
        } catch (e) {
            console.error(`Unable to update review: ${e}`);
            if (!responseSent) {
                res.status(500).json({ error: e.message });
            }
        }
    }
    

    static async apiDeleteReview(req, res, next) {
        try {
            const reviewId = req.params.id;
            const reviewResponse = await ReviewsDAO.deleteReview(reviewId);
            res.json({ status: "success" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async apiGetReviews(req, res, next) {
        try {
            let id = req.params.id || {};
            let reviews = await ReviewsDAO.getReviewsByMovieId(id);
            if (!reviews) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            res.json(reviews);
        } catch (e) {
            console.log(`api, ${e}`);
            res.status(500).json({ error: e });
        }
    }
}
