import { useState, useEffect } from "react";
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartDataPoint {
  time: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  timestamp: number;
}

interface MarketChartProps {
  marketId: string;
  currentYesPrice: number;
  currentNoPrice: number;
  className?: string;
}

export function MarketChart({ marketId, currentYesPrice, currentNoPrice, className = "" }: MarketChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real chart data from backend API
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      
      try {
        // TODO: Add price history endpoint to backend
        // For now, create a single current price point
        const now = Date.now();
        const data: ChartDataPoint[] = [];
        
        // Show current price as a starting point
        data.push({
          time: new Date(now).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          yesPrice: currentYesPrice,
          noPrice: currentNoPrice,
          volume: 0,
          timestamp: now
        });
        
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        // Fallback to current prices
        setChartData([{
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          yesPrice: currentYesPrice,
          noPrice: currentNoPrice,
          volume: 0,
          timestamp: Date.now()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [marketId, currentYesPrice, currentNoPrice]);

  if (isLoading) {
    return (
      <div className={`bg-muted/20 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  const yesChange = latestData ? latestData.yesPrice - (previousData?.yesPrice || latestData.yesPrice) : 0;
  const noChange = latestData ? latestData.noPrice - (previousData?.noPrice || latestData.noPrice) : 0;

  return (
    <div className={`bg-muted/20 rounded-lg p-4 w-full min-w-0 ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">24h Price Chart</h3>
          <div className="flex items-center gap-1 text-xs">
            {yesChange >= 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-danger" />
            )}
            <span className={yesChange >= 0 ? "text-success" : "text-danger"}>
              {yesChange >= 0 ? "+" : ""}{yesChange.toFixed(1)}¢
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-muted-foreground">YES</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-danger rounded-full"></div>
            <span className="text-muted-foreground">NO</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}¢`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}¢`,
                name === 'yesPrice' ? 'YES Price' : 'NO Price'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            
            {/* YES Price Line */}
            <Line
              type="monotone"
              dataKey="yesPrice"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--success))' }}
            />
            
            {/* NO Price Line */}
            <Line
              type="monotone"
              dataKey="noPrice"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--destructive))' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Current Prices */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/20">
        <div className="text-center">
          <div className="text-lg font-bold text-success">
            {latestData?.yesPrice.toFixed(1)}¢
          </div>
          <div className="text-xs text-muted-foreground">YES</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-danger">
            {latestData?.noPrice.toFixed(1)}¢
          </div>
          <div className="text-xs text-muted-foreground">NO</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-gold">
            ${(latestData?.volume || 0).toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">Volume</div>
        </div>
      </div>
    </div>
  );
}
