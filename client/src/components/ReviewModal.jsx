import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitReview } from "../features/reviewSlice";

export default function ReviewModal({ isOpen, onClose, project, onReviewSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const dispatch = useDispatch();
  const { loading: submitting } = useSelector((state) => state.reviews);

  // PRE-FILL DATA FOR "EDIT REVIEW"
  useEffect(() => {
    if (project && project.review_id) {
      setRating(project.review_rating);
      setComment(project.review_comment);
    } else {
      setRating(0);
      setComment("");
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating!");

    dispatch(submitReview({
      project_id: project.id,
      reviewee_id: project.assigned_to, 
      rating,
      comment,
    })).then((result) => {
      if (!result.error) {
        onReviewSuccess();
        onClose();
      } else {
        alert(result.payload || "Error submitting review");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          {project.review_id ? "Edit Your Review" : "Review Freelancer"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Share your experience regarding <span className="font-bold text-indigo-600">{project.title}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl transition-all ${
                  star <= rating ? "text-yellow-400 scale-110" : "text-gray-200"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            rows="4"
            placeholder="Write a testimonial..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : project.review_id ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}