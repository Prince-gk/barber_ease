import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, Star } from "lucide-react";
import { apiService, Appointment, User as UserType, Service } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ReviewModal from "@/components/ReviewModal";
import { useToast } from "@/hooks/use-toast";

interface AppointmentWithDetails extends Appointment {
  barber?: UserType;
  service?: Service;
}

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithDetails | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const {
    data: appointments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: async (): Promise<AppointmentWithDetails[]> => {
      const appointments = await apiService.getMyAppointments();

      // Fetch barber and service details for each appointment
      const appointmentsWithDetails = await Promise.all(
        appointments.map(
          async (appointment): Promise<AppointmentWithDetails> => {
            try {
              const [barber, service] = await Promise.all([
                apiService.getUserById(appointment.barber_id),
                apiService.getServiceById(appointment.service_id),
              ]);
              return { ...appointment, barber, service };
            } catch (error) {
              console.error("Error fetching appointment details:", error);
              return appointment;
            }
          },
        ),
      );

      return appointmentsWithDetails;
    },
    enabled: !!user,
  });

  const handleReviewClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    refetch();
    toast({
      title: "Review Submitted",
      description: "Your review has been posted successfully!",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-2 text-gray-600">
            View your upcoming and past appointments
          </p>
        </div>

        {!appointments || appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments yet
              </h3>
              <p className="text-gray-500 mb-4">
                Book your first appointment with one of our barbers
              </p>
              <Button onClick={() => (window.location.href = "/barbers")}>
                Find Barbers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span>
                          {appointment.barber_name || "Unknown Barber"}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {appointment.service_name || "Unknown Service"}
                      </p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(appointment.appointment_time)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatTime(appointment.appointment_time)}
                      </span>
                    </div>
                  </div>

                  {appointment.service && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">
                            {appointment.service.name}
                          </h4>
                          {appointment.service.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.service.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${appointment.service.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.service.duration} min
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {appointment.status.toLowerCase() === "completed" && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleReviewClick(appointment)}
                        className="flex items-center space-x-2"
                      >
                        <Star className="h-4 w-4" />
                        <span>Leave Review</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedAppointment && (
          <ReviewModal
            appointment={selectedAppointment}
            barberName={
              selectedAppointment.barber?.full_name || "Unknown Barber"
            }
            serviceName={selectedAppointment.service?.name || "Unknown Service"}
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default Appointments;
