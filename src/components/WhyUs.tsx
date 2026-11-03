import React from 'react'
import './Whyus.css'

function WhyUs() {
  return (
    <div className="mx-auto flex justify-center items-center my-28">
      <div className="relative bg-gradient-to-r from-blue-900 via-gray-900 to-black rounded-2xl shadow-xl p-8 overflow-hidden max-w-4xl">
        {/* Animated background blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3 text-center animate-fade-in-up">
            What makes us different?
          </h2>
          <p className="text-lg text-gray-200 text-center max-w-2xl mx-auto animate-fade-in-up delay-200">
            We combine real-time NASA data, AI-powered risk analysis, and a beautiful interactive experience to help you plan with confidence. Our unique blend of science and design means you get forecasts you can trust—delivered with clarity and style.
          </p>
          {/* Animated underline */}
          <div className="mx-auto mt-4 w-24 h-1 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default WhyUs