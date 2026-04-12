import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Blockchain UPI</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              A simulation-based approach to prevent tampering and fraud in UPI transactions 
              using Hyperledger Fabric blockchain technology.
            </p>
            <div className="flex space-x-4">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <button type="button" className="text-left text-gray-600 hover:text-gray-900 transition-colors">
                  Fraud Detection
                </button>
              </li>
              <li>
                <button type="button" className="text-left text-gray-600 hover:text-gray-900 transition-colors">
                  Tamper Prevention
                </button>
              </li>
              <li>
                <button type="button" className="text-left text-gray-600 hover:text-gray-900 transition-colors">
                  Real-time Monitoring
                </button>
              </li>
              <li>
                <button type="button" className="text-left text-gray-600 hover:text-gray-900 transition-colors">
                  Audit Trail
                </button>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Technology
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600">Hyperledger Fabric</span>
              </li>
              <li>
                <span className="text-gray-600">React.js</span>
              </li>
              <li>
                <span className="text-gray-600">Node.js</span>
              </li>
              <li>
                <span className="text-gray-600">Blockchain</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-600">
              <FaShieldAlt className="w-4 h-4" />
              <span className="text-sm">
                Secure • Immutable • Transparent
              </span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-600">
              <p>&copy; 2025 Blockchain UPI System. All rights reserved.</p>
              <p className="mt-1">
                This is a simulation project for educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
