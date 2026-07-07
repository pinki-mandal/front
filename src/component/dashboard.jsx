import React from 'react'

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-3 text-gray-600">
          Welcome! You are logged in successfully.
        </p>
      </div>
    </div>
  )
}

export default Dashboard