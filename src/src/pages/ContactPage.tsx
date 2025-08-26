import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export function ContactPage() {
  const { t } = useTranslation('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(formData.subject)
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )
      const mailtoLink = `mailto:toni@toniriera.art?subject=${subject}&body=${body}`
      
      // Open email client
      window.location.href = mailtoLink
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(t('message_sent'))
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error(t('message_error'))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="py-16 md:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Email</h3>
                  <a href="mailto:toni@toniriera.art" className="text-gray-300 hover:text-purple-400 transition-colors">
                    toni@toniriera.art
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Phone</h3>
                  <p className="text-gray-300">Available upon request</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Location</h3>
                  <p className="text-gray-300">Available for remote collaboration worldwide</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-900 border border-purple-500/20 rounded-lg">
              <h3 className="font-bold text-white mb-3">What I Can Help With</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• AI-powered image generation</li>
                <li>• Creative retouching and editing</li>
                <li>• Advertising campaign visuals</li>
                <li>• Product photography enhancement</li>
                <li>• Artistic and conceptual imagery</li>
              </ul>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-purple-500/20 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    placeholder="Project inquiry"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    placeholder="Tell me about your project and vision..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}