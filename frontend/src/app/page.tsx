import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  AcademicCapIcon,
  BeakerIcon,
  UsersIcon,
  GlobeAltIcon,
  ChartBarIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const features = [
    {
      icon: BeakerIcon,
      title: "Cutting-edge Research",
      description: "Access to state-of-the-art research facilities and methodologies across multiple disciplines."
    },
    {
      icon: UsersIcon,
      title: "Collaborative Network",
      description: "Connect with researchers, academics, and industry experts from around the world."
    },
    {
      icon: GlobeAltIcon,
      title: "Global Impact",
      description: "Research projects that address global challenges and create meaningful societal impact."
    },
    {
      icon: AcademicCapIcon,
      title: "Education Excellence",
      description: "Comprehensive educational programs and mentorship opportunities for students and researchers."
    },
    {
      icon: ChartBarIcon,
      title: "Data-Driven Insights",
      description: "Advanced analytics and data science capabilities to drive evidence-based research."
    },
    {
      icon: SparklesIcon,
      title: "Innovation Hub",
      description: "Fostering innovation through interdisciplinary collaboration and entrepreneurship."
    }
  ];

  const stats = [
    { label: "Research Papers", value: "2,500+" },
    { label: "Active Researchers", value: "500+" },
    { label: "Partner Institutions", value: "150+" },
    { label: "Countries Reached", value: "45+" }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Open Research Institute
              <span className="block text-blue-200">of India</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Advancing research and innovation through collaboration, knowledge sharing, 
              and cutting-edge methodologies that address tomorrow&apos;s challenges today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/research"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                Explore Research
              </Link>
              <Link 
                href="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Why Choose Orii?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We provide the infrastructure, community, and resources needed to conduct 
              world-class research and drive meaningful innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-slate-600">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Research Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of researchers and innovators. Access cutting-edge resources, 
            collaborate with experts, and make an impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Join Orii Today
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}