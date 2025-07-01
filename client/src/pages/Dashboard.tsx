import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Star, CalendarDays } from "lucide-react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: apiService.getMyAppointments,
    enabled: !!user,
  });

  // Filter upcoming appointments (future dates with confirmed or pending status)
  const upcomingAppointments =
    appointments?.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_time);
      const now = new Date();
      return (
        appointmentDate > now &&
        ["confirmed", "pending"].includes(appointment.status.toLowerCase())
      );
    }) || [];

  const completedAppointments =
    appointments?.filter(
      (appointment) => appointment.status.toLowerCase() === "completed",
    ) || [];

  const stats = [
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Appointments",
      value: completedAppointments.length,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Appointments",
      value: appointments?.length || 0,
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your appointments
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Upcoming Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Button onClick={() => (window.location.href = "/barbers")}>
                    Book an Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Appointment #{appointment.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.appointment_time)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status.toLowerCase() === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {upcomingAppointments.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.href = "/appointments")}
                    >
                      View All Appointments
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => (window.location.href = "/barbers")}
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  Find Barbers
                </Button>
                <Button
                  onClick={() => (window.location.href = "/appointments")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View My Appointments
                </Button>
                <Button
                  onClick={() => (window.location.href = "/profile")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
