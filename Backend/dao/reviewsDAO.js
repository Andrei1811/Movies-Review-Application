import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;

let reviews;

export default class ReviewsDAO {
  static async injectDB(conn) {
    if (reviews) {
      return;
    }
    try {
      reviews = await conn.db("reviews").collection("reviews");
    } catch (e) {
      console.error(`Unable to establish collection handles in ReviewsDAO: ${e}`);
    }
  }

  static async addReview(movieId, user, review, sentiment, score) {
    try {
      const reviewDoc = {
        movieId: movieId,
        user: user,
        review: review,
        sentiment: sentiment 
      };
      console.log("Adding review with sentiment:", sentiment);
      return await reviews.insertOne(reviewDoc);
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async getReview(reviewId) {
    try {
      return await reviews.findOne({ _id: ObjectId(reviewId) });
    } catch (e) {
      console.error(`Unable to get review: ${e}`);
      return { error: e };
    }
  }

  static async updateReview(reviewId, user, review, sentiment) {
    try {
      const updateResponse = await reviews.updateOne(
        { _id: ObjectId(reviewId), user: user },
        { $set: { review: review, sentiment: sentiment } } // Actualizăm și sentimentul
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update review: ${e}`);
      return { error: e };
    }
  }

  static async deleteReview(reviewId) {
    try {
      const deleteResponse = await reviews.deleteOne({
        _id: ObjectId(reviewId),
      });

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to delete review: ${e}`);
      return { error: e };
    }
  }

  static async getReviewsByMovieId(movieId) {
    try {
        const cursor = await reviews.find({ movieId: parseInt(movieId) });
        const reviewsArray = await cursor.toArray();

        // Calculăm sentimentul general al recenziilor
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        reviewsArray.forEach(review => {
            if (review.sentiment === 'POSITIVE') {
                positiveCount++;
            } else if (review.sentiment === 'NEGATIVE') {
                negativeCount++;
            } else {
                neutralCount++;
            }
        });

        let generalSentiment = 'NEUTRAL';
        if (positiveCount > negativeCount) {
            generalSentiment = 'POSITIVE';
        } else if (negativeCount > positiveCount) {
            generalSentiment = 'NEGATIVE';
        }

        return {
            reviews: reviewsArray,
            generalSentiment: generalSentiment,
            positiveCount: positiveCount,
            negativeCount: negativeCount,
            neutralCount: neutralCount
        };
    } catch (e) {
        console.error(`Unable to get reviews: ${e}`);
        return { error: e };
    }
}

}
