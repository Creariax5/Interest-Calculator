import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Calendar, Percent, TrendingUp, RefreshCw, Plus, Trash2, BarChart2, ChevronDown, ChevronUp, Edit3, Download, Upload, FileText, ArrowUp, ArrowDown } from 'lucide-react';

const InterestCalculator = () => {
const [advancedMode, setAdvancedMode] = useState(false);

// Simple mode state
const [principal, setPrincipal] = useState(1000);
const [rate, setRate] = useState(5);
const [years, setYears] = useState(5);
const [compoundDays, setCompoundDays] = useState(365);
const [chartData, setChartData] = useState([]);
const [simpleTotal, setSimpleTotal] = useState(0);
const [compoundTotal, setCompoundTotal] = useState(0);
const [visualInterval, setVisualInterval] = useState("year"); // year, month, week, day

// Advanced mode state
const [assets, setAssets] = useState([
  { id: 1, name: "USUAL", principal: 220, rate: 75, color: "#8884d8" },
  { id: 2, name: "BTC", principal: 450, rate: 25, color: "#82ca9d" },
  { id: 3, name: "Pendle USDC", principal: 200, rate: 10, color: "#ffc658" },
  { id: 4, name: "ETH/USDT", principal: 305, rate: 5, color: "#ff8042" },
  { id: 5, name: "USDC syntetix", principal: 380, rate: 27, color: "#0088FE" },
  { id: 6, name: "Other", principal: 63.35, rate: 0, color: "#00C49F" },
  { id: 7, name: "rabby other", principal: 108, rate: 20, color: "#FFBB28" },
  { id: 8, name: "USDC binance", principal: 160, rate: 10, color: "#FF8042" }
]);
const [nextAssetId, setNextAssetId] = useState(9);
const [newAssetName, setNewAssetName] = useState("");
const [newAssetPrincipal, setNewAssetPrincipal] = useState(1000);
const [newAssetRate, setNewAssetRate] = useState(5);
const [assetChartData, setAssetChartData] = useState([]);
const [pieChartData, setPieChartData] = useState([]);
const [totalInvestment, setTotalInvestment] = useState(0);
const [totalFinalValue, setTotalFinalValue] = useState(0);

// Sorting state
const [sortField, setSortField] = useState('name');
const [sortDirection, setSortDirection] = useState('asc');

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a4de6c"];

// Add new asset
const handleAddAsset = () => {
  if (newAssetName.trim() === "") return;
  
  const colorIndex = (nextAssetId - 1) % COLORS.length;
  
  setAssets([
    ...assets,
    {
      id: nextAssetId,
      name: newAssetName,
      principal: newAssetPrincipal,
      rate: newAssetRate,
      color: COLORS[colorIndex]
    }
  ]);
  
  setNextAssetId(nextAssetId + 1);
  setNewAssetName("");
  setNewAssetPrincipal(1000);
  setNewAssetRate(5);
};

// Handle sorting
const handleSort = (field) => {
  const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
  setSortField(field);
  setSortDirection(newDirection);
};

// Get sorted assets
const getSortedAssets = () => {
  // Calculate final values for sorting if needed
  let assetsToSort = [...assets];
  
  if (sortField === 'finalValue') {
    assetsToSort = assetsToSort.map(asset => {
      const compoundsPerYear = 365 / compoundDays;
      const finalValue = compoundDays <= 0
        ? asset.principal * (1 + (asset.rate / 100) * years) // Simple interest
        : asset.principal * Math.pow(1 + (asset.rate / 100) / compoundsPerYear, compoundsPerYear * years); // Compound interest
      return { ...asset, finalValue };
    });
  }
  
  // Sort the assets
  return assetsToSort.sort((a, b) => {
    let aValue = sortField === 'finalValue' ? a.finalValue : a[sortField];
    let bValue = sortField === 'finalValue' ? b.finalValue : b[sortField];
    
    // Handle string comparison for asset names
    if (sortField === 'name') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

// Calculate simple mode interest
useEffect(() => {
  if (!advancedMode) {
    // Create data for chart
    const newChartData = [];
    
    // Determine interval size and label based on visualization interval
    let intervalSize;
    let intervalLabel;
    
    switch(visualInterval) {
      case "day":
        intervalSize = 1/365;
        intervalLabel = "day";
        break;
      case "week":
        intervalSize = 7/365;
        intervalLabel = "week";
        break;
      case "month":
        intervalSize = 1/12;
        intervalLabel = "month";
        break;
      case "year":
      default:
        intervalSize = 1;
        intervalLabel = "year";
    }
    
    // Calculate number of points for the chart
    const totalPoints = Math.ceil(years / intervalSize) + 1;
    const maxPoints = 100; // Limit max points for performance
    const skipFactor = totalPoints > maxPoints ? Math.floor(totalPoints / maxPoints) : 1;
    
    // Generate chart data
    for (let i = 0; i <= Math.ceil(years / intervalSize); i += skipFactor) {
      const currentTime = i * intervalSize;
      
      // Skip if beyond the time range
      if (currentTime > years) continue;
      
      const simpleAmount = principal * (1 + (rate / 100) * currentTime);
      let compoundAmount;
      
      // Handle compounding based on days
      if (compoundDays <= 0) {
        compoundAmount = simpleAmount; // Simple interest (no compounding)
      } else {
        // Calculate number of compounds per year
        const compoundsPerYear = 365 / compoundDays;
        compoundAmount = principal * Math.pow(1 + (rate / 100) / compoundsPerYear, compoundsPerYear * currentTime);
      }
      
      newChartData.push({
        interval: i,
        time: currentTime.toFixed(2),
        intervalType: intervalLabel,
        simple: parseFloat(simpleAmount.toFixed(2)),
        compound: parseFloat(compoundAmount.toFixed(2)),
      });
    }
    
    // Calculate final values
    const simpleTotal = principal * (1 + (rate / 100) * years);
    let compoundTotal;
    
    if (compoundDays <= 0) {
      compoundTotal = simpleTotal; // Simple interest (no compounding)
    } else {
      // Calculate number of compounds per year
      const compoundsPerYear = 365 / compoundDays;
      compoundTotal = principal * Math.pow(1 + (rate / 100) / compoundsPerYear, compoundsPerYear * years);
    }
    
    setChartData(newChartData);
    setSimpleTotal(simpleTotal);
    setCompoundTotal(compoundTotal);
  }
}, [principal, rate, years, compoundDays, visualInterval, advancedMode]);

// Calculate advanced mode interest
useEffect(() => {
  if (advancedMode) {
    // Create data for asset growth chart
    const newAssetChartData = [];
    
    for (let year = 0; year <= years; year++) {
      const yearData = { year };
      let yearTotalValue = 0;
      
      assets.forEach(asset => {
        // Calculate compound interest for each asset
        const compoundsPerYear = 365 / compoundDays;
        const finalValue = compoundDays <= 0
          ? asset.principal * (1 + (asset.rate / 100) * year) // Simple interest
          : asset.principal * Math.pow(1 + (asset.rate / 100) / compoundsPerYear, compoundsPerYear * year); // Compound interest
          
        yearData[asset.name] = parseFloat(finalValue.toFixed(2));
        yearTotalValue += finalValue;
      });
      
      yearData.total = parseFloat(yearTotalValue.toFixed(2));
      newAssetChartData.push(yearData);
    }
    
    // Create data for pie chart
    const initialTotal = assets.reduce((sum, asset) => sum + asset.principal, 0);
    
    const initialPieData = assets.map(asset => ({
      name: asset.name,
      value: asset.principal,
      color: asset.color
    }));
    
    // Calculate final values for each asset
    const finalPieData = assets.map(asset => {
      const compoundsPerYear = 365 / compoundDays;
      const finalValue = compoundDays <= 0
        ? asset.principal * (1 + (asset.rate / 100) * years) // Simple interest
        : asset.principal * Math.pow(1 + (asset.rate / 100) / compoundsPerYear, compoundsPerYear * years); // Compound interest
        
      return {
        name: asset.name,
        value: finalValue,
        color: asset.color
      };
    });
    
    const finalTotal = finalPieData.reduce((sum, item) => sum + item.value, 0);
    
    setAssetChartData(newAssetChartData);
    setPieChartData([initialPieData, finalPieData]);
    setTotalInvestment(initialTotal);
    setTotalFinalValue(finalTotal);
  }
}, [advancedMode, assets, years, compoundDays]);

const fileInputRef = useRef(null);

// Handle CSV import
const handleImportCSV = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const csv = e.target.result;
    const lines = csv.split('\n');
    
    // Skip header row
    const newAssets = [];
    let nextId = nextAssetId;
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const columns = lines[i].split(',');
      if (columns.length >= 3) {
        // Clean up the values and convert numbers
        const name = columns[0].trim();
        
        // Remove $ and any commas from the principal
        const principalStr = columns[1].replace(/[$,]/g, '').trim();
        const principal = parseFloat(principalStr) || 0;
        
        // Remove % from the rate
        const rateStr = columns[2].replace(/%/g, '').trim();
        const rate = parseFloat(rateStr) || 0;
        
        // Only add if we have a name and numbers
        if (name && !isNaN(principal) && !isNaN(rate)) {
          const colorIndex = (nextId - 1) % COLORS.length;
          newAssets.push({
            id: nextId++,
            name,
            principal,
            rate,
            color: COLORS[colorIndex]
          });
        }
      }
    }
    
    if (newAssets.length > 0) {
      setAssets([...assets, ...newAssets]);
      setNextAssetId(nextId);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  reader.readAsText(file);
};

// Handle CSV export
const handleExportCSV = () => {
  // Create CSV header
  let csv = 'Asset,Principal,Rate,Final Value\n';
  
  let totalPrincipal = 0;
  let totalFinalValue = 0;
  
  // Add each asset
  assets.forEach(asset => {
    // Calculate final value for this asset
    const compoundsPerYear = 365 / compoundDays;
    const finalValue = compoundDays <= 0
      ? asset.principal * (1 + (asset.rate / 100) * years) // Simple interest
      : asset.principal * Math.pow(1 + (asset.rate / 100) / compoundsPerYear, compoundsPerYear * years); // Compound interest
    
    totalPrincipal += asset.principal;
    totalFinalValue += finalValue;
    
    csv += `${asset.name},${asset.principal.toFixed(2)},${asset.rate}%,${finalValue.toFixed(2)}\n`;
  });
  
  // Add total row
  csv += `Total,${totalPrincipal.toFixed(2)},-,${totalFinalValue.toFixed(2)}`;
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'assets_report.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Remove asset
const handleRemoveAsset = (id) => {
  setAssets(assets.filter(asset => asset.id !== id));
};

// Helper to render sort indicator
const renderSortIndicator = (field) => {
  if (sortField !== field) return null;
  return sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
};

return (
  <div className="w-full max-w-6xl mx-auto p-4 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold text-center mb-4 text-indigo-900">Interest Growth Simulator</h1>
    
    {/* Mode Switch */}
    <div className="flex justify-end mb-4">
      <button
        className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg ${
          advancedMode 
            ? "bg-indigo-600 text-white" 
            : "bg-white text-indigo-600 border border-indigo-300"
        }`}
        onClick={() => setAdvancedMode(!advancedMode)}
      >
        <BarChart2 size={16} className="mr-1" />
        {advancedMode ? "Advanced Mode" : "Simple Mode"}
        <ChevronUp size={16} className="ml-1" />
      </button>
    </div>
    
    {!advancedMode ? (
      /* Simple Mode UI */
      <>
        {/* Main inputs */}
        <div className="mb-4">
          <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
            <div className="flex flex-wrap md:flex-nowrap items-end gap-4">
              {/* Principal Input */}
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Principal</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Interest Rate Input */}
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Interest Rate</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-600 font-medium">%</span>
                  </div>
                </div>
              </div>
              
              {/* Time Period Input */}
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Time Period</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    step="0.1"
                    value={years}
                    onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 pr-12 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-600 font-medium">years</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Compounding Frequency Input */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center">
                <TrendingUp className="h-4 w-4 text-indigo-600 mr-1" />
                Compounding Frequency
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  min="0"
                  value={compoundDays}
                  onChange={(e) => setCompoundDays(parseInt(e.target.value) || 0)}
                  className="w-full p-2 pr-12 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-medium">days</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 flex gap-2 flex-wrap">
                {[
                  { days: 0, label: "no compounding" },
                  { days: 1, label: "daily" },
                  { days: 7, label: "weekly" },
                  { days: 30, label: "monthly" },
                  { days: 365, label: "annually" }
                ].map((option) => (
                  <button
                    key={option.days}
                    className={`px-2 py-1 rounded-full transition-all ${
                      compoundDays === option.days
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setCompoundDays(option.days)}
                  >
                    {option.days} = {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Visualization Interval Selection */}
        <div className="mb-4">
          <div className="bg-white p-3 rounded-lg shadow-md border border-indigo-100">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <RefreshCw className="h-4 w-4 text-indigo-600 mr-1" />
              Visualization Interval
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "day", label: "Daily" },
                { value: "week", label: "Weekly" },
                { value: "month", label: "Monthly" },
                { value: "year", label: "Yearly" }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`py-2 px-3 text-sm rounded-lg transition-all shadow-sm ${
                    visualInterval === option.value
                      ? "bg-indigo-600 text-white font-medium"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => setVisualInterval(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Simple Interest</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Initial Investment</div>
                <div className="text-lg font-bold text-gray-900">${principal.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Interest Earned</div>
                <div className="text-lg font-bold text-green-600">
                  ${(simpleTotal - principal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Final Amount</div>
              <div className="text-2xl font-bold text-indigo-700">
                ${simpleTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Compound Interest</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Initial Investment</div>
                <div className="text-lg font-bold text-gray-900">${principal.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Interest Earned</div>
                <div className="text-lg font-bold text-green-600">
                  ${(compoundTotal - principal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Final Amount</div>
              <div className="text-2xl font-bold text-indigo-700">
                ${compoundTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span>Growth Visualization</span>
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              {visualInterval}ly intervals
            </span>
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  tickMargin={10}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={{ stroke: '#E0E0E0' }}
                  label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fontSize: 12, fill: '#666' }} 
                />
                <YAxis 
                  fontSize={12}
                  tickMargin={10}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={{ stroke: '#E0E0E0' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12, fill: '#666' }} 
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                  labelFormatter={(value) => `Year ${value}`}
                  contentStyle={{ 
                    fontSize: '12px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  formatter={(value) => <span style={{ fontSize: '12px', color: '#666' }}>{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="simple" 
                  name="Simple Interest" 
                  stroke="#8884d8" 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                  strokeWidth={2.5}
                  dot={{ r: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="compound" 
                  name="Compound Interest" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                  strokeWidth={2.5}
                  dot={{ r: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    ) : (
      /* Advanced Mode UI */
      <>
        {/* Time and Compounding Settings */}
        <div className="mb-4 bg-white p-4 rounded-lg shadow-md border border-indigo-100">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Investment Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Period Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center">
                <Calendar className="h-4 w-4 text-indigo-600 mr-1" />
                Investment Period
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  value={years}
                  onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 pr-12 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-medium">years</span>
                </div>
              </div>
              
              {/* Time period preset buttons */}
              <div className="mt-2 text-xs text-gray-500 flex gap-1 flex-wrap">
                {[
                  { value: 1, label: "1 year" },
                  { value: 3, label: "3 years" },
                  { value: 5, label: "5 years" },
                  { value: 10, label: "10 years" }
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`px-2 py-1 rounded-full transition-all ${
                      years === option.value
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setYears(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Compounding Frequency Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center">
                <TrendingUp className="h-4 w-4 text-indigo-600 mr-1" />
                Compounding Frequency
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  min="0"
                  value={compoundDays}
                  onChange={(e) => setCompoundDays(parseInt(e.target.value) || 0)}
                  className="w-full p-2 pr-12 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-medium">days</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 flex gap-2 flex-wrap">
                {[
                  { days: 0, label: "no compounding" },
                  { days: 1, label: "daily" },
                  { days: 7, label: "weekly" },
                  { days: 30, label: "monthly" },
                  { days: 365, label: "annually" }
                ].map((option) => (
                  <button
                    key={option.days}
                    className={`px-2 py-1 rounded-full transition-all ${
                      compoundDays === option.days
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setCompoundDays(option.days)}
                  >
                    {option.days} = {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Asset Form */}
        <div className="mb-4 bg-white p-4 rounded-lg shadow-md border border-indigo-100">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Add New Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Asset Name Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Asset Name</label>
              <input
                type="text"
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                placeholder="e.g. Savings Account"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Asset Principal Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Principal Amount</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <input
                  type="number"
                  value={newAssetPrincipal}
                  onChange={(e) => setNewAssetPrincipal(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Asset Interest Rate Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Interest Rate</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.01"
                  value={newAssetRate}
                  onChange={(e) => setNewAssetRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-medium">%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleAddAsset}
            >
              <Plus size={16} className="mr-1" />
              Add Asset
            </button>
          </div>
        </div>
        
        {/* Asset List */}
        <div className="mb-4 bg-white p-4 rounded-lg shadow-md border border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-800">Your Assets</h3>
            
            <div className="flex gap-2">
              {/* CSV Import Button */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  <Upload size={14} className="mr-1" />
                  Import CSV
                </button>
              </div>
              
              {/* CSV Export Button */}
              <button
                className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                onClick={handleExportCSV}
              >
                <Download size={14} className="mr-1" />
                Export CSV
              </button>
            </div>
          </div>
          
          {assets.length === 0 ? (
            <p className="text-gray-500 text-sm">No assets added yet. Add your first asset using the form above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Asset
                        {renderSortIndicator('name')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('principal')}
                    >
                      <div className="flex items-center">
                        Principal
                        {renderSortIndicator('principal')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rate')}
                    >
                      <div className="flex items-center">
                        Rate
                        {renderSortIndicator('rate')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('finalValue')}
                    >
                      <div className="flex items-center">
                        Final Value
                        {renderSortIndicator('finalValue')}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedAssets().map(asset => {
                    // Calculate final value for this asset
                    const compoundsPerYear = 365 / compoundDays;
                    const finalValue = compoundDays <= 0
                      ? asset.principal * (1 + (asset.rate / 100) * years) // Simple interest
                      : asset.principal * Math.pow(1 + (asset.rate / 100) / compoundsPerYear, compoundsPerYear * years); // Compound interest
                      
                    return (
                      <tr key={asset.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ${asset.principal.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {asset.rate}%
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                          ${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-red-600 hover:text-red-900 focus:outline-none"
                            onClick={() => handleRemoveAsset(asset.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${totalInvestment.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-green-600">
                      ${totalFinalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Asset Growth Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Asset Growth Over Time</h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assetChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    fontSize={12}
                    tickMargin={10}
                    axisLine={{ stroke: '#E0E0E0' }}
                    tickLine={{ stroke: '#E0E0E0' }}
                    label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fontSize: 12, fill: '#666' }} 
                  />
                  <YAxis 
                    fontSize={12}
                    tickMargin={10}
                    axisLine={{ stroke: '#E0E0E0' }}
                    tickLine={{ stroke: '#E0E0E0' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12, fill: '#666' }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                    labelFormatter={(value) => `Year ${value}`}
                    contentStyle={{ 
                      fontSize: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    formatter={(value) => <span style={{ fontSize: '12px', color: '#666' }}>{value}</span>}
                  />
                  
                  {assets.map((asset, index) => (
                    <Line 
                      key={asset.id}
                      type="monotone" 
                      dataKey={asset.name} 
                      name={asset.name} 
                      stroke={asset.color} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                      strokeWidth={2}
                      dot={{ r: 0 }}
                    />
                  ))}
                  
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Value" 
                    stroke="#333" 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Pie Charts */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Portfolio Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Initial Investment</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData[0] || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={70}
                        paddingAngle={1}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData[0]?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                        contentStyle={{ 
                          fontSize: '12px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-sm font-medium text-gray-900">
                  ${totalInvestment.toLocaleString()}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">After {years} Years</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData[1] || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={70}
                        paddingAngle={1}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData[1]?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                        contentStyle={{ 
                          fontSize: '12px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-sm font-medium text-green-600">
                  ${totalFinalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);
};

export default InterestCalculator;
