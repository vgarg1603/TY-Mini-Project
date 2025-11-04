import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";

const TaxDocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate sample years for the dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    // Simulate loading tax documents
    const loadDocuments = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => {
        setDocuments([
          // Sample data - replace with actual API data
          {
            id: 1,
            name: "Form 1099-DIV",
            year: 2024,
            date: "2024-01-31",
            type: "Dividend Income",
            status: "Available",
          },
          {
            id: 2,
            name: "Annual Investment Summary",
            year: 2024,
            date: "2024-12-31",
            type: "Summary",
            status: "Available",
          },
          {
            id: 3,
            name: "Form 1099-DIV",
            year: 2023,
            date: "2023-01-31",
            type: "Dividend Income",
            status: "Available",
          },
        ]);
        setLoading(false);
      }, 500);
    };

    loadDocuments();
  }, [selectedYear, user]);

  const filteredDocuments = documents.filter(doc => doc.year === selectedYear);

  const downloadDocument = (doc) => {
    // TODO: Implement actual document download
    alert(`Downloading ${doc.name} for ${doc.year}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-blue-600">
              Tax Center
            </h2>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Tax Documents
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl">
            Access your tax documents and investment summaries. Download forms for your tax filing needs.
          </p>
        </div>

        {/* Year Filter */}
        <div className="mb-8 flex items-center gap-4">
          <label htmlFor="year-select" className="text-sm font-semibold text-gray-700">
            Tax Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Important Notice */}
        <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Important Information</h3>
              <p className="text-sm text-blue-800">
                Tax documents are typically available by January 31st for the previous tax year. 
                Please consult with a tax professional for specific tax advice related to your investments.
              </p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900">No documents available</p>
              <p className="text-sm text-gray-600 mt-1">
                No tax documents found for {selectedYear}
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Document Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Document Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {doc.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(doc.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-10 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-4">
            If you have questions about your tax documents or need assistance, please contact our support team.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Tax Resources
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxDocumentsPage;
