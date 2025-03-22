"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { BarChart2, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { fetchStockData } from "@/app/actions/serverActions";

interface StockChartDialogProps {
  symbol: string;
  name: string;
  assetType: string;
}

interface StockData {
  date: string;
  originalDate: Date;
  closeInr: number;
}

type TimeRange = "1d" | "5d" | "1m" | "6m" | "ytd" | "1y" | "5y" | "max";

export function StockChartDialog({ symbol, name, assetType }: StockChartDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [highestValue, setHighestValue] = useState<number>(0);
  const [lowestValue, setLowestValue] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");
  const [usingMockData, setUsingMockData] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // Fixed exchange rate (in a real app, this would be fetched from an API)
  const exchangeRate = 82.5; // Updated to a more current INR to USD rate

  // Format date based on time range (Google Finance style)
  const formatDateForTimeRange = useCallback((date: Date, range: TimeRange): string => {
    if (range === "1d") {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (range === "5d") {
      return `${date.toLocaleDateString([], {weekday: 'short'})} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (range === "1m" || range === "6m") {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    } else if (range === "ytd" || range === "1y") {
      return date.toLocaleDateString([], {month: 'short', year: '2-digit'});
    } else {
      // 5y or max
      return date.toLocaleDateString([], {month: 'short', year: 'numeric'});
    }
  }, []);

  // Format tooltip date label based on time range
  const formatTooltipDate = useCallback((date: Date, range: TimeRange): string => {
    if (range === "1d" || range === "5d") {
      return date.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (range === "1m" || range === "6m" || range === "ytd") {
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } else {
      // 1y, 5y, max
      return date.toLocaleDateString([], {
        month: 'long',
        year: 'numeric'
      });
    }
  }, []);

  // Calculate data for the selected time range
  const calculateTimeRange = useCallback((selectedRange: TimeRange) => {
    const endDate = new Date();
    const startDate = new Date();
    let interval = "1d";
    
    switch (selectedRange) {
      case "1d":
        startDate.setDate(startDate.getDate() - 1);
        interval = "15m";
        break;
      case "5d":
        startDate.setDate(startDate.getDate() - 5);
        interval = "60m";
        break;
      case "1m":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "6m":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "ytd":
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "5y":
        startDate.setFullYear(startDate.getFullYear() - 5);
        interval = "1wk";
        break;
      case "max":
        startDate.setFullYear(startDate.getFullYear() - 20); // Approximate for max
        interval = "1wk";
        break;
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Format dates for Yahoo Finance API
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);
    
    return { period1, period2, interval };
  }, []);

  const getStockData = useCallback(async (currentTimeRange: TimeRange) => {
    if (!symbol) {
      setError("No symbol provided");
      setLoading(false);
      return;
    }

    try {
      const { period1, period2, interval } = calculateTimeRange(currentTimeRange);
      
      // Use server action to fetch data
      const data = await fetchStockData(symbol, period1, period2, interval);
      
      // Check if we're using mock data
      if (data.isMockData) {
        setUsingMockData(true);
      }
      
      if (!data.prices || data.prices.length === 0) {
        throw new Error(`No data available for ${currentTimeRange} time range`);
      }
      
      // Transform data for the chart with INR conversion
      const chartData = data.prices.map((price: any) => {
        const originalDate = new Date(price.date * 1000);
        
        // Convert USD to INR
        const closeInr = price.close * exchangeRate;
        
        return {
          date: formatDateForTimeRange(originalDate, currentTimeRange),
          originalDate: originalDate,
          closeInr
        };
      });

      // Sort data by date
      chartData.sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

      // Determine how many data points to display based on time range
      let filteredData = chartData;
      if (chartData.length > 100) {
        const step = Math.ceil(chartData.length / 100);
        filteredData = chartData.filter((_, index) => index % step === 0 || index === chartData.length - 1);
        // Always include the last data point
        if (filteredData[filteredData.length - 1] !== chartData[chartData.length - 1]) {
          filteredData.push(chartData[chartData.length - 1]);
        }
      }

      setStockData(filteredData);

      // Calculate metrics in INR using all data points
      if (chartData.length > 0) {
        const values = chartData.map(item => item.closeInr);
        const highest = Math.max(...values);
        const lowest = Math.min(...values);
        
        setHighestValue(highest);
        setLowestValue(lowest);
        
        // Calculate percent change from first to last value
        const firstValue = chartData[0].closeInr;
        const lastValue = chartData[chartData.length - 1].closeInr;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        setPercentChange(change);
      }
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
      setStockData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [symbol, exchangeRate, formatDateForTimeRange, calculateTimeRange]);

  // Effect to handle dialog open state and fetch data
  useEffect(() => {
    if (open && shouldFetch) {
      getStockData(timeRange);
      setShouldFetch(false);
    }
  }, [open, shouldFetch, getStockData, timeRange]);

  // Effect to trigger fetch when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      setShouldFetch(true);
    } else {
      // Reset state when dialog closes
      setStockData([]);
      setError(null);
      setUsingMockData(false);
    }
  }, [open]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((newRange: TimeRange) => {
    if (newRange !== timeRange) {
      setTimeRange(newRange);
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      setShouldFetch(true);
    }
  }, [timeRange]);

  // Generate mock data in a Google Finance style
  const generateMockData = useCallback((): StockData[] => {
    const now = new Date();
    const mockData: StockData[] = [];
    let price = 150;
    
    // Determine number of data points and interval based on timeRange
    let numPoints = 20;
    let intervalMs = 24 * 60 * 60 * 1000; // 1 day in ms
    
    switch(timeRange) {
      case "1d":
        numPoints = 24;
        intervalMs = 60 * 60 * 1000; // hourly
        break;
      case "5d":
        numPoints = 30;
        intervalMs = 4 * 60 * 60 * 1000; // 4 hours
        break;
      case "1m":
        numPoints = 30;
        intervalMs = 24 * 60 * 60 * 1000; // daily
        break;
      case "6m":
        numPoints = 24;
        intervalMs = 7 * 24 * 60 * 60 * 1000; // weekly
        break;
      case "ytd":
        numPoints = 12;
        intervalMs = 30 * 24 * 60 * 60 * 1000; // monthly
        break;
      case "1y":
        numPoints = 12;
        intervalMs = 30 * 24 * 60 * 60 * 1000; // monthly
        break;
      case "5y":
        numPoints = 20;
        intervalMs = 3 * 30 * 24 * 60 * 60 * 1000; // quarterly
        break;
      case "max":
        numPoints = 20;
        intervalMs = 365 * 24 * 60 * 60 * 1000; // yearly
        break;
    }
    
    // Generate data points
    for (let i = numPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * intervalMs);
      
      // Add some random price movement
      price = price * (1 + (Math.random() - 0.48) * 0.05);
      
      mockData.push({
        date: formatDateForTimeRange(date, timeRange),
        originalDate: date,
        closeInr: price * exchangeRate
      });
    }
    
    return mockData;
  }, [timeRange, exchangeRate, formatDateForTimeRange]);

  // Use data from API or fallback to mock data
  const mockData = useMemo(() => generateMockData(), [generateMockData]);
  const displayData = stockData.length > 0 ? stockData : mockData;
  const chartColor = percentChange >= 0 ? "#22c55e" : "#ef4444";

  // Format INR currency
  const formatINR = useCallback((value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  // Custom tooltip component for the chart (Google Finance style)
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const dateStr = dataPoint.originalDate 
        ? formatTooltipDate(dataPoint.originalDate, timeRange)
        : label;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="text-gray-500 dark:text-gray-400 mb-1">{dateStr}</p>
          <p className="font-semibold">{formatINR(dataPoint.closeInr)}</p>
        </div>
      );
    }
    return null;
  }, [formatTooltipDate, timeRange, formatINR]);

  // Time range buttons
  const timeRangeOptions: TimeRange[] = ["1d", "5d", "1m", "6m", "ytd", "1y", "5y", "max"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4">
          <BarChart2 className="h-4 w-4 mr-2" /> View Price History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] data-[state=open]:!animate-in data-[state=open]:!fade-in-0 data-[state=open]:!zoom-in-95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {name} ({symbol}) Price History
          </DialogTitle>
          <DialogDescription>
            Price history for {assetType} {symbol ? `(${symbol})` : ""}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Current price and change summary */}
          {stockData.length > 0 && (
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-2xl font-bold">
                {formatINR(stockData[stockData.length - 1].closeInr)}
              </span>
              <span className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}% {timeRange.toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Time range selector */}
          <div className="flex flex-wrap gap-2 justify-start">
            {timeRangeOptions.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange(range)}
                disabled={loading}
                className="px-3 py-1 h-8"
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground ml-2">Loading stock data for {timeRange.toUpperCase()}...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setShouldFetch(true);
                }}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {usingMockData && (
                <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 p-3 rounded-md mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Using simulated data. Yahoo Finance data unavailable.</p>
                </div>
              )}
              
              {/* Main chart */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displayData}
                    margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={15}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `₹${Math.round(value/1000)}K`}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={displayData[0]?.closeInr} stroke="#888" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="closeInr"
                      stroke={chartColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: chartColor, stroke: "white", strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Summary metrics cards */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Highest Value</p>
                  <p className="text-lg font-bold">
                    {formatINR(stockData.length > 0 ? highestValue : mockData[mockData.length - 1].closeInr * 1.1)}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Lowest Value</p>
                  <p className="text-lg font-bold">
                    {formatINR(stockData.length > 0 ? lowestValue : mockData[0].closeInr * 0.9)}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    {timeRange === "1y" ? "12-Month Change" : 
                     timeRange === "5y" ? "5-Year Change" : 
                     timeRange === "1d" ? "1-Day Change" : 
                     timeRange === "ytd" ? "YTD Change" : 
                     `${timeRange.toUpperCase()} Change`}
                  </p>
                  <p className={`text-lg font-bold ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stockData.length > 0 ? percentChange.toFixed(2) : "+43.33"}%
                  </p>
                </Card>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Data source: {usingMockData ? 'Simulated data' : 'Yahoo Finance API'}. 
                Chart shows closing prices for the {timeRange.toUpperCase()} time period.
                Values are shown in INR (USD/INR rate: ₹{exchangeRate.toFixed(2)}).
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 