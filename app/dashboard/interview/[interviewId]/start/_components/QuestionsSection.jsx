"use client";
import React from 'react';
import { Volume2 } from 'lucide-react';

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
  
  const textToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert('Your browser does not support text to speech');
    }
  };

  return mockInterviewQuestion && (
    <div className='p-5 border rounded-lg bg-white my-10 shadow-sm'>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'>
        {mockInterviewQuestion.map((question, index) => (
          <h2 
            key={index}
            className={`p-2 rounded-full text-xs md:text-sm font-semibold text-center border cursor-pointer transition-all ${activeQuestionIndex === index ? 'bg-primary text-white border-primary' : 'bg-secondary text-gray-500'}`}>
            Question #{index + 1}
          </h2>
        ))}
      </div>
      
      <h2 className='my-5 text-md md:text-lg font-medium text-gray-800 leading-relaxed'>
        {mockInterviewQuestion[activeQuestionIndex]?.question}
      </h2>
      
      <Volume2 className='cursor-pointer text-indigo-600 h-6 w-6 mt-4 hover:scale-110 transition-transform' onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)} />
    </div>
  );
}

export default QuestionsSection;
