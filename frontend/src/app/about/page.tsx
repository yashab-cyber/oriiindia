import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  AcademicCapIcon,
  GlobeAltIcon,
  LightBulbIcon,
  UsersIcon,
  ChartBarIcon,
  HandRaisedIcon
} from "@heroicons/react/24/outline";

export default function About() {
  const values = [
    {
      icon: LightBulbIcon,
      title: "Innovation",
      description: "Fostering creativity and breakthrough thinking in research and development."
    },
    {
      icon: UsersIcon,
      title: "Collaboration",
      description: "Building bridges between researchers, institutions, and communities worldwide."
    },
    {
      icon: AcademicCapIcon,
      title: "Excellence",
      description: "Maintaining the highest standards in research quality and academic integrity."
    },
    {
      icon: GlobeAltIcon,
      title: "Global Impact",
      description: "Creating research solutions that address global challenges and benefit humanity."
    },
    {
      icon: ChartBarIcon,
      title: "Evidence-Based",
      description: "Grounding all research in rigorous methodology and data-driven insights."
    },
    {
      icon: HandRaisedIcon,
      title: "Open Access",
      description: "Promoting open science and democratizing access to knowledge and research."
    }
  ];

  const leadership = [
    {
      name: "Dr. Rajesh Sharma",
      position: "Director & Chief Executive",
      image: "/api/placeholder/300/300",
      bio: "Leading researcher in computational biology with over 20 years of experience in academic and industry research.",
      education: "PhD in Computer Science, IIT Delhi",
      expertise: "Computational Biology, Machine Learning, Bioinformatics"
    },
    {
      name: "Prof. Meera Patel",
      position: "Head of Research",
      image: "/api/placeholder/300/300",
      bio: "Renowned expert in climate science and environmental policy with numerous publications in top-tier journals.",
      education: "PhD in Environmental Science, University of Cambridge",
      expertise: "Climate Science, Environmental Policy, Sustainability"
    },
    {
      name: "Dr. Arjun Kumar",
      position: "Director of Innovation",
      image: "/api/placeholder/300/300",
      bio: "Technology entrepreneur and researcher specializing in AI applications for social good.",
      education: "PhD in Artificial Intelligence, Stanford University",
      expertise: "Artificial Intelligence, Social Innovation, Technology Policy"
    },
    {
      name: "Dr. Priya Singh",
      position: "Head of Academic Affairs",
      image: "/api/placeholder/300/300",
      bio: "Education technology specialist focused on improving research training and capacity building.",
      education: "PhD in Education Technology, Harvard University",
      expertise: "Education Technology, Research Training, Capacity Building"
    }
  ];

  const milestones = [
    {
      year: "2018",
      title: "Foundation",
      description: "Open Research Institute of India was established with the vision of democratizing research."
    },
    {
      year: "2019",
      title: "First Research Programs",
      description: "Launched flagship research programs in AI, climate science, and biotechnology."
    },
    {
      year: "2020",
      title: "Global Partnerships",
      description: "Established partnerships with leading international research institutions."
    },
    {
      year: "2021",
      title: "Open Access Platform",
      description: "Launched comprehensive open access publication and collaboration platform."
    },
    {
      year: "2022",
      title: "1000+ Researchers",
      description: "Reached milestone of 1000+ active researchers across multiple disciplines."
    },
    {
      year: "2023",
      title: "Major Grants",
      description: "Secured significant funding for climate change and healthcare research initiatives."
    },
    {
      year: "2024",
      title: "Innovation Hub",
      description: "Opened state-of-the-art innovation hub for technology transfer and startup incubation."
    },
    {
      year: "2025",
      title: "Global Recognition",
      description: "Recognized as leading research institute for sustainable development solutions."
    }
  ];

  const stats = [
    { number: "2,500+", label: "Research Papers Published" },
    { number: "500+", label: "Active Researchers" },
    { number: "150+", label: "Partner Institutions" },
    { number: "45+", label: "Countries Represented" },
    { number: "50+", label: "Research Areas" },
    { number: "100+", label: "Industry Collaborations" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              About Orii
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              The Open Research Institute of India is a pioneering institution dedicated to 
              advancing knowledge through collaborative research, open science, and innovative 
              solutions to global challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To democratize access to research and knowledge by fostering an open, 
                collaborative environment where researchers from diverse backgrounds can 
                work together to address humanity&apos;s most pressing challenges.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe that breakthrough innovations emerge when brilliant minds from 
                different disciplines, cultures, and perspectives collaborate without barriers.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To be the world&apos;s leading open research institute, where transformative 
                discoveries are made accessible to all, driving sustainable development 
                and improving lives globally.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We envision a future where research knows no boundaries, where knowledge 
                flows freely, and where every researcher has the opportunity to contribute 
                to solving global challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that reflect our commitment to advancing research and fostering collaboration
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide our work and shape our research culture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Key milestones in our evolution as a leading research institution
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-300"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}>
                  <div className={`w-full max-w-md ${
                    index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'
                  }`}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the visionary leaders driving our mission forward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <div className="flex items-center justify-center h-64">
                    <UsersIcon className="h-20 w-20 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {leader.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {leader.position}
                  </p>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {leader.bio}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Education:</strong> {leader.education}</p>
                    <p><strong>Expertise:</strong> {leader.expertise}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be part of a global community working to solve the world&apos;s biggest challenges 
            through open, collaborative research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/register"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Become a Researcher
            </a>
            <a 
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Partner With Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}