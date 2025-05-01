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
            Inicio
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Servicios
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Plataforma
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Casos de Estudio
          </Link>
          <Link href="#" className="text-gray-600 hover:text-[#093733]">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-[#093733] hover:text-[#093733]/80 hidden md:block">
            Iniciar sesión
          </Link>
          <Link href="#" className="bg-[#093733] text-white px-4 py-2 rounded-full hover:bg-[#093733]/90 transition">
            Ponerse en contacto
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
              <p className="text-sm md:text-base">Proveedor #1 de Soluciones de Encuestas de Vivienda</p>
              <h1 className="text-5xl md:text-7xl font-light leading-tight">
                Perspectivas de Vivienda
                <br />
                Basadas en Datos
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="#"
                  className="bg-white text-[#093733] px-6 py-3 rounded-full inline-flex items-center justify-center hover:bg-[#E8E8D3] transition group w-fit"
                >
                  Ponerse en contacto
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#"
                  className="border border-white text-white px-6 py-3 rounded-full inline-flex items-center justify-center hover:bg-white/10 transition group w-fit"
                >
                  Nuestros servicios
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
                  alt="Panel de control de encuesta de vivienda"
                  width={200}
                  height={200}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <div className="text-[#093733]">
                  <p className="font-medium">Explora Nuestro</p>
                  <p className="font-bold">Último Caso de Estudio</p>
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
              <p className="text-[#91856C] mt-2">Encuestas completadas a nivel nacional</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-[#093733]">50K</h3>
              <p className="text-[#91856C] mt-2">Unidades de vivienda analizadas</p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="text-4xl md:text-5xl font-bold text-[#093733]">98%</h3>
              <p className="text-[#91856C] mt-2">Tasa de satisfacción del cliente</p>
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
                <span className="text-[#093733]">Centrándonos en la precisión,</span>
                <span className="text-[#91856C]"> entregamos perspectivas accionables</span>
              </h2>
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                Nos aseguramos de que cada encuesta que realizamos cumpla con los más altos estándares de calidad de datos. Nuestro enfoque integral proporciona a las organizaciones información confiable para la toma de decisiones informadas en vivienda y desarrollo urbano.
              </p>
              <Link href="#" className="text-[#093733] font-medium inline-flex items-center group">
                Aprende más sobre nuestra metodología
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#093733]">Nuestros Servicios Principales</h2>
            <p className="text-[#91856C] mt-4 max-w-2xl mx-auto">
              Soluciones integrales de encuestas de vivienda que transforman datos en perspectivas accionables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#E8E8D3]/20 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#093733] text-white rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Despliegue Profesional de Encuestas</h3>
              <p className="text-[#91856C]">
                Personal de campo calificado que realiza encuestas de vivienda personalizadas con rigurosos protocolos de aseguramiento de calidad.
              </p>
            </div>

            <div className="bg-[#E8E8D3]/20 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#093733] text-white rounded-full flex items-center justify-center mb-4">
                <BarChart2 size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Plataforma de Análisis de Datos</h3>
              <p className="text-[#91856C]">
                Paneles interactivos para visualización de datos con herramientas de filtrado personalizadas y generación automática de informes.
              </p>
            </div>

            <div className="bg-[#E8E8D3]/20 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#093733] text-white rounded-full flex items-center justify-center mb-4">
                <Map size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Inteligencia de Negocios</h3>
              <p className="text-[#91856C]">
                Consulta experta sobre diseño de encuestas con análisis de tendencias y recomendaciones accionables.
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para transformar tus datos de vivienda?</h2>
              <p className="text-white/80 mb-6">
                Únete a organizaciones y gobiernos que ya han mejorado sus decisiones de vivienda y desarrollo urbano con nuestras soluciones integrales de encuestas.
              </p>
              <Link
                href="#"
                className="bg-white text-[#093733] px-6 py-3 rounded-full inline-flex items-center justify-center hover:bg-[#E8E8D3] transition group"
              >
                Programar una consulta
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden md:block">
              <Image
                src="/placeholder.svg?height=300&width=500"
                alt="Visualización del panel de datos"
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#093733]">Nuestro Proceso</h2>
            <p className="text-[#91856C] mt-4 max-w-2xl mx-auto">
              Un enfoque simplificado para recopilar y analizar datos de vivienda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Consulta</h3>
              <p className="text-[#91856C]">Trabajamos contigo para entender tus necesidades y objetivos específicos.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Diseño de Encuesta</h3>
              <p className="text-[#91856C]">Nuestros expertos crean encuestas personalizadas adaptadas a tus requisitos.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Recolección de Datos</h3>
              <p className="text-[#91856C]">Implementamos encuestas utilizando metodologías rigurosas y personal capacitado.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#093733] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold text-[#093733] mb-2">Análisis e Informes</h3>
              <p className="text-[#91856C]">Proporcionamos perspectivas detalladas y recomendaciones accionables.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#093733]">Lo Que Dicen Nuestros Clientes</h2>
          </div>

          <div className="max-w-4xl mx-auto bg-[#E8E8D3]/20 p-8 rounded-lg">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Foto del cliente"
                width={100}
                height={100}
                className="rounded-full"
              />
              <div>
                <p className="text-gray-600 italic mb-4">
                  "Nexus nos proporcionó los datos precisos que necesitábamos para asegurar la financiación de nuestro último proyecto de desarrollo. Su plataforma es intuitiva y su equipo es increíblemente solidario."
                </p>
                <p className="font-bold text-[#093733]">Jane Doe</p>
                <p className="text-[#91856C]">Directora de Desarrollo Urbano, Ciudad Ejemplo</p>
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
              <p className="text-[#91856C] text-sm">Perspectivas de vivienda basadas en datos</p>
            </div>

            <div>
              <h4 className="font-bold text-[#093733] mb-4">Enlaces Rápidos</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  Inicio
                </Link>
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  Servicios
                </Link>
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  Plataforma
                </Link>
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  Contacto
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-bold text-[#093733] mb-4">Legal</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  Política de Privacidad
                </Link>
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  Términos de Servicio
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-bold text-[#093733] mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    {/* Placeholder for social icon */}
                  </svg>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-[#093733]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    {/* Placeholder for social icon */}
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[#91856C]/20 mt-8 pt-8 text-center text-[#91856C]">
            <p>&copy; {new Date().getFullYear()} Sensia Company. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )

}
