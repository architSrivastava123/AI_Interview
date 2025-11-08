"use client";
import React from 'react';
import AddNewInterview from './_components/AddNewInterview';
import InterviewList from './_components/InterviewList';

function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      <p className="text-gray-600 mt-2">Welcome to your AI Mock Interview Dashboard!</p>
      
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create AI Mock Interview</h2>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
          <AddNewInterview />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interview History</h2>
        <InterviewList />
      </div>
    </div>
  );
}

export default Dashboard;
