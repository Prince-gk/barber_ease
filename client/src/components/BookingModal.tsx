
import { useState } from 'react';
import { apiService, User, Service } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber: User;
  service: Service;
}

const BookingModal = ({ isOpen, onClose, barber, service }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock time slots - in a real app, this would come from the barber's availability
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      await apiService.createAppointment({
        barber_id: barber.id,
        service_id: service.id!,
        appointment_time: appointmentDateTime.toISOString(),
      });

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${barber.full_name} has been scheduled for ${format(appointmentDateTime, 'PPP')} at ${selectedTime}.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule your appointment with {barber.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{barber.full_name}</p>
                    <p className="text-sm text-gray-600">Professional Barber</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">{service.name}</h4>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${service.price}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{service.duration} min</span>
                    </Badge>
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(selectedDate, 'PPP')} at {selectedTime}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleBooking} 
              disabled={!selectedDate || !selectedTime || loading}
              className="w-full"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  className="rounded-md border pointer-events-auto"
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="text-sm"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
