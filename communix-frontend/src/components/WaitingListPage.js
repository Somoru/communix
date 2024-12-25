import React from 'react';

function WaitingListPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg"> 
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Thank You for Signing Up!</h1>
        <p className="text-lg text-gray-600 mb-8">
          You've been added to our waiting list. We're working hard to launch Communix soon.
        </p>
        <p className="text-gray-600">
          In the meantime, you can follow us on [social media links] for updates.
        </p>
      </div>
    </div>
  );
}

export default WaitingListPage;