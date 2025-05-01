import { FormMessage, Message } from "@/components/form-message";
import { LoginForm } from "@/components/login-form";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart2, ClipboardList, Map, Menu } from "lucide-react"

export default async function Home(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen bg-[#E8E8D3]/10">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-[#093733] font-bold text-xl flex items-center">
            <span className="text-[#093733] mr-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" fill="currentColor" />
                <path d="M2 12L12 17L22 12" fill="currentColor" />
              </svg>
            </span>
            Nexus
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Home
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Services
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Platform
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Case Studies
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-[#093733] hover:text-[#093733]/80 hidden md:block">
            Log in
          </Link>
          <Link href="#" className="bg-[#093733] text-white px-4 py-2 rounded-full hover:bg-[#093733]/90 transition">
            Get in touch
          </Link>
          <button className="md:hidden text-[#093733]">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/landing-background.jpg?height=600&width=1200"
            alt="Urban housing development"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-white space-y-6">
              <p className="text-sm md:text-base">#1 Housing Survey Solutions Provider</p>
              <h1 className="text-5xl md:text-7xl font-light leading-tight">
                Data-Driven
                <br />
                Housing Insights
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="#"
                  className="bg-white text-[#093733] px-6 py-3 rounded-full inline-flex items-center justify-center hover:bg-[#E8E8D3] transition group w-fit"
                >
                  Get in touch
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#"
                  className="border border-white text-white px-6 py-3 rounded-full inline-flex items-center justify-center hover:bg-white/10 transition group w-fit"
                >
                  Our services
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="bg-white rounded-lg p-4 shadow-lg max-w-xs w-full relative">
                <div className="absolute -right-4 -top-4 bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <Image
                  src="/case.jpg?height=200&width=200"
                  alt="Housing survey dashboard"
                  width={200}
                  height={200}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <div className="text-[#093733]">
                  <p className="font-medium">Explore Our</p>
                  <p className="font-bold">Latest Case Study</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-4xl md:text-5xl font-bold text-[#093733]">500+</h3>
              <p className="text-[#91856C] mt-2">Surveys completed nationwide</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-[#093733]">50K</h3>
              <p className="text-[#91856C] mt-2">Housing units analyzed</p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="text-4xl md:text-5xl font-bold text-[#093733]">98%</h3>
              <p className="text-[#91856C] mt-2">Client satisfaction rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-16 bg-[#E8E8D3]/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium">
                <span className="text-[#093733]">Focusing on accuracy,</span>
                <span className="text-[#91856C]"> we deliver actionable insights</span>
              </h2>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                We ensure that every survey we conduct meets the highest standards of data quality. Our comprehensive
                approach provides organizations with reliable information for informed decision-making in housing and
                urban development.
              </p>
              <Link href="#" className="text-[#093733] font-medium inline-flex items-center group">
                Learn more about our methodology
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#093733]">Our Core Services</h2>
            <p className="text-[#91856C] mt-4 max-w-2xl mx-auto">
              Comprehensive housing survey solutions that transform data into actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#E8E8D3]/20 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#093733] text-white rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Professional Survey Deployment</h3>
              <p className="text-[#91856C]">
                Qualified field personnel conducting customized housing surveys with rigorous quality assurance
                protocols.
              </p>
            </div>

            <div className="bg-[#E8E8D3]/20 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#093733] text-white rounded-full flex items-center justify-center mb-4">
                <BarChart2 size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Data Analysis Platform</h3>
              <p className="text-[#91856C]">
                Interactive dashboards for data visualization with custom filtering tools and automated report
                generation.
              </p>
            </div>

            <div className="bg-[#E8E8D3]/20 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#093733] text-white rounded-full flex items-center justify-center mb-4">
                <Map size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Business Intelligence</h3>
              <p className="text-[#91856C]">
                Expert consultation on survey design with trend analysis and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#093733] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your housing data?</h2>
              <p className="text-white/80 mb-6">
                Join organizations and governments who have already improved their housing and urban development
                decisions with our comprehensive survey solutions.
              </p>
              <Link
                href="#"
                className="bg-white text-[#093733] px-6 py-3 rounded-full inline-flex items-center justify-center hover:bg-[#E8E8D3] transition group"
              >
                Schedule a consultation
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden md:block">
              <Image
                src="/placeholder.svg?height=300&width=500"
                alt="Data dashboard visualization"
                width={500}
                height={300}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-[#E8E8D3]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#093733]">Our Process</h2>
            <p className="text-[#91856C] mt-4 max-w-2xl mx-auto">
              A streamlined approach to gathering and analyzing housing data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Consultation</h3>
              <p className="text-[#91856C]">We work with you to understand your specific needs and objectives.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Survey Design</h3>
              <p className="text-[#91856C]">Our experts create customized surveys tailored to your requirements.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Data Collection</h3>
              <p className="text-[#91856C]">Professional field teams gather accurate and comprehensive data.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Analysis & Insights</h3>
              <p className="text-[#91856C]">Transform raw data into actionable insights through our platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#093733]">What Our Clients Say</h2>
          </div>

          <div className="max-w-4xl mx-auto bg-[#E8E8D3]/20 p-8 rounded-lg">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=96&width=96"
                  alt="Client portrait"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[#091856C] italic mb-4">
                  "Nexus transformed our approach to urban housing development. The data insights we received were
                  invaluable in making informed decisions about our community development projects. Their team was
                  professional, thorough, and delivered beyond our expectations."
                </p>
                <div>
                  <p className="font-bold text-[#093733]">Sarah Johnson</p>
                  <p className="text-[#91856C]">Director of Urban Planning, Metro City Government</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E8E8D3]/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-[#093733] font-bold text-xl flex items-center mb-4">
                <span className="text-[#093733] mr-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                    <path d="M2 17L12 22L22 17" fill="currentColor" />
                    <path d="M2 12L12 17L22 12" fill="currentColor" />
                  </svg>
                </span>
                Nexus
              </span>
              <p className="text-[#91856C] mb-1">by Sensia Company</p>
              <p className="text-[#91856C] mb-4">
                Comprehensive housing survey solutions for informed decision-making.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-[#093733] hover:text-[#093733]/80">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" fill="currentColor" />
                  </svg>
                </a>
                <a href="#" className="text-[#093733] hover:text-[#093733]/80">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <a href="#" className="text-[#093733] hover:text-[#093733]/80">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                      fill="currentColor"
                    />
                    <rect x="2" y="9" width="4" height="12" fill="currentColor" />
                    <circle cx="4" cy="4" r="2" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[#093733] font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    About Sensia
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#093733] font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Survey Deployment
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Data Analysis
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Business Intelligence
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#91856C] hover:text-[#093733]">
                    Consulting
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#093733] font-bold mb-4">Newsletter</h3>
              <p className="text-[#91856C] mb-4">
                Subscribe to our newsletter for the latest insights in housing data.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-full border-2 border-[#093733] focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#093733] text-white px-4 py-2 rounded-r-full hover:bg-[#093733]/90 transition"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-[#91856C]/20 mt-8 pt-8 text-center text-[#91856C]">
            <p>&copy; {new Date().getFullYear()} Sensia Company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )

}
