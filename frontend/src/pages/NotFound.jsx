import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-center min-h-[60vh]">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
        <AlertCircle size={44} />
      </div>
      <h1 className="text-6xl font-extrabold font-display text-txt-title tracking-tight">
        404
      </h1>
      <h2 className="text-2xl font-bold font-display text-txt-title mt-2 mb-4">
        Page Not Found
      </h2>
      <p className="text-txt-muted max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
