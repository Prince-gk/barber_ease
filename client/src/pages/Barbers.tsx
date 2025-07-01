import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, User } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User as UserIcon, Star, Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Barbers = () => {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [ratings, setRatings] = useState<
    Record<number, { average: number; count: number }>
  >({});

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    const filtered = barbers.filter(
      (barber) =>
        barber.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (barber.bio &&
          barber.bio.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    setFilteredBarbers(filtered);
  }, [searchTerm, barbers]);

  const fetchBarbers = async () => {
    try {
      const barbersData = await apiService.getBarbers();
      setBarbers(barbersData);
      setFilteredBarbers(barbersData);

      const ratingsData: Record<number, { average: number; count: number }> =
        {};
      await Promise.all(
        barbersData.map(async (barber) => {
          try {
            const rating = await apiService.getBarberRating(barber.id);
            console.log(rating);
            ratingsData[barber.id] = rating;
          } catch {
            ratingsData[barber.id] = { average: 0, count: 0 };
          }
        }),
      );
      setRatings(ratingsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load barbers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Barber
          </h1>
          <p className="text-gray-600 mb-6">
            Discover talented barbers in your area and book your next
            appointment
          </p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search barbers by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredBarbers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No barbers found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No barbers have registered yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber) => (
              <Card
                key={barber.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {barber.full_name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">Professional</Badge>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {ratings[barber.id]?.average ?? 0.0} (
                          {ratings[barber.id]?.count ?? 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {barber.bio && (
                    <CardDescription className="mb-4 line-clamp-3">
                      {barber.bio}
                    </CardDescription>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Nairobi, Kenya</span>
                  </div>

                  <div className="space-y-2">
                    <Link to={`/barber/${barber.id}`}>
                      <Button className="w-full">View Profile & Book</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Barbers;
