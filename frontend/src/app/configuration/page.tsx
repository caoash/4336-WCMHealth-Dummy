'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- Interfaces (Helper) ---
interface DetailRow { // Minimal interface needed for feature extraction
    id: number;
    Details: string;
    Value: string; // Keep Value for completeness, though not directly used here
    Status: string;
}

// Helper function to parse the Details string (copied from health-report)
const parseDetailsString = (detailsString: string): { [key: string]: string } => {
    if (!detailsString) return {};
    return detailsString.split(', ').reduce((acc, pair) => {
        const [key, ...valueParts] = pair.split(':');
        const value = valueParts.join(':').trim();
        if (key) {
            acc[key.trim()] = value;
        }
        return acc;
    }, {} as { [key: string]: string });
};

// --- Conditional Structure ---
type Operator = '>' | '<' | '==' | '!=';
type ComparisonType = 'value' | 'feature';

interface Conditional {
    id: number;
    feature1: string;
    operator: Operator;
    comparisonType: ComparisonType;
    comparisonValue: string; // Store value as string, parse later if needed
}

// --- Component ---
export default function Configuration() {
    // State for table columns (fixed)
    const columns: string[] = ["Feature 1", "Operator", "Comparison Type", "Value / Feature", "Actions"]; // Added Actions column

    // State for available features derived from data
    const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);

    // State for the list of defined conditionals - Initialize from localStorage later
    const [conditionals, setConditionals] = useState<Conditional[]>([]);

    // State for the "Add Conditional" form inputs
    const [newConditional, setNewConditional] = useState<Omit<Conditional, 'id'>>({
        feature1: '',
        operator: '==', // Default operator
        comparisonType: 'value', // Default comparison type
        comparisonValue: ''
    });
    const [formError, setFormError] = useState<string | null>(null);

    // --- Data Fetching & Feature Extraction ---
    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const res = await fetch('/api/dashboard'); // Fetch data like the report page
            if (!res.ok) throw new Error('Failed to fetch dashboard data');
            const data = await res.json();

            if (data.details && data.details.length > 0) {
                const allKeys = new Set<string>();
                data.details.forEach((detail: DetailRow) => {
                    const parsed = parseDetailsString(detail.Details);
                    Object.keys(parsed).forEach(key => allKeys.add(key));
                });
                setAvailableFeatures(Array.from(allKeys).sort());
            } else {
                setAvailableFeatures([]);
            }
        } catch (error) {
            console.error('Error fetching features:', error);
            setAvailableFeatures([]); // Ensure it's empty on error
            // Optionally show an error message to the user
        }
    };

    // --- Load Conditionals from localStorage on Mount ---
    useEffect(() => {
        try {
            const storedConditionals = localStorage.getItem('definedConditionals');
            if (storedConditionals) {
                const parsedConditionals = JSON.parse(storedConditionals);
                // Basic validation to ensure it's an array (can add more checks)
                if (Array.isArray(parsedConditionals)) {
                     setConditionals(parsedConditionals);
                } else {
                    console.warn("Stored conditionals data is not an array, ignoring.");
                    localStorage.removeItem('definedConditionals'); // Clean up invalid data
                }
            }
        } catch (error) {
            console.error('Error loading conditionals from localStorage:', error);
            // Optionally clear corrupted data
            // localStorage.removeItem('definedConditionals');
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Save Conditionals to localStorage on Change ---
    useEffect(() => {
        try {
            // Avoid saving the initial empty state if it hasn't been loaded yet
            // This check might not be strictly necessary if loading happens first,
            // but can prevent overwriting stored data with an empty array unnecessarily.
            // We check if the component has mounted and potentially loaded data.
            if (conditionals.length > 0 || localStorage.getItem('definedConditionals')) {
                 localStorage.setItem('definedConditionals', JSON.stringify(conditionals));
            }
        } catch (error) {
            console.error('Error saving conditionals to localStorage:', error);
            // Handle potential errors like quota exceeded
        }
    }, [conditionals]); // Dependency array ensures this runs whenever conditionals change

    // --- Event Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setNewConditional(prev => {
            // If the comparisonType is changing, update it and reset comparisonValue
            if (name === 'comparisonType') {
                return {
                    ...prev,
                    comparisonType: value as ComparisonType, // Update type
                    comparisonValue: '' // Reset value/feature selection
                };
            }
            // Otherwise, just update the field that changed
            return {
                ...prev,
                [name]: value
            };
        });

        setFormError(null); // Clear error on input change
    };

    const handleAddConditional = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Basic Validation
        if (!newConditional.feature1) {
            setFormError('Please select Feature 1.');
            return;
        }
        if (newConditional.comparisonType === 'feature' && !newConditional.comparisonValue) {
             setFormError('Please select a valid comparison Feature from the second dropdown.');
            return;
        }
         if (newConditional.comparisonType === 'value' && newConditional.comparisonValue.trim() === '') {
             setFormError('Please enter a comparison Value.');
            return;
        }


        const newCond: Conditional = {
            ...newConditional,
            id: Date.now(), // Simple unique ID using timestamp
        };

        setConditionals(prev => [...prev, newCond]);

        // Reset form
        setNewConditional({
            feature1: '',
            operator: '==',
            comparisonType: 'value',
            comparisonValue: ''
        });
    };

    const handleDeleteConditional = (idToDelete: number) => {
        setConditionals(prev => prev.filter(cond => cond.id !== idToDelete));
    };

    // --- Render ---
    return (
        <div className="container mx-auto px-4 py-8">
            <nav className="mb-6">
                <Link href="/" className="text-blue-600 hover:underline">
                    &larr; Back to Home
                </Link>
            </nav>
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-[#5f43b2]">Configuration Page</h1>

                {/* --- Add Conditional Form --- */}
                <form onSubmit={handleAddConditional} className="mb-8 p-4 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Conditional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        {/* Feature 1 */}
                        <div>
                            <label htmlFor="feature1" className="block text-sm font-medium text-gray-700 mb-1">Feature 1</label>
                            <select
                                id="feature1"
                                name="feature1"
                                value={newConditional.feature1}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-700"
                                required
                            >
                                <option value="" disabled>Select Feature...</option>
                                {availableFeatures.map(f => <option key={f} value={f} className="text-gray-700">{f}</option>)}
                            </select>
                        </div>

                        {/* Operator */}
                        <div>
                            <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                            <select
                                id="operator"
                                name="operator"
                                value={newConditional.operator}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-700"
                                required
                            >
                                <option value="==" className="text-gray-700">== (Equal)</option>
                                <option value="!=" className="text-gray-700">!= (Not Equal)</option>
                                <option value=">" className="text-gray-700">&gt; (Greater Than)</option>
                                <option value="<" className="text-gray-700">&lt; (Less Than)</option>
                            </select>
                        </div>

                         {/* Comparison Type */}
                         <div>
                            <label htmlFor="comparisonType" className="block text-sm font-medium text-gray-700 mb-1">Compare Against</label>
                            <select
                                id="comparisonType"
                                name="comparisonType"
                                value={newConditional.comparisonType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-700"
                                required
                            >
                                <option value="value" className="text-gray-700">Specific Value</option>
                                <option value="feature" className="text-gray-700">Another Feature</option>
                            </select>
                        </div>

                        {/* Value / Feature */}
                        <div className="lg:col-span-1"> {/* Adjust span as needed */}
                            <label htmlFor="comparisonValue" className="block text-sm font-medium text-gray-700 mb-1">
                                {newConditional.comparisonType === 'value' ? 'Value' : 'Feature'}
                            </label>
                            {newConditional.comparisonType === 'value' ? (
                                <input
                                    id="comparisonValue"
                                    name="comparisonValue"
                                    type="text" // Keep as text, parse to number if needed during evaluation
                                    placeholder="Enter value"
                                    value={newConditional.comparisonValue}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2]"
                                    required
                                />
                            ) : (
                                <select
                                    id="comparisonValue"
                                    name="comparisonValue"
                                    value={newConditional.comparisonValue}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-700"
                                    required
                                >
                                    <option value="" disabled>Select Feature...</option>
                                    {availableFeatures.filter(f => f !== newConditional.feature1).map(f => <option key={f} value={f} className="text-gray-700">{f}</option>)}
                                </select>
                            )}
                        </div>

                         {/* Add Button */}
                         <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                         >
                             Add Conditional
                         </button>
                    </div>
                     {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
                </form>


                {/* --- Configuration Table --- */}
                <div className="overflow-x-auto">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Defined Conditionals</h2>
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {columns.map((colName, index) => (
                                    <th key={index} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {colName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {conditionals.length === 0 ? (
                                // Placeholder Row
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-sm text-gray-500">
                                        No conditionals defined yet. Add rows using the form above.
                                    </td>
                                </tr>
                            ) : (
                                // Render defined conditionals
                                conditionals.map((cond) => (
                                    <tr key={cond.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{cond.feature1}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">{cond.operator}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">{cond.comparisonType}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{cond.comparisonValue}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                                             <button
                                                onClick={() => handleDeleteConditional(cond.id)}
                                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                title="Delete Conditional"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
