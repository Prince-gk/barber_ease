
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { apiService, Appointment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReviewModalProps {
  appointment: Appointment;
  barberName: string;
  serviceName: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const ReviewModal = ({
  appointment,
  barberName,
  serviceName,
  isOpen,
  onClose,
  onReviewSubmitted,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && appointment.id) {
      checkExistingReview();
    }
  }, [isOpen, appointment.id]);

  const checkExistingReview = async () => {
    try {
      const existingReview = await apiService.checkExistingReview(appointment.id!);
      if (existingReview) {
        setHasExistingReview(true);
        setRating(existingReview.rating);
        setComment(existingReview.comment || '');
      }
    } catch (error) {
      console.log('Could not check existing review:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    if (hasExistingReview) {
      toast({
        title: "Review Already Exists",
        description: "You have already reviewed this appointment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.createReview({
        appointment_id: appointment.id!,
        rating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      onReviewSubmitted();
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setHasExistingReview(false);
  };

  const StarRating = () => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none disabled:cursor-not-allowed"
          onMouseEnter={() => !hasExistingReview && setHoveredStar(star)}
          onMouseLeave={() => !hasExistingReview && setHoveredStar(0)}
          onClick={() => !hasExistingReview && setRating(star)}
          disabled={hasExistingReview}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoveredStar || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasExistingReview ? 'Your Review' : 'Leave a Review'}
          </DialogTitle>
          <DialogDescription>
            {hasExistingReview 
              ? `Your review for ${barberName} - ${serviceName}`
              : `Share your experience with ${barberName} for ${serviceName}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment {!hasExistingReview && '(optional)'}</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => !hasExistingReview && setComment(e.target.value)}
              rows={4}
              disabled={hasExistingReview}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {!hasExistingReview && (
              <Button type="submit" disabled={loading || rating === 0}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
