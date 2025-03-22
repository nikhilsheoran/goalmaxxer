import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const period1 = searchParams.get('period1');
  const period2 = searchParams.get('period2');
  const interval = searchParams.get('interval') || '1d';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  if (!period1 || !period2) {
    return NextResponse.json({ error: 'Period1 and period2 are required' }, { status: 400 });
  }

  try {
    // Set up AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    // Yahoo Finance API URL
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.statusText} (${response.status})`);
      return NextResponse.json(
        { error: `Failed to fetch data from Yahoo Finance: ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Verify the data structure
    if (!data?.chart?.result?.[0]) {
      console.error('Invalid data structure received from Yahoo Finance');
      return NextResponse.json(
        { error: 'Invalid data received from Yahoo Finance API' }, 
        { status: 500 }
      );
    }

    // Check for Yahoo Finance errors
    if (data.chart.error) {
      console.error(`Yahoo Finance error: ${data.chart.error.description}`);
      return NextResponse.json(
        { error: data.chart.error.description || 'Yahoo Finance API error' }, 
        { status: 500 }
      );
    }
    
    const result = data.chart.result[0];
    
    // Check for valid price data
    if (!result.timestamp || !result.indicators?.quote?.[0]?.close) {
      console.error('No price data available for this symbol');
      return NextResponse.json(
        { error: 'No price data available for this symbol' }, 
        { status: 404 }
      );
    }

    // Format the data for the response
    const formattedData = {
      symbol: result.meta.symbol,
      currency: result.meta.currency,
      exchangeName: result.meta.exchangeName,
      instrumentType: result.meta.instrumentType,
      prices: result.timestamp.map((timestamp: number, index: number) => {
        // Handle potentially missing data points
        const close = result.indicators.quote[0].close?.[index] || null;
        const open = result.indicators.quote[0].open?.[index] || null;
        const high = result.indicators.quote[0].high?.[index] || null;
        const low = result.indicators.quote[0].low?.[index] || null;
        const volume = result.indicators.quote[0].volume?.[index] || null;
        
        return {
          date: timestamp,
          close,
          open,
          high,
          low,
          volume
        };
      }).filter((item: any) => item.close !== null) // Filter out null values
    };

    // Cache headers for better performance
    return NextResponse.json(formattedData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=1800', // 5 min client, 30 min CDN
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout when fetching data from Yahoo Finance' }, 
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
} 