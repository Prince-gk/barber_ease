import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService, User, Service, Review } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  DollarSign,
  User as UserIcon,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookingModal from "@/components/BookingModal";

const BarberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [barber, setBarber] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    if (id) {
      fetchBarberData();
    }
  }, [id]);

  const fetchBarberData = async () => {
    try {
      // Get barber info from barbers list
      const barbersData = await apiService.getBarbers();
      const foundBarber = barbersData.find((b) => b.id === parseInt(id!));
      const reviewsData = await apiService.getReviews(foundBarber.id);
      setReviews(reviewsData);
      if (!foundBarber) {
        toast({
          title: "Barber not found",
          variant: "destructive",
        });
        navigate("/barbers");
        return;
      }

      setBarber(foundBarber);

      // Get barber's services
      const servicesData = await apiService.getServices(foundBarber.id);
      setServices(servicesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load barber profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book an appointment.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user.is_barber) {
      toast({
        title: "Cannot Book",
        description: "Barbers cannot book appointments with other barbers.",
        variant: "destructive",
      });
      return;
    }

    setSelectedService(service);
    setShowBookingModal(true);
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.createReview({
        barber_id: barber!.id,
        client_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      toast({ title: "Review submitted!" });
      setNewReview({ rating: 0, comment: "" });

      // Reload reviews
      const updatedReviews = await apiService.getReviews(barber!.id);
      setReviews(updatedReviews);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Could not submit review. You must complete a session with the barber",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Barber not found
          </h1>
          <Button onClick={() => navigate("/barbers")}>Back to Barbers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/barbers")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Barbers
        </Button>

        {/* Barber Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {barber.full_name}
                  </h1>
                  <Badge>Professional Barber</Badge>
                </div>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-medium">0.0</span>
                    <span>(0 reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Available for booking</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          {barber.bio && (
            <CardContent>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">{barber.bio}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
            <CardDescription>
              Choose from {barber.full_name}'s available services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No services available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">${service.price}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleBookService(service)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reviews & Ratings</CardTitle>
            <CardDescription>What clients are saying</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No reviews yet. Be the first to leave one!
                </p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border p-4 rounded-md">
                    <div className="flex items-center space-x-2 text-sm text-yellow-500">
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="mt-2 text-gray-800">{review.comment}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      — {review.client_name || "Anonymous"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {user && !user.is_barber && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-medium mb-2">Leave a Review</h4>
            <div className="flex space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    newReview.rating >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }`}
                  onClick={() => setNewReview((r) => ({ ...r, rating: star }))}
                />
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 mb-3 text-sm"
              rows={3}
              placeholder="Write your feedback..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview((r) => ({ ...r, comment: e.target.value }))
              }
            />
            <Button onClick={submitReview}>Submit Review</Button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && barber && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          barber={barber}
          service={selectedService}
        />
      )}
    </div>
  );
};

export default BarberProfile;
