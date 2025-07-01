
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Calendar, Star, Users, Clock, Award } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-600 rounded-full">
                <Scissors className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">BarberEase</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The modern solution for barber shops. Book appointments, manage your schedule, 
              and grow your business with our comprehensive platform.
            </p>
            
            {user ? (
              <div className="space-x-4">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/barbers">
                  <Button size="lg" variant="outline">
                    Find Barbers
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Barber Shop
            </h2>
            <p className="text-lg text-gray-600">
              Streamline your operations with our comprehensive suite of tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Clients can book appointments 24/7 with real-time availability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Keep track of client preferences and appointment history
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>
                  Build trust with authentic client reviews and ratings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Time Management</CardTitle>
                <CardDescription>
                  Set your availability and manage your schedule efficiently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Scissors className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Service Catalog</CardTitle>
                <CardDescription>
                  Showcase your services with detailed descriptions and pricing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Professional Profiles</CardTitle>
                <CardDescription>
                  Create stunning profiles that showcase your skills and experience
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Barber Shop?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of barbers who have already modernized their business
          </p>
          {!user && (
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Your Free Trial
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
